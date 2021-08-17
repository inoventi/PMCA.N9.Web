using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Diagnostics;
using System.Net;
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
using Syncfusion.Pdf;
using Syncfusion.HtmlConverter;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using System.Text.Json;
using Newtonsoft.Json;

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
        public IActionResult Index()
        {
            SetActiveOption("4008");
            return View();
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
    }
}
