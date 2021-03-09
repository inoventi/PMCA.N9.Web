using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using PMCTool.App.Attributes;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public partial class ExecutionController : BaseController
    {
        private string _error;
        private readonly IOptions<AppSettingsModel> _appSettings;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IConverter _converter;

        public ExecutionController(
            IOptions<AppSettingsModel> appSettings,
            IHostingEnvironment hostingEnvironment,
            IConverter converter,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
            _hostingEnvironment = hostingEnvironment;
            _converter = converter;
        }

        #region P R O J E C T S

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Projects()
        {
            var data = new List<ProjectIndicator>();
            try
            {
                var userId = GetTokenValue("UserId");

                //data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/participant", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = await restClient.Get<List<ProjectIndicator>>(baseUrl, $"/api/v1/projects/users/{userId}/indicators", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Sort((x, y) => x.ProjectName.CompareTo(y.ProjectName));
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

            SetActiveOption("3120");
            ViewBag.Sort = 0;
            ViewBag.Title = localizer["ViewTitleProjectExecution"];
            return View(data);
        }

        [HttpPost]
        public async Task<IActionResult> Projects(int sortID)
        {
            var data = new List<ProjectIndicator>();
            try
            {
                var userId = GetTokenValue("UserId");

                //data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/participant", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = await restClient.Get<List<ProjectIndicator>>(baseUrl, $"/api/v1/projects/users/{userId}/indicators", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                switch (sortID)
                {
                    case 1:
                        data = data.OrderBy(t => t.Status).ToList();
                        break;
                    case 2:
                        data = data.OrderBy(t => t.CompanyName).ToList();
                        break;
                    case 3:
                        data.Sort(delegate (ProjectIndicator a, ProjectIndicator b)
                        {
                            if (a.StartDate == null && b.StartDate != null)
                            {
                                return 1;
                            }
                            else if (a.StartDate != null && b.StartDate == null)
                            {
                                return -1;
                            }
                            else if (a.StartDate == null && b.StartDate == null)
                            {
                                return 0;
                            }
                            else
                            {
                                return DateTime.Compare((DateTime)a.StartDate, (DateTime)b.StartDate);
                            }
                        });
                        break;
                    case 4:
                        data.Sort(delegate (ProjectIndicator a, ProjectIndicator b)
                        {
                            if (a.EndDate == null && b.EndDate != null)
                            {
                                return 1;
                            }
                            else if (a.EndDate != null && b.EndDate == null)
                            {
                                return -1;
                            }
                            else if (a.EndDate == null && b.EndDate == null)
                            {
                                return 0;
                            }
                            else
                            {
                                return DateTime.Compare((DateTime)a.EndDate, (DateTime)b.EndDate);
                            }
                        });
                        break;
                    default:
                        break;
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

            SetActiveOption("3120");
            ViewBag.Sort = sortID;
            ViewBag.Title = localizer["ViewTitleProjectExecution"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Project(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            var data = new ProjectViewModel();
            int layerCount = 0;

            try
            {
                var projectParticipant = await restClient.Get<ProjectParticipant>(baseUrl, $"/api/v1/projectparticipant/project/{id}/participant", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectParticipant == null)
                    return RedirectToAction("Projects");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Projects");

                data.Project = project;
                data.Company = await restClient.Get<Company>(baseUrl, $"/api/v1/Companies/{project.CompanyID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                layerCount = await restClient.Get<int>(baseUrl, $"/api/v1/projects/{id}/layers/count", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ViewBag.LayerCount = layerCount;

                data.ProjectIndicator = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{id}/indicators/elements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (project.StartDate.HasValue)
                    data.ProjectAcquiredValueStartDate = project.StartDate.Value.ToString("yyyy-MM-dd");
                else
                    data.ProjectAcquiredValueStartDate = DateTime.Now.ToString("yyyy-MM-dd");

                if (project.EndDate.HasValue && project.EndDate.Value < DateTime.Now)
                    data.ProjectAcquiredValueEndDate = project.EndDate.Value.ToString("yyyy-MM-dd");
                else 
                    data.ProjectAcquiredValueEndDate = DateTime.Now.ToString("yyyy-MM-dd");
            }
            catch (HttpResponseException ex)
            {
                if (ex.ServiceResponse.StatusCode == HttpStatusCode.NotFound)
                {
                    return RedirectToAction("AccessNotAllowed", "Home");
                }

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

            var pp = await GetProjectParticipant(id.Value);
            if (pp != null)
                ViewBag.Role = pp.Role;
            else
                ViewBag.Role = null;

            SetActiveOption("3120");
            ViewBag.Title = localizer["ViewTitleProjectExecution"];
            return View(data);
        }

        [HttpPatch]
        public async Task<JsonResult> ArchiveProject(Guid idProject)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var dbProject = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{idProject}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var result = await restClient.Patch<OkObjectResult, Project>(baseUrl, $"/api/v1/projects/" + dbProject.ProjectID.ToString() + "/archive", dbProject, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        #endregion

        #region P R O G R A M S

        [PMCToolAuthorize(ObjectCode = "3121")]
        [HttpGet]
        public async Task<IActionResult> Programs()
        {
            var data = new List<PMCTool.Models.Environment.Program>();

            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PMCTool.Models.Environment.Program>>(baseUrl, $"/api/v1/mydashboard/programs/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                foreach(var program in data)
                {
                    program.Projects = program.Projects.OrderBy(o => o.Order).ToList();
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

            SetActiveOption("3121");
            ViewBag.Sort = 0;
            ViewBag.Title = localizer["ViewTitleProgramExecution"];
            return View(data);
        }

        [HttpPost]
        public async Task<IActionResult> Programs(int sortID)
        {
            var data = new List<PMCTool.Models.Environment.Program>();
            try
            {
                data = await restClient.Get<List<PMCTool.Models.Environment.Program>>(baseUrl, $"/api/v1/mydashboard/programs", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                switch (sortID)
                {
                    case 1:
                        data = data.OrderBy(t => t.Status).ToList();
                        break;
                    case 2:
                        data = data.OrderBy(t => t.CompanyName).ToList();
                        break;
                    default:
                        break;
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

            SetActiveOption("3121");
            ViewBag.Sort = sortID;
            ViewBag.Title = localizer["ViewTitleProgramExecution"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3121")]
        [HttpGet]
        public async Task<IActionResult> Program(Guid? id)
        {
            var data = new PMCTool.Models.Environment.Program();
            var company = new PMCTool.Models.Environment.Company();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Programs");

            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<PMCTool.Models.Environment.Program>(baseUrl, $"/api/v1/mydashboard/programs/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                int contProjects = data.Projects.Count();
                
                if(contProjects == 0)
                {
                    return RedirectToAction("EmptyProgram", "Home");
                }
                else
                {
                    data.Projects = data.Projects.OrderBy(o => o.Order).ToList();
                    if (data.CompanyID != null)
                    {
                        company = await restClient.Get<Company>(baseUrl, $"/api/v1/Companies/{data.CompanyID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    }
                    var programs = await restClient.Get<List<PMCTool.Models.Environment.Program>>(baseUrl, $"/api/v1/mydashboard/programs/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    var program = programs.Where(q => q.ProgramID == id.Value).FirstOrDefault();
                    if (program == null)
                    {
                        return RedirectToAction("AccessNotAllowed", "Home");
                    }
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

            ViewBag.CompanyLogo = company.Logo;
            ViewBag.CompanyCity = company.Address.City;
            ViewBag.CompanyState = company.Address.State;
            ViewBag.CompanyCountry = company.Address.Country;

            SetActiveOption("3121");
            ViewBag.Title = localizer["ViewTitleProgramExecution"];
            return View(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetProgramProjects(Guid programId)
        {
            IEnumerable<ProjectsByProgramId> data = null;
            try
            {
                var result = await restClient.Get<PMCTool.Models.Environment.Program>(baseUrl, $"/api/v1/mydashboard/programs/{programId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = result.Projects;
                data = data.OrderBy(o => o.Order).ToList();
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

        #endregion

        #region P O R T F O L I O S

        [PMCToolAuthorize(ObjectCode = "3122")]
        [HttpGet]
        public async Task<IActionResult> Portfolios()
        {
            var data = new List<Portfolio>();

            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<Portfolio>>(baseUrl, $"/api/v1/mydashboard/portfolios/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            SetActiveOption("3122");
            ViewBag.Sort = 0;
            ViewBag.Title = localizer["ViewTitlePortfolioExecution"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3122")]
        [HttpGet]
        public async Task<IActionResult> Portfolio(Guid? id)
        
        {
            var data = new PortfolioViewModel();
            List<PortfolioModel> result = new List<PortfolioModel>();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Portfolios");

            try
            {
                data.Programs = (await restClient.Get<IEnumerable<PMCTool.Models.Environment.Program>>(baseUrl, $"/api/v1/mydashboard/portfolios/{id}/programs", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } })).ToList();
                data.Projects = (await restClient.Get<IEnumerable<ProjectsByProgramId>>(baseUrl, $"/api/v1/mydashboard/portfolios/{id}/projects", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } })).ToList();

                int contPrograms = data.Programs.Count();
                int contProjects = data.Projects.Count();
                if(contPrograms == 0)
                {
                    if(contProjects == 0 & contProjects == 0)
                    {
                        return RedirectToAction("EmptyPortfolio", "Home");
                    }
                    else
                    {
                        Participant participant = await GetParticipant();
                        var portfolios = await restClient.Get<List<Portfolio>>(baseUrl, $"/api/v1/mydashboard/portfolios/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        var portfolio = portfolios.Where(q => q.PortfolioID == id.Value).FirstOrDefault();
                        if (portfolio == null)
                        {
                            return RedirectToAction("AccessNotAllowed", "Home");
                        }
                        foreach (var item in data.Programs)
                        {
                            result.Add(new PortfolioModel()
                            {
                                Value = item,
                                Type = 1,
                                Order = item.Order
                            });
                        }

                        foreach (var item in data.Projects)
                        {
                            result.Add(new PortfolioModel()
                            {
                                Value = item,
                                Type = 2,
                                Order = item.Order
                            });
                        }

                        result = result.OrderBy(o => o.Order).ToList();

                        ViewBag.PortfolioName = portfolio.Name;
                        ViewBag.RealProgress = Math.Round(portfolio.Progress * 100, 2);
                        ViewBag.ExpectedProgress = Math.Round(portfolio.PlannedProgress * 100, 2);
                        ViewBag.Status = portfolio.Status;
                    }
           
                }
                else
                {
                    int contProjectsByProgram = 0;
                    for(var a=0; a < contPrograms; a++)
                    {
                        contProjectsByProgram += data.Programs[a].Projects.Count();
                    }
                    if(contProjectsByProgram == 0)
                    {
                        return RedirectToAction("EmptyProgramEmptyProjects", "Home");
                    }
                    else
                    {
                        Participant participant = await GetParticipant();
                        var portfolios = await restClient.Get<List<Portfolio>>(baseUrl, $"/api/v1/mydashboard/portfolios/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        var portfolio = portfolios.Where(q => q.PortfolioID == id.Value).FirstOrDefault();
                        if (portfolio == null)
                        {
                            return RedirectToAction("AccessNotAllowed", "Home");
                        }
                        foreach (var item in data.Programs)
                        {
                            result.Add(new PortfolioModel()
                            {
                                Value = item,
                                Type = 1,
                                Order = item.Order
                            });
                        }

                        foreach (var item in data.Projects)
                        {
                            result.Add(new PortfolioModel()
                            {
                                Value = item,
                                Type = 2,
                                Order = item.Order
                            });
                        }

                        result = result.OrderBy(o => o.Order).ToList();

                        ViewBag.PortfolioName = portfolio.Name;
                        ViewBag.RealProgress = Math.Round(portfolio.Progress * 100, 2);
                        ViewBag.ExpectedProgress = Math.Round(portfolio.PlannedProgress * 100, 2);
                        ViewBag.Status = portfolio.Status;
                    }
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

            SetActiveOption("3122");
            ViewBag.Title = localizer["ViewTitlePortfolioExecution"];
            return View(result);
        }

        #endregion

        #region D A S H B O A R D S

        [PMCToolAuthorize(ObjectCode = "3123")]
        [HttpGet]
        public async Task<IActionResult> Dashboards()
        {
            var data = new List<Board>();
            Random r = new Random();
            ViewBag.versionCache = "?v="+r.Next();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<Board>>(baseUrl, $"/api/v1/mydashboard/boards/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

            SetActiveOption("3123");
            ViewBag.Title = localizer["ViewTitleDashboardExecution"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3123")]
        [HttpGet]
        public async Task<IActionResult> Dashboard(Guid? id)
        {
            var data = new List<Portfolio>();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Dashboards");

            try
            {
                Participant participant = await GetParticipant();
                var dashboards = await restClient.Get<List<Board>>(baseUrl, $"/api/v1/mydashboard/boards/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dashboard = dashboards.Where(q => q.BoardID == id.Value).FirstOrDefault();
                if (dashboard == null)
                    return RedirectToAction("AccessNotAllowed", "Home");

                data = (await restClient.Get<IEnumerable<Portfolio>>(baseUrl, $"/api/v1/mydashboard/boards/{id}/portfolios", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } })).ToList();
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

            SetActiveOption("3123");
            ViewBag.Title = localizer["ViewTitleDashboardExecution"];
            return View(data);
        }

        #endregion

        #region R E P O R T S

        [HttpGet]
        public async Task<JsonResult> GetFactsheet(Guid projectId)
        {
            IEnumerable<ProjectFactsheet> data = null;
            try
            {
                data = await restClient.Get<IEnumerable<ProjectFactsheet>>(baseUrl, $"/api/v1/projects/{projectId}/factsheets", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpPost]
        public async Task<JsonResult> CreateFactsheet(Guid projectId, List<ProjectFactsheet> data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Post<List<ProjectFactsheet>, List<ProjectFactsheet>>(baseUrl, $"/api/v1/projects/{projectId}/factsheets", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetProjectProgressHistory(Guid projectId, string fromDate, string toDate)
        {
            IEnumerable<ProjectProgressHistoryReport> data = null;
            try
            {
                data = await restClient.Get<IEnumerable<ProjectProgressHistoryReport>>(baseUrl, $"/api/v1/reports/progressHistory/project/{projectId}/fromDate/{fromDate}/toDate/{toDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = data.OrderBy(t => t.Date);
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
        public async Task<JsonResult> GetProjectHours(Guid projectId, string fromDate, string toDate)
        {
            IEnumerable<ProjectHoursPlannedAndReals> data = null;
            try
            {
                data = await restClient.Get<IEnumerable<ProjectHoursPlannedAndReals>>(baseUrl, $"/api/v1/reports/hours/project/{projectId}/fromDate/{fromDate}/toDate/{toDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = data.OrderBy(t => t.Date);
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
        public async Task<JsonResult> GetProjectPareto(Guid projectId)
        {
            IEnumerable<Pareto> data = null;
            try
            {
                data = await restClient.Get<IEnumerable<Pareto>>(baseUrl, $"/api/v1/reports/pareto/project/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetProjectCustomizedReports(Guid projectId)
        {
            IEnumerable<ProjectCustomizedReport> data = null;
            try
            {
                data = await restClient.Get<IEnumerable<ProjectCustomizedReport>>(baseUrl, $"/api/v1/projects/{projectId}/customizedReports", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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
        public async Task<JsonResult> GetProjectCustomizedReportById(Guid projectId, Guid projectCustomizedReportId)
        {
            ProjectCustomizedReport data = null;
            try
            {
                data = await restClient.Get<ProjectCustomizedReport>(baseUrl, $"/api/v1/projects/{projectId}/customizedReports/{projectCustomizedReportId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpPost]
        public async Task<JsonResult> CreateProjectCustomizedReport(ProjectCustomizedReport data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Post<ProjectCustomizedReport, ProjectCustomizedReport>(baseUrl, $"/api/v1/projects/{data.ProjectID}/customizedReports", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        [HttpPut]
        public async Task<JsonResult> EditProjectCustomizedReport(ProjectCustomizedReport data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Put<OkObjectResult, ProjectCustomizedReport>(baseUrl, $"/api/v1/projects/{data.ProjectID}/customizedReports/{data.ProjectCustomizedReportID}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        [HttpDelete]
        public async Task<JsonResult> DeleteProjectCustomizedReport(Guid projectId, Guid projectCustomizedReportId)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{projectId}/customizedReports/{projectCustomizedReportId}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> ExecuteProjectCustomizedReport(Guid projectId, Guid projectCustomizedReportId, string elementId)
        {
            DataTable data = null;
            DataTable dataTable = null;
            ResponseModel response = new ResponseModel()
            {
                ValueString = "",
            };
            try
            {
                var report = await restClient.Get<string>(baseUrl, $"/api/v1/projects/{projectId}/customizedReports/{projectCustomizedReportId}/elements/{elementId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
                var serializeSettings = new JsonSerializerSettings();
                serializeSettings.Converters.Add(new IsoDateTimeConverter() { DateTimeFormat = "yyyy-MM-dd" });

                dataTable = JsonConvert.DeserializeObject<DataTable>(report, serializeSettings);

                data = dataTable.Clone(); //Just copy structure, not data
                for (int i = 0; i < data.Columns.Count; i++)// Convert every column to String type
                {
                    if (data.Columns[i].DataType != typeof(string))
                        data.Columns[i].DataType = typeof(string);
                }

                // Recover all data, but now in string type
                foreach (DataRow dr in dataTable.Rows)
                {
                    data.ImportRow(dr);
                }

                // Transform numeric data
                for (int i = 0; i < data.Rows.Count; i++)
                {
                    for (int j = 0; j < data.Columns.Count; j++)
                    {
                        switch (data.Columns[j].ColumnName.ToUpper())
                        {
                            //Percentages
                            case "E01-09":
                            case "E01-10":
                            case "E01-15":
                            case "E02-08":
                            case "E02-09":
                            case "E02-12":
                            case "E03-10":
                            case "E03-16":
                            case "E04-08":
                            case "E05-06":
                            case "E07-08":
                            case "E08-08":
                            case "E09-08":
                            case "E10-05":
                            case "E10-06":
                                data.Rows[i][j] = (String.IsNullOrEmpty(data.Rows[i][j].ToString())) ? "-" : "" + Math.Round(double.Parse(data.Rows[i][j].ToString()) * 100, 2); ;
                                break;
                            //Status
                            case "E01-12":
                            case "E02-11":
                            case "E03-09":
                            case "E04-09":
                            case "E05-09":
                            case "E06-06":
                            case "E07-09":
                            case "E08-09":
                            case "E09-09":
                            case "E10-07":
                                data.Rows[i][j] = (String.IsNullOrEmpty(data.Rows[i][j].ToString())) ? "-" : localizer.GetString("EnumProjectElementStatus_" + data.Rows[i][j].ToString());
                                break;
                            //Dates
                            case "E01-02":
                            case "E01-03":
                            case "E01-04":
                            case "E01-05":
                            case "E01-06":
                            case "E01-07":
                            case "E02-02":
                            case "E02-03":
                            case "E02-04":
                            case "E02-05":
                            case "E02-06":
                            case "E02-07":
                            case "E03-05":
                            case "E03-06":
                            case "E04-05":
                            case "E04-06":
                            case "E04-07":
                            case "E05-02":
                            case "E05-03":
                            case "E05-04":
                            case "E06-04":
                            case "E07-03":
                            case "E07-04":
                            case "E07-05":
                            case "E07-06":
                            case "E08-03":
                            case "E08-04":
                            case "E08-05":
                            case "E08-06":
                            case "E09-03":
                            case "E09-04":
                            case "E09-05":
                            case "E09-06":
                            case "E10-03":
                            case "E10-04":
                                //data.Rows[i][j] = (String.IsNullOrEmpty(data.Rows[i][j].ToString())) ? "-" : "" + DateTime.Parse(data.Rows[i][j].ToString()).ToString("yyyy-MM-dd");
                                data.Rows[i][j] = (String.IsNullOrEmpty(data.Rows[i][j].ToString())) ? "-" : DateTime.Parse(data.Rows[i][j].ToString().Split(" ")[0]).ToString("yyyy-MM-dd");
                                break;
                            //Currency
                            case "E01-13":
                            case "E01-14":
                            case "E03-12":
                            case "E03-13":
                            case "E05-11":
                            case "E05-12":
                                data.Rows[i][j] = (String.IsNullOrEmpty(data.Rows[i][j].ToString())) ? "-": "" + Math.Round(double.Parse(data.Rows[i][j].ToString()), 2).ToString("C");
                                break;
                            //Probability
                            case "E05-08":
                                data.Rows[i][j] = (String.IsNullOrEmpty(data.Rows[i][j].ToString())) ? "-" : localizer.GetString("EnumProjectRiskProbability_" + data.Rows[i][j].ToString());
                                break;
                            //Impact
                            case "E05-07":
                                data.Rows[i][j] = (String.IsNullOrEmpty(data.Rows[i][j].ToString())) ? "-" : localizer.GetString("EnumProjectRiskImpact_" + data.Rows[i][j].ToString());
                                break;

                            default:
                                data.Rows[i][j] = (String.IsNullOrEmpty(data.Rows[i][j].ToString())) ? "-" : data.Rows[i][j];
                                break;
                        }
                    }
                }
                response.ValueString = JsonConvert.SerializeObject(data);
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString());
                
                return Json(response);
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(response);
        }

        #endregion

        #region G L O B A L

        private async Task<Participant> GetParticipant()
        {

            Participant result = new Participant();
            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{participantUser.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result.ParticipantUser.Image = participantUser.Image;
                }
            }
            catch (Exception ex)
            {

            }

            return result;
        }

        [HttpGet]
        public async Task<JsonResult> GetElementSelectionList(string projectId, int type)
        {
            switch (type)
            {
                case 1:
                    return await GetActivitySelectionList(projectId);
                case 2:
                    return await GetMilestoneSelectionList(projectId);
                case 3:
                    return await GetEvidenceSelectionList(projectId);
                case 4:
                    return await GetIncidentSelectionList(projectId);
                case 5:
                    return await GetRiskSelectionList(projectId);
                default:
                    return Json(new List<SelectionListItem>());
            }
        }

        [HttpGet]
        public async Task<JsonResult> GetActivitySelectionList(string projectId)
        {
            List<SelectionListItem> response = new List<SelectionListItem>();

            try
            {
                response = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/activities/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }        
        
        [HttpGet]
        public async Task<JsonResult> GetChildActivitiesSelectionList(string projectId)
        {
            List<SelectionListItem> response = new List<SelectionListItem>();

            try
            {
                response = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/activities/childs/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetMilestoneSelectionList(string projectId)
        {
            List<SelectionListItem> response = new List<SelectionListItem>();

            try
            {
                response = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/milestones/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetEvidenceSelectionList(string projectId)
        {
            List<SelectionListItem> response = new List<SelectionListItem>();

            try
            {
                response = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/evidences/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetIncidentSelectionList(string projectId)
        {
            List<SelectionListItem> response = new List<SelectionListItem>();

            try
            {
                response = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/incidents/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetRiskSelectionList(string projectId)
        {
            List<SelectionListItem> response = new List<SelectionListItem>();

            try
            {
                response = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/risks/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetLayerSelectionList(Guid projectId, Guid? parentId)
        {
            List<SelectionListItem> response = new List<SelectionListItem>();

            try
            {
                if (parentId == null)
                {
                    response = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/layers/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);
                }
                else {
                    response = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/layers/selectionList?parentId={parentId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);
                }
                
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetElementIndicators(string projectId, int type, Guid? layerId = null)
        {
            ProjectIndicator response = new ProjectIndicator();

            try
            {
                switch (type)
                {
                    case 1:
                        response = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{projectId}/indicators/activities", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        break;
                    case 2:
                        response = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{projectId}/indicators/milestones", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        break;
                    case 3:
                        if (layerId == null)
                        {
                            response = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{projectId}/indicators/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        }
                        else {
                            response = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{projectId}/indicators/layers/{layerId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        }
                        break;
                    case 4:
                        response = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{projectId}/indicators/incidents", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        break;
                    case 5:
                        response = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{projectId}/indicators/risks", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        break;
                    case 6:
                        response = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{projectId}/indicators/meetings", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        break;
                    default:
                        break;
                }
                
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetParticipant(string id)
        {
            Participant response = new Participant();

            try
            {
                if (!string.IsNullOrWhiteSpace(id))
                    response = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetParticipantByProject(string id)
        {
            List<SelectionListItem> response = new List<SelectionListItem>();

            try
            {
                response = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{id}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetParticipantSelectionList()
        {
            List<SelectionListItem> response = new List<SelectionListItem>();
            try
            {
                response = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        protected async Task<ProjectParticipant> GetProjectParticipant(Guid projectId)
        {

            ProjectParticipant result = null;
            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result = await restClient.Get<ProjectParticipant>(baseUrl, $"/api/v1/projects/{projectId}/participants/{participantUser.ParticipantID.ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
            }
            catch (Exception ex)
            {

            }

            return result;
        }

        [HttpGet]
        public async Task<JsonResult> GetProjectConfiguration(string id)
        {
            Project response = new Project();

            try
            {
                response = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{(int)EnumFactory.ProjectType.Project}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetProjectHolidaysCalendar(string id)
        {
            List<ProjectHoliday> response = new List<ProjectHoliday>();

            try
            {
                response = await restClient.Get<List<ProjectHoliday>>(baseUrl, $"/api/v1/projects/{id}/holidays/calendar", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetProjectElementRelationship(string projectId)
        {
            IEnumerable<ProjectTaskRelationshipElements> data = null;
            try
            {
                data = await restClient.Get<IEnumerable<ProjectTaskRelationshipElements>>(baseUrl, $"/api/v1/projects/{projectId}/elementsRelationship", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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

        #endregion

    }
}