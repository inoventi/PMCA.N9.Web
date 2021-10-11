using System;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    public class ReportedIncidentsController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        public ReportedIncidentsController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<IActionResult> Index()
        {
            List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.States = states;
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> GetDataReportedIncidents(ModelFilters data)
        {
            List<ActionsToMake> reportedIncidentsData = new List<ActionsToMake>();
            try
            {
                reportedIncidentsData = await restClient.Get<List<ActionsToMake>>(baseUrl,
                   $"api/v1/reportedIncidents/data?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&advertisement={data.Advertisement}",
                   new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            return PartialView("~/Views/ReportedIncidents/_ParcialTableIncidents.cshtml", reportedIncidentsData);
        }
        [HttpPost]
        public async Task<IActionResult> getIncidentsByProject(Guid? project)
        {
            List<IncidentsReportA> Incidents = await restClient.Get<List<IncidentsReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}/evidences/incidents", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            return PartialView("~/Views/ReportedIncidents/_ParcialIncidentsByProject.cshtml", Incidents);
        }
    }
}
