using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using PMCTool.App.Attributes;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;
using PMCTool.Models.Core;

namespace PMCTool.App.Controllers
{
    public partial class ExecutionController : BaseController
    {
        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Milestones(Guid id)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects", "Execution");

            var data = new ProjectMilestoneDetailViewModel();

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
            //data.ProjectIndicator = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{id}/indicators/milestones", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            //SetActiveOption("3120");

            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Milestones"];
            ViewBag.Participants = participants;
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Milestone(Guid projectId, Guid milestoneId)
        {
            ProjectMilestoneDetailViewModel data = new ProjectMilestoneDetailViewModel();

            try
            {
                if (projectId == null || projectId == Guid.Empty)
                    return RedirectToAction("Activities");

                if (milestoneId == null || milestoneId == Guid.Empty)
                    return RedirectToAction("Milestones");

                //var projectMilestone = await restClient.Get<ProjectTaskTable>(baseUrl, $"/api/v1/gantt/taskTable/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var projectMilestone = await restClient.Get<ProjectTaskTable>(baseUrl, $"/api/v1/projects/{projectId}/milestones/{milestoneId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectMilestone == null)
                    return RedirectToAction("Milestones");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Milestones");

                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectTaskID = milestoneId;
                data.ProjectEditable = project.ProjectEditable;
                data.ProjectMilestone = projectMilestone;

                data.ProjectMilestone.start_date = (Convert.ToDateTime(data.ProjectMilestone.start_date)).ToString("yyyy-MM-dd");
                data.ProjectMilestone.end_date = (Convert.ToDateTime(data.ProjectMilestone.end_date)).ToString("yyyy-MM-dd");
                data.ProjectMilestone.RealStartDate = data.ProjectMilestone.RealStartDate != "" ? (Convert.ToDateTime(data.ProjectMilestone.RealStartDate)).ToString("yyyy-MM-dd") : "";
                data.ProjectMilestone.RealEndDate = data.ProjectMilestone.RealEndDate != "" ? (Convert.ToDateTime(data.ProjectMilestone.RealEndDate)).ToString("yyyy-MM-dd") : "";
                data.ProjectMilestone.RealProgress = data.ProjectMilestone.RealProgress;
                data.ProjectMilestone.RealCost = data.ProjectMilestone.RealCost;
                data.ProjectMilestone.PlannedProgress = data.ProjectMilestone.PlannedProgress;

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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Milestone"];
            return View(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetMilestoneAgreements(Guid projectId, Guid milestoneId)
        {
            var data = new List<ProjectMeetingAgreement>();
            try
            {
                //data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/milestones/{milestoneId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/milestones/{milestoneId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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