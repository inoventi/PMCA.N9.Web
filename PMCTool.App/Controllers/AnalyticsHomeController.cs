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
        [PMCToolAuthorize(ObjectCode = "3000")]

        [HttpGet]
        public async Task<JsonResult> GetSessionToken()
        {
            List<UserToken> data = new List<UserToken>();
            try
            {
                String userId = GetTokenValue("UserId");
                data = await restClient.Get<List<UserToken>>(baseUrl, $"api/v1/analytics/participant/{userId}/sessiontoken", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetProjectsByParticipantHome(Guid participantID)
        {
            var respuesta = new Dictionary<string, object>();
            try
            {
                var data = await restClient.Get<List<Projects_ByParticipantHome>>(baseUrl, $"api/v1/analytics/participant/{participantID}/projects", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var DataOrder = data.OrderBy(c => c.ProjectName);
                respuesta.Add("data",DataOrder);
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
        public async Task<JsonResult> GetComplianceGoal_ByParticipant(Guid participantID)
        {
            List<ComplianceGoal_ByParticipant> data = new List<ComplianceGoal_ByParticipant>();
            try
            {
                data = await restClient.Get<List<ComplianceGoal_ByParticipant>>(baseUrl, $"api/v1/analytics/participant/{participantID}/compliancegoal", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetQualityTracing_ByElements(Guid participantID)
        {
            List<QualityTracing_ByElements> data = new List<QualityTracing_ByElements>();
            try
            {
                data = await restClient.Get<List<QualityTracing_ByElements>>(baseUrl, $"api/v1/analytics/participant/{participantID}/qualitytracing", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetElementsStatusCount_ByParticipant(Guid participantID)
        {
            List<ParticipantElementsCount_ByStatus> data = new List<ParticipantElementsCount_ByStatus>();
            try
            {
                data = await restClient.Get<List<ParticipantElementsCount_ByStatus>>(baseUrl, $"api/v1/analytics/participants/{participantID}/elements/status", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPartcipantID()
        {
            Participant participant = await GetParticipant();
            return Json(participant.ParticipantID);
        }
    }
}