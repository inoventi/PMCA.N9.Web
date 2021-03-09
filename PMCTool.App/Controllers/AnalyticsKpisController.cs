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
        
        [PMCToolAuthorize(ObjectCode = "3128")]
        public IActionResult Kpis()
        {
            SetActiveOption("3128");
            return View();
        }
        [HttpGet]
        public async Task<JsonResult> GetKpisByParticipants(string participantsIds, string startDate, string endDate)
        {
            // get cookie del idioma
            //string token = HttpContext.Request.Cookies["pmctool-token-app"];
            List<Kpis_byParticipants> data = new List<Kpis_byParticipants>();
            List<KpisParticipant> datax = new List<KpisParticipant>();
            var respuesta = new Dictionary<string, object>();
            try
            {
                // [HttpGet("kpis/participants")]
                 data = await restClient.Get<List<Kpis_byParticipants>>(baseUrl, $"/api/v1/analytics/kpis/participants?participantsids={participantsIds}&startDate={startDate}&endDate={endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                for (int i = 0; i < data.Count; i++)
                {
                    datax.Add(new KpisParticipant
                    {
                        Serie= i,
                        ParticipantID = data[i].ParticipantID,
                        ParticipantName = data[i].ParticipantName,
                        TotalClosedInTimeA = data[i].TotalClosedInTimeA,
                        TotalClosedA = data[i].TotalClosedA,
                        TotalDelayedB = data[i].TotalDelayedB,
                        TotalElementsActiveB = data[i].TotalElementsActiveB,
                        TotalDelayedCustomD = data[i].TotalDelayedCustomD,
                        TotalOnTimeCustomD = data[i].TotalOnTimeCustomD,
                        OwnerPhoto = data[i].OwnerPhoto
                    });

                }
                respuesta.Add("kpis", datax); 
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