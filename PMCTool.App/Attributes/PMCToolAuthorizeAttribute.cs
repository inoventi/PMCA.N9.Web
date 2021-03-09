using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
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

                try
                {
                    var response = Task.Run<OkObjectResult>(() => restClient.Get<OkObjectResult>(baseUrl, $"/api/v1/useraccess/{ObjectCode}", header)).Result;
                    var result = JsonConvert.DeserializeObject<UserObjectAccess>(response.Value.ToString());
                    isValid = result.ValidAccess;
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
