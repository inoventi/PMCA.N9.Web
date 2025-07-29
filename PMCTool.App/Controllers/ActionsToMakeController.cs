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
using Newtonsoft.Json;
using System.Text.Json;

namespace PMCTool.App.Controllers
{
    public class ActionsToMakeController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        public ActionsToMakeController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        [PMCToolAuthentication]
        public async Task<IActionResult> Index()
        {
            SetActiveOption("4008");
            //List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            List<SelectionListItem> portfolios = await restClient.Get<List<SelectionListItem>>(baseUrl, $"api/v1/globalstatus/select/portfolios", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.portfolios = portfolios;
            //ViewBag.States = states;
            return View();
        }
        [HttpGet]
        [Route("ActionsToMake/GetPrograms")]
        public async Task<IActionResult> GetGlobalStatusSelectProgramsByPortfolioAsync(string idPortfolio)
        {
            List<SelectionListItem> programs = new List<SelectionListItem>();
            try
            {
                programs = await restClient.Get<List<SelectionListItem>>(baseUrl, $"api/v1/globalstatus/select/programs/" + idPortfolio, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            return Json(programs);
        }
        [HttpGet]
        [Route("ActionsToMake/Graphics")]
        public async Task<IActionResult> GetGraphicsGlobalStatusAsync(string idPortfolio)
        {
            Dictionary<string, string> colors = new Dictionary<string, string>
            {
                { "OnTime", "#4CAF50"},           // Verde
                { "Delayed", "#e6c702"},          // Amarillo
                { "WithImpact", "#dc3545"},       // Rojo
                { "Closed", "#d0d0d0"},           // Gris claro
                { "Cancel", "#545454"},           // Gris oscuro
                { "Onsettings", "#F1F5F9"}
            };
            Dictionary<string, object> graphics = new Dictionary<string, object>();
            try
            {
                List<ReportStatusGlobalMainbit001_ByProject> report = await restClient.Get<List<ReportStatusGlobalMainbit001_ByProject>>(baseUrl, $"api/v1/globalstatus/graphics/"+idPortfolio, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var graphicStatusProjects = report.Where(x => x.ChartId == 2).Select(x => new Dictionary<string, object>
                {
                    { "name", x.NameProgramOrLabelStatus },
                    { "y", x.Total },
                    { "t", x.ChartId },
                    { "color", colors[x.NameProgramOrLabelStatus] }
                }).ToList();

                var graphicProjectsInProgram = report.Where(x => x.ChartId == 1).Select(x => new Dictionary<string, object>
                {
                    { "name", x.NameProgramOrLabelStatus },
                    { "y", x.Total },
                    { "t", x.ChartId },
                }).ToList();

                graphics.Add("graphicStatusProjects", graphicStatusProjects);
                graphics.Add("graphicProjectsInProgram", graphicProjectsInProgram);
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
            return Json(graphics);
        }
        [HttpPost]
        public async Task<IActionResult> GetDataActionsToMake(ModelFilters data)
        {
            List<ActionsToMake> actionsToMakeData = new List<ActionsToMake>();
            try
            {
                actionsToMakeData = await restClient.Get<List<ActionsToMake>>(baseUrl,
                   $"api/v1/actionstomake/data?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&advertisement={data.Advertisement}",
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

            return Json(actionsToMakeData);
        }
        public IActionResult printReportActionsToMake(ModelFilters data)
        {
            string url = "/ActionsToMake/printViewReportActionsToMake?model=";
            string requestParametersModel = JsonConvert.SerializeObject(data);

            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            });
        }
        public async Task<IActionResult> printViewReportActionsToMake(string model)
        {
            //List<ModelFilters> fullStates = new List<ModelFilters>();
            var modelo = model.Split('|')[0];
            var token = model.Split('|')[1];

            ModelFilters data = JsonConvert.DeserializeObject<ModelFilters>(modelo);

            List<ActionsToMake> actionsToMakeData = new List<ActionsToMake>();

            try
            {
                //if (data.estadoid == null)
                //{
                //    data.estadoid = 0;
                //}
                actionsToMakeData = await restClient.Get<List<ActionsToMake>>(baseUrl,
                   $"api/v1/actionstomake/data?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&advertisement={data.Advertisement}",
                   new Dictionary<string, string>() { { "Authorization", token } });
             
                
              return PartialView("_ReportActiosToMake", actionsToMakeData);
                

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
