using DocumentFormat.OpenXml.Presentation;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.Web.CodeGeneration.Design;
using Newtonsoft.Json;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace PMCTool.App.Controllers
{
    public class ProjectController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
       
        public ProjectController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        // GET: ProjectController
        public ActionResult Index()
        {
            return LocalRedirect("/Home/Index"); 

             
        }

        [HttpGet] 
        [Route("Project/ReportEvidences")]
        public async Task<IActionResult> ReportEvidences()
        {
            var projectTab = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/ProjectTab/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            SetActiveOption("4008");
            ViewBag.projects = projectTab;
            ViewBag.baseUrlPmctool = baseUrlPMCTool;

            return View();
        }
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
        [HttpPost]
        [Route("Project/GetReportEvidencesByProjec006")]
        public async Task<IActionResult> GetReportEvidencesByProjecID006(Guid projectID)
        {
            //var _httpResponse = new ObjectResult(null);
            //ResponseRequest _response = new ResponseRequest();

            //Dictionary<string, List<ReportEvidencesByProjecID006>> result = new Dictionary<string, List<ReportEvidencesByProjecID006>>();
            List<ReportEvidencesByProjecID006> reportData = new List<ReportEvidencesByProjecID006>();
            try
            {
                reportData = await restClient.Get<List<ReportEvidencesByProjecID006>>(baseUrl, $"/api/v1/actionstomake/reportEvidencesByProjecID006/{projectID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ViewBag.Leader= reportData.First().LeaderName;
                ViewBag.Pm= reportData.First().ProjectManagerName;
                ViewBag.BaseUrlPmctool = baseUrlPMCTool;
                //_response.Data = elements;
                //_response.IsSuccess = true;


            }
            catch (HttpResponseException ex)
            {
                //_response.Data = null;
                //_response.IsSuccess = false;
                //_response.SuccessMessage = ex.Message.ToString();
                
            }
            catch (Exception ex)
            {

                //_response.Data = null;
                //_response.IsSuccess = false;
                //_response.SuccessMessage = ex.Message.ToString(); C:\PMCTool\PMCAnalytics.Application\PMCTool.App\Views\Project\_PartialReportEvidences.cshtml

            }
            return PartialView("_PartialReportEvidences", reportData);
        }

        [PMCToolAuthentication]
        public async Task<IActionResult> ProjectSheet()
        {
            var projectTab = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/ProjectTab/selectionList/withfilter", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            SetActiveOption("4008");
            ViewBag.projects = projectTab;
            ViewBag.baseUrlPmctool = baseUrlPMCTool;
            return View();
        }


        [HttpGet]
        [Route("Project/ReportGetProjectSheetByID")]
        public async Task<IActionResult> ReportGetProjectSheetByID(Guid projectId)
        {
            ReportGetProjectSheetByID result = new ReportGetProjectSheetByID();
            try
            {
                result = await restClient.Get<ReportGetProjectSheetByID>(baseUrl, $"/api/v1/project/reportGetProjectSheedById/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            return Json(result);
        }

        [HttpGet]
        [Route("Project/GetReportGanttActivitiesByID")]
        public async Task<IActionResult> GetReportGanttActivitiesByID(Guid projectId)
        {
            List<ReportGanttActivitiesByID> result = new List<ReportGanttActivitiesByID>();
            try
            {
                result = await restClient.Get<List<ReportGanttActivitiesByID>>(baseUrl, $"/api/v1/project/reportGanttActivitiesByID/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            return Json(result);
        }
        [HttpGet]
        [Route("Project/GetProjectElementCountByParticipant")]
        public async Task<IActionResult> GetProjectElementCountByParticipant(Guid projectId)
        {
            GetProjectElementCount_ByParticipant result = new GetProjectElementCount_ByParticipant();
            try
            {
                result = await restClient.Get<GetProjectElementCount_ByParticipant>(baseUrl, $"/api/v1/project/projectElementCountByParticipant/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            return Json(result);
        }

        [HttpGet]
        [Route("Project/reportGetProjectSheedById002")]
        public async Task<IActionResult> reportGetProjectSheedById002(Guid projectId)
        {
            ReportGetProjectSheetByID002 result = new ReportGetProjectSheetByID002();
            try
            {
                result = await restClient.Get<ReportGetProjectSheetByID002>(baseUrl, $"/api/v1/project/reportGetProjectSheedById002/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            return Json(result);
        }
    }
}
