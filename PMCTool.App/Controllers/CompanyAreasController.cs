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
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class CompanyAreasController : BaseController
    {
        private string _error;

        public CompanyAreasController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {

        }

        [PMCToolAuthorize(ObjectCode = "3104")]
        [HttpGet]
        public async Task<IActionResult> Index()
        {

            //List<SelectionListItem> companies = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            //List<SelectionListItem> companyAreas = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companyAreas/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            //List<SelectionListItem> responsibles = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

            //ViewBag.Companies = companies;
            //ViewBag.CompanyAreas = companyAreas;
            //ViewBag.Responsibles = responsibles;

            SetActiveOption("3104");
            ViewBag.Title = localizer["ViewTitleCompanyArea"];
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> GetCompanyAreas()
        {
            List<CompanyArea> data = new List<CompanyArea>();
            try
            {
                data = await restClient.Get<List<CompanyArea>>(baseUrl, $"/api/v1/companyAreas", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                List<SelectionListItem> users = new List<SelectionListItem>();
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
        public async Task<JsonResult> GetCompaniesSelectionList()
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
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
        public async Task<JsonResult> GetCompanyAreasSelectionList(Guid companyId, Guid? companyAreaId)
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/{companyId}/areas/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
                if (companyAreaId != null && companyAreaId != Guid.Empty)
                {
                    data = data.Where(q => q.Key != companyAreaId).ToList();
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

        [HttpGet]
        public async Task<JsonResult> GetResponsiblesSelectionList(Guid? areaId)
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                if(areaId != null && areaId != Guid.Empty)
                    data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companyAreas/{areaId}/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                data = SelectionListHelper.AddNullOption(data, localizer["SelectListNullItem"]);
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
        public async Task<JsonResult> CreateCompanyArea(CompanyArea data)
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
                var result = await restClient.Post<CompanyArea, CompanyArea>(baseUrl, $"/api/v1/companyAreas", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateCompanyArea(CompanyArea data)
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
                var result = await restClient.Put<OkObjectResult, CompanyArea>(baseUrl, $"/api/v1/companyAreas/" + data.AreaID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteCompanyArea(CompanyArea data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/companyAreas/{data.AreaID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetCompanyAreaByCode(string code)
        {
            ResponseModel response = new ResponseModel() { IsSuccess = true, ValueBoolean = false };

            if (string.IsNullOrWhiteSpace(code))
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["User"]);
                return Json(response);
            }

            try
            {
                var data = await restClient.Get<CompanyArea>(baseUrl, $"/api/v1/companyAreas/code/{code}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.SuccessMessage = localizer.GetString("CodeExist");
                if (data != null)
                    response.ValueBoolean = true;
            }
            catch (HttpResponseException ex)
            {
                if (ex.ServiceResponse.StatusCode != System.Net.HttpStatusCode.NotFound)
                {
                    response.IsSuccess = false;
                    var apiError = GetApiError(ex.ServiceContent.ToString());
                    response.ErrorCode = apiError.ErrorCode;
                    response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
                }
            }
            catch (Exception ex)
            {
                response.ValueBoolean = false;
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
                                                       { "BulkLoad", "companyareas" } ,
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

        private bool ValidateData(CompanyArea data, bool isNew)
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

            if (data.Name.Length > 200)
            {
                _error = string.Format(localizer.GetString("4011"), localizer["Name"], "150");
                return false;
            }

            if (!string.IsNullOrWhiteSpace(data.Description))
            {
                if (data.Description.Length > 500)
                {
                    _error = string.Format(localizer.GetString("4011"), localizer["Description"], "500");
                    return false;
                }
            }

            if(data.CompanyID == null || data.CompanyID == Guid.Empty)
            {
                _error = string.Format(localizer.GetString("4012"), localizer["Company"]);
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
            string fileName = Directory.GetCurrentDirectory() + @"/Temp/" + localizer.GetString("Catalogs") + "_" + localizer.GetString("WorkAreas").ToString().Replace(" ", "_").Replace("Á","A") + "_" + DateTime.Now.ToString("yyyyMMddHHmmsss") + ".xlsx";

            try
            {
                var dataResponsibles = await restClient.Get<List<Participant>>(baseUrl, $"/api/v1/participants", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataCompany = await restClient.Get<List<CompanyArea>>(baseUrl, $"/api/v1/Companies", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var dataCompanyAreas = await restClient.Get<List<CompanyArea>>(baseUrl, $"/api/v1/CompanyAreas", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var wsResponsibles = wb.Worksheets.Add(localizer.GetString("Responsible"));
                var wsCompany = wb.Worksheets.Add(localizer.GetString("Company"));
                var wsCompanyAreas = wb.Worksheets.Add(localizer.GetString("Area"));
                
                wsResponsibles.Cell(1, 1).Value = localizer.GetString("Code");
                wsResponsibles.Cell(1, 2).Value = localizer.GetString("Name");

                wsCompany.Cell(1, 1).Value = localizer.GetString("Code");
                wsCompany.Cell(1, 2).Value = localizer.GetString("Name");

                wsCompanyAreas.Cell(1, 1).Value = localizer.GetString("Code");
                wsCompanyAreas.Cell(1, 2).Value = localizer.GetString("Name");
                wsCompanyAreas.Cell(1, 3).Value = localizer.GetString("Company");

                int iRow = 2;
                dataResponsibles = dataResponsibles.OrderBy(t => t.Code).ToList();
                foreach (var data in dataResponsibles)
                {
                    wsResponsibles.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsResponsibles.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsResponsibles.Cell(iRow, 2).SetValue<string>(data.Name + " " + data.Lastname + " " + data.Surname);
                    wsResponsibles.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                var firstCell = wsResponsibles.FirstCellUsed();
                var lastCell = wsResponsibles.LastCellUsed();
                var range = wsResponsibles.Range(firstCell.Address, lastCell.Address);
                var table = range.CreateTable();
                wsResponsibles.Columns().AdjustToContents();

                iRow = 2;
                dataCompany = dataCompany.OrderBy(t => t.Code).ToList();
                foreach (var data in dataCompany)
                {
                    wsCompany.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsCompany.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsCompany.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsCompany.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsCompany.FirstCellUsed();
                lastCell = wsCompany.LastCellUsed();
                range = wsCompany.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsCompany.Columns().AdjustToContents();

                iRow = 2;
                dataCompanyAreas = dataCompanyAreas.OrderBy(t => t.Code).ToList();
                foreach (var data in dataCompanyAreas)
                {
                    wsCompanyAreas.Cell(iRow, 1).SetValue<string>(data.Code);
                    wsCompanyAreas.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;
                    wsCompanyAreas.Cell(iRow, 2).SetValue<string>(data.Name);
                    wsCompanyAreas.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;
                    wsCompanyAreas.Cell(iRow, 3).SetValue<string>(data.CompanyName);
                    wsCompanyAreas.Cell(iRow, 3).Style.NumberFormat.NumberFormatId = 0;

                    iRow++;
                }

                firstCell = wsCompanyAreas.FirstCellUsed();
                lastCell = wsCompanyAreas.LastCellUsed();
                range = wsCompanyAreas.Range(firstCell.Address, lastCell.Address);
                table = range.CreateTable();
                wsCompanyAreas.Columns().AdjustToContents();

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
}