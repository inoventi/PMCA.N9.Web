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
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class DashboardsController : BaseController
    {
        private readonly IOptions<AppSettingsModel> _appSettings;
        private readonly IHostingEnvironment _he;
        private string _error;

        public DashboardsController(IOptions<AppSettingsModel> appSettings,
            IHostingEnvironment he,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
            _he = he;
        }

        #region M A N A G E M E N T

        [PMCToolAuthorize(ObjectCode = "3111")]
        [HttpGet]
        public IActionResult Index()
        {
            Board m = new Board();

            SetActiveOption("3111");
            ViewBag.Title = localizer["ViewTitleDashboard"];
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> Get()
        {
            var data = new List<Board>();
            try
            {
                data = await restClient.Get<List<Board>>(baseUrl, $"/api/v1/boards", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
                var data = await restClient.Get<Project>(baseUrl, $"/api/v1/boards/code/{code}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpPost]
        public async Task<JsonResult> Create(Board data)
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

                var result = await restClient.Post<CreatedResult, Board>(baseUrl, $"/api/v1/boards", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Update(Board data)
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
                var result = await restClient.Put<OkObjectResult, Board>(baseUrl, $"/api/v1/boards/{data.BoardID}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Delete(Board data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/boards/{data.BoardID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateData(Board data, bool isNew)
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
                var data = await restClient.Get<Board>(baseUrl, $"/api/v1/boards/{project.ProjectID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [PMCToolAuthorize(ObjectCode = "3111")]
        [HttpGet]
        public async Task<IActionResult> Connection(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                RedirectToAction("Index");
            
            var m = await restClient.Get<Board>(baseUrl, $"/api/v1/boards/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            SetActiveOption("3111");
            ViewBag.Title = localizer["ViewTitleDashboard"] + ": " + localizer["Portfolio"];
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> GetChildren(string id)
        {
            var data = new List<Project>();
            try
            {
                var portfolios = await restClient.Get<List<Portfolio>>(baseUrl, $"/api/v1/boards/{id}/portfolios", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                foreach (var portfolio in portfolios)
                {
                    data.Add(new Project()
                    {
                        ProjectID = portfolio.PortfolioID,
                        Code = portfolio.Code,
                        Name = portfolio.Name,
                        Order = portfolio.Order,
                        Percentage = portfolio.Percentage,
                        Type = (int)EnumFactory.ProjectType.Portfolio,
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
        public async Task<JsonResult> GetAvaliableChildren()
        {
            var data = new List<SelectionListItem>();
            try
            {
                int type = (int)EnumFactory.ProjectType.Portfolio;
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
            if (data.Count() > 0 && (total == null || total.Value != 100))
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