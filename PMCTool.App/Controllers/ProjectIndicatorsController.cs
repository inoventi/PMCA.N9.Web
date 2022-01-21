using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using OfficeOpenXml;
using PMCTool.App.Attributes;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Environment;

namespace PMCTool.App.Controllers
{
    public class ProjectIndicatorsController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        public ProjectIndicatorsController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHostingEnvironment hostingEnvironment) : base(appSettings, localizer)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        [PMCToolAuthentication]
        public async Task<IActionResult> Index()
        {
            List<SelectionListState> states = await restClient.Get<List<SelectionListState>>(baseUrl, $"/api/v1/locations/states/selectionList/A2BED164-F5C9-45E8-BA20-4CD3AC810837", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            ViewBag.States = states;
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> GetDataProjectIndicators(ModelFilters data)
        {
            List<ProjectIndicators> projectIndicatorsData = new List<ProjectIndicators>();
            try
            {
                projectIndicatorsData = await restClient.Get<List<ProjectIndicators>>(baseUrl,
                   $"api/v1/projectIndicators/data?states={data.States}&generaldirection={data.GeneralDirection}&projecttype={data.ProjectType}&stage={data.Stage}&investment={data.Investment}&advertisement={data.Advertisement}",
                   new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                ResponseModel response = new ResponseModel
                {
                    ErrorCode = apiError.ErrorCode,
                    ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
                };
                return Json(apiError);
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

            return Json(projectIndicatorsData);
        }
        public async Task<IActionResult> Indicator(int project)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };
            String path = null;
            if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                path = Path.Combine(_hostingEnvironment.WebRootPath, @"client\sct\projectIndicators\");
            }
            else if (System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                path = Path.Combine(_hostingEnvironment.WebRootPath, @"client/sct/projectIndicators/"); 
            }

            dynamic Model = new ExpandoObject();

            try
            {


                int requesData = project;
                string fileName = "ProjectIndicatorsData.xlsx";
                string pathFile = Path.Combine(path, fileName);
                // get general data indicators 
                List<ProjectIndicators> projectIndicatorsData = new List<ProjectIndicators>();

                projectIndicatorsData = await restClient.Get<List<ProjectIndicators>>(baseUrl,
                   $"api/v1/projectIndicators/data?states=&generaldirection=&projecttype=&stage=&investment=&advertisement=",
                   new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var indicator = projectIndicatorsData.FindAll(p => p.Code == Convert.ToString(requesData)).ToList();
                Model.Indicators = indicator;
                // path to your excel file
                FileInfo fileInfo = new FileInfo(pathFile);

                ExcelPackage package = new ExcelPackage(fileInfo);
                ExcelWorksheet worksheet = package.Workbook.Worksheets.FirstOrDefault();

                // get number of rows and columns in the sheet
                int rows = worksheet.Dimension.Rows; // 20
                int columns = worksheet.Dimension.Columns; // 7

                // loop through the worksheet rows and columns
                List<ProjectIndicatorsDetail> projectIndicators = new List<ProjectIndicatorsDetail>();
                for (int iRow = 2; iRow <= rows; iRow++)
                {
                    double code;
                    if (worksheet.Cells["A" + iRow.ToString()].Value != null)
                    {
                        code = Convert.ToDouble(worksheet.Cells[$"A{iRow}"].Value.ToString().Trim());
                    }
                    else
                    {
                        continue;

                    }
                    if (requesData == code)
                    {
                        string projectName = null;
                        if (worksheet.Cells["B" + iRow.ToString()].Value != null)
                        {
                            projectName = worksheet.Cells[$"B{iRow}"].Value.ToString().Trim();
                        }
                        int month;
                        if (worksheet.Cells["C" + iRow.ToString()].Value != null)
                        {
                            month = Convert.ToInt32(worksheet.Cells[$"C{iRow}"].Value.ToString().Trim());
                        }
                        else
                        {
                            continue;

                        }

                        int anio;
                        if (worksheet.Cells["D" + iRow.ToString()].Value != null)
                        {
                            anio = Convert.ToInt32(worksheet.Cells[$"D{iRow}"].Value.ToString().Trim());
                        }
                        else
                        {
                            continue;

                        }

                        double? ac = null;
                        if (worksheet.Cells["E" + iRow.ToString()].Value != null)
                        {
                            ac = Convert.ToDouble(worksheet.Cells[$"E{iRow}"].Value.ToString().Trim());
                        }

                        double? etc = null;
                        if (worksheet.Cells["F" + iRow.ToString()].Value != null)
                        {
                            etc = Convert.ToDouble(worksheet.Cells[$"F{iRow}"].Value.ToString().Trim());
                        }

                        double? afrp = null;
                        if (worksheet.Cells["G" + iRow.ToString()].Value != null)
                        {
                            afrp = Convert.ToDouble(worksheet.Cells[$"G{iRow}"].Value.ToString().Trim());
                        }
                        double? afrpmc = null;
                        if (worksheet.Cells["H" + iRow.ToString()].Value != null)
                        {
                            afrpmc = Convert.ToDouble(worksheet.Cells[$"H{iRow}"].Value.ToString().Trim());
                        }
                        double? pv = null;
                        if (worksheet.Cells["I" + iRow.ToString()].Value != null)
                        {
                            pv = Convert.ToDouble(worksheet.Cells[$"I{iRow}"].Value.ToString().Trim());
                        }

                        ProjectIndicatorsDetail pIndicator = new ProjectIndicatorsDetail();
                        pIndicator.Code = code;
                        pIndicator.ProjectName = projectName;
                        pIndicator.Month = month;
                        pIndicator.Anio = anio;
                        pIndicator.AC = ac;
                        pIndicator.ETC = etc;
                        pIndicator.AFRP = afrp;
                        pIndicator.AFRPMC = afrpmc;
                        pIndicator.PV = pv;
                        projectIndicators.Add(pIndicator);

                    } // end IF
                } // end FOR

                Model.Chart = projectIndicators;
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }
            return View("~/Views/ProjectIndicators/Indicator.cshtml", Model);
        }
    }
}
