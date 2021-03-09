using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using CookieManager;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;
using PMCTool.Models.Security;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class UserController : BaseController
    {
        private IHttpContextAccessor _httpContextAccessor;
        private readonly ICookieManager _cookieManager;
        private readonly ICookie _cookie;

        private string _error;

        public UserController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer,
            IHttpContextAccessor httpContextAccessor,
            ICookieManager cookieManager, ICookie cookie) : base(appSettings, localizer)
        {
            _httpContextAccessor = httpContextAccessor;
            _cookieManager = cookieManager;
            _cookie = cookie;
        }

        #region USER MANAGEMENT

        [PMCToolAuthorize(ObjectCode = "3100")]
        [HttpGet]
        public IActionResult Index()
        {
            SetActiveOption("3100");
            ViewBag.Title = localizer["ViewTitleUserManagement"];
            return View();
        }

        [PMCToolAuthorize(ObjectCode = "3100")]
        [HttpGet]
        public async Task<IActionResult> Editor(Guid? id)
        {
            User m = new User();
            if (id == null)
            {
                ViewBag.IsNew = true;
                List<SelectionListItem> participants = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList/Unassigned", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                participants = participants.OrderBy(o => o.Value).ToList();
                ViewBag.Particpants = participants;

                m.CreateParticipant = true;
            }
            else
            {
                if (id.Value == Guid.Empty)
                    RedirectToAction("Index", "User");

                ViewBag.IsNew = false;

                try
                {
                    int type = (int)EnumFactory.UserType.App;
                    string env = GetTokenValue("Env");
                    m = await restClient.Get<User>(baseUrl, $"/api/v1/users/{id.Value.ToString()}/type/{type.ToString()}/Environment/{env}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
                catch (Exception ex)
                {
                    RedirectToAction("Index", "User");
                }
            }

            ViewBag.Title = localizer["ViewTitleUserManagement"];

            SetActiveOption("3100");
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> GetUsers()
        {
            List<User> data = new List<User>();
            try
            {
                int type = (int)EnumFactory.UserType.App;
                string env = GetTokenValue("Env");
                data = await restClient.Get<List<User>>(baseUrl, $"/api/v1/users/type/{type.ToString()}/Environment/{env}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetLanguages()
        {
            List <SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/languages/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetTimeZones(Guid languageId)
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/timezones/selectionList/languages/{languageId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = data.OrderBy(o => o.Value).ToList();
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> CreateUser(User data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data, true))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                data.Status = (int)EnumFactory.UserStatus.Inactive;
                data.Type = (int)EnumFactory.UserType.App;
                data.EnvironmentID = new Guid(GetTokenValue("Env"));
                data.Membership = new UserMembership() { StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow };

                var result = await restClient.Post<CreatedResult, User>(baseUrl, $"/api/v1/users", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
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

        [HttpPost]
        public async Task<JsonResult> UpdateUser(User data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data, false))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Put<OkObjectResult, User>(baseUrl, $"/api/v1/users/" + data.UserID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
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

        [HttpPost]
        public async Task<JsonResult> DeleteUser(User data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            if (!ValidateData(data, false))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/users/{data.UserID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
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

        [HttpPost]
        public async Task<JsonResult> UnlockUser(User data)
        {
            var result = await restClient.Get<User>(baseUrl, $"/api/v1/users/{data.UserID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            data.Name = result.Name;
            if (data.LicenseType == null || data.LicenseType < 1)
            {
                data.Status = (int)EnumFactory.UserStatus.Inactive;
            }
            else
            {
                data.Status = (int)EnumFactory.UserStatus.Active;
            }
            return await UpdateUser(data);
        }

        [HttpPost]
        public async Task<JsonResult> ValidateUsername(string username)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ValueBoolean = false,
            };

            if (string.IsNullOrWhiteSpace(username))
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["User"]);
                return Json(response);
            }

            try
            {
                var data = await restClient.Get<User>(baseUrl, $"/api/v1/users/username/{username}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                if (data != null)
                    response.ValueBoolean = true;
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

        [HttpPost]
        public async Task<JsonResult> ValidateUserEmail(string email)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ValueBoolean = false,
            };

            if (string.IsNullOrWhiteSpace(email))
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["Email"]);
                return Json(response);
            }

            try
            {
                var data = await restClient.Get<User>(baseUrl, $"/api/v1/users/email/{email}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                if (data != null)
                    response.ValueBoolean = true;
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

        [HttpPost]
        public async Task<JsonResult> GenerateUsername(string name, string lastname)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ValueBoolean = true,
            };

            if (string.IsNullOrWhiteSpace(name))
            {
                return Json(response);
            }

            if (string.IsNullOrWhiteSpace(lastname))
            {
                return Json(response);
            }

            try
            {
                var data = await restClient.Get<string>(baseUrl, $"/api/v1/auth/username?name={name.Trim()}&lastname={lastname.Trim()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.ValueString = data;
                response.IsSuccess = true;
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

        private bool ValidateData(User data, bool isNew)
        {

            _error = "";

            if (string.IsNullOrWhiteSpace(data.Name))
            {
                _error = string.Format(localizer.GetString("4012"), localizer["Name"]);
                return false;
            }

            if (data.Name.Length > 50)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Name"], "50");
                return false;
            }

            if (string.IsNullOrWhiteSpace(data.Lastname))
            {
                _error = string.Format(localizer.GetString("4012"), localizer["Lastname"]);
                return false;
            }

            if (data.Lastname.Length > 50)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Lastname"], "50");
                return false;
            }

            if (!string.IsNullOrWhiteSpace(data.Surname))
            {
                if (data.Surname.Length > 50)
                {
                    _error = string.Format(localizer.GetString("4011"), localizer["Surname"], "50");
                    return false;
                }
            }

            if (isNew)
            {

                if (string.IsNullOrWhiteSpace(data.Login))
                {
                    _error = string.Format(localizer.GetString("4012"), localizer["User"]);
                    return false;
                }

                if (data.Login.Length > 50)
                {
                    _error = string.Format(localizer.GetString("4011"), localizer["User"], "50");
                    return false;
                }

                if (string.IsNullOrWhiteSpace(data.Password))
                {
                    _error = string.Format(localizer.GetString("4012"), localizer["Password"]);
                    return false;
                }

                if (data.Password.Length < 8 || data.Password.Length > 15)
                {
                    _error = localizer.GetString("4007");
                    return false;
                }
            }

            return true;
        }

        #endregion

        #region USER <-> PROFILE

        [PMCToolAuthorize(ObjectCode = "3100")]
        [HttpGet]
        public async Task<IActionResult> AccessProfile(Guid? id)
        {
            if (id == null || id.Value == Guid.Empty)
                RedirectToAction("Index", "User");

            User m = new User();

            try
            {
                int type = (int)EnumFactory.UserType.App;
                m = await restClient.Get<User>(baseUrl, $"/api/v1/users/{id.Value.ToString()}/type/{type.ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            }
            catch (Exception ex)
            {
                RedirectToAction("Index", "User");
            }

            SetActiveOption("3100");
            ViewBag.Title = localizer["ViewTitleUserManagement"] + ": " + localizer["Profiles"];
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> GetUserProfile(string id)
        {
            List<UserProfileSelection> data = new List<UserProfileSelection>();
            try
            {
                int system = (int)EnumFactory.System.PMCTool_App;
                string env = GetTokenValue("Env");
                data = await restClient.Get<List<UserProfileSelection>>(baseUrl, $"/api/v1/users/{id}/profile/kardex/{system.ToString()}/environment/{env}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> CreateUserProfile(string profileId, string userId)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            try
            {
                string data = await restClient.Post<string, string>(baseUrl, $"/api/v1/users/{userId}/profiles/{profileId}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        [HttpPost]
        public async Task<JsonResult> DeleteUserProfile(string profileId, string userId)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            try
            {
                string data = await restClient.Delete<string, string>(baseUrl, $"/api/v1/users/{userId}/profiles/{profileId}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(response);
        }

        #endregion

        #region USER <-> CONNECTIVITY

        [HttpGet]
        public async Task<JsonResult> GetIPs(string userId)
        {
            List<UserConnectivity> data = new List<UserConnectivity>();

            if (string.IsNullOrEmpty(userId))
                return Json(data);

            try
            {
                int type = (int)EnumFactory.UserType.App;
                data = await restClient.Get<List<UserConnectivity>>(baseUrl, $"/api/v1/UserConnectivity/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> CreateUserConnection(string ip, string userId)
        {
            IPAddress ipaddress;
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            if (string.IsNullOrEmpty(ip.Trim()))
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["IPAddress"]);
                return Json(response);
            }

            if (ip != "*")
            {
                bool ValidateIP = IPAddress.TryParse(ip, out ipaddress);
                if (!ValidateIP)
                {
                    response.ErrorMessage = localizer.GetString("4014");
                    return Json(response);
                }
            }

            UserConnectivity data = new UserConnectivity()
            {
                ID = Guid.NewGuid(),
                UserID = new Guid(userId),
                UserName = "",
                IP = ip.Trim()
            };

            try
            {
                string result = await restClient.Post<string, UserConnectivity>(baseUrl, $"/api/v1/UserConnectivity", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
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

        [HttpPost]
        public async Task<JsonResult> DeleteUserConnection(string id)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            try
            {
                string data = await restClient.Delete<string, string>(baseUrl, $"/api/v1/UserConnectivity/{id}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
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

        #endregion

        #region USER <-> LICENSING

        [HttpGet]
        public async Task<JsonResult> GetEnvironmentLicensing() {
            List<EnvironmentLicense> data = new List<EnvironmentLicense>();

            try
            {
                string env = GetTokenValue("Env");
                data = await restClient.Get<List<EnvironmentLicense>>(baseUrl, $"/api/v1/Environments/{env}/licensing", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetAvailableLicenses(int? licenseEx)
        {
            List<EnvironmentLicense> data = new List<EnvironmentLicense>();

            try
            {
                string env = GetTokenValue("Env");
                var licenses = await restClient.Get<List<EnvironmentLicense>>(baseUrl, $"/api/v1/Environments/{env}/licensing", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (licenseEx != null)
                    licenses = licenses.Where(t => t.LicenseType != licenseEx).ToList();

                foreach (var license in licenses)
                {
                    if (license.AssignedLicenses < license.AvailableLicenses)
                    {
                        data.Add(license);
                    }
                }
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> RemoveLicense(Guid userId, Guid environmentId) {

            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            try
            {
                UserEnvironment data = new UserEnvironment() {
                    UserID = userId,
                    EnvironmentID = environmentId,
                    LicenseType = null
                };

                var result = await restClient.Put<string, UserEnvironment>(baseUrl, $"/api/v1/userenvironments", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
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

        [HttpPost]
        public async Task<JsonResult> UpdateLicense(Guid userId, Guid environmentId, int licenseType)
        {

            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            try
            {
                UserEnvironment data = new UserEnvironment()
                {
                    UserID = userId,
                    EnvironmentID = environmentId,
                    LicenseType = licenseType
                };

                var result = await restClient.Put<string, UserEnvironment>(baseUrl, $"/api/v1/userenvironments", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");
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

        #endregion

        #region PASSWORD UPDATE

        [PMCToolAuthorize(ObjectCode = "3102")]
        [HttpGet]
        public IActionResult UpdatePassword()
        {
            SetActiveOption("3102");
            ViewBag.Title = localizer["ViewTitleUpdatePassword"];
            return View();
        }

        [HttpPost]
        public async Task<JsonResult> UpdatePassword(PasswordRecoverModel data)
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
                    NewPassword = data.Password,
                    Login = GetTokenValue("LoginId"),
                };

                var result = await restClient.Put<OkObjectResult, ChangePassword>(baseUrl, $"/api/v1/users/changePassword", changePassword, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("PasswordUpdateSuccessMsg");
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

        #endregion
    }
}