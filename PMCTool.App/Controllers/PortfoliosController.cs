using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
    [PMCToolAuthentication]
    public class PortfoliosController : BaseController
    {
        private readonly IOptions<AppSettingsModel> _appSettings;
        private readonly IHostingEnvironment _he;
        private string _error;

        public PortfoliosController(IOptions<AppSettingsModel> appSettings,
             IHostingEnvironment he,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
            _he = he;
        }

        #region M A N A G E M E N T

        [PMCToolAuthorize(ObjectCode = "3110")]
        [HttpGet]
        public IActionResult Index()
        {
            Portfolio m = new Portfolio();

            SetActiveOption("3110");
            ViewBag.Title = localizer["ViewTitlePortfolio"];
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> Get()
        {
            var data = new List<Portfolio>();
            try
            {
                data = await restClient.Get<List<Portfolio>>(baseUrl, $"/api/v1/portfolios", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetByCode(string code)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ValueBoolean = false,
            };

            if (string.IsNullOrWhiteSpace(code))
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["Code"]);
                return Json(response);
            }

            try
            {
                var data = await restClient.Get<Portfolio>(baseUrl, $"/api/v1/portfolios/code/{code}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                if (data != null)
                {
                    response.ValueBoolean = true;
                    response.ErrorMessage = string.Format(localizer.GetString("4017"), localizer.GetString("Code"));
                }
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
        public async Task<JsonResult> GetById(Guid? id)
        {
            var data = new Portfolio();
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ValueBoolean = true,
            };

            if (id == null || id.Value == Guid.Empty)
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["Code"]);
                return Json(response);
            }

            try
            {
                data = await restClient.Get<Portfolio>(baseUrl, $"/api/v1/portfolios/{id.ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                if (data == null)
                    response.ValueBoolean = false;
                else
                    response.ErrorMessage = string.Format(localizer.GetString("4017"), localizer.GetString("Code"));
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

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> Create(Portfolio data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data, true))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                data.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                data.Progress = 0;

                var result = await restClient.Post<CreatedResult, Portfolio>(baseUrl, $"/api/v1/portfolios", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Update(Portfolio data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data, false))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Put<OkObjectResult, Portfolio>(baseUrl, $"/api/v1/portfolios/{data.PortfolioID}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Delete(Portfolio data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data, false))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/portfolios/{data.PortfolioID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateData(Portfolio data, bool isNew)
        {
            _error = "";

            if (isNew)
            {
                if (!string.IsNullOrWhiteSpace(data.Code))
                {
                    if (data.Code.Length > 50)
                    {
                        _error = string.Format(localizer.GetString("4011"), localizer["Code"], "50");
                        return false;
                    }
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(data.Code))
                {
                    _error = string.Format(localizer.GetString("4012"), localizer["Code"]);
                    return false;
                }
                else
                {
                    if (data.Code.Length > 50)
                    {
                        _error = string.Format(localizer.GetString("4011"), localizer["Code"], "50");
                        return false;
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(data.Name))
            {
                _error = localizer.GetString("4010");
                return false;
            }

            if (data.Name.Length > 150)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Name"], "150");
                return false;
            }

            return true;
        }

        [HttpPost]
        public async Task<JsonResult> UploadFile(ImageToLoadModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                Project imgData = new Project()
                {
                    ProjectID = data.ID,
                    Image = _appSettings.Value.ImageLogicalPath + @"/projects/" + data.ID.ToString().Replace("-", "") + Path.GetExtension(data.Image.FileName),
                };

                var result = await restClient.Put<OkResult, Project>(baseUrl, $"/api/v1/projects/" + data.ID.ToString() + "/logo", imgData, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (data.Image != null)
                {
                    string filename = Path.Combine(_he.WebRootPath, @"images/projects/", data.ID.ToString().Replace("-", "") + Path.GetExtension(data.Image.FileName));
                    using (FileStream DestinationStream = new FileStream(filename, FileMode.Create))
                    {
                        await data.Image.CopyToAsync(DestinationStream);
                    }
                }
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

        [HttpPost]
        public async Task<JsonResult> DeleteFile(Project project)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<Portfolio>(baseUrl, $"/api/v1/portfolios/{project.ProjectID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var reference = Path.Combine(_he.WebRootPath, @"images\projects", Path.GetFileName(data.Image));
                project.Image = null;

                var result = await restClient.Put<OkResult, Project>(baseUrl, $"/api/v1/projects/" + project.ProjectID.ToString() + "/logo", project, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (System.IO.File.Exists(reference))
                {
                    System.IO.File.Delete(reference);
                }

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

        #region C O N N E C T I O N

        [PMCToolAuthorize(ObjectCode = "3110")]
        [HttpGet]
        public async Task<IActionResult> Connection(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                RedirectToAction("Index");

            var m = await restClient.Get<Portfolio>(baseUrl, $"/api/v1/portfolios/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            List<KeyValuePairItem> projectType = new List<KeyValuePairItem>() {
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectType.Program).ToString(), Value = localizer.GetString("EnumProjectType_" + ((int)EnumFactory.ProjectType.Program).ToString()) },
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectType.Project).ToString(), Value = localizer.GetString("EnumProjectType_" + ((int)EnumFactory.ProjectType.Project).ToString()) },
            };

            ViewBag.ProjectType = projectType;
            ViewBag.Title = localizer["ViewTitlePortfolio"] + ": " + localizer["ProgramOrProject"];

            SetActiveOption("3110");
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> GetChildren(string id)
        {
            var data = new List<Project>();
            try
            {
                var projects = await restClient.Get<List<ProjectsByProgramId>>(baseUrl, $"/api/v1/portfolios/{id}/projects", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var programs = await restClient.Get<List<PMCTool.Models.Environment.Program>>(baseUrl, $"/api/v1/portfolios/{id}/programs", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                foreach (var project in projects)
                {
                    if(project.Status != (int)EnumFactory.ProjectElementStatus.Archived)
                    {
                        data.Add(new Project()
                        {
                            ProjectID = project.ProjectID,
                            Code = project.Code,
                            Name = project.Name,
                            Order = project.Order,
                            Percentage = project.Percentage,
                            Type = (int)EnumFactory.ProjectType.Project,
                            Status = project.Status
                        });
                    }
                }

                foreach (PMCTool.Models.Environment.Program program in programs)
                {
                    data.Add(new Project()
                    {
                        ProjectID = program.ProgramID,
                        Code = program.Code,
                        Name = program.Name,
                        Order = program.Order,
                        Percentage = program.Percentage,
                        Type = (int)EnumFactory.ProjectType.Program,
                        Status = program.Status
                    });
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

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetAvaliableChildren(int type)
        {
            var data = new List<SelectionListItem>();
            try
            {
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/selectionList/{type}/noparent", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateConnection(string id, string parent, int order, double percentage)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (percentage < 0)
            {
                response.ErrorMessage = string.Format(localizer.GetString("4019"), localizer.GetString("Weighing"));
                return Json(response);
            }

            try
            {
                Project data = new Project()
                {
                    ProjectID = new Guid(id),
                    ParentID = new Guid(parent),
                    Order = order,
                    Percentage = percentage
                };

                var result = await restClient.Put<CreatedResult, Project>(baseUrl, $"/api/v1/projects/{id}/connection", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateConnection(Guid id, List<Project> data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            var total = data.Sum(t => t.Percentage);
            if (total == null || total.Value != 100)
            {
                response.ErrorMessage = localizer.GetString("5045");
                return Json(response);
            }

            try
            {
                var result = await restClient.Put<CreatedResult, List<Project>>(baseUrl, $"/api/v1/projects/{id}/connection/batch", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteConnection(string id)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<CreatedResult, string>(baseUrl, $"/api/v1/projects/{id}/connection", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
    }
}