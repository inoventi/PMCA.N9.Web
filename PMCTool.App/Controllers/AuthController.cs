using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Security;
using CookieManager;
using PMCTool.App.Attributes;
using Microsoft.AspNetCore.Authorization;
using PMCTool.Models.Core;
using Newtonsoft.Json;
using System.IO;
using System.ComponentModel;

namespace PMCTool.App.Controllers
{
    public class AuthController : BaseController
    {
        private IHttpContextAccessor _httpContextAccessor;
        private readonly ICookieManager _cookieManager;
        private readonly ICookie _cookie;

        public AuthController(IOptions<AppSettingsModel> appSettings, 
            IStringLocalizer<SharedResource> localizer, 
            IHttpContextAccessor httpContextAccessor,
            ICookieManager cookieManager, ICookie cookie) : base(appSettings, localizer)
        {
            _httpContextAccessor = httpContextAccessor;
            _cookieManager = cookieManager;
            _cookie = cookie;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<JsonResult> Login(string username, string password)
        {
            ResponseModel response = await SignIn(username, password, null);
            return Json(response);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<JsonResult> LoginExt(string username, string password, string env)
        {
            ResponseModel response = new ResponseModel() {
                IsSuccess = false,
                ErrorMessage = ""
            };

            if (string.IsNullOrEmpty(env)) {
                response.ErrorMessage = string.Format(localizer["4012"], localizer["Environment"]);
                return Json(response);
            }

            response = await SignIn(username, password, env);
            return Json(response);
        }

        public IActionResult ExternalLogin() {
            string email = Request.HttpContext.Request.Query["userEmail"].ToString();
            if (email == null | email=="")
            {
                return RedirectToAction("Login", "Auth");
            }
            else {
                return RedirectToAction("Index", "Home");

            }

           
        }
        [AllowAnonymous]
        [HttpPost]
        public async Task<JsonResult> AcceptAgreement(string username, string password, string tk)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            var result = await restClient.Post<string, string>(baseUrl, $"/api/v1/auth/Agreement", "", new Dictionary<string, string>() { { "Authorization", tk } });

            if (!string.IsNullOrEmpty(result))
                response = await SignIn(username, password,"");

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetEnvironmentsByUser(Guid uid, string tk)
        {
            List<PMCTool.Models.Core.Environment> result = new List<PMCTool.Models.Core.Environment>();
            try
            {
                result = await restClient.Get<List<PMCTool.Models.Core.Environment>>(baseUrl, $"/api/v1/Environments/user/{uid}", new Dictionary<string, string>() { { "Authorization", tk } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }
            return Json(result);
        }

        [HttpGet]
        public async Task<JsonResult> GetAgreementPolicy(string tk)
        {
            Agreement result = new Agreement();
            try
            {
                result = await restClient.Get<Agreement>(baseUrl, $"/api/v1/agreement", new Dictionary<string, string>() { { "Authorization", tk } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }
            return Json(result);
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult PasswordRecovery(string id)
        {
            PasswordRecoverModel passwordRecovery = new PasswordRecoverModel()
            {
                Token = id
            };

            return View(passwordRecovery);
        }

        [HttpPost]
        public async Task<JsonResult> PasswordRecovery(PasswordRecoverModel data)
        {
            ResponseModel response = new ResponseModel
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            if (string.IsNullOrEmpty(data.Password))
            {
                response.ErrorMessage = localizer.GetString("4002");
                return Json(response);
            }

            if (string.IsNullOrEmpty(data.Confirm))
            {
                response.ErrorMessage = localizer.GetString("4005");
                return Json(response);
            }

            if (!data.Password.Equals(data.Confirm))
            {
                response.ErrorMessage = localizer.GetString("4006");
                return Json(response);
            }

            if (data.Password.Length < 8 || data.Password.Length > 15)
            {
                response.ErrorMessage = localizer.GetString("4007");
                return Json(response);
            }

            try
            {
                ChangePassword changePassword = new ChangePassword()
                {
                    RecoveryToken = data.Token,
                    NewPassword = data.Password
                };

                response.IsSuccess = await restClient.Put<bool, ChangePassword>(baseUrl, $"/api/v1/auth/passwordRecovery", changePassword, null);
                if (response.IsSuccess)
                {
                    response.SuccessMessage = localizer.GetString("PasswordUpdateSuccessMsg");
                }
                else
                {
                    response.ErrorMessage = localizer.GetString("4003");
                }
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<JsonResult> PasswordRecover(string username)
        {
            ResponseModel response = new ResponseModel
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            if (string.IsNullOrEmpty(username))
            {
                response.ErrorMessage = localizer.GetString("4001");
                return Json(response);
            }

            PasswordRecovery passwordRecovery = new PasswordRecovery()
            {
                User = username,
                Type = (int)EnumFactory.UserType.App,
                System = (int)EnumFactory.System.PMCTool_App
            };

            try
            {
                response.IsSuccess = await restClient.Post<bool, PasswordRecovery>(baseUrl, $"/api/v1/auth/passwordRecovery", passwordRecovery, null);
                if (response.IsSuccess)
                {
                    response.SuccessMessage = localizer.GetString("PasswordRecoverSuccessMsg");
                }
                else
                {
                    response.ErrorMessage = localizer.GetString("4003");
                }
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        [PMCToolAuthenticationAttribute]
        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            ResponseModel response = new ResponseModel();

            try
            {
                var result = await restClient.Post<bool, string>(baseUrl, $"/api/v1/auth/logout", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (result)
                {
                    _httpContextAccessor.HttpContext.Response.Cookies.Delete("pmctool-token-app");
                    _httpContextAccessor.HttpContext.Response.Cookies.Delete("pmctool-name-app");
                    _httpContextAccessor.HttpContext.Response.Cookies.Delete("pmctool-avatar-app");
                    _httpContextAccessor.HttpContext.Response.Cookies.Delete("pmctool-envlogo-app");
                    _httpContextAccessor.HttpContext.Response.Cookies.Delete("pmctool-option");
                }
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return RedirectToAction("Login", "Auth");
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> ExternalLoginCourses(string userEmail)
        {
            UserTokenCourses response = new UserTokenCourses
            {
                IsSuccess = false,
                ErrorMessage = "",
                ErrorCode = 0,
                token = "",
                userEmail = userEmail,
                LicenseID =""
            };
            string lisenseID = "";
            string token = "";
            List<LicenseRole> data = new List<LicenseRole>();

            if (!String.IsNullOrEmpty(userEmail))
            {
                string email = userEmail;
                var emailExist = Task.Run<string>(() => restClient.Post<string, string>(baseUrl, $"/api/v1/auth/checkUserExistByEmailAsync", userEmail, new Dictionary<string, string>())).Result;
                if (emailExist == "userExist") {
                    token = Task.Run<string>(() => restClient.Post<string, string>(baseUrl, $"/api/v1/auth/TokenByEmailAsync", userEmail, new Dictionary<string, string>())).Result;
                    if (token != "")
                    {
                        lisenseID = Task.Run<string>(() => restClient.Post<string, string>(baseUrl, $"/api/v1/auth/GettokenByEmailAsync", userEmail, new Dictionary<string, string>())).Result;
                    }
                }

            }
            else
            {
                response.IsSuccess = false;
                response.ErrorCode = 404;
                response.ErrorMessage = "wrong email";
            }

            if (!string.IsNullOrEmpty(token))
            {
                //correccto
                response.IsSuccess = true; 
                response.ErrorCode = 200;
                response.token = token;
                response.userEmail = userEmail;
                response.ErrorMessage = "Success";
                response.LicenseID = lisenseID;


            }
            else
            {
                response.IsSuccess = false;
                response.ErrorCode = 404;
                response.ErrorMessage = "wrong token or email not exist"; 
                response.LicenseID = null;
            }
            return Json(response);

        }

        #region P R I V A T E 

        private async Task<ResponseModel> SignIn(string username, string password, string env)
        {
            ResponseModel response = new ResponseModel {
                IsSuccess = false,
                ValueBoolean = false,
                ValueString = "",
            };

            if (string.IsNullOrEmpty(username))
            {
                response.ErrorMessage = localizer.GetString("4001");
                return response;
            }

            if (string.IsNullOrEmpty(password))
            {
                response.ErrorMessage = localizer.GetString("4002");
                return response;
            }

            try
            {
                string envLogo = "";

                Login login = new Login()
                {
                    Username = username,
                    Password = password,
                    IP = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                    Type = (int)EnumFactory.UserType.App,
                    Device = (int)EnumFactory.UserLoginDevice.NonMobileApp,
                    System = (int)EnumFactory.System.PMCTool_App,
                    Environment = env,
                };

                //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                //User information 
                //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                var result = await restClient.Post<OkObjectResult, Login>(baseUrl, $"/api/v1/auth/login", login, null);
                response.ValueString = result.Value.ToString();

                var handler = new JwtSecurityTokenHandler();
                var token = handler.ReadJwtToken(response.ValueString);
                var userId = token.Claims.FirstOrDefault(x => x.Type == "jti").Value;
                var envId = token.Claims.FirstOrDefault(x => x.Type == "Env").Value;

                //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                //User profile information 
                //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                var profile = await restClient.Get<User>(baseUrl, $"/api/v1/Users/{userId}", new Dictionary<string, string>() { { "Authorization", response.ValueString } });

                //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                //Environment information 
                //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                if (!string.IsNullOrEmpty(envId))
                {
                    var environment = await restClient.Get<PMCTool.Models.Core.Environment>(baseUrl, $"/api/v1/environments/{envId}", new Dictionary<string, string>() { { "Authorization", response.ValueString } });
                    envLogo = environment.Logo;
                }

                if (profile.Type == (int)EnumFactory.UserType.App)
                {
                    response.ValueInt = 1;
                    var hasAgreement = await restClient.Get<bool>(baseUrl, $"/api/v1/auth/Agreement", new Dictionary<string, string>() { { "Authorization", response.ValueString } });
                    if (hasAgreement)
                    {
                        SetupAccess(response.ValueString, profile.Image, envLogo);
                        response.ValueBoolean = true;
                    }
                }
                else
                {
                    response.ValueInt = 2;
                    if (profile.Type == (int)EnumFactory.UserType.CCP && !string.IsNullOrEmpty(env))
                    {
                        SetupAccess(response.ValueString, profile.Image, envLogo);
                        response.ValueBoolean = true;
                    }
                }

                response.ValueString1 = response.ValueString;
                response.ValueString = userId;
                response.IsSuccess = true;
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;

                if (apiError.ErrorCode == 5017)
                {
                    response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString()) + " " + apiError.ErrorMessage;
                }
                else
                {
                    response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
                }
            }
            catch (Exception ex)
            {
                if(string.Equals(ex.Message, localizer.GetString("10061")))
                {
                    response.ErrorMessage = localizer.GetString("ConnectionRefused");
                }
                else
                {
                    response.ErrorMessage = ex.Source + ": " + ex.Message;
                    if (ex.InnerException != null)
                        response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                }
            }

            return response;
        }

        private void SetupAccess(string token, string image, string envLogo) {

            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var userId = jwt.Claims.FirstOrDefault(x => x.Type == "jti").Value;
            var lang = jwt.Claims.FirstOrDefault(x => x.Type == "Lang").Value;
            var name = jwt.Claims.FirstOrDefault(x => x.Type == "Fn").Value + " " + jwt.Claims.FirstOrDefault(x => x.Type == "Ln").Value;

            _httpContextAccessor.HttpContext.Response.Cookies.Append("pmctool-token-app",
                token, new CookieOptions()
                {
                    Expires = DateTime.Now.AddDays(7),
                    IsEssential = true
                });

            _httpContextAccessor.HttpContext.Response.Cookies.Append("pmctool-name-app",
                name, new CookieOptions()
                {
                    Expires = DateTime.Now.AddDays(7),
                    IsEssential = true
                });

            _httpContextAccessor.HttpContext.Response.Cookies.Append("pmctool-lang-app",
                lang, new CookieOptions()
                {
                    Expires = DateTime.Now.AddDays(7),
                    IsEssential = true
                });

            _httpContextAccessor.HttpContext.Response.Cookies.Append(CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(lang)),
                new CookieOptions
                {
                    Expires = DateTime.Now.AddDays(7),
                    IsEssential = true
                });

            if (!string.IsNullOrEmpty(image))
            {
                _httpContextAccessor.HttpContext.Response.Cookies.Append("pmctool-avatar-app",
                image, new CookieOptions()
                {
                    Expires = DateTime.Now.AddDays(7),
                    IsEssential = true
                });
            }

            if (!string.IsNullOrEmpty(envLogo))
            {
                _httpContextAccessor.HttpContext.Response.Cookies.Append("pmctool-envlogo-app",
                envLogo, new CookieOptions()
                {
                    Expires = DateTime.Now.AddDays(7),
                    IsEssential = true
                });
            }
        }

        #endregion
    }
}