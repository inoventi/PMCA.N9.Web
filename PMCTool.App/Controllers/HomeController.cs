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
using System.IdentityModel.Tokens.Jwt; 

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class HomeController : BaseController
    { 
        public HomeController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer ) : base(appSettings, localizer)
        {
         }

        [PMCToolAuthorize(ObjectCode = "3000")]
        public IActionResult Index()
        {
            SetActiveOption("001");
            ViewBag.Title = localizer["ViewTitleHome"];

            return View();
        }

        public  async Task<IActionResult> Lock()
        {
            string appToken = Request.Cookies["pmctool-token-app"];

            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(appToken);
            var userId = token.Claims.FirstOrDefault(x => x.Type == "jti").Value;
            var envId = token.Claims.FirstOrDefault(x => x.Type == "Env").Value;
            var profile = await restClient.Get<User>(baseUrl, $"/api/v1/Users/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            var result = await restClient.Post<bool, string>(baseUrl, $"/api/v1/auth/logout", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            ViewBag.Login = profile.Login;
            ViewBag.envId = envId;
            Response.HttpContext.Response.Cookies.Delete("pmctool-token-app");
            Response.HttpContext.Response.Cookies.Delete("pmctool-name-app");
            Response.HttpContext.Response.Cookies.Delete("pmctool-avatar-app");
            Response.HttpContext.Response.Cookies.Delete("pmctool-envlogo-app");
            Response.HttpContext.Response.Cookies.Delete("pmctool-option");
            Response.HttpContext.Response.Cookies.Delete("pmctool-name-env");

            return View();
        }

        public IActionResult EmptyProgram()
        {
            ViewBag.Title = localizer["4030"];
            ViewBag.Message = localizer["4029"];
            ViewBag.Icon = "fas fa-folder";
            return View("EmptyPortfolioPrograms", null);
        }
        public IActionResult EmptyPortfolio()
        {
            ViewBag.Title = localizer["4030"];
            ViewBag.Message = localizer["4031"];
            ViewBag.Icon = "fas fa-briefcase";
            return View("EmptyPortfolioPrograms",null);
        }
        public IActionResult EmptyProgramEmptyProjects()
        {
            ViewBag.Title = localizer["4030"];
            ViewBag.Message = localizer["4032"];
            ViewBag.Icon = "fas fa-briefcase";
            return View("EmptyPortfolioPrograms", null);
        }
        public IActionResult AccessNotAllowed()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
