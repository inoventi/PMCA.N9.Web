using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class ParticipantUsersController : BaseController
    {
        private readonly IOptions<AppSettingsModel> _appSettings;
        private string _error;
        private readonly IHostingEnvironment _he;
        private IHttpContextAccessor _httpContextAccessor;

        public ParticipantUsersController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer,
            IHttpContextAccessor httpContextAccessor, 
            IHostingEnvironment e) : base(appSettings, localizer)
        {
            _httpContextAccessor = httpContextAccessor;
            _appSettings = appSettings;
            _he = e;
        }

        [HttpGet]
        public async Task<JsonResult> GetById(Guid participantId)
        {
            ParticipantUser data = new ParticipantUser();
            try
            {
                data = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantUsers/" + participantId.ToString(), new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
                return Json(data);
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetAvailable(Guid UserID)
        {
            List<SelectionListItem> users = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/Environments/selectionList/users/all", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            List<SelectionListItem> participantUsers = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participantUsers/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            foreach (SelectionListItem item in participantUsers)
            {
                if (item.Key != UserID)
                {
                    users = SelectionListHelper.RemoveOption(users, (Guid)item.Key);
                }
            }

            users = SelectionListHelper.AddNullOption(users, localizer["SelectListNullItem"]);
            return Json(users);
        }

        [HttpPost]
        public async Task<JsonResult> UpdateUser(ParticipantUser data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/participantusers/" + data.ParticipantID.ToString(), "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (data.UserID != Guid.Empty)
                {
                    ParticipantUser result = await restClient.Post<ParticipantUser, ParticipantUser>(baseUrl, $"/api/v1/participantusers", (ParticipantUser)data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
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

        [HttpPatch]
        public async Task<JsonResult> UploadFile(ParticipantUserImage photo)
        {
            ParticipantUser data = new ParticipantUser();

            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };
           
            try
            {
                string userId = GetTokenValue("UserId");

                data = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                 //data = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantUsers/" + photo.ParticipantID.ToString(), new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (data != null)
                {
                    if(data.Image != null)
                    {
                        var reference = Path.Combine(_he.WebRootPath, @"images\avatar\users", Path.GetFileName(data.Image));
 
                        data.Image = null;
                        var updatedParticipant = await restClient.Patch<ParticipantUser, ParticipantUser>(baseUrl, $"/api/v1/participantusers/file/" + data.ParticipantID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                        if (System.IO.File.Exists(reference))
                        {
                            System.IO.File.Delete(reference);
                        }
                    }

                    data.Image = _appSettings.Value.ImageLogicalPath + @"/avatar/users/" + data.UserID.ToString().Replace("-", "") + Path.GetExtension(photo.Image.FileName);
                    var result = await restClient.Patch<ParticipantUser, ParticipantUser>(baseUrl, $"/api/v1/participantusers/file/" + data.ParticipantID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                    if (photo.Image != null)
                    {
                        string filename = Path.Combine(_he.WebRootPath, @"images/avatar/users/", data.UserID.ToString().Replace("-", "") + Path.GetExtension(photo.Image.FileName));
                         using (FileStream DestinationStream = new FileStream(filename, FileMode.Create))
                        {
                             await photo.Image.CopyToAsync(DestinationStream);
                        }
                    }
                    if (!string.IsNullOrEmpty(data.Image))
                    {
                        _httpContextAccessor.HttpContext.Response.Cookies.Append("pmctool-avatar-app",
                        data.Image, new CookieOptions()
                        {
                            Expires = DateTime.Now.AddDays(7),
                            IsEssential = true
                        });
                    }   
                    response.IsSuccess = true;
                    response.SuccessMessage = localizer.GetString("SuccessMsg");
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

        [HttpPatch]
        public async Task<JsonResult> DeleteFile(ParticipantUser participantUser)
        {
            ParticipantUser data = new ParticipantUser();

            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    data = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    if(data != null)
                    {
                        var reference = Path.Combine(_he.WebRootPath, @"images/avatar/users", Path.GetFileName(data.Image));
                        data.Image = null;
                        var result = await restClient.Patch<ParticipantUser, ParticipantUser>(baseUrl, $"/api/v1/participantusers/file/" + data.ParticipantID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                        if (System.IO.File.Exists(reference))
                        {
                            System.IO.File.Delete(reference);
                        }

                        var defaultAvater = Path.Combine(_he.WebRootPath, @"\images\avatar\default-avatar.png");

                        _httpContextAccessor.HttpContext.Response.Cookies.Append("pmctool-avatar-app",
                        defaultAvater, new CookieOptions()
                        {
                            Expires = DateTime.Now.AddDays(7),
                            IsEssential = true
                        });

                        response.IsSuccess = true;
                        response.SuccessMessage = localizer.GetString("SuccessMsg");
                    }
                    
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
    }
    public class ParticipantUserImage : ParticipantUser
    {
        public IFormFile Image { get; set; }
    }
}