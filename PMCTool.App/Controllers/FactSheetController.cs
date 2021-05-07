using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Models;

namespace PMCTool.App.Controllers
{
    
    public class FactSheetController : BaseController
    {
        private readonly IOptions<AppSettingsModel> _appSettings;
        public FactSheetController(
            IOptions<AppSettingsModel> appSettings, 
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
        }

        //[PMCToolAuthorize(ObjectCode = "3100")]
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }
    }
}
