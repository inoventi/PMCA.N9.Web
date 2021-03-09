using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class TemplatesController : BaseController
    {
        private string _error;

        public TemplatesController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        [PMCToolAuthorize(ObjectCode = "3113")]
        [HttpGet]
        public IActionResult Index()
        {
            SetActiveOption("3113");
            ViewBag.Title = localizer["ViewTitleTemplate"];
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> Get()
        {
            var data = new List<Template>();
            try
            {
                data = await restClient.Get<List<Template>>(baseUrl, $"/api/v1/Templates", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Create(Template data)
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
                var result = await restClient.Post<CreatedResult, Template>(baseUrl, $"/api/v1/Templates", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Update(Template data)
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
                var result = await restClient.Put<OkObjectResult, Template>(baseUrl, $"/api/v1/Templates/" + data.TemplateID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Delete(Template data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/Templates/{data.TemplateID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateData(Template data, bool isNew)
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

            if (data.Name.Length > 50)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Name"], "50");
                return false;
            }

            if (string.IsNullOrWhiteSpace(data.Description))
            {
                _error = localizer.GetString("4010");
                return false;
            }

            if (data.Description.Length > 150)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Description"], "150");
                return false;
            }

            if (data.StartDate == DateTime.MinValue || string.IsNullOrWhiteSpace(data.StartDate.ToString()))
            {
                _error = string.Format(localizer.GetString("4012"), localizer["StartDate"]);
                return false;
            }

            return true;
        }

        #region Gantt

        [HttpGet]
        public async Task<IActionResult> Gantt(Guid id)
        {
            var templetes = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/templates/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            var templete = templetes.Where(c => c.Key == id).FirstOrDefault();
            ViewBag.TempleteName = templete.Value;
            ViewBag.ProjectId = id;
            ViewBag.Title = localizer["ViewTitleTemplate"];
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> GetGantt(string id)
        {
            TemplateGantt data = new TemplateGantt();
            try
            {
                data = await restClient.Get<TemplateGantt>(baseUrl, $"/api/v1/Templates/{id}/gantt/", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
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
        public async Task<JsonResult> CreateTask(TemplateTaskLocal data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                var result = await restClient.Post<TemplateTask, TemplateTaskLocal>(baseUrl, $"/api/v1/Templates/{data.ProjectId}/gantt/task", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> UpdateTask(TemplateTaskLocal data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                var result = await restClient.Put<TemplateTask, TemplateTaskLocal>(baseUrl, $"/api/v1/Templates/{data.ProjectId}/gantt/task/{data.Id}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> DeleteTask(TemplateTask data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/Templates/{data.ProjectId}/gantt/task/{data.Id}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateLink(TemplateLink data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                TemplateLink result = await restClient.Post<TemplateLink, TemplateLink>(baseUrl, $"/api/v1/Templates/{data.ProjectId}/gantt/link", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> UpdateLink(TemplateLink data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                var result = await restClient.Put<TemplateLink, TemplateLink>(baseUrl, $"/api/v1/Templates/{data.ProjectId}/gantt/link/{data.id.ToString()}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> DeleteLink(TemplateLink data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/Templates/{data.ProjectId}/gantt/link/{data.id.ToString()}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpPatch]
        public async Task<JsonResult> UpdateBatchWbs(Guid templateId, List<BatchWbsUpdate> data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                Boolean result = await restClient.Post<Boolean, List<BatchWbsUpdate>>(baseUrl, $"/api/v1/templates/{templateId}/gantt/tasks/wbs", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
    }

    #endregion Gantt

    public class TemplateTaskLocal
    {
        public bool Editable { get; set; }
        public bool ReadOnly { get; set; }
        public short SortOrder { get; set; }
        public string Type { get; set; }
        public string WbsCode { get; set; }
        public Guid ProjectId { get; set; }
        public Guid CreatedBy { get; set; }
        public bool ManualWeight { get; set; }
        public int? Duration { get; set; }
        public DateTime End_date { get; set; }
        public DateTime Start_date { get; set; }
        public string Text { get; set; }
        public Guid? Parent { get; set; }
        public Guid Id { get; set; }
        public double Weight { get; set; }
        public Guid UpdatedBy { get; set; }
    }
}