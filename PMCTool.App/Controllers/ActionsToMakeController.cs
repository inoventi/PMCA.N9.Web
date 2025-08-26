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
            List<SelectionListItem> portfolios = await restClient.Get<List<SelectionListItem>>(baseUrl, $"api/v1/actionstomake/select/portfolios", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
                programs = await restClient.Get<List<SelectionListItem>>(baseUrl, $"api/v1/actionstomake/select/programs/{idPortfolio}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
                { "En-tiempo", "#4CAF50"},           // Verde
                { "Atrasado", "#e6c702"},          // Amarillo
                { "Con-Impacto", "#dc3545"},       // Rojo
                { "Cerrado", "#d0d0d0"},           // Gris claro
                { "Cancelado", "#545454"},           // Gris oscuro
                { "En-Configuracion", "#F1F5F9"}
            };
            Dictionary<string, object> graphics = new Dictionary<string, object>();
            try
            {
                List<ReportStatusGlobalMainbit001_ByProject> report = await restClient.Get<List<ReportStatusGlobalMainbit001_ByProject>>(baseUrl, $"api/v1/actionstomake/graphics/{idPortfolio}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
                List<ReportStatusGlobalDetailMainbit002_ByProject> report = await restClient.Get<List<ReportStatusGlobalDetailMainbit002_ByProject>>(baseUrl, $"api/v1/actionstomake/detail/projects/{idProgram}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                foreach (var projects in report)
                {
                    rowTable += @"<tr>
                                    <th>" + projects.ProgramName + @"</th>
                                    <td>" + projects.Name + @"</td>
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
            Dictionary<string, string> colors = new Dictionary<string, string>
            {
                { "En-tiempo", "#4CAF50"},           // Verde
                { "Atrasado", "#e6c702"},          // Amarillo
                { "Con-Impacto", "#dc3545"},       // Rojo
                { "Cerrado", "#d0d0d0"},           // Gris claro
                { "Cancelado", "#545454"},           // Gris oscuro
                { "En-Configuracion", "#F1F5F9"}
            };
            var rowTable = "";
            try
            {
                List<ReportStatusGlobalDetailMainbit003> report = await restClient.Get<List<ReportStatusGlobalDetailMainbit003>>(baseUrl, $"api/v1/actionstomake/detail/projects/status/{portfolio}/{status}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                foreach (var projects in report)
                {
                    rowTable += @"<tr>
                                    <th>" + projects.Program + @"</th>
                                    <td>" + projects.Name + @"</td>
                                    <td style='width: 150px; background: " + colors[projects.Phase] + ";font-weight: 500;'>" + projects.Phase + @"</td>
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
            List<ReportStatusGlobalDetailMainbit004> report = new List<ReportStatusGlobalDetailMainbit004>();
            try
            {
                report = await restClient.Get<List<ReportStatusGlobalDetailMainbit004>>(baseUrl, $"api/v1/actionstomake/reportTableProjecs/{programa}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                foreach (var project in report)
                {
                    project.PlannedProgress = Convert.ToDouble(Math.Round((Convert.ToDecimal(project.PlannedProgress)) * 100, 2)); // Math.Round(originalValue)
                    project.Progress = Convert.ToDouble(Math.Round((Convert.ToDecimal(project.Progress)) * 100, 2)); // Math.Round(originalValue)
                }
                var temp = report.Select(r => new ReportStatusGlobalDetailMainbit004()
                {
                    ProjectId = r.ProjectId,
                    Code = r.Code,
                    Name = r.Name,
                    Stage = localizer[r.Stage],
                    Phase = r.Phase,
                    ProjectManagerName = r.ProjectManagerName,
                    LeaderName = r.LeaderName,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate,
                    Status = r.Status,
                    PlannedProgress = r.PlannedProgress,
                    Progress = r.Progress,
                }).ToList();
                return Json(temp);
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
            return Json(report);
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

        public async Task<IActionResult> ElementsToVerify()
        {
            var projectTab = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/ProjectTab/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            SetActiveOption("4008");
            ViewBag.projects = projectTab;
            ViewBag.baseUrlPmctool = baseUrlPMCTool;
            return View();
        }
        [HttpGet]
        [Route("ActionsToMake/GetProjectElementsCheck005")]
        public async Task<IActionResult> GetProjectElementsCheck005(string projectId, string startDate, string endDate)
        {
            Dictionary<string, List<ReportGetProjectElementsCheck005>> result = new Dictionary<string, List<ReportGetProjectElementsCheck005>>();
            try
            {
                List<ReportGetProjectElementsCheck005> elements = await restClient.Get<List<ReportGetProjectElementsCheck005>>(baseUrl, $"/api/v1/actionstomake/reportGetProjectElementsCheck005/{projectId}/{startDate}/{endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                result.Add("indicatorTable1", elements.Where(x => x.IndicatorTable.Equals(1)).ToList());
                result.Add("indicatorTable2", elements.Where(x => x.IndicatorTable.Equals(2)).ToList());
                result.Add("indicatorTable3", elements.Where(x => x.IndicatorTable.Equals(3)).ToList());
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
        

        [PMCToolAuthentication]
        public async Task<IActionResult> ProjectSheet()
        {
            var projectTab = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/ProjectTab/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            SetActiveOption("4008");
            ViewBag.projects = projectTab;
            ViewBag.baseUrlPmctool = baseUrlPMCTool;
            return View();
        }

        [HttpGet]
        [Route("ActionsToMake/ReportGetProjectSheetByID")]
        public async Task<IActionResult> ReportGetProjectSheetByID(Guid projectId)
        {
            ReportGetProjectSheetByID result = new ReportGetProjectSheetByID();
            try
            {
                result = await restClient.Get<ReportGetProjectSheetByID>(baseUrl, $"/api/v1/actionstomake/reportGetProjectSheedById/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        [Route("ActionsToMake/GetReportGanttActivitiesByID")]
        public async Task<IActionResult> GetReportGanttActivitiesByID(Guid projectId)
        {
            List<ReportGanttActivitiesByID> result = new List<ReportGanttActivitiesByID>();
            try
            {
                result = await restClient.Get<List<ReportGanttActivitiesByID>>(baseUrl, $"/api/v1/actionstomake/reportGanttActivitiesByID/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch(Exception ex)
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
        [Route("ActionsToMake/GetProjectElementCountByParticipant")]
        public async Task<IActionResult> GetProjectElementCountByParticipant(Guid projectId)
        {
            GetProjectElementCount_ByParticipant result = new GetProjectElementCount_ByParticipant();
            try
            {
                result = await restClient.Get<GetProjectElementCount_ByParticipant>(baseUrl, $"/api/v1/actionstomake/projectElementCountByParticipant/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        [Route("ActionsToMake/reportGetProjectSheedById002")]
        public async Task<IActionResult> reportGetProjectSheedById002(Guid projectId)
        {
            ReportGetProjectSheetByID002 result = new ReportGetProjectSheetByID002();
            try
            {
                result = await restClient.Get<ReportGetProjectSheetByID002>(baseUrl, $"/api/v1/actionstomake/reportGetProjectSheedById002/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
