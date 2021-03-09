using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Diagnostics;
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
        [PMCToolAuthorize(ObjectCode = "3129")]
        [HttpGet]
        public IActionResult Organigrama()
        {
            SetActiveOption("3129");
            return View();
        }
        [HttpGet]
        public async Task<JsonResult> GetOrganigramaByCompany(Guid companyId)
        {
            List<AreaScaling_ByCompany> area = new List<AreaScaling_ByCompany>();
            List<ResponsableArea_ByCompany> responsable = new List<ResponsableArea_ByCompany>();
            List<Participants_ByArea> participants = new List<Participants_ByArea>();
            var respuesta = new Dictionary<string, object>();
            try
            {
                // GET api/v1/analytics/areas/{companyId}
                area = await restClient.Get<List<AreaScaling_ByCompany>>(baseUrl, $"api/v1/analytics/areas/{companyId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                // GET api/v1/analytics/Responsable/Area/{companyId}
                responsable = await restClient.Get<List<ResponsableArea_ByCompany>>(baseUrl, $"api/v1/analytics/Responsable/Area/{companyId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                // GET api/v1/analytics/Participants/Area/{companyId}
                participants = await restClient.Get<List<Participants_ByArea>>(baseUrl, $"api/v1/analytics/Participants/Area/{companyId}", new Dictionary<string, string> { { "Authorization", GetTokenValue("Token") } });

                respuesta.Add("areas", area);
                respuesta.Add("responsable", responsable);
                respuesta.Add("participants", participants);
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