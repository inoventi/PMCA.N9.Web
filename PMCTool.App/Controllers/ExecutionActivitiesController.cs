using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using PMCTool.App.Attributes;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    public partial class ExecutionController : BaseController
    {
        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Activities(Guid id)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects", "Execution");

            var data = new ProjectActivityDetailViewModel();

            Project project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            if (project == null)
                return RedirectToAction("Projects");

            data.ProjectID = project.ProjectID;
            data.ProjectName = project.Name;
            data.ProjectPhase = project.Phase;
            data.ProjectChangeControl = project.ChangeManagement;
            data.ProjectEditable = project.ProjectEditable;

            var pp = await GetProjectParticipant(id);
            data.ParticipantRole = pp.Role;

            if (project.Phase != null && project.Phase != 1 && project.ChangeManagement == (int)EnumFactory.ProjectChangeManagement.Optional)
                data.ChangeControl = true;

            var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{id}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

            SetActiveOption("3120");
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Activities"];
            ViewBag.Participants = participants;
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Activity(Guid projectId, Guid activityId)
        {
            ProjectActivityDetailViewModel data = new ProjectActivityDetailViewModel();

            try
            {
                if (projectId == null || projectId == Guid.Empty)
                    return RedirectToAction("Activities");

                if (activityId == null || activityId == Guid.Empty)
                    return RedirectToAction("Activities");

                //var projectActivity = await restClient.Get<ProjectTaskTable>(baseUrl, $"/api/v1/gantt/taskTable/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var projectActivity = await restClient.Get<ProjectTaskTable>(baseUrl, $"/api/v1/projects/{projectId}/activities/{activityId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectActivity == null)
                    return RedirectToAction("Risks");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Risks");

                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectTaskID = activityId;
                data.ProjectEditable = project.ProjectEditable;

                data.ProjectActivity = projectActivity;

                data.ProjectActivity.start_date = data.ProjectActivity.start_date != "" ? (Convert.ToDateTime(data.ProjectActivity.start_date)).ToString("yyyy-MM-dd") : "";
                data.ProjectActivity.end_date = data.ProjectActivity.end_date != "" ? (Convert.ToDateTime(data.ProjectActivity.end_date)).ToString("yyyy-MM-dd") : "";
                data.ProjectActivity.RealStartDate = data.ProjectActivity.RealStartDate != "" ? (Convert.ToDateTime(data.ProjectActivity.RealStartDate)).ToString("yyyy-MM-dd") : "";
                data.ProjectActivity.RealEndDate = data.ProjectActivity.RealEndDate != "" ? (Convert.ToDateTime(data.ProjectActivity.RealEndDate)).ToString("yyyy-MM-dd") : "";
                data.ProjectActivity.RealProgress = data.ProjectActivity.RealProgress;
                data.ProjectActivity.RealCost = data.ProjectActivity.RealCost;
                data.ProjectActivity.PlannedProgress = data.ProjectActivity.PlannedProgress;


                data.ProjectActivity.resources = await restClient.Get<List<ProjectTaskParticipant>>(baseUrl, $"/api/v1/projects/{projectId}/task/{activityId}/participants", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (data.ProjectActivity.owner_id != null)
                {
                    Participant participant = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{data.ProjectActivity.owner_id.Value}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    data.ResponsableID = data.ProjectActivity.owner_id.Value;
                    data.ResponsableName = participant.Name + " " + participant.Lastname + " " + participant.Surname;
                    data.ResponsableEmail = participant.Email;
                    data.ResponsablePhone = participant.Contact.Value;
                    data.ResponsableEscalationName = participant.Escalation;
                    data.ResponsableEscalationID = participant.EscalationID;

                    List<ProjectTaskParticipant> taskParticipants = new List<ProjectTaskParticipant>();
                    taskParticipants = data.ProjectActivity.resources.Where(q => q.resource_id != data.ProjectActivity.owner_id).ToList();
                    foreach(var taskParticipant in taskParticipants)
                    {
                        participant = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{taskParticipant.resource_id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        data.Participants.Add(participant);
                    }

                }
                else
                {
                    foreach (var taskParticipant in data.ProjectActivity.resources)
                    {
                        Participant participant = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{taskParticipant.resource_id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        data.Participants.Add(participant);
                    }
                }

                var pp = await GetProjectParticipant(projectId);
                if (pp == null)
                    return RedirectToAction("AccessNotAllowed", "Home");


                ViewBag.Role = pp.Role;

            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            SetActiveOption("3120");
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Activity"];
            return View(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetActivityEvidences(Guid projectId, Guid activityId)
        {
            var data = new List<ProjectEvidence>();
            try
            {
                //data = await restClient.Get<List<ProjectEvidence>>(baseUrl, $"/api/v1/projects/{projectId}/activities/{activityId}/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectEvidence>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/activities/{activityId}/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetActivityIncidents(Guid projectId, string activityId)
        {
            var data = new List<ProjectIncident>();
            try
            {
                //data = await restClient.Get<List<ProjectIncident>>(baseUrl, $"/api/v1/ProjectIncident/element/{projectTaskID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                //data = await restClient.Get<List<ProjectIncident>>(baseUrl, $"/api/v1/projects/{projectId}/activities/{activityId}/incidents", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectIncident>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/activities/{activityId}/incidents", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetActivityAgreements(Guid projectId, Guid activityId)
        {
            var data = new List<ProjectMeetingAgreement>();
            try
            {
                //data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/activities/{activityId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/activities/{activityId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetActivityDates(Guid projectId, Guid activityId)
        {
            var data = new ProjectTaskDates();
            try
            {
                data = await restClient.Get<ProjectTaskDates>(baseUrl, $"/api/v1/projects/{projectId}/activities/{activityId}/dates", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
           catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(data);
        } 
        
        [HttpGet]
        public async Task<JsonResult> GetActivityTimeSheets(Guid projectId, Guid activityId)
        {
            var data = new List<TimeSheet>();
            try
            {

                data = await restClient.Get<List<TimeSheet>>(baseUrl, $"/api/v1/timesheets/task/{activityId}/project/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(data);
        }
    }
}