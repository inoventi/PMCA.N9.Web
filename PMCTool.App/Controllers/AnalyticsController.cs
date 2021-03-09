using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
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
    [PMCToolAuthentication]
    public partial class AnalyticsController : BaseController
    {
        private readonly IOptions<AppSettingsModel> _appSettings;
        private IConfiguration configuration;
        public AnalyticsController(
            IOptions<AppSettingsModel> appSettings,          
            IStringLocalizer<SharedResource> localizer, IConfiguration iConfig) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
            configuration = iConfig;
        }
        private async Task<Participant> GetParticipant()
        {

            Participant result = new Participant();
            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{participantUser.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result.ParticipantUser.Image = participantUser.Image;
                }
            }
            catch (Exception ex)
            {

            }

            return result;
        }
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            ViewBag.UrlAnalytics = configuration.GetSection("AppSettings").GetSection("UrlAnalytics").Value;
             try
             {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    //api/v1/participants/{id}
                    var participantUser = await restClient.Get<ParticipantUserEmail>(baseUrl, $"/api/v1/participantusers/userEmail/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    ViewBag.userEmail = participantUser.Email;
                }
                else {
                    return new RedirectResult("/");
                }
            }
            catch (Exception ex)
            {
                return new RedirectResult("/");

            }

            return View();
        }

        [HttpGet]
        public async Task<IActionResult> Courses()
        {
            ViewBag.UrlCourses = configuration.GetSection("AppSettings").GetSection("UrlCourses").Value;
            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    //api/v1/participants/{id}
                    var participantUser = await restClient.Get<ParticipantUserEmail>(baseUrl, $"/api/v1/participantusers/userEmail/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    ViewBag.userEmail = participantUser.Email;
                }
                else
                {
                    return new RedirectResult("/");
                }
            }
            catch (Exception ex)
            {
                return new RedirectResult("/");

            }

            return View();
        }
    }
}