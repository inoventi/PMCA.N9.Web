using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PMCTool.App.Attributes;
using System.Dynamic;
using PMCTool.App.Models;
using PMCTool.Models.Environment;
using PMCTool.Common.RestConnector;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Localization;
using PMCTool.Models.Core;
using Newtonsoft.Json;
using System.Text.Json;

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
        public IActionResult printReportReportedIncidents(ModelFilters data)
        {
            string url = "/ReportedIncidents/printViewReportReportedIncidents?model=";
            string requestParametersModel = JsonConvert.SerializeObject(data);

            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            });
        }

        public async Task<IActionResult> printViewReportReportedIncidents(string model)
        {
            var modelo = model.Split('|')[0];
            var token = model.Split('|')[1];
            ModelFilters data = JsonConvert.DeserializeObject<ModelFilters>(modelo);
            List<ActionsToMake> reportedIncidentsData = new List<ActionsToMake>();
            dynamic modelDetail = new ExpandoObject();
            try
            {
                reportedIncidentsData = await restClient.Get<List<ActionsToMake>>(baseUrl,
                   $"api/v1/reportedIncidents/data?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&advertisement={data.Advertisement}",
                   new Dictionary<string, string>() { { "Authorization", token } });

                modelDetail.projects = reportedIncidentsData;
                List<IncidentsReportA> arrayIncident = new List<IncidentsReportA>();
                foreach (var i in modelDetail.projects)
                {
                    List<IncidentsReportA> incidents = await restClient.Get<List<IncidentsReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{i.ProjectID}/evidences/incidents", new Dictionary<string, string>() { { "Authorization", token } });
                    foreach (var a in incidents)
                    {
                        IncidentsReportA incident = new IncidentsReportA();
                        incident.ProjectID = a.ProjectID;
                        incident.ActionPlan = a.ActionPlan;
                        incident.Description = a.Description;
                        incident.ElementType = a.ElementType;
                        incident.EvidenceDescripcion = a.EvidenceDescripcion;
                        incident.EvidenceID = a.EvidenceID;
                        incident.PlannedEndDate = a.PlannedEndDate;
                        incident.ProjectIncidentID = a.ProjectIncidentID;
                        incident.Status = a.Status;
                        incident.TaskDescripcion = a.TaskDescripcion;
                        incident.TaskID = a.TaskID;
                        arrayIncident.Add(incident);
                    }
                }
                modelDetail.incidents = arrayIncident;


                return PartialView("_ReportIncidents", modelDetail);


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
