using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PMCTool.App.Controllers
{
    public class BranchLocationsController : BaseController
    {
        public BranchLocationsController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {

        }
        public async Task<IActionResult> Index()
        {
            List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.States = states;
            return View();
        }
        [HttpGet]
        public async Task<JsonResult> GetBranchLocation(int state, int municipalities, string predio)
        {
            List<BranchLocation> data = new List<BranchLocation>();
            try
            {
                data = await restClient.Get<List<BranchLocation>>(baseUrl, $"/api/v1/branchlocation/{state}/{municipalities}/{predio}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
    }
}
