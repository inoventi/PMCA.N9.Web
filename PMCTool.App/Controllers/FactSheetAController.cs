using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using PMCTool.App.Attributes;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;
using Syncfusion.HtmlConverter;
using Syncfusion.Pdf;

namespace PMCTool.App.Controllers
{
    public class FactSheetAController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment; 
        private readonly IOptions<AppSettingsModel> _appSettings;

        public FactSheetAController(
            IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
            _hostingEnvironment = hostingEnvironment;

        }
        [PMCToolAuthentication]
        [HttpGet]
        public async Task<IActionResult> Index(Guid? project)
        {
            SetActiveOption("4007");
            ProjectTabViewModel p = new ProjectTabViewModel();
            try
            {
                var projectTab = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projecttaba/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                //if (project != null)
                //{
                //    ViewBag.Projects = projectTab.Where(c => c.Key == project).ToList();
                //    var selectProject = projectTab.Where(c => c.Key == project).ToList();
                //    p.ProjectID = selectProject[0].Key.Value;
                //    p.ProjectName = selectProject[0].Value;
                //}
                //else
                //{

                    ViewBag.Projects = projectTab.OrderBy(c => c.Value).ToList();
                    p.ProjectID = null;
                    p.ProjectName = null;


                //}


                ViewBag.ProjectSeleted = project;

                return View("~/Views/FactSheet/A/Index.cshtml", p);
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


           
        }
        [PMCToolAuthentication]
        [HttpGet]
        public async Task<IActionResult> ProjectDetail(Guid? project)
        {
            ViewBag.ProjectSeleted = project;
            string appToken = Request.Cookies["pmctool-token-app"];
            dynamic modelDetail = new ExpandoObject();

            List<ProjectTabA> pp = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}", new Dictionary<string, string>() { { "Authorization", appToken } });
            modelDetail.Project = pp;
            List<EvidencesLayerSpecifications> Evidences = await restClient.Get<List<EvidencesLayerSpecifications>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}/evidences", new Dictionary<string, string>() { { "Authorization", appToken } });
            modelDetail.Evidences = Evidences;
            List<IncidentsReportA> Incidents = await restClient.Get<List<IncidentsReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}/evidences/incidents", new Dictionary<string, string>() { { "Authorization", appToken } });
            modelDetail.Incidents = Incidents;
            List<ActionPlanReportA> ActionPlan = await restClient.Get<List<ActionPlanReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}/actionsplan", new Dictionary<string, string>() { { "Authorization", appToken } });
            modelDetail.ActionPlan = ActionPlan;

            //List<ProjectTabA> pp2 = await restClient.Get<List<ProjectTabA>>(baseUrl, $"api/v1/projects/{project}/evidences", new Dictionary<string, string>() { { "Authorization", appToken } });


            return View("~/Views/FactSheet/A/ProjectDetail.cshtml", modelDetail);
        }
        

        [HttpPost]
        public async Task<IActionResult> getControlPointbyEvidence(Guid? evidence)
        {
            var respuesta = new Dictionary<string, object>();
            dynamic modelProjectTab = new ExpandoObject();
 
            string appToken = Request.Cookies["pmctool-token-app"];
            modelProjectTab.controlPoints = await restClient.Get<List<ControlPoints>>(baseUrl, $"/api/v1/projecttaba/getdetail/{evidence}/evidences/controlpoints", new Dictionary<string, string>() { { "Authorization", appToken } });
  
             
             
            return PartialView("~/Views/FactSheet/A/_PartialControlPoints.cshtml", modelProjectTab);

 
        }
        public async Task<bool> LoadImage(string chart, string projectID)
        { 
            var chartImagen = chart.Split(',')[1];
            byte[] bytes = Convert.FromBase64String(chartImagen); 
            String path = Path.Combine(_hostingEnvironment.WebRootPath, @"images\chart\"); //Path 

            //Check if directory exist
            if (!System.IO.Directory.Exists(path))
            {
                System.IO.Directory.CreateDirectory(path); //Create directory if it doesn't exist
            }

            string imageName = projectID + ".jpg";

            //set the image path
            string imgPath = Path.Combine(path, imageName);

            byte[] imageBytes = Convert.FromBase64String(chartImagen);

            System.IO.File.WriteAllBytes(imgPath, imageBytes);

           

            return true;
        }  

        [HttpPost]
        public async Task<IActionResult> getReportFactSheet(Guid? projectId)
        {
            dynamic modelProjectTab = new ExpandoObject();
            List<ProjectTask> projectTaskFinally = new List<ProjectTask>();
            string stage = null;
            if (!string.IsNullOrEmpty(projectId.ToString()))
            {
                ViewBag.ProjectSeleted = projectId;
                string appToken = Request.Cookies["pmctool-token-app"];
                var tabsheet = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", appToken } });
                foreach (var projectTab in tabsheet)
                {
                    stage = projectTab.Stage;
                }
                modelProjectTab.tabsheet = tabsheet;
                
                if (!string.IsNullOrEmpty(stage))
                {
                    if (stage == "Preparativos de ejecución" || stage == "Ejecución")
                    {
                        var projectEvidences = await restClient.Get<List<FactSheetA_Evidences>>(baseUrl, $"/api/v1/projecttaba/{projectId}/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        modelProjectTab.ProjectEvidences = projectEvidences;

                        var projectTask = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projecttaba/gettaskdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        foreach (var data in projectTask)
                        {
                            if (data.WbsCode == "1.5.2.1" || data.WbsCode == "1.5.2.3" || data.WbsCode == "1.5.2.4" || data.WbsCode == "1.5.2.5")
                            {
                                ProjectTask taskAppend = new ProjectTask()
                                {
                                    text = data.text == "Convocatoria / Oficio de adjudicación" ? "Convocatoria" : data.text,
                                    start_date = data.start_date,
                                    status = data.status
                                };
                                projectTaskFinally.Add(taskAppend);
                            }
                        }
                        modelProjectTab.ProjectTask = projectTaskFinally;

                        return PartialView("~/Views/FactSheet/A/_ParcialIndexA.cshtml", modelProjectTab);
                    }
                    else
                    {
                       var projectTask = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projecttaba/gettaskdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        foreach (var data in projectTask)
                        {
                            if (data.WbsCode == "1.1" || data.WbsCode == "1.2" || data.WbsCode == "1.3" || data.WbsCode == "1.4")
                            {
                                ProjectTask taskAppend = new ProjectTask()
                                {
                                    text = data.text,
                                    start_date = data.start_date,
                                    duration = data.duration,
                                    status = data.status
                                };
                                projectTaskFinally.Add(taskAppend);
                            }
                        }
                        modelProjectTab.ProjectTask = projectTaskFinally;

                        return PartialView("~/Views/FactSheet/A/_ParcialIndex.cshtml", modelProjectTab);
                    }
                }
            }
            modelProjectTab.ProjectTask = projectTaskFinally;
            return PartialView("~/Views/FactSheet/A/_ParcialIndex.cshtml", modelProjectTab);
        }
        public IActionResult printReportFactSheetA(ProjectModelReport data)
        {
            string url = "/FactSheetA/printViewReportFactSheetA?model=";
            string requestParametersModel = JsonConvert.SerializeObject(data);

            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            });
        }
        public IActionResult printReportFactSheetADetail(ProjectModelReport data)
        {
            string url = "/FactSheetA/printViewReportFactSheetADetail?model=";
            string requestParametersModel = JsonConvert.SerializeObject(data);

            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            });
        }
        public async Task<IActionResult> printViewReportFactSheetADetail(string model)
        {
            // xxx
            //List<ModelFilters> fullStates = new List<ModelFilters>();
            var modelo = model.Split('|')[0];
            var appToken = model.Split('|')[1];

            ProjectModelReport dataModel = JsonConvert.DeserializeObject<ProjectModelReport>(modelo);
            dynamic modelProjectTab = new ExpandoObject();

            try
            {
                ViewBag.ProjectSeleted = dataModel.project; 
                dynamic modelDetail = new ExpandoObject();

                List<ProjectTabA> pp = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}", new Dictionary<string, string>() { { "Authorization", appToken } });
                modelDetail.Project = pp;
                List<EvidencesLayerSpecifications> Evidences = await restClient.Get<List<EvidencesLayerSpecifications>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}/evidences", new Dictionary<string, string>() { { "Authorization", appToken } });
                modelDetail.Evidences = Evidences;
                List<IncidentsReportA> Incidents = await restClient.Get<List<IncidentsReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}/evidences/incidents", new Dictionary<string, string>() { { "Authorization", appToken } });
                modelDetail.Incidents = Incidents;
                List<ActionPlanReportA> ActionPlan = await restClient.Get<List<ActionPlanReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}/actionsplan", new Dictionary<string, string>() { { "Authorization", appToken } });
                modelDetail.ActionPlan = ActionPlan;


                //puntos de control
                //var e = "3b22ab5e-1c2b-4d71-92b5-0cea81e961b4,422d8ae0-bf0d-4d8c-9063-a3e6b44df251";
                //var evidences = e.Split(',');
                //var evidences = dataModel.evidences.Split(',');
                List<ControlPoints> controlPointAll = new List<ControlPoints>();
                foreach (var evidence in Evidences)
                {
                    List<ControlPoints> controlPointsDb = await restClient.Get<List<ControlPoints>>(baseUrl, $"/api/v1/projecttaba/getdetail/{evidence.ProjectEvidenceID}/evidences/controlpoints", new Dictionary<string, string>() { { "Authorization", appToken } });
                    foreach (var item in controlPointsDb)
                    {
                        ControlPoints cp = new ControlPoints();
                        cp.ProjectEvidenceID = item.ProjectEvidenceID;
                        cp.Description = item.Description;
                        cp.Status = item.Status;
                        cp.PlannedEndDate = item.PlannedEndDate;
                        cp.Comments = item.Comments;
                        controlPointAll.Add(cp);

                    }

                }
                modelDetail.ControlPoints = controlPointAll;


                return View("~/Views/FactSheet/A/ProjectDetailReport.cshtml", modelDetail);



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
        public async Task<IActionResult> printViewReportFactSheetA(string model)
        {
            //List<ModelFilters> fullStates = new List<ModelFilters>();
            var modelo = model.Split('|')[0];
            var token = model.Split('|')[1];

            ProjectModelReport dataModel = JsonConvert.DeserializeObject<ProjectModelReport>(modelo);
            ViewBag.ProjectSeleted = dataModel.project;
            dynamic modelProjectTab = new ExpandoObject();

            try
            {
                List<ProjectTask> projectTask = new List<ProjectTask>();
                List<ProjectTask> projectTaskFinally = new List<ProjectTask>();
                var tabsheet = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}", new Dictionary<string, string>() { { "Authorization", token } }); 
                modelProjectTab.tabsheet = tabsheet;

                projectTask = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projecttaba/gettaskdetail/{dataModel.project}", new Dictionary<string, string>() { { "Authorization", token } });
                foreach (var data in projectTask)
                {
                    if (data.WbsCode == "1.1" || data.WbsCode == "1.2" || data.WbsCode == "1.3" || data.WbsCode == "1.4")
                    {
                        ProjectTask taskAppend = new ProjectTask()
                        {
                            text = data.text,
                            start_date = data.start_date,
                            duration = data.duration,
                            status = data.status
                        };
                        projectTaskFinally.Add(taskAppend);
                    }
                }
                modelProjectTab.ProjectTask = projectTaskFinally;

                return View("~/Views/FactSheet/A/_ParcialIndexReport.cshtml", modelProjectTab);
                 


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
        public class ProjectModelReport
        {
            public string project { get; set; } 
            public string evidences { get; set; } 
        }
    }
}
