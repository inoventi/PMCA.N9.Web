using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
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
    
    public class FactSheetController : BaseController
    {
        private readonly IOptions<AppSettingsModel> _appSettings;
        public FactSheetController(
            IOptions<AppSettingsModel> appSettings, 
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
        }

        //[PMCToolAuthorize(ObjectCode = "3100")]
        [HttpGet]
        public async Task<IActionResult> Index(Guid? projectId)
        {
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
    }
}
