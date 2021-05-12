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
    public class BranchAdvancesController : BaseController
    {
        public BranchAdvancesController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {

        }
        // GET: BranchAdvancesController
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
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
        //public async Task<JsonResult> getBranchAdvancesData(brachAdvances data)
        //{  

            //    List<ReportBrachAdvances> fullStates = new List<ReportBrachAdvances>();
            //    try
            //    {
            //         fullStates = await restClient.Get<List<ReportBrachAdvances>>(baseUrl,
            //                            $"api/v1/branchadvances/reportdata/estate/{data.estadoid}/data?municipiosid={data.municipiosid}&tipopredio={data.tipopredio}&tipovista={data.tipovista}",
            //            new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });


            //        return Json(new { hasError = false, data = fullStates });

            //    }
            //    catch (HttpResponseException ex)
            //    {
            //        return Json(new { hasError = true, message= ex.Message });

            //    }
            //    catch (Exception ex)
            //    {
            //        return Json(new { hasError = true, message = ex.Message }); 
            //    }

            //}



        }
}
