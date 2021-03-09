using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class FactSheetsController : BaseController
    {
        private string _error;

        public FactSheetsController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        [PMCToolAuthorize(ObjectCode = "3116")]
        [HttpGet]
        public IActionResult Index()
        {
            SetActiveOption("3116");
            ViewBag.Title = localizer["ViewTitleFactSheet"];
            return View();
        }

        [PMCToolAuthorize(ObjectCode = "3116")]
        [HttpGet]
        public IActionResult Create()
        {
            SetActiveOption("3116");
            ViewBag.Title = localizer["ViewTitleFactSheet"];
            ViewBag.IsNew = true;
            return View();
        }

        [PMCToolAuthorize(ObjectCode = "3116")]
        [HttpGet]
        public IActionResult Update(Guid id)
        {
            var data = new FactSheet();
            ViewBag.IsNew = false;
            try
            {
                var task = Task.Run(async () => await restClient.Get<FactSheet>(baseUrl, $"/api/v1/FactSheets/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }));
                task.Wait();
                data = task.Result;
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

            return View("Create", data);
        }

        [HttpGet]
        public async Task<JsonResult> GetFactSheets()
        {
            var data = new List<FactSheet>();
            try
            {
                data = await restClient.Get<List<FactSheet>>(baseUrl, $"/api/v1/FactSheets", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Create(FactSheet data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data,true))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                data.IsActive = true;
                var result = await restClient.Post<CreatedResult, FactSheet>(baseUrl, $"/api/v1/FactSheets", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public IActionResult UpdateDetails(Guid id)
        {
            try
            {
                List<KeyValuePairItem> fsOrder = new List<KeyValuePairItem>();
                for (int i = 1; i <= 100; i++)
                {
                    KeyValuePairItem item = new KeyValuePairItem() { Key = i.ToString(), Value = i.ToString() };
                    fsOrder.Add(item);
                }
                ViewBag.FactSheetDetailOrder = fsOrder;

                var headerData = new FactSheet();

                var task = Task.Run(async () => await restClient.Get<FactSheet>(baseUrl, $"/api/v1/FactSheets/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }));
                task.Wait();
                headerData = task.Result;
                ViewBag.Title = localizer["ViewTitleFactSheet"] + ": " + $"{headerData.Code} - {headerData.Name}";

                var data = new FactSheetDetail()
                {
                    FactSheetID = id
                };
                return View("Details", data);
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
        }

        [HttpPut]
        public async Task<JsonResult> Update(FactSheet data)
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
                var result = await restClient.Put<OkObjectResult, FactSheet>(baseUrl, $"/api/v1/FactSheets/{data.FactSheetID.ToString()}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Delete(FactSheet data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/FactSheets/{data.FactSheetID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateData(FactSheet data, bool isNew)
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

        #region Details

        [HttpGet]
        public async Task<JsonResult> GetFactSheetDetails(Guid id)
        {
            var data = new List<FactSheetDetail>();
            try
            {
                data = await restClient.Get<List<FactSheetDetail>>(baseUrl, $"/api/v1/FactSheets/{id}/Details", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateDetail(Guid id, FactSheetDetail data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateDetailData(data))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Post<CreatedResult, FactSheetDetail>(baseUrl, $"/api/v1/FactSheets/{id}/Details", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateDetail(Guid id, FactSheetDetail data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateDetailData(data))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Put<OkObjectResult, FactSheetDetail>(baseUrl,
                    $"/api/v1/FactSheets/{id}/Details/{data.FactSheetDetailID.ToString()}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteDetail(Guid id, FactSheetDetail data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateDetailData(data))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/FactSheets/{id}/Details/{data.FactSheetDetailID.ToString()}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateDetailData(FactSheetDetail data)
        {
            _error = "";

            //if (string.IsNullOrEmpty(data.Key.Trim()))
            //{
            //    _error = localizer.GetString("4012");
            //    return false;
            //}

            //if (data.Key.Length > 150)
            //{
            //    _error = string.Format(localizer.GetString("4011"), localizer["Key"], "150");
            //    return false;
            //}

            if (string.IsNullOrWhiteSpace(data.Value))
            {
                _error = localizer.GetString("4012");
                return false;
            }

            //if (data.Value.Length > 150)
            //{
            //    _error = string.Format(localizer.GetString("4011"), localizer["Value"], "150");
            //    return false;
            //}

            if (data.Order <= 0)
            {
                _error = localizer.GetString("4012");
                return false;
            }

            return true;
        }

        #endregion Details
    }
}