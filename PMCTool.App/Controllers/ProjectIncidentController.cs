using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class ProjectIncidentController : BaseController
    {
        public ProjectIncidentController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        [HttpGet]
        public async Task<JsonResult> GetTopNIncidents(Guid elementID, int nIncidents)
        {
            var data = new List<ProjectIncident>();
            try
            {
                data = await restClient.Get<List<ProjectIncident>>(baseUrl, $"/api/v1/ProjectIncident/element/{elementID}/top/{nIncidents}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
    }
}