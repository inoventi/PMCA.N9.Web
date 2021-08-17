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
    
    public class FactSheetController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        private readonly IOptions<AppSettingsModel> _appSettings;
        public FactSheetController(
            IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
            _hostingEnvironment = hostingEnvironment;

        }

        [PMCToolAuthentication]
        [HttpGet]
        public async Task<IActionResult> Index(Guid? projectId)
        {
            SetActiveOption("4007");
            ProjectTabViewModel p = new ProjectTabViewModel();
            try
            {
                var projectTab = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/ProjectTab/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectId != null)
                {
                    ViewBag.Projects = projectTab.Where(c => c.Key == projectId).ToList();
                    var selectProject = projectTab.Where(c => c.Key == projectId).ToList();
                    p.ProjectID = selectProject[0].Key.Value;
                    p.ProjectName = selectProject[0].Value;
                }
                else
                {
                    ViewBag.Projects = projectTab.OrderBy(c => c.Value).ToList();
                    p.ProjectID = null;
                    p.ProjectName = null;
                    
                }

                return View(p);
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
        public async Task<IActionResult> demo(Guid? projectId)
        {
            string projectID = "d8b2e8cf-e1df-4724-a715-558b771564ed";
            ViewBag.ProjectID = projectID;
            List<ProjectTab> data = new List<ProjectTab>();
            string appToken = Request.Cookies["pmctool-token-app"];

            data = await restClient.Get<List<ProjectTab>>(baseUrl, $"/api/v1/ProjectTab/{projectID}", new Dictionary<string, string>() { { "Authorization", appToken } });
            dynamic modelProjectTab = new ExpandoObject();
            modelProjectTab.Data = data;

            List<ProjectTab_Task> projectTask = new List<ProjectTab_Task>();
            projectTask = await restClient.Get<List<ProjectTab_Task>>(baseUrl, $"/api/v1/ProjectTab/{projectID}/tasks", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            modelProjectTab.ProjectTask = projectTask;


            ViewBag.ProjectID = "d8b2e8cf-e1df-4724-a715-558b771564ed";
            

            return View("IndexReport", modelProjectTab);

        }

        [HttpGet]
        public async Task<JsonResult> GetProjectTab(Guid projectID)
        {
            List<ProjectTab> data = new List<ProjectTab>();
            try
            {
                data = await restClient.Get<List<ProjectTab>>(baseUrl, $"/api/v1/ProjectTab/{projectID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            return Json(data);
        }
        [HttpGet]
        public async Task<JsonResult> GetProjectTabTask(Guid projectID)
        {
            List<ProjectTab_Task> data = new List<ProjectTab_Task>();
            try
            {
                data = await restClient.Get<List<ProjectTab_Task>>(baseUrl, $"/api/v1/ProjectTab/{projectID}/tasks", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            return Json(data);
        }
        public IActionResult printReport(ProjectTabRequest data)
        {
             string url = "/FactSheet/printViewReport?model=";
            string requestParametersModel = JsonConvert.SerializeObject(data);

            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            }); 
        }
        public async Task<IActionResult> printViewReport(string model)
        {
            var modelo = model.Split('|')[0];
            var token = model.Split('|')[1];
            ProjectTabRequest projectTabRequest = JsonConvert.DeserializeObject<ProjectTabRequest>(modelo);

            try
            {
                 
                List<ProjectTab> data = new List<ProjectTab>();
 
                data = await restClient.Get<List<ProjectTab>>(baseUrl, $"/api/v1/ProjectTab/{projectTabRequest.ProjectID}", new Dictionary<string, string>() { { "Authorization", token } });
                dynamic modelProjectTab = new ExpandoObject();
                modelProjectTab.Data = data;

                List<ProjectTab_Task> projectTask = new List<ProjectTab_Task>();
                projectTask = await restClient.Get<List<ProjectTab_Task>>(baseUrl, $"/api/v1/ProjectTab/{projectTabRequest.ProjectID}/tasks", new Dictionary<string, string>() { { "Authorization", token } });
                modelProjectTab.ProjectTask = projectTask;
                 
                 return PartialView("IndexReport", modelProjectTab);

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
