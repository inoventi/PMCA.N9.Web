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
    public partial class CostsController : BaseController
    {
        [PMCToolAuthorize(ObjectCode = "3127")]
        [HttpGet]
        public async Task<IActionResult> Projects()
        {
            SetActiveOption("3127");
            AnalyticsProjectViewModel p = new AnalyticsProjectViewModel();
            Participant participant = await GetParticipant();
            ViewBag.Title = localizer["Costs1_001"];
            var projects = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/{participant.ParticipantID}/role/projects/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.Projects = projects.OrderBy(c => c.Value).ToList();
            if (projects.Count > 0)
            {
                p.ProjectID = projects[0].Key.Value;
                p.ProjectName = projects[0].Value;
            }
            return View(p);
        }
        [HttpGet]
        public async Task<JsonResult> GetDataProjectActivityCosts(Guid projectId)
        {
            IEnumerable<ProjectTask> data = new List<ProjectTask>();
            try
            {
                data = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/costs/{projectId}/activities", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetDataProjectActivityCostsDetail(Guid projectId, Guid activityId)
        {
            var evidences = new List<ProjectEvidence>();
            var respuesta = new Dictionary<string, object>();
            try
            {
                //Participants
                var participants = await restClient.Get<List<ActivityParticipantCost>>(baseUrl, $"/api/v1/costs/{projectId}/activities/{activityId}/participants", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                //Evidences
                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                  evidences = await restClient.Get<List<ProjectEvidence>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/activities/{activityId}/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                respuesta.Add("participants", participants);
                respuesta.Add("evidences", evidences);
                //TABLAS DE DATOS


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
        [HttpGet]
        public async Task<JsonResult> GetDataProject(Guid projectId)
        {
            Project project = new Project();
            try
            {
                project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            return Json(project);
        }
        [HttpGet]
        public async Task<JsonResult> GetDataProjectCosts(Guid projectId)
        {
            IEnumerable<ProjectTotalCosts> costs = new List<ProjectTotalCosts>();
            try
            {
                costs = await restClient.Get<List<ProjectTotalCosts>>(baseUrl, $"/api/v1/costs/{projectId}/costs", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            return Json(costs);
        }
        [HttpGet]
        public async Task<JsonResult> GetProjectCostsByDay(Guid projectId, string startDate, string endDate)
        {
            List<ProjectCostPlannedAndReal> projectCosts = new List<ProjectCostPlannedAndReal>();
            try
            {
                projectCosts = await restClient.Get<List<ProjectCostPlannedAndReal>>(baseUrl, $"/api/v1/costs/{projectId}/startdate/{startDate}/enddate/{endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            return Json(projectCosts);
        }
        private async Task<Participant> GetParticipant()
        {

            Participant result = new Participant();
            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{participantUser.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result.ParticipantUser.Image = participantUser.Image;
                }
            }
            catch (Exception ex)
            {

            }

            return result;
        }
        protected async Task<ProjectParticipant> GetProjectParticipant(Guid projectId)
        {

            ProjectParticipant result = null;
            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result = await restClient.Get<ProjectParticipant>(baseUrl, $"/api/v1/projects/{projectId}/participants/{participantUser.ParticipantID.ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
            }
            catch (Exception ex)
            {

            }

            return result;
        }
    }
}