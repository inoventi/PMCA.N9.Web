using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class ProjectAnnotationsController : BaseController
    {
        public ProjectAnnotationsController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        #region P R O J E C T  A N N O T A T I O N

        [HttpGet]
        public async Task<JsonResult> GetAnnotations(Guid projectId, int type, Guid elementId)
        {
            var data = new List<ProjectAnnotation>();
            try
            {
                data = await restClient.Get<List<ProjectAnnotation>>(baseUrl, $"api/v1/projects/{projectId}/elements/{elementId}/annotations", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = data.OrderByDescending(t => t.CreatedOn).ToList();
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
        public async Task<JsonResult> GetTopNAnnotations(Guid projectId, int type, Guid elementId, int nAnnotations)
        {
            var data = new List<ProjectAnnotation>();
            try
            {
                data = await restClient.Get<List<ProjectAnnotation>>(baseUrl, $"/api/v1/projects/{projectId}/elements/{elementId}/annotations/top/{nAnnotations}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = data.OrderByDescending(t => t.CreatedOn).ToList();
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
        public async Task<JsonResult> GetCountAnnotations(Guid projectId, Guid elementId)
        {
            int count = 0;
            try
            {
                count = await restClient.Get<int>(baseUrl, $"/api/v1/projects/{projectId}/elements/{elementId}/annotations/count", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            return Json(count);
        }

        [HttpPost]
        public async Task<JsonResult> CreateAnnotation(Guid projectId, int type, Guid elementId, string annotation)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                ProjectAnnotation data = new ProjectAnnotation()
                {
                    ProjectID = projectId,
                    ElementType = type,
                    ElementID = elementId,
                    Annotation = annotation
                };

                var result = await restClient.Post<ProjectAnnotation, ProjectAnnotation>(baseUrl, $"/api/v1/projects/{projectId}/elements/{elementId}/annotations", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        #endregion
    }
}