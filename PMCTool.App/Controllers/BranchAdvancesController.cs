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

namespace PMCTool.App.Controllers
{
    public class BranchAdvancesController : BaseController
    {
        public BranchAdvancesController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {

        }
        // GET: BranchAdvancesController
        public ActionResult Index()
        {
            return View();
        }
          
         
    }
}
