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
    public class ProgramsController : BaseController
    {
        private string _error;

        public ProgramsController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        #region M A N A G E M E N T

        [PMCToolAuthorize(ObjectCode = "3109")]
        [HttpGet]
        public IActionResult Index()
        {
            Project m = new Project();

            SetActiveOption("3109");
            ViewBag.Title = localizer["ViewTitleProgram"];
            return View(m);
        }

        [PMCToolAuthorize(ObjectCode = "3109")]
        [HttpGet]
        public async Task<IActionResult> Editor(Guid? id)
        {
            PMCTool.Models.Environment.Program m = new PMCTool.Models.Environment.Program() { IsActive = true };

            try
            {
                if (id == null)
                {
                    ViewBag.IsNew = true;
                }
                else
                {
                    ViewBag.IsNew = false;
                    m = await restClient.Get<PMCTool.Models.Environment.Program>(baseUrl, $"/api/v1/programs/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }

                List<SelectionListItem> companies = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
                List<SelectionListItem> sponsor = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
                List<SelectionListItem> leader = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
                List<SelectionListItem> projectManager = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                List<KeyValuePairItem> status = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectStatus.Active).ToString(), Value = localizer.GetString("EnumProjectStatus_" + ((int)EnumFactory.ProjectStatus.Active).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectStatus.Inactive).ToString(), Value =localizer.GetString("EnumProjectStatus_" + ((int)EnumFactory.ProjectStatus.Inactive).ToString()) },
                };

                companies = companies.OrderBy(o => o.Value).ToList();

                ViewBag.Sponsor = sponsor;
                ViewBag.Leader = leader;
                ViewBag.ProjectManager = projectManager;
                ViewBag.Companies = companies;
                ViewBag.Status = status;

            }
            catch (Exception ex)
            {
                RedirectToAction("Index");
            }

            SetActiveOption("3109");
            ViewBag.Title = localizer["ViewTitleProgram"];
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> Get()
        {
            var data = new List<PMCTool.Models.Environment.Program>();
            try
            {
                data = await restClient.Get<List<PMCTool.Models.Environment.Program>>(baseUrl, $"/api/v1/programs", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
                var data = await restClient.Get<PMCTool.Models.Environment.Program>(baseUrl, $"/api/v1/programs/code/{code}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            var data = new PMCTool.Models.Environment.Program();
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
                data = await restClient.Get<PMCTool.Models.Environment.Program>(baseUrl, $"/api/v1/programs/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Create(PMCTool.Models.Environment.Program data)
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
                var result = await restClient.Post<CreatedResult, PMCTool.Models.Environment.Program>(baseUrl, $"/api/v1/programs", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Update(PMCTool.Models.Environment.Program data)
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
                var result = await restClient.Put<OkObjectResult, PMCTool.Models.Environment.Program>(baseUrl, $"/api/v1/programs/" + data.ProgramID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Delete(PMCTool.Models.Environment.Program data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProgramID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateData(PMCTool.Models.Environment.Program data, bool isNew)
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

        #endregion

        #region C O N N E C T I O N

        [PMCToolAuthorize(ObjectCode = "3109")]
        [HttpGet]
        public async Task<IActionResult> Connection(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                RedirectToAction("Index");

            var m = await restClient.Get<PMCTool.Models.Environment.Program>(baseUrl, $"/api/v1/programs/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            SetActiveOption("3109");
            ViewBag.Title = localizer["ViewTitleProgram"] + ": " + localizer["Project"];
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> GetChildren(string id)
        {
            var data = new List<Project>();
            try
            {
                data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/projects/parent/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            var data = new List<Project>();
            try
            {
                data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = data.Where(t => t.ParentID == null).ToList();
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