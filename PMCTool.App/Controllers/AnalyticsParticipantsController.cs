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
        private string _error;
        [PMCToolAuthorize(ObjectCode = "3126")]
        [HttpGet]
        public IActionResult Participants()
        {
            SetActiveOption("3126");
            return View();
        }
       
        [HttpPost]
        public async Task<JsonResult> GetDetailsHoursRealsByParticipant(DetailsHoursRealsByParticipant request)
        {

             var respuesta = new Dictionary<string, object>();
            try
            {
                //TABLA
                //api/v1/analytics/participants/{participantId}/hours/datestart/{dateStart}/dateend/{dateEnd}
                // api/v1/analytics/participants/{participantId}/hours/datestart/{dateStart}/dateend/{dateEnd}
                var data = await restClient.Get<List<DetailsHoursReals_byPaticipantDate>>(baseUrl,
                    $"api/v1/analytics/participants/{request.participantId}/hours/datestart/{request.dateStart}/dateend/{request.dateEnd}",
                    new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var order = data.OrderBy(c => c.ProjectName);
                respuesta.Add("data", order); 
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

        [HttpPost]
        public async Task<JsonResult> GetReportAvailability(ParticipantsReportAvailability request)
        {

            IEnumerable<ProjectProgressHistoryReport> chart = null;
            var respuesta = new Dictionary<string, object>();
            try
            {
                //TABLA
                //participants/{participantId}/availability/datestart/{dateStart}/dateend/{dateEnd}
                var data = await restClient.Get<List<AvailabilityReports_ByParticipantSelection>>(baseUrl, 
                     $"api/v1/analytics/participants/{request.participantId}/availability/datestart/{request.dateStart}/dateend/{request.dateEnd}?projectsIds={request.projectsIds}",
                     new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                //GRAFICA
                //participants/{participantId}/availability/chart/datestart/{dateStart}/dateend/{dateEnd}
                var chartx = await restClient.Get<List<ParticipantPlannedHours_ByDatebyProjects>>(baseUrl,
                    $"api/v1/analytics/participants/{request.participantId}/availability/chart/datestart/{request.dateStart}/dateend/{request.dateEnd}?projectsIds={request.projectsIds}",
                    new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var projects = data.GroupBy(c => c.ProjectID).Select(group => group.First());
                 
                respuesta.Add("data", data);
                respuesta.Add("projects", projects);
                respuesta.Add("chart", chartx);
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
        [HttpPost]
        public async Task<JsonResult> GetReportAvailabilityByDayAndByParticipant(ParticipantsReportAvailability request)
        {
            var respuesta = new Dictionary<string, object>();
            try
            {
                //MODAL - TABLA
                //participants/{participantId}/availability/datestart/{dateStart}/dateend/{dateEnd}
                var data = await restClient.Get<List<AvailabilityReports_ByParticipantSelection>>(baseUrl,
                     $"api/v1/analytics/participants/{request.participantId}/availability/datestart/{request.dateStart}/dateend/{request.dateEnd}?projectsIds={request.projectsIds}",
                     new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var projects = data.OrderBy(c => c.ProjectID);
                respuesta.Add("projects", projects);
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

        private bool ValidateData(ParticipantsReportAvailability data, bool v)
        {
            throw new NotImplementedException();
        }

        [HttpGet]
        public async Task<JsonResult> GetProyectsParticipants(string participantId)
        {
            // get cookie del idioma
            //string token = HttpContext.Request.Cookies["pmctool-token-app"];
            List<SelectionListItem> data = new List<SelectionListItem>();
            Participant participant = await GetParticipant();
            var respuesta = new Dictionary<string, object>();
            try
            { 
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/analytics/participants/{participantId}/projects/assing/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var projects = data.OrderBy(c => c.Value);
                respuesta.Add("projects", projects);
                ViewBag.Projects = respuesta;
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
        public async Task<JsonResult> GetAssignedHoursvsRealsPerParticipants(string participantsIDS, string dateStart, string dateEnd)
        {

            List<AssignedHoursvsReals_ByParticipantSelection> elementsSumary = new List<AssignedHoursvsReals_ByParticipantSelection>();
            var respuesta = new Dictionary<string, object>();
            try
            {
                //participants/{participantId}/hours/vs/reals/datestart/{dateStart}/dateend/{dateEnd}                                                                                                     
                elementsSumary = await restClient.Get<List<AssignedHoursvsReals_ByParticipantSelection>>(baseUrl, $"/api/v1/analytics/participants/{participantsIDS}/hours/vs/reals/datestart/{dateStart}/dateEnd/{dateEnd}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var participants = elementsSumary.GroupBy(c => c.ParticipantID).Select(group => group.First());
                //var elements = elementsSumary.GroupBy(c => c.Type).Select(group => group.First());

                //var participants = elementsSumary.GroupBy(c => c.ParticipantID).Select(group => group.First());

                respuesta.Add("data", elementsSumary);
                respuesta.Add("participants", participants);
                //respuesta.Add("elements", elements);
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
        public async Task<JsonResult> GetParticipantsAssingedPerProject(string participantsIDS)
        {
             
            List<AssignedHours_ByParticipantSelection> elementsSumary = new List<AssignedHours_ByParticipantSelection>();
            var respuesta = new Dictionary<string, object>();
            try
            {
                                                                                                   
                elementsSumary = await restClient.Get<List<AssignedHours_ByParticipantSelection>>(baseUrl, $"/api/v1/analytics/participants/{participantsIDS}/hours/assigned/per/project", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var participants = elementsSumary.GroupBy(c => c.ParticipantID).Select(group => group.First());
                //var elements = elementsSumary.GroupBy(c => c.Type).Select(group => group.First());

                //var participants = elementsSumary.GroupBy(c => c.ParticipantID).Select(group => group.First());

                respuesta.Add("data", elementsSumary);
                respuesta.Add("participants", participants);
                //respuesta.Add("elements", elements);
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
        public async Task<JsonResult> getParticipantsPendingAssignments(string participantsIDS) {
            //PMCSP_GetParticipantsElementsCountInProyectsbySelection 
            List<ParticipantsElementsCountInProyects> elementsSumary = new List<ParticipantsElementsCountInProyects>();
             var respuesta = new Dictionary<string, object>();
            try
            {

                elementsSumary = await restClient.Get<List<ParticipantsElementsCountInProyects>>(baseUrl, $"/api/v1/analytics/participants/{participantsIDS}/elements/count", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var participants = elementsSumary.GroupBy(c => c.ParticipantID).Select(group => group.First());
                var elements = elementsSumary.GroupBy(c=> c.Type).Select( group => group.First());

                //var participants = elementsSumary.GroupBy(c => c.ParticipantID).Select(group => group.First());

                respuesta.Add("data", elementsSumary);
                respuesta.Add("participants", participants);
                respuesta.Add("elements", elements);
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
        public async Task<JsonResult> getParticipantsProjectsIndicatorsbySelection(string participantsIDS)
        {
            
             
             List<ElementsSumary_ByParticipantSelection> elementsSumary = new List<ElementsSumary_ByParticipantSelection>();
             List<Projects_ByParticipantSelection> projectsData = new List<Projects_ByParticipantSelection>();
            var respuesta = new Dictionary<string, object>();
            try
            {

                elementsSumary = await restClient.Get<List<ElementsSumary_ByParticipantSelection>>(baseUrl, $"/api/v1/analytics/participants/{participantsIDS}/elements/pending/close", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var participants = elementsSumary.GroupBy(c=> c.ParticipantID).Select(group => group.First());
                var projects = elementsSumary.GroupBy(c=> c.ProjectID).Select(group => group.First());

                respuesta.Add("projectsData", projectsData);
                respuesta.Add("elements", elementsSumary);
                respuesta.Add("categories", participants);
                respuesta.Add("projects", projects);
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
        public async Task<JsonResult> GetParticipantCompanysAreasByRoleSelectionList(Guid companyid)
        {

            List<SelectionListItem> data = new List<SelectionListItem>();
            Participant participant = await GetParticipant();
            try
            {
                           
                // api/v1/participant/{participantId}/company/{companyid}/areas/selectionList
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/{participant.ParticipantID}/company/{companyid}/areas/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ViewBag.Projects = data;
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
        public async Task<JsonResult> GetParticipantCompanysByRoleSelectionList()
        {

            List<SelectionListItem> data = new List<SelectionListItem>();
            Participant participant = await GetParticipant();
            try
            {
                // api/v1/participants/{participantId}/companys/roles/{role}/selectionList
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/{participant.ParticipantID}/companys/roles/{5}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ViewBag.Projects = data;
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
        public async Task<JsonResult> GetParticipantByRoleSelectionList()
        {
            
            List<SelectionListItem> data = new List<SelectionListItem>();
            Participant participant = await GetParticipant();
            var respuesta = new Dictionary<string, object>();
            try
            {
                                                                                //api/v1/participants/{participantId}/roles/{role}/selectionList
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/{participant.ParticipantID}/roles/{5}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var participants = data.OrderBy(c => c.Value);
                respuesta.Add("participants", participants);
                ViewBag.Projects = respuesta;
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
        public async Task<JsonResult> GetElementsAssignedByParticipant(Guid participantID)
        {
            List<ElementsAssigned_ByParticipant> elemetsAsiggned = new List<ElementsAssigned_ByParticipant>();
            try
            {

                elemetsAsiggned = await restClient.Get<List<ElementsAssigned_ByParticipant>>(baseUrl, $"/api/v1/analytics/participant/{participantID}/elements/assigned", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ViewBag.Projects = elemetsAsiggned;
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
            return Json(elemetsAsiggned);
        }
        [HttpGet]
        public async Task<JsonResult> GetTotalHoursReal_ByParticipantSelection(string participantsIDS, string dateStart, string dateEnd)
        {

            IEnumerable<TotalHoursReal_ByParticipantSelection> data = new List<TotalHoursReal_ByParticipantSelection>();
            try
            {
                data = await restClient.Get<List<TotalHoursReal_ByParticipantSelection>>(baseUrl, $"/api/v1/analytics/participants/{participantsIDS}/realhours/datestart/{dateStart}/dateend/{dateEnd}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetParticipantActivitiesHoursPlanned_ByProject(Guid participantID, Guid projectID)
        {

            List<GetParticipantActivitiesHoursPlanned_ByProject> ActivitiesProject = new List<GetParticipantActivitiesHoursPlanned_ByProject>();
            var respuesta = new Dictionary<string, object>();
            try
            {

                ActivitiesProject = await restClient.Get<List<GetParticipantActivitiesHoursPlanned_ByProject>>(baseUrl, $"/api/v1/analytics/participant/{participantID}/activities/project/{projectID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                respuesta.Add("data", ActivitiesProject);
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
        public async Task<JsonResult> GetDetailHoursPlannedvsReal_ByParticipant(Guid participantID, string startDate, string endDate)
        {

            List<GetDetailHoursPlannedvsReal_ByParticipant> DetailHours = new List<GetDetailHoursPlannedvsReal_ByParticipant>();
            var respuesta = new Dictionary<string, object>();
            try
            {
                var startDateFormat = String.Format("{0:MM/dd/yyyy}", startDate);
                var endDateFormat = String.Format("{0:MM/dd/yyyy}", endDate);
                DetailHours = await restClient.Get<List<GetDetailHoursPlannedvsReal_ByParticipant>>(baseUrl, $"/api/v1/analytics/participants/{participantID}/hoursrealvsplanned?startDate={startDateFormat}&endDate={endDateFormat}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                respuesta.Add("data", DetailHours);
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