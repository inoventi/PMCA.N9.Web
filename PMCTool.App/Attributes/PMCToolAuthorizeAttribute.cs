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
    /// <summary>
    /// Validate user access to specific resourse
    /// </summary>
    public class PMCToolAuthorizeAttribute: Attribute, IAuthorizationFilter
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
                header.Add("Authorization", token);
                //
                var handler = new JwtSecurityTokenHandler();
                var tokenString = handler.ReadJwtToken(token);
                var userId = tokenString.Claims.FirstOrDefault(x => x.Type == "jti").Value;
                var envId = tokenString.Claims.FirstOrDefault(x => x.Type == "Env").Value;
                var profileUser = Task.Run<User>(() => restClient.Get<User>(baseUrl, $"/api/v1/Users/{userId}", new Dictionary<string, string>() { { "Authorization", token } })).Result;
                ///
                try
                {

                    if (profileUser.Type == (int)EnumFactory.UserType.App)
                    {
                        var response = Task.Run<OkObjectResult>(() => restClient.Get<OkObjectResult>(baseUrl, $"/api/v1/useraccess/{ObjectCode}", header)).Result;
                        var result = JsonConvert.DeserializeObject<UserObjectAccess>(response.Value.ToString());
                        isValid = result.ValidAccess;
                    }
                    else if (profileUser.Type == (int)EnumFactory.UserType.CCP) {
                        isValid = true;
                    }
                    else{

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
