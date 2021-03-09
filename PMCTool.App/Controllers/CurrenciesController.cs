using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.Net.Http.Headers;
using System.Net.Http;
using System.IO;
using PMCTool.App.Attributes;
using PMCTool.Models.Core;
using PMCTool.App.Helpers;
using PMCTool.Models.Exceptions;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class CurrenciesController : BaseController
    {
        private string _error;

        public CurrenciesController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        #region C U R R E N C I E S

        [PMCToolAuthorize(ObjectCode = "3107")]
        [HttpGet]
        public IActionResult Index()
        {
            SetActiveOption("3107");
            ViewBag.Title = localizer["ViewTitleCurrencies"];
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> GetCurrencies()
        {
            var data = new List<Currency>();
            try
            {
                data = await restClient.Get<List<Currency>>(baseUrl, $"/api/v1/Currencies", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Create(Currency data)
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
                var result = await restClient.Post<CreatedResult, Currency>(baseUrl, $"/api/v1/Currencies", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Update(Currency data)
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
                var result = await restClient.Put<OkObjectResult, Currency>(baseUrl, $"/api/v1/Currencies/" + data.CurrencyID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Delete(Currency data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/Currencies/{data.CurrencyID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region E X C H A N G E  R A T E

        [HttpGet]
        public async Task<JsonResult> GetCurrencyRates(Guid currencyId)
        {
            var data = new List<CurrencyExchangeRate>();
            try
            {
                data = await restClient.Get<List<CurrencyExchangeRate>>(baseUrl, $"/api/v1/currencies/{currencyId}/rates", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateExchangeRate(Guid sourceId, Guid targetId, decimal rate)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            CurrencyExchangeRate data = new CurrencyExchangeRate()
            {
                CurrencySourceID = sourceId,
                CurrencyTargetID = targetId,
                Rate = rate
            };

            try
            {
                var result = await restClient.Post<CurrencyExchangeRate, CurrencyExchangeRate>(baseUrl, $"/api/v1/currencies/{sourceId}/rates", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateExchangeRate(Guid currencyId, Guid rateId, decimal rate)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            CurrencyExchangeRate data = new CurrencyExchangeRate()
            {
                CurrencySourceID = currencyId,
                CurrencyExchangeRateID = rateId,
                Rate = rate
            };

            try
            {
                var result = await restClient.Put<OkObjectResult, CurrencyExchangeRate>(baseUrl, $"/api/v1/currencies/{currencyId}/rates/{rateId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteExchangeRate(Guid currencyId, Guid rateId)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, CurrencyExchangeRate>(baseUrl, $"/api/v1/currencies/{currencyId}/rates/{rateId}", new CurrencyExchangeRate(), new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region G L O B A L

        [HttpPost]
        public async Task<JsonResult> UploadFile(List<IFormFile> files)
        {
            var source = files.FirstOrDefault();

            string filename = ContentDispositionHeaderValue.Parse(source.ContentDisposition).FileName.Trim('"');

            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };
            try
            {
                using (var content = new MultipartFormDataContent())
                {
                    content.Add(new StreamContent(source.OpenReadStream())
                    {
                        Headers =
                        {
                            ContentLength = source.Length,
                            ContentType = new MediaTypeHeaderValue(source.ContentType)
                        }
                    }, "File", filename);

                    var result = await restClient.Post<BulkLoad, MultipartFormDataContent>(baseUrl, $"/api/v1/BulkLoad", content,
                     new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") },
                                                            { "BulkLoad", "currencies" } ,
                                                           { "content-type", new MediaTypeHeaderValue(source.ContentType).ToString() } }, true);

                    response.SuccessMessage = ConvertBulkResponse(result);
                    response.IsSuccess = result.IsSuccess;
                    response.HasErrors = result.HasErrors;
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
        public async Task<JsonResult> GetCurrenciesList()
        {
            var data = new List<SelectionListItem>();
            try
            {
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/currencies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateData(Currency data, bool isNew)
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

    }
}