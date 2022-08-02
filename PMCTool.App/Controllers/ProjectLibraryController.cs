using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using OfficeOpenXml;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    public class ProjectLibraryController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        public ProjectLibraryController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        public async Task<IActionResult> Index()
        {
            dynamic projectLibraryView = new ExpandoObject();
            try
            {
                var projectLibraryChart = await restClient.Get<List<ProjectLibraryChart>>(baseUrl, $"/api/v1/projecttaba/projectlibrary/chart", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var projectLibraryTable = await restClient.Get<List<ProjectLibraryTable>>(baseUrl, $"/api/v1/projecttaba/projectlibrary/table", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                projectLibraryView.chart = projectLibraryChart;
                projectLibraryView.table = projectLibraryTable;
            }
            catch (Exception ex) { 
            
            }
            return View(projectLibraryView);
        }
        public async Task<IActionResult> Top() {
            dynamic projectLibraryView = new ExpandoObject();
            try
            {
                var projectLibraryChart = await restClient.Get<List<ProjectTopLibrary>>(baseUrl, $"/api/v1/projecttaba/projectlibrary/top", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                  projectLibraryView.top = projectLibraryChart;
            }
            catch (Exception ex)
            {

            }
            return View(projectLibraryView);
        }
    }
}
