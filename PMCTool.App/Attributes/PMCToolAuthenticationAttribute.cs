using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using PMCTool.Common.RestConnector;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Attributes
{
    /// <summary>
    /// Validate if user is logged in
    /// </summary>
    public class PMCToolAuthenticationAttribute : Attribute, IAuthorizationFilter
    {
        private string _controller;
        private string _action;

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            bool isValid = false;
            Dictionary<string, string> header = new Dictionary<string, string>();
            RestClient restClient = new RestClient();
            string baseUrl = AppSettings.Current.BaseUrl;

            _controller = "Auth";
            _action = "Login";

            string token = context.HttpContext.Request.Cookies["pmctool-token-app"];
            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    header.Add("Authorization", token);
                    isValid = Task.Run<bool>(() => restClient.Post<bool, string>(baseUrl, $"/api/v1/auth/validateToken", "", header)).Result;
                }
                catch (Exception ex)
                {
                }
            }

            if (!isValid)
                context.Result = new RedirectToActionResult(_action, _controller, null);
        }
    }
}
