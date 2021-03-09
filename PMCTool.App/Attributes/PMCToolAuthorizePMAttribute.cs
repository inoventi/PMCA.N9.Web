using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Attributes
{
    public class PMCToolAuthorizePMAttribute : Attribute, IAuthorizationFilter
    {
        public string ObjectCode;
        private string _controller;
        private string _action;

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            bool isValid = false;
            Dictionary<string, string> header = new Dictionary<string, string>();
            RestClient restClient = new RestClient();
            string baseUrl = AppSettings.Current.BaseUrl;

            _controller = "Home";
            _action = "AccessNotAllowed";

            if (!string.IsNullOrEmpty(ObjectCode))
            {
                string token = context.HttpContext.Request.Cookies["pmctool-token-app"];
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);
                string userId = jwt.Claims.FirstOrDefault(x => x.Type == "jti").Value;
                int userType = int.Parse(jwt.Claims.FirstOrDefault(x => x.Type == "TP").Value);
                string env = jwt.Claims.FirstOrDefault(x => x.Type == "Env").Value;

                header.Add("Authorization", token);

                try
                {
                    var userEnvironment = Task.Run<UserEnvironment>(() => restClient.Get<UserEnvironment>(baseUrl, $"/api/v1/userenvironments/user/{userId}/environment/{env}", header)).Result;
                    if (userEnvironment.LicenseType == (int)EnumFactory.UserLicenseType.ProjectManager)
                    {
                        var response = Task.Run<OkObjectResult>(() => restClient.Get<OkObjectResult>(baseUrl, $"/api/v1/useraccess/{ObjectCode}", header)).Result;
                        var result = JsonConvert.DeserializeObject<UserObjectAccess>(response.Value.ToString());
                        isValid = result.ValidAccess;
                    }
                }
                catch (Exception ex)
                {
                }
            }

            if (!isValid)
            {
                context.Result = new RedirectToRouteResult(
                    new RouteValueDictionary(
                        new { controller = _controller, action = _action }));
            }
        }
    }
}
