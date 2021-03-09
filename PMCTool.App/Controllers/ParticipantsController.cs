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
        public async Task<JsonResult> GetByCode(string code)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ValueBoolean = false,
            };

            if (string.IsNullOrWhiteSpace(code))
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["Code"]);
                return Json(response);
            }

            try
            {
                var data = await restClient.Get<Project>(baseUrl, $"/api/v1/Participants/code/{code}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                if (data != null)
                {
                    response.ErrorMessage = string.Format(localizer.GetString("4017"), localizer.GetString("Code"));
                    response.ValueBoolean = true;
                }
            }
            catch (HttpResponseException ex)
            {
                if(ex.StatusCode != StatusCodes.Status404NotFound)
                {
                    var apiError = GetApiError(ex.ServiceContent.ToString());
                    response.ErrorCode = apiError.ErrorCode;
                    response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
                }
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        [HttpGet]
        public async Task<JsonResult> GetByEmail(string email)
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
                var data = await restClient.Get<Project>(baseUrl, $"/api/v1/Participants/email/{email}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                if (data != null)
                {
                    response.ValueBoolean = true;
                    response.ErrorMessage = string.Format(localizer.GetString("4017"), localizer.GetString("Email"));
                }
            }
            catch (HttpResponseException ex)
            {
                if(ex.StatusCode != StatusCodes.Status404NotFound)
                {
                    var apiError = GetApiError(ex.ServiceContent.ToString());
                    response.ErrorCode = apiError.ErrorCode;
                    response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
                }
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
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
                    if (m.Address.CountryID != null)
                        states = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/states/selectionList/{data.Address.CountryID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                    List<SelectionListItem> cities = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);
                    if (m.Address.StateID != null)
                        cities = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/cities/selectionList/{data.Address.StateID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

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
                    ViewBag.Cities = cities;
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

        [HttpGet]
        public async Task<JsonResult> DownloadCatalog()
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            var wb = new XLWorkbook();
            string fileName = Directory.GetCurrentDirectory() + @"/Temp/" + localizer.GetString("Catalogs") + "_" + localizer.GetString("Participant") + "_" + DateTime.Now.ToString("yyyyMMddHHmmsss") + ".xlsx";

            try
            {
                var dataAreas = await restClient.Get<List<CompanyArea>>(baseUrl, $"/api/v1/companyAreas", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataFunctions = await restClient.Get<List<Function>>(baseUrl, $"/api/v1/functions", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataEscalations = await restClient.Get<List<Participant>>(baseUrl, $"/api/v1/participants", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                List<KeyValuePairItem> dataCostTypes = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.ByHour).ToString(), Value = localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.ByHour).ToString()).ToString().ToUpper() },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.ByDay).ToString(), Value =localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.ByDay).ToString()).ToString().ToUpper() },
                    //new KeyValuePairItem(){ Key = ((int)EnumFactory.ParticipantCostType.Fixed).ToString(), Value =localizer.GetString("EnumCostType_" + ((int)EnumFactory.ParticipantCostType.Fixed).ToString()).ToString().ToUpper() },
                };

                var dataCurrencies = await restClient.Get<List<Currency>>(baseUrl, $"/api/v1/currencies", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataCountry = await restClient.Get<List<Location>>(baseUrl, $"/api/v1/locations/type/{1}/language/{GetTokenValue("Lang")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataState = await restClient.Get<List<Location>>(baseUrl, $"/api/v1/locations/type/{2}/language/{GetTokenValue("Lang")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataCity = await restClient.Get<List<Location>>(baseUrl, $"/api/v1/locations/type/{3}/language/{GetTokenValue("Lang")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var wsAreas = wb.Worksheets.Add(localizer.GetString("Area"));
                var wsFunction = wb.Worksheets.Add(localizer.GetString("Function"));
                var wsEscalation = wb.Worksheets.Add(localizer.GetString("Escalation"));
                var wsCostType = wb.Worksheets.Add(localizer.GetString("CostType"));
                var wsCurrency = wb.Worksheets.Add(localizer.GetString("Currency"));

                var wsCountry = wb.Worksheets.Add(localizer.GetString("Country"));
                var wsState = wb.Worksheets.Add(localizer.GetString("State"));
                var wsCity = wb.Worksheets.Add(localizer.GetString("City"));

                wsAreas.Cell(1, 1).Value = localizer.GetString("Code");
                wsAreas.Cell(1, 2).Value = localizer.GetString("Name");
                wsAreas.Cell(1, 3).Value = localizer.GetString("Company");

                wsFunction.Cell(1, 1).Value = localizer.GetString("Code");
                wsFunction.Cell(1, 2).Value = localizer.GetString("Name");

                wsEscalation.Cell(1, 1).Value = localizer.GetString("Code");
                wsEscalation.Cell(1, 2).Value = localizer.GetString("Name");

                wsCostType.Cell(1, 1).Value = localizer.GetString("Code");
                wsCostType.Cell(1, 2).Value = localizer.GetString("Name");

                wsCurrency.Cell(1, 1).Value = localizer.GetString("Code");
                wsCurrency.Cell(1, 2).Value = localizer.GetString("Name");

                wsCountry.Cell(1, 1).Value = localizer.GetString("Code");
                wsCountry.Cell(1, 2).Value = localizer.GetString("Name");

                wsState.Cell(1, 1).Value = localizer.GetString("Code");
                wsState.Cell(1, 2).Value = localizer.GetString("Name");
                wsState.Cell(1, 3).Value = localizer.GetString("Country");

                wsCity.Cell(1, 1).Value = localizer.GetString("Code");
                wsCity.Cell(1, 2).Value = localizer.GetString("Name");
                wsCity.Cell(1, 3).Value = localizer.GetString("State");

                int iRow = 2;
                dataAreas = dataAreas.OrderBy(t => t.Code).ToList();
                foreach (var data in dataAreas)
                {
                    wsAreas.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsAreas.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsAreas.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsAreas.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;
                    wsAreas.Cell(iRow, 3).SetValue<string>(data.CompanyName);
                    wsAreas.Cell(iRow, 3).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                var firstCell = wsAreas.FirstCellUsed();
                var lastCell = wsAreas.LastCellUsed();
                var range = wsAreas.Range(firstCell.Address, lastCell.Address);
                var table = range.CreateTable();
                wsAreas.Columns().AdjustToContents();

                iRow = 2;
                dataFunctions = dataFunctions.OrderBy(t => t.Code).ToList();
                foreach (var data in dataFunctions)
                {
                    wsFunction.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsFunction.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsFunction.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsFunction.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsFunction.FirstCellUsed();
                lastCell = wsFunction.LastCellUsed();
                range = wsFunction.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsFunction.Columns().AdjustToContents();

                iRow = 2;
                dataEscalations = dataEscalations.OrderBy(t => t.Code).ToList();
                foreach (var data in dataEscalations)
                {
                    wsEscalation.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsEscalation.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsEscalation.Cell(iRow, 2).SetValue<string>(data.Name + " " + data.Lastname + " " + data.Surname);
                    wsEscalation.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsEscalation.FirstCellUsed();
                lastCell = wsEscalation.LastCellUsed();
                range = wsEscalation.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsEscalation.Columns().AdjustToContents();

                iRow = 2;
                foreach (var data in dataCostTypes)
                {
                    wsCostType.Cell(iRow, 1).SetValue<string>(data.Key);
                    wsCostType.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsCostType.Cell(iRow, 2).SetValue<string>(data.Value);
                    wsCostType.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsCostType.FirstCellUsed();
                lastCell = wsCostType.LastCellUsed();
                range = wsCostType.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsCostType.Columns().AdjustToContents();

                iRow = 2;
                dataCurrencies = dataCurrencies.OrderBy(t => t.Code).ToList();
                foreach (var data in dataCurrencies)
                {
                    wsCurrency.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsCurrency.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsCurrency.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsCurrency.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsCurrency.FirstCellUsed();
                lastCell = wsCurrency.LastCellUsed();
                range = wsCurrency.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsCurrency.Columns().AdjustToContents();

                iRow = 2;
                dataCountry = dataCountry.OrderBy(t => t.Name).ToList();
                foreach (var data in dataCountry)
                {
                    wsCountry.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsCountry.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsCountry.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsCountry.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsCountry.FirstCellUsed();
                lastCell = wsCountry.LastCellUsed();
                range = wsCountry.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsCountry.Columns().AdjustToContents();

                iRow = 2;
                dataState = dataState.OrderBy(t => t.ParentName).ThenBy(t => t.Name).ToList();
                foreach (var data in dataState)
                {
                    wsState.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsState.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsState.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsState.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;
                    wsState.Cell(iRow, 3).SetValue<string>(data.ParentName);
                    wsState.Cell(iRow, 3).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsState.FirstCellUsed();
                lastCell = wsState.LastCellUsed();
                range = wsState.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsState.Columns().AdjustToContents();

                iRow = 2;
                dataCity = dataCity.OrderBy(t => t.ParentName).ThenBy(t => t.Name).ToList();
                foreach (var data in dataCity)
                {
                    wsCity.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsCity.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsCity.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsCity.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;
                    wsCity.Cell(iRow, 3).SetValue<string>(data.ParentName);
                    wsCity.Cell(iRow, 3).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsCity.FirstCellUsed();
                lastCell = wsCity.LastCellUsed();
                range = wsCity.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsCity.Columns().AdjustToContents();

                using (FileStream fs = new FileStream(fileName, FileMode.Create))
                {
                    wb.SaveAs(fs);
                    fs.Flush();
                }
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                response.ErrorMessage = ex.Source + ": " + ex.Message;
                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            response.ValueString = fileName;
            return Json(response);
        }

        public FileResult DownloadFile(string filePath)
        {
            string fileName = Path.GetFileName(filePath);
            byte[] finalResult = System.IO.File.ReadAllBytes(filePath);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            return File(finalResult, "application/xlsx", fileName);
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