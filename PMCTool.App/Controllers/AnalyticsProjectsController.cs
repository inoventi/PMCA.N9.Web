using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    public partial class AnalyticsController : BaseController
    {
        [PMCToolAuthorize(ObjectCode = "3125")]
        [HttpGet]
        public async Task<IActionResult> Projects()
        {
            SetActiveOption("3125");
            ViewBag.Title = localizer["Analytics1_001"];
            AnalyticsProjectViewModel p = new AnalyticsProjectViewModel();
            Participant participant = await GetParticipant();
            var projects = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/{participant.ParticipantID}/roles/{5}/projects/status/{4}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.Projects = projects;

            if (projects.Count > 0)
            {
                p.ProjectID = projects[0].Key.Value;
                p.ProjectName = projects[0].Value;
            }
            return View(p);
        }
     
        [HttpGet]
        public async Task<JsonResult> GetDataParticipantTaskByProject(Guid projectID)
        {
            List<ParticipantProjectTaskByRole> data = new List<ParticipantProjectTaskByRole>();
            try
            {
                data = await restClient.Get<List<ParticipantProjectTaskByRole>>(baseUrl, $"/api/v1/analytics/projects/{projectID}/activities", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetDataProjectsByParticipant(Guid participantID)
        {
            IEnumerable<ProjectsByParticipant> data = new List<ProjectsByParticipant>();
            try
            {
                data = await restClient.Get<List<ProjectsByParticipant>>(baseUrl, $"/api/v1/analytics/participants/{participantID}/projects", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetDataProjectsElementsByParticipant(Guid participantID)
        {
            IEnumerable<ProjectElementsCountByParticipant> data = null;
            try
            {
                data = await restClient.Get<List<ProjectElementsCountByParticipant>>(baseUrl, $"/api/v1/analytics/participants/{participantID}/elements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetDataChangeControlProjectsByParticipant(Guid participantID)
        {
            IEnumerable<ProjectChangesControl_ByParticipant> data = new List<ProjectChangesControl_ByParticipant>();
            try
            {
                data = await restClient.Get<List<ProjectChangesControl_ByParticipant>>(baseUrl, $"/api/v1/analytics/participants/{participantID}/projects/changes", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [PMCToolAuthorize(ObjectCode = "3125")]
        [HttpGet]
        public async Task<IActionResult> Project(Guid projectId)
        {
            if (projectId == null || projectId == Guid.Empty)
                return RedirectToAction("Projects");
            ViewBag.Title = localizer["Analytics1_001"];
            var data = new ProjectViewModel();

            var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            var contactSponsor = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{project.SponsorID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            var contactLeader = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{project.LeaderID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            var contactProjectManager = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{project.ProjectManagerID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.ContactSponsor = contactSponsor;
            ViewBag.ContactLeader = contactLeader;
            ViewBag.ContactProjectManager = contactProjectManager;
            data.Project = project;

            if (project.StartDate.HasValue)
                data.ProjectAcquiredValueStartDate = project.StartDate.Value.ToString("yyyy-MM-dd");
            else
                data.ProjectAcquiredValueStartDate = DateTime.Now.ToString("yyyy-MM-dd");

            if (project.EndDate.HasValue && project.EndDate.Value < DateTime.Now)
                data.ProjectAcquiredValueEndDate = project.EndDate.Value.ToString("yyyy-MM-dd");
            else
                data.ProjectAcquiredValueEndDate = DateTime.Now.ToString("yyyy-MM-dd");
            return View(data);
        }
        [HttpGet]
        public async Task<JsonResult> GetDataProjectPendings(Guid projectId)
        {
            IEnumerable<ProjectPendingsByWeek> data = new List<ProjectPendingsByWeek>();
            try
            {
                data = await restClient.Get<List<ProjectPendingsByWeek>>(baseUrl, $"/api/v1/analytics/projects/{projectId}/pendings", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });               
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
        public async Task<JsonResult> GetDataQualityTracingProject(Guid projectId)
        {
            IEnumerable<QualityTracing_ByElements> data = new List<QualityTracing_ByElements>();
            try
            {
                data = await restClient.Get<List<QualityTracing_ByElements>>(baseUrl, $"/api/v1/analytics/projects/{projectId}/elements/quality", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetDataProjectElementsCheck(Guid projectId, string startDate, string endDate)
        {
            IEnumerable<ProjectElementsCheck> data = new List<ProjectElementsCheck>();
            try
            {
                data = await restClient.Get<List<ProjectElementsCheck>>(baseUrl, $"/api/v1/analytics/projects/{projectId}/elements/startdate/{startDate}/enddate/{endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetDataQualityTracingProjectDetail(Guid projectId, int elementType)
        {
            IEnumerable<QualityTracingProject_ByElement> data = new List<QualityTracingProject_ByElement>();
            try
            {
                data = await restClient.Get<List<QualityTracingProject_ByElement>>(baseUrl, $"/api/v1/analytics/projects/{projectId}/elements/type/{elementType}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetDataControlChanges(Guid projectId, string startDate, string endDate)
        {
            List<ControlChange_ByPorject> data = new List<ControlChange_ByPorject>();
            try
            {
                var result = await restClient.Get<List<ControlChange_ByPorject>>(baseUrl, $"/api/v1/analytics/projects/{projectId}/changes/startdate/{startDate}/enddate/{endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                foreach (var item in result)
                {
                    item.Change = item.Change.Replace("StartPlannedDate", localizer.GetString("PlannedStartDate")).Replace("EndPlannedDate", localizer.GetString("PlannedEndDate")).Replace("Responsible", localizer.GetString("Responsible"));
                    data.Add(item);
                }
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
        public async Task<JsonResult> GetProjectAssignedHours(Guid projectId, string startDate, string endDate)
        {
            List<ProjectAssignedHours> AssignedHours = new List<ProjectAssignedHours>();
            List<ParticipantsTask_ByProject> ParticipantsTask = new List<ParticipantsTask_ByProject>();
            var respuesta = new Dictionary<string, object>();
            try
            {
                AssignedHours = await restClient.Get<List<ProjectAssignedHours>>(baseUrl, $"/api/v1/analytics/project/{projectId}/startdate/{startDate}/enddate/{endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ParticipantsTask = await restClient.Get<List<ParticipantsTask_ByProject>>(baseUrl, $"/api/v1/analytics/participats/task/project/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                respuesta.Add("AssignedHours", AssignedHours);
                respuesta.Add("participants", ParticipantsTask);
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

            return Json(respuesta);
        }
    }
}