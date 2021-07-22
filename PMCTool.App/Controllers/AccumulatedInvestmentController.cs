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
    public class AccumulatedInvestmentController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly List<string> monthKeys = new List<string> { "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" };

        public AccumulatedInvestmentController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<IActionResult> Index()
        {
            SetActiveOption("4005");
            List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.States = states;
            return View();
        }
        [HttpPost]
        [PMCToolAuthentication]
        public async Task<IActionResult> GetDataAccumulatedInvestment(ModelFiltersInvestment data)
        {
            AccumulatedInvestmentSummary accumulatedInvestment = new AccumulatedInvestmentSummary();
            try
            {
                accumulatedInvestment = await restClient.Get<AccumulatedInvestmentSummary>(baseUrl,
                                   $"api/v1/accumulatedinvestment/data?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&year={data.Year}",
                   new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                return PartialView("_PartialChart", accumulatedInvestment);

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
        public async Task<JsonResult> GetDataDrawChart(ModelFiltersInvestment data)
        {
            List<AccumulatedInvestment> AccumulatedInvestmentChart = new List<AccumulatedInvestment>();
            try
            {
                AccumulatedInvestmentChart = await restClient.Get<List<AccumulatedInvestment>>(baseUrl,
                                   $"api/v1/accumulatedinvestment/data/chart?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&year={data.Year}",
                   new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                return Json(AccumulatedInvestmentChart);

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
        public async Task<IActionResult> GetDataAccumulatedInvestmentDetail(ModelFiltersInvestmentDetail data)
        {
            List<AccumulatedInvestmentDetail> accumulatedInvestmentDetail = new List<AccumulatedInvestmentDetail>();
            try
            {
                accumulatedInvestmentDetail = await restClient.Get<List<AccumulatedInvestmentDetail>>(baseUrl,
                                   $"api/v1/accumulatedinvestment/data/detail?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&year={data.Year}&type={data.Type}&month={data.MontID}",
                   new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                return PartialView("_PartialTableDetail", accumulatedInvestmentDetail);

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
        private string getCategoryTranslated(int month)
        {
            try
            {
                // return localizer.getString(monthKeys[month - 1]).toString();
                return monthKeys[month - 1];
            }
            catch (IndexOutOfRangeException)
            {
                return "error";
            }
        }
    }
}
