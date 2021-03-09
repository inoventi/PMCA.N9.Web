using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    public class ProjectEvidenceWeightController : BaseController
    {
        public ProjectEvidenceWeightController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        [HttpGet]
        public async Task<JsonResult> Get(Guid projectId, Guid activityId)
        {
            var data = new List<ProjectEvidenceWeight>();
            try
            {
                data = await restClient.Get<List<ProjectEvidenceWeight>>(baseUrl, $"/api/v1/projects/{projectId}/activities/{activityId}/evidences/Weights", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpPut]
        public async Task<JsonResult> UpdateBatch(Guid projectId, Guid activityId, IEnumerable<ProjectEvidenceWeight> data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Put<IEnumerable<ProjectEvidenceWeight>, IEnumerable<ProjectEvidenceWeight>>(baseUrl, $"/api/v1/projects/{projectId}/activities/{activityId}/evidences/Weights/batch", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
    }
}