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
using Syncfusion.Pdf;
using Syncfusion.HtmlConverter;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using System.Text.Json;
using Newtonsoft.Json;

namespace PMCTool.App.Controllers
{
    public class BranchLocationsController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        public BranchLocationsController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<IActionResult> Index()
        {
            SetActiveOption("002");
            List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.States = states;
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> GetBranchLocation(ReportBranchLocation data)
        {
            List<ReportBranchLocation> Report = new List<ReportBranchLocation>();
            try
            {
                if (data.State == null)
                {
                    data.State = "0";
                }
                Report = await restClient.Get<List<ReportBranchLocation>>(baseUrl, $"api/v1/branchlocation/state/{data.State}/data?municipalities={data.Municipalities}&predio={data.Predio}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(apiError);
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

            return Json(Report);
        }
        public IActionResult PrintReportBranchLocation(BranchLocation data)
        {
            string url = "/BranchLocations/printViewReportBranchLocation?model=";
            if(data.State == null)
            {
                data.State = 0;
            }
            string requestParametersModel = JsonConvert.SerializeObject(data);


            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            });
        }
        public async Task<IActionResult> printViewReportBranchLocation(string model)
        {
            List<ReportBranchLocation> fullStates = new List<ReportBranchLocation>();
            var modelo = model.Split('|')[0];
            var token = model.Split('|')[1];

            BranchLocation data = JsonConvert.DeserializeObject<BranchLocation>(modelo);

            try
            {                                                                                  
                fullStates = await restClient.Get<List<ReportBranchLocation>>(baseUrl,$"api/v1/branchlocation/reportdata/state/{data.State}/data?municipalities={data.Municipalities}&predio={data.Predio}",new Dictionary<string, string>() { { "Authorization", token } });
                return PartialView("_PartialReportBranchLocation", fullStates);


            }
            catch (HttpResponseException ex)
            {
                return Json(new { hasError = true, message = ex.Message });

            }
            catch (Exception ex)
            {
                return Json(new { hasError = true, message = ex.Message });
            }
        }
    }
}
