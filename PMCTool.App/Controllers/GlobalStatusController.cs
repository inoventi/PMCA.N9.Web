using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Models.Environment;
using PMCTool.Common.RestConnector;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Localization;
using PMCTool.Models.Core;

namespace PMCTool.App.Controllers
{
    public class GlobalStatusController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        public GlobalStatusController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        [PMCToolAuthentication]
        public async Task<IActionResult> Index()
        {
            SetActiveOption("4004");
            List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.States = states;
            return View();
        }
        //[PMCToolAuthentication]
        //public async Task<IActionResult> Index()
        //{
        //    SetActiveOption("4004");
        //    List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
        //    ViewBag.States = states;
        //    return View();
        //}

        //[HttpPost]
        //[PMCToolAuthentication]
        //public async Task<IActionResult> GetDataGlobalStatus(ModelFilters data)
        //{
        //    List<GlobalStatus> globalStatusData = new List<GlobalStatus>();
        //    try
        //    {
        //        globalStatusData = await restClient.Get<List<GlobalStatus>>(baseUrl,
        //                           $"api/v1/globalstatus/data?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&advertisement={data.Advertisement}",
        //           new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
        //        return PartialView("_PartialTableGlobalStatus", globalStatusData);

        //    }
        //    catch (HttpResponseException ex)
        //    {
        //        return Json(new { hasError = true, message = ex.Message });

        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { hasError = true, message = ex.Message });
        //    }
        //}

        //[HttpPost]
        //[PMCToolAuthentication]
        //public async Task<IActionResult> GetDataGlobalStatusDetail(ModelFilters data)
        //{
        //    List<GlobalStatusDetail> globalStatusDetailData = new List<GlobalStatusDetail>();

        //    try
        //    {
        //        globalStatusDetailData = await restClient.Get<List<GlobalStatusDetail>>(baseUrl,
        //                            $"api/v1/globalstatus/detail/data?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&advertisement={data.Advertisement}",
        //           new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

        //        return PartialView("_PartialTableGlobalStatusDetail", globalStatusDetailData);

        //    }
        //    catch (HttpResponseException ex)
        //    {
        //        return Json(new { hasError = true, message = ex.Message });

        //    }
        //    catch (Exception ex)
        //    {
        //        return Json(new { hasError = true, message = ex.Message });
        //    }
            
        //}
    }
}
