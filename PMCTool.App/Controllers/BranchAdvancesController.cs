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
 
    public class BranchAdvancesController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        public BranchAdvancesController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        [PMCToolAuthentication] 
        public async Task<IActionResult> Index()
        {
            SetActiveOption("4002");
            List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.States = states;
            return View();
        }

        public IActionResult printReportBranchAdvances(brachAdvances data)
        {
            string url = "/BranchAdvances/printViewReportBranchAdvances?model=";
            string requestParametersModel = JsonConvert.SerializeObject(data);
             
            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            });
        }
        public async Task<IActionResult> printViewReportBranchAdvances(string model)
        {
            List<ReportBrachAdvances> fullStates = new List<ReportBrachAdvances>();
            var modelo = model.Split('|')[0]; 
            var token = model.Split('|')[1];

             brachAdvances data = JsonConvert.DeserializeObject<brachAdvances>(modelo);

            try
            {
                if (data.estadoid == null)
                {
                    data.estadoid = 0;
                }

                fullStates = await restClient.Get<List<ReportBrachAdvances>>(baseUrl,
                                   $"api/v1/branchadvances/reportdata/estate/{data.estadoid}/data?municipiosid={data.municipiosid}&tipopredio={data.tipopredio}&tipovista={data.tipovista}",
                                    new Dictionary<string, string>() { { "Authorization", token } });
                ///ViewBag.data = fullStates;
                if (data.tipovista == "default")
                {
                    return PartialView("_ParcialTableDefaultIndexReport", fullStates);
                }
                else
                {
                    return PartialView("_ParcialTablePercentageIndexReport", fullStates);
                }


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



        [HttpPost]
        [PMCToolAuthentication]

        public async Task<JsonResult> getMunicipalities(int estateID) {

            var respuesta = new Dictionary<string, object>(); 
            List<EstatesMunicipalities> fullStates = new List<EstatesMunicipalities>(); 
            try
            {
                fullStates = await restClient.Get<List<EstatesMunicipalities>>(baseUrl, $"/api/v1/locations/state/{estateID}/Municipalities", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var cleanfullStates = fullStates.RemoveAll(x => x.EstateID != estateID);
                //ViewBag.Particpants = participants;

            }
            catch (HttpResponseException ex)
            {
                
            }
            catch (Exception ex)
            {
                 
            }


            return Json(fullStates);

        }
        [HttpPost]
        [PMCToolAuthentication]

        public async Task<IActionResult> getBranchAdvancesData(brachAdvances data)
        {
            List<ReportBrachAdvances> fullStates = new List<ReportBrachAdvances>();
            try
            {
                if (data.estadoid == null) {
                    data.estadoid = 0;
                }
                fullStates = await restClient.Get<List<ReportBrachAdvances>>(baseUrl,
                                   $"api/v1/branchadvances/reportdata/estate/{data.estadoid}/data?municipiosid={data.municipiosid}&tipopredio={data.tipopredio}&tipovista={data.tipovista}",
                   new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ///ViewBag.data = fullStates;
                if (data.tipovista == "default") {
                    return PartialView("_ParcialTableDefaultIndex", fullStates);
                }else {
                    return PartialView("_ParcialTablePercentageIndex", fullStates);
                }
              
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
