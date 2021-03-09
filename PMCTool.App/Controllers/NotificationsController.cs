using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class NotificationsController : BaseController
    {
        public NotificationsController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        #region P R O J E C T  N O T I F I C A T I O N

        [HttpGet]
        public async Task<JsonResult> GetTopNNotification(int nPage, int nNotification)
        {
            var data = new List<Notification>();
            try
            {
                var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{GetTokenValue("UserId")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = await restClient.Get<List<Notification>>(baseUrl, $"/api/v1/notification/participant/{participantUser.ParticipantID}/notifications/top?nPage={nPage}&nNotification={nNotification}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = data.OrderByDescending(t => t.CreatedOn).ToList();
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetNotificationBadge()
        {
            var data = new List<Notification>();
            try
            {
                var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{GetTokenValue("UserId")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = await restClient.Get<List<Notification>>(baseUrl, $"/api/v1/notification/participant/{participantUser.ParticipantID}/notifications/badge", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetNotificationTotal()
        {
            int data = 0;
            try
            {
                var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{GetTokenValue("UserId")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = await restClient.Get<int>(baseUrl, $"/api/v1/notification/participant/{participantUser.ParticipantID}/notifications/total", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(response);
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
                return Json(response);
            }

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> CreateNotification(Guid projectId, int type, Guid elementId, string subject, string message, IEnumerable<string> recipients)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                Notification data = new Notification()
                {
                    NotificationID = Guid.NewGuid(),
                    Subject = subject,
                    Message = message,
                    Sender = string.Empty,
                    Status = (int)EnumFactory.NotificationStatus.Active,
                    Source = type,
                    SourceID = elementId.ToString(),
                    ScheduledFor = null,
                    Recipients = recipients.Select(p => new NotificationRecipient()
                    {
                        Recipient = p,
                        Status = (int)EnumFactory.NotificationStatus.Active,
                        Badge = true,
                        Display = true,
                        ViewedOn = null,
                    })
                };

                var result = await restClient.Post<Notification, Notification>(baseUrl, $"/api/v1/notification/projects/{projectId}/element/{elementId}/notifications", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
    
        [HttpPut]
        public async Task<JsonResult> UpdateBadgeNotification(List<Notification> data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{GetTokenValue("UserId")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var result = await restClient.Put<OkObjectResult,List<Notification>>(baseUrl, $"/api/v1/notification/participant/{participantUser.ParticipantID}/notifications/badge", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpPut]
        public async Task<JsonResult> UpdateDisplayNotification(Guid notificationId)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                Notification data = new Notification();
                var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{GetTokenValue("UserId")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var result = await restClient.Put<OkObjectResult, Notification>(baseUrl, $"/api/v1/notification/participant/{participantUser.ParticipantID}/notifications/{notificationId}/display", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
    }
}