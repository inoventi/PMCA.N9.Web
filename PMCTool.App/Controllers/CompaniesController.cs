using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Attributes;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;
using ClosedXML.Excel;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class CompaniesController : BaseController
    {
        private readonly IOptions<AppSettingsModel> _appSettings;
        private string _error;
        private readonly IHostingEnvironment _he;

        public CompaniesController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer, IHostingEnvironment e) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
            _he = e;
        }

        [PMCToolAuthorize(ObjectCode = "3103")]
        [HttpGet]
        public IActionResult Index()
        {
            SetActiveOption("3103");
            ViewBag.Title = localizer["ViewTitleCompany"];

            return View();
        }

        [PMCToolAuthorize(ObjectCode = "3103")]
        [HttpGet]
        public async Task<IActionResult> New()
        {
            
            ViewBag.Title = localizer["ViewTitleCompany"];

            List<SelectionListItem> countries = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/countries/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> states = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);
            List<SelectionListItem> cities = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);

            ViewBag.Countries = countries;
            ViewBag.States = states;
            ViewBag.Cities = cities;
            ViewBag.Mode = "New";
            
            SetActiveOption("3103");
            return View("Editor", new CompanyImage() {IsActive = true});
        }

        [PMCToolAuthorize(ObjectCode = "3103")]
        [HttpGet]
        public async Task<IActionResult> Editor(Company data)
        {
            List<SelectionListItem> countries = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/countries/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

            List<SelectionListItem> states = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);
            if (data.Address.CountryID != null)
                states = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/states/selectionList/{data.Address.CountryID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

            List<SelectionListItem> cities = SelectionListHelper.AddNullOption(new List<SelectionListItem>(), localizer["SelectListNullItem"]);
            if (data.Address.StateID != null)
                cities = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/locations/cities/selectionList/{data.Address.StateID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            
            ViewBag.Countries = countries;
            ViewBag.States = states;
            ViewBag.Cities = cities;
            ViewBag.Mode = "Edit";

            SetActiveOption("3103");
            ViewBag.Title = localizer["ViewTitleCompany"];
            return View(data);
        }

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
        public async Task<JsonResult> GetCompanies()
        {
            List<Company> data = new List<Company>();
            try
            {
                data = await restClient.Get<List<Company>>(baseUrl, $"/api/v1/companies", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                List<SelectionListItem> countries = new List<SelectionListItem>();
                List<SelectionListItem> states = new List<SelectionListItem>();
                List<SelectionListItem> cities = new List<SelectionListItem>();
                List<SelectionListItem> users = new List<SelectionListItem>();

                data = data.OrderBy(o => o.Name).ToList();

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
        public async Task<JsonResult> CreateCompany(Company data)
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
                Company result = await restClient.Post<Company, Company>(baseUrl, $"/api/v1/companies", (Company)data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateCompany(Company data)
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
                Company result = await restClient.Put<Company, Company>(baseUrl, $"/api/v1/companies/" + data.CompanyID.ToString(), (Company)data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteCompany(Company data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/companies/{data.CompanyID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UploadFile(CompanyImage data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.Logo = _appSettings.Value.ImageLogicalPath + @"/avatar/companies/" + data.CompanyID.ToString().Replace("-", "") + Path.GetExtension(data.Image.FileName);
                Company result = await restClient.Put<Company, Company>(baseUrl, $"/api/v1/companies/file/" + data.CompanyID.ToString(), (Company)data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (data.Image != null)
                {
                    string filename = Path.Combine(_he.WebRootPath, @"images/avatar/companies/", data.CompanyID.ToString().Replace("-", "") + Path.GetExtension(data.Image.FileName));
                    using (FileStream DestinationStream = new FileStream(filename, FileMode.Create))
                    {
                        await data.Image.CopyToAsync(DestinationStream);
                    }
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

        [HttpPost]
        public async Task<JsonResult> DeleteFile(Company company)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<Company>(baseUrl, $"/api/v1/companies/{company.CompanyID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var reference = Path.Combine(_he.WebRootPath, @"images/avatar/companies", Path.GetFileName(data.Logo));
                data.Logo = null;
                
                Company result = await restClient.Put<Company, Company>(baseUrl, $"/api/v1/companies/file/" + data.CompanyID.ToString(), (Company)data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (System.IO.File.Exists(reference))
                {
                    System.IO.File.Delete(reference);
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

        [HttpGet]
        public async Task<JsonResult> GetCompanyByCode(string code)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ValueBoolean = false,
            };

            if (string.IsNullOrWhiteSpace(code))
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["User"]);
                return Json(response);
            }

            try
            {
                var data = await restClient.Get<Company>(baseUrl, $"/api/v1/companies/code/{code}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("CodeExist");
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
                                                       { "BulkLoad", "companies" } ,
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

        private bool ValidateData(Company data, bool isNew)
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
                _error = localizer.GetString("4010");
                return false;
            }

            if (data.Name.Length > 150)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Name"], "150");
                return false;
            }

            if (data.Address.Street != null && data.Address.Street.Length > 450)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Street"], "450");
                return false;
            }

            if (data.Address.ExtNum != null && data.Address.ExtNum.Length > 150)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["ExtNum"], "150");
                return false;
            }

            if (data.Address.IntNum != null && data.Address.IntNum.Length > 150)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["IntNum"], "150");
                return false;
            }

            if (data.Address.District != null && data.Address.District.Length > 450)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["District"], "450");
                return false;
            }

            if (data.Address.ZipCode != null && data.Address.ZipCode.Length > 150)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["ZipCode"], "150");
                return false;
            }

            return true;
        }

        [HttpGet]
        public async Task<JsonResult> DownloadCatalog()
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            var wb = new XLWorkbook();
            string fileName = Directory.GetCurrentDirectory() + @"/Temp/" + localizer.GetString("Catalogs") + "_" + localizer.GetString("Company") + "_" + DateTime.Now.ToString("yyyyMMddHHmmsss") + ".xlsx";

            try
            {
                var dataCountry = await restClient.Get<List<Location>>(baseUrl, $"/api/v1/locations/type/{1}/language/{GetTokenValue("Lang")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataState = await restClient.Get<List<Location>>(baseUrl, $"/api/v1/locations/type/{2}/language/{GetTokenValue("Lang")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataCity = await restClient.Get<List<Location>>(baseUrl, $"/api/v1/locations/type/{3}/language/{GetTokenValue("Lang")}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var wsCountry = wb.Worksheets.Add(localizer.GetString("Country"));
                var wsState = wb.Worksheets.Add(localizer.GetString("State"));
                var wsCity = wb.Worksheets.Add(localizer.GetString("City"));

                wsCountry.Cell(1, 1).Value = localizer.GetString("Code");
                wsCountry.Cell(1, 2).Value = localizer.GetString("Name");

                wsState.Cell(1, 1).Value = localizer.GetString("Code");
                wsState.Cell(1, 2).Value = localizer.GetString("Name");
                wsState.Cell(1, 3).Value = localizer.GetString("Country");

                wsCity.Cell(1, 1).Value = localizer.GetString("Code");
                wsCity.Cell(1, 2).Value = localizer.GetString("Name");
                wsCity.Cell(1, 3).Value = localizer.GetString("State");

                int iRow = 2;
                dataCountry = dataCountry.OrderBy(t => t.Name).ToList();
                foreach (var data in dataCountry)
                {
                    wsCountry.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsCountry.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsCountry.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsCountry.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                var firstCell = wsCountry.FirstCellUsed();
                var lastCell = wsCountry.LastCellUsed();
                var range = wsCountry.Range(firstCell.Address, lastCell.Address);
                var table = range.CreateTable();
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
    }

    public class CompanyImage : Company
    {
        public IFormFile Image { get; set; }
    }
}