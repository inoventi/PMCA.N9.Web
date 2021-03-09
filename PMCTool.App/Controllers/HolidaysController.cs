using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class HolidaysController : BaseController
    {
        private string _error;

        public HolidaysController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
           
        }

        [PMCToolAuthorize(ObjectCode = "3106")]
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            List<SelectionListItem> companies = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            companies = companies.OrderBy(o => o.Value).ToList();

            ViewBag.Companies = companies;

            SetActiveOption("3106");
            ViewBag.Title = localizer["ViewTitleHoliday"];
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> GetHolidays()
        {
            List<Holiday> data = new List<Holiday>();
            try
            {
                data = await restClient.Get<List<Holiday>>(baseUrl, $"/api/v1/holidays", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                List<SelectionListItem> users = new List<SelectionListItem>();
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> CreateHoliday(Holiday data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                Holiday result = await restClient.Post<Holiday, Holiday>(baseUrl, $"/api/v1/holidays", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateHoliday(Holiday data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Put<OkObjectResult, Holiday>(baseUrl, $"/api/v1/holidays/" + data.HolidayID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteHoliday(Holiday data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/holidays/{data.HolidayID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetByProject(Guid projectId)
        {
            List<Holiday> data = new List<Holiday>();
            try
            {
                data = await restClient.Get<List<Holiday>>(baseUrl, $"/api/v1/projects/{projectId}/holidays", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                List<SelectionListItem> users = new List<SelectionListItem>();
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        private bool ValidateData(Holiday data)
        {

            _error = "";

            if (string.IsNullOrEmpty(data.Name.Trim()))
            {
                _error = localizer.GetString("4010");
                return false;
            }

            if (data.Name.Length > 150)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Name"], "150");
                return false;
            }

            //if (string.IsNullOrEmpty(data.Description.Trim()))
            //{
            //    _error = localizer.GetString("4010");
            //    return false;
            //}

            //if (data.Name.Length > 500)
            //{
            //    _error = string.Format(localizer.GetString("4011"), localizer["Description"], "500");
            //    return false;
            //}

            return true;
        }
    }
}