using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
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

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class ParticipantsController : BaseController
    {
        private string _error;

        public ParticipantsController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {

        }

        #region P A R T I C I P A N T  L I S T

        [PMCToolAuthorize(ObjectCode = "3112")]
        [HttpGet]
        public IActionResult Index()
        {
            List<SelectionListItem> availableUsers = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);

            ViewBag.AvailableUsers = availableUsers;

            SetActiveOption("3112");
            ViewBag.Title = localizer["ViewTitleParticipant"];
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> Get()
        {
            List<Participant> data = new List<Participant>();
            try
            {
                data = await restClient.Get<List<Participant>>(baseUrl, $"/api/v1/participants", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetByID(string id)
        {
            Participant data = new Participant();

            try
            {
                data = await restClient.Get<Participant>(baseUrl, $"/api/v1/Participants/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetSelectionItemList()
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
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
        public async Task<JsonResult> GetByProjectSelectionItemList(Guid projectID)
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/" + projectID + "/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        #endregion

        #region P A R T I C I P A N T  M A N A G E M E N T

        [PMCToolAuthorize(ObjectCode = "3112")]
        [HttpGet]
        public async Task<IActionResult> New(Participant data)
        {
            List<SelectionListItem> countries = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/countries/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> states = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);
            List<SelectionListItem> cities = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);
            List<SelectionListItem> areas = new List<SelectionListItem>();
            List<SelectionListItem> companies = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> functions = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/functions/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> escalations = SelectionListHelper.AddNullOption(SelectionListHelper.RemoveOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), data.ParticipantID), localizer["SelectListNullItem"]);
            List<SelectionListItem> currencies = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/currencies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<KeyValuePairItem> costtypes = new List<KeyValuePairItem>() {
                new KeyValuePairItem(){ Key = null, Value = localizer["SelectListNullItem"] },
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.ByHour).ToString(), Value = localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.ByHour).ToString()) },
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.ByDay).ToString(), Value =localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.ByDay).ToString()) },
                //new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.Fixed).ToString(), Value =localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.Fixed).ToString()) },
            };
            costtypes = costtypes.OrderBy(o => o.Value).ToList();
            companies = companies.OrderBy(o => o.Value).ToList();

            ViewBag.Countries = countries;
            ViewBag.States = states;
            ViewBag.Cities = cities;
            ViewBag.Areas = areas;
            ViewBag.Companies = companies;
            ViewBag.Functions = functions;
            ViewBag.Escalations = escalations;
            ViewBag.Currencies = currencies;
            ViewBag.CostTypes = costtypes;
            ViewBag.Mode = "New";

            SetActiveOption("3112");
            ViewBag.Title = localizer["ViewTitleParticipant"];
            return View("Editor", new Participant() { IsActive = true });
        }

        [PMCToolAuthorize(ObjectCode = "3112")]
        [HttpGet]
        public async Task<IActionResult> Editor(Participant data)
        {
            Participant m = new Participant();

            try
            {
                if (data.ParticipantID != null)
                {
                    m = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{data.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    List<SelectionListItem> countries = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/countries/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                    List<SelectionListItem> states = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);
                    //if (m.Address.CountryID != null)
                    //    states = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/states/selectionList/{data.Address.CountryID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                    //List<SelectionListItem> cities = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);
                    //if (m.Address.StateID != null)
                    //    cities = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/cities/selectionList/{data.Address.StateID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                    List<SelectionListItem> companies = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
                    List<SelectionListItem> areas = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companyAreas/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                    if (m.CompanyID != null)
                        areas = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companyAreas/selectionList/company/{data.CompanyID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                    List<SelectionListItem> functions = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/functions/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
                    List<SelectionListItem> escalations = SelectionListHelper.AddNullOption(SelectionListHelper.RemoveOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), data.ParticipantID), localizer["SelectListNullItem"]);
                    List<SelectionListItem> currencies = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/currencies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                    List<KeyValuePairItem> costtypes = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = null, Value = localizer["SelectListNullItem"] },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.ByHour).ToString(), Value = localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.ByHour).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.ByDay).ToString(), Value =localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.ByDay).ToString()) },
                    //new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.Fixed).ToString(), Value =localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.Fixed).ToString()) },
                    };

                    //if (m.ParticipantUser.UserID != Guid.Empty) {
                    //    costtypes.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ParticipantCostType.Fixed).ToString(), Value = localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.Fixed).ToString())});
                    //}
                    costtypes = costtypes.OrderBy(o => o.Value).ToList();
                    companies = companies.OrderBy(o => o.Value).ToList();

                    ViewBag.Countries = countries;
                    ViewBag.States = states;
                    //ViewBag.Cities = cities;
                    ViewBag.Areas = areas;
                    ViewBag.Companies = companies;
                    ViewBag.Functions = functions;
                    ViewBag.Escalations = escalations;
                    ViewBag.Currencies = currencies;
                    ViewBag.CostTypes = costtypes;
                    ViewBag.Mode = "Edit";
                }   
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
            SetActiveOption("3112");
            ViewBag.Title = localizer["ViewTitleParticipant"];

            return View(m);
        }

        [HttpPost]
        public async Task<JsonResult> Post(Participant data)
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
                Participant result = await restClient.Post<Participant, Participant>(baseUrl, $"/api/v1/participants", (Participant)data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Put(Participant data)
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
                Participant result = await restClient.Put<Participant, Participant>(baseUrl, $"/api/v1/participants/" + data.ParticipantID.ToString(), (Participant)data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Delete(Participant data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/participants/{data.ParticipantID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateData(Participant data, bool isNew)
        {
            _error = "";

            if (isNew)
            {
                if (!string.IsNullOrWhiteSpace(data.Code))
                {
                    if (data.Code.Length > 50)
                    {
                        _error = string.Format(localizer.GetString("4011"), localizer["Code"], "50");
                        return false;
                    }
                }
            }
            else
            {
                if (string.IsNullOrWhiteSpace(data.Code))
                {
                    _error = string.Format(localizer.GetString("4012"), localizer["Code"]);
                    return false;
                }
                else
                {
                    if (data.Code.Length > 50)
                    {
                        _error = string.Format(localizer.GetString("4011"), localizer["Code"], "50");
                        return false;
                    }
                }
            }

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

            //if (string.IsNullOrWhiteSpace(data.Surname))
            //{
            //    _error = string.Format(localizer.GetString("4012"), localizer["Surname"]);
            //    return false;
            //}

            if (!string.IsNullOrWhiteSpace(data.Surname) && data.Surname.Length > 50)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Surname"], "50");
                return false;
            }

            if (string.IsNullOrWhiteSpace(data.Email))
            {
                _error = string.Format(localizer.GetString("4012"), localizer["Email"]);
                return false;
            }

            if (data.Email.Length > 150)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Email"], "150");
                return false;
            }

            return true;
        }

        #endregion

        #region M A S S I V E  L O A D

        [HttpPost]
        public async Task<JsonResult> MasiveUploadFile(List<IFormFile> files)
        {
            var source = files.FirstOrDefault();

            string filename = ContentDispositionHeaderValue.Parse(source.ContentDisposition).FileName.Trim('"');

            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };
            try
            {
                using (var content = new MultipartFormDataContent())
                {
                    content.Add(new StreamContent(source.OpenReadStream())
                    {
                        Headers =
                        {
                            ContentLength = source.Length,
                            ContentType = new MediaTypeHeaderValue(source.ContentType)
                        }
                    }, "File", filename);

                    var result = await restClient.Post<BulkLoad, MultipartFormDataContent>(baseUrl, $"/api/v1/BulkLoad", content,
                    new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") },
                                                       { "BulkLoad", "participants" } ,
                                                       { "content-type", new MediaTypeHeaderValue(source.ContentType).ToString() } }, true);

                    response.SuccessMessage = ConvertBulkResponse(result);
                    response.IsSuccess = result.IsSuccess;
                    response.HasErrors = result.HasErrors;
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

        #endregion

        #region G L O B A L  F U N C T I O N S

        [HttpGet]
        public async Task<JsonResult> GetStates(Guid countryID)
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/states/selectionList/{countryID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
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
        public async Task<JsonResult> GetCities(Guid stateID)
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/cities/selectionList/{stateID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
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
        public async Task<JsonResult> GetCompanyAreas(Guid companyID)
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companyAreas/selectionList/company/{companyID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        #endregion
    }
}