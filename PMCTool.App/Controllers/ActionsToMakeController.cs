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
                programs = await restClient.Get<List<SelectionListItem>>(baseUrl, $"api/v1/globalstatus/select/programs/{idPortfolio}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
                List<ReportStatusGlobalMainbit001_ByProject> report = await restClient.Get<List<ReportStatusGlobalMainbit001_ByProject>>(baseUrl, $"api/v1/globalstatus/graphics/{idPortfolio}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var graphicStatusProjects = report.Where(x => x.ChartId == 2).Select(x => new Dictionary<string, object>
                {
                    { "name", x.NameProgramOrLabelStatus },
                    { "y", x.Total },
                    { "t", x.ElementId },
                    { "color", colors[x.NameProgramOrLabelStatus] }
                }).ToList();

                var graphicProjectsInProgram = report.Where(x => x.ChartId == 1).Select(x => new Dictionary<string, object>
                {
                    { "name", x.NameProgramOrLabelStatus },
                    { "y", x.Total },
                    { "t", x.ElementId },
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
        [HttpGet]
        [Route("ActionsToMake/DetailProjectsByProgram")]
        public async Task<IActionResult> GetDetailProjectsByProgramAsync(string idProgram)
        {
            var rowTable = "";
            try
            {
                List<ReportStatusGlobalDetailMainbit002_ByProject> report = await restClient.Get<List<ReportStatusGlobalDetailMainbit002_ByProject>>(baseUrl, $"api/v1/globalstatus/detail/projects/{idProgram}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                foreach(var projects in report)
                {
                    rowTable += @"<tr>
                                    <th>" + projects.ProgramName +@"</th>
                                    <td>"+projects.Name+@"</td>
                                </tr>";
                }
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
            return Json(rowTable);
        }
        [HttpGet]
        [Route("ActionsToMake/DetailProjectsByStatus")]
        public async Task<IActionResult> GetDetailProjectsByStatusAsync(string portfolio, string status)
        {
            var rowTable = "";
            try
            {
                List<ReportStatusGlobalDetailMainbit003> report = await restClient.Get<List<ReportStatusGlobalDetailMainbit003>>(baseUrl, $"api/v1/globalstatus/detail/projects/status/{portfolio}/{status}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                foreach (var projects in report)
                {
                    rowTable += @"<tr>
                                    <th>" + projects.Program+ @"</th>
                                    <td>" + projects.Name + @"</td>
                                    <td style='width: 150px;'>" + localizer[$"StatusString-{projects.Phase}"] + @"</td>
                                </tr>";
                }
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
            return Json(rowTable);
        }
        [HttpGet]
        [Route("ActionsToMake/ProjectsTableDetail")]
        public async Task<IActionResult> GetProjectsTableDetailAsync(string programa)
        {
            var rowTable = "";
            try
            {
                Dictionary<string, string> colors = new Dictionary<string, string>
                {
                    { "1", "#4CAF50"},           // Verde
                    { "2", "#e6c702"},           // Amarillo
                    { "3", "#dc3545"},           // Rojo
                    { "4", "#d0d0d0"},           // Gris claro
                    { "5", "#545454"},           // Gris oscuro
                    { "6", "#F1F5F9"}
                };
                List<ReportStatusGlobalDetailMainbit004> report = await restClient.Get<List<ReportStatusGlobalDetailMainbit004>>(baseUrl, $"api/v1/globalstatus/reportTableProjecs/{programa}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                foreach(var project in report)
                {
                    decimal? progress = Math.Round((Convert.ToDecimal(project.PlannedProgress)) * 100,2); // Math.Round(originalValue)
                    decimal? progressreal = Math.Round((Convert.ToDecimal(project.Progress)) * 100,2); // Math.Round(originalValue)
                     
                    rowTable += @"<tr>
                                    <th>" + project.Code + @"</th>
                                    <td>" + project.Name + @"</td>
                                    <td>" + localizer[$"phase-{project.Stage}"] + @"</td>
                                    <td>" + project.Phase + @"</td>
                                    <td>" + project.ProjectManagerName + @"</td>
                                    <td>" + project.LeaderName + @"</td>
                                    <td>" + project.StartDate?.ToString("yyyy-MM-dd") + @"</td>
                                    <td>" + project.EndDate?.ToString("yyyy-MM-dd") + @"</td>
                                    <td style='background-color:" + colors[project.Status.ToString()] +"'>" + localizer[$"F01-0{project.Status}"] + @"</td>
                                    <td>" + progress.ToString()+ @"%</td>
                                    <td>" + progressreal.ToString() + @"%</td>
                                </tr>";
                }
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
            return Json(rowTable);
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
