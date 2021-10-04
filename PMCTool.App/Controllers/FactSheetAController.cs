using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
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
        [HttpGet]
        public async Task<IActionResult> Index(Guid? project)
        {
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
        [HttpPost]
        public async Task<IActionResult> getReportFactSheet(Guid? projectId)
        {
            dynamic modelProjectTab = new ExpandoObject();

            if (projectId != null)
            {
                string appToken = Request.Cookies["pmctool-token-app"];
                modelProjectTab.tabsheet  = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", appToken } });
               
                List<ProjectTask> projectTask = new List<ProjectTask>();
                List<ProjectTask> projectTaskFinally = new List<ProjectTask>();

                projectTask = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projecttaba/gettaskdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                foreach (var data in projectTask)
                {
                    if (data.WbsCode == "1.2" || data.WbsCode == "1.3" || data.WbsCode == "1.4" || data.WbsCode == "1.5") {
                        ProjectTask taskAppend = new ProjectTask() {
                            text =data.text,
                            start_date = data.start_date,
                            duration = data.duration,
                            status = data.status
                        };
                        projectTaskFinally.Add(taskAppend);
                    
                    }
                 
                }
                    modelProjectTab.ProjectTask = projectTaskFinally;
            }
            else
            {

            }
            ViewBag.ProjectSeleted = projectId;
            //AGREGAR CONSULTA PARA OBTENER EL STATUS DEL PROYECTO Y MANDAR EJECUTAR LAS COSULTAS NECESARIAS PARA EL PARCIAL VIEW QUE SE OCUPA
            var ProjectStatus = 2;//Ejecución
            if(ProjectStatus == 1)
            {
                return PartialView("~/Views/FactSheet/A/_ParcialIndexA.cshtml", modelProjectTab);
            }
            else
            {
                return PartialView("~/Views/FactSheet/A/_ParcialIndex.cshtml", modelProjectTab);
            }
        }
     }
}
