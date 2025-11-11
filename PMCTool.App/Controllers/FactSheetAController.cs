using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using PMCTool.App.Attributes;
using PMCTool.App.Helpers;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Enumeration;
using PMCTool.Models.Environment;
using Syncfusion.HtmlConverter;
using Syncfusion.Pdf;

namespace PMCTool.App.Controllers
{
    public class FactSheetAController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment; 
        private readonly IOptions<AppSettingsModel> _appSettings;
        private IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;



        public FactSheetAController(
            IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer,
            IHostingEnvironment hostingEnvironment,
            IHttpContextAccessor httpContextAccessor,
            IConfiguration configuration) : base(appSettings, localizer)
        {
            _appSettings = appSettings;
            _hostingEnvironment = hostingEnvironment;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;

        }
        //[PMCToolAuthentication]
        //[HttpGet]
        //public async Task<IActionResult> Index(Guid? project)
        //{
        //    SetActiveOption("4007");
        //    ProjectTabViewModel p = new ProjectTabViewModel();

        //    try
        //    {
        //        var projectTab = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projecttaba/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
        //        //if (project != null)
        //        //{
        //        //    ViewBag.Projects = projectTab.Where(c => c.Key == project).ToList();
        //        //    var selectProject = projectTab.Where(c => c.Key == project).ToList();
        //        //    p.ProjectID = selectProject[0].Key.Value;
        //        //    p.ProjectName = selectProject[0].Value;
        //        //}
        //        //else
        //        //{

        //            ViewBag.Projects = projectTab.OrderBy(c => c.Value).ToList();
        //            p.ProjectID = null;
        //            p.ProjectName = null;


        //        //}


        //        ViewBag.ProjectSeleted = project;
        //        var urlPath = _configuration.GetValue<string>("AppSettings:UrlLoginPoe");  
        //        var httpClient = new HttpClient(new HttpClientHandler());
        //        var values = new List<KeyValuePair<string, string>>
        //            {
        //            new KeyValuePair<string, string>("Token", "?KX06eTh]th0QD_dqtB="),
        //            };
        //        HttpResponseMessage response = await httpClient.PostAsync(urlPath.ToString(), new FormUrlEncodedContent(values));

        //        var responseString = await response.Content.ReadAsStringAsync();
        //        var result = JsonConvert.DeserializeObject<QsToken>(responseString);
        //        ViewBag.TokenQS = result.id_token;


        //        return View("~/Views/FactSheet/A/Index.cshtml", p);
        //    }
        //    catch (HttpResponseException ex)
        //    {

        //        var apiError = GetApiError(ex.ServiceContent.ToString());
        //        ResponseModel response = new ResponseModel
        //        {
        //            ErrorCode = apiError.ErrorCode,
        //            ErrorMessage = localizer.GetString(apiError.ErrorCode.ToString())
        //        };
        //        return Json(response);
        //    }


           
        //}
        [PMCToolAuthentication]
        [HttpGet]
        public async Task<IActionResult> ProjectDetail(Guid? project)
        {
            ViewBag.ProjectSeleted = project;
            string appToken = Request.Cookies["pmctool-token-app"];
            dynamic modelDetail = new ExpandoObject();

            List<ProjectTabA> pp = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}", new Dictionary<string, string>() { { "Authorization", appToken } });
            modelDetail.Project = pp;
            List<EvidencesLayerSpecifications> Evidences = await restClient.Get<List<EvidencesLayerSpecifications>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}/evidences", new Dictionary<string, string>() { { "Authorization", appToken } });
            modelDetail.Evidences = Evidences;
            List<IncidentsReportA> Incidents = await restClient.Get<List<IncidentsReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}/evidences/incidents", new Dictionary<string, string>() { { "Authorization", appToken } });
            modelDetail.Incidents = Incidents;
            List<ActionPlanReportA> ActionPlan = await restClient.Get<List<ActionPlanReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{project}/actionsplan", new Dictionary<string, string>() { { "Authorization", appToken } });
            modelDetail.ActionPlan = ActionPlan;

            //List<ProjectTabA> pp2 = await restClient.Get<List<ProjectTabA>>(baseUrl, $"api/v1/projects/{project}/evidences", new Dictionary<string, string>() { { "Authorization", appToken } });


            return View("~/Views/FactSheet/A/ProjectDetail.cshtml", modelDetail);
        }
        

        [HttpPost]
        public async Task<IActionResult> getControlPointbyEvidence(Guid? evidence)
        {
            var respuesta = new Dictionary<string, object>();
            dynamic modelProjectTab = new ExpandoObject();
 
            string appToken = Request.Cookies["pmctool-token-app"];
            modelProjectTab.controlPoints = await restClient.Get<List<ControlPoints>>(baseUrl, $"/api/v1/projecttaba/getdetail/{evidence}/evidences/controlpoints", new Dictionary<string, string>() { { "Authorization", appToken } });
  
             
             
            return PartialView("~/Views/FactSheet/A/_PartialControlPoints.cshtml", modelProjectTab);

 
        }
        public async Task<ResponseModel> LoadImage(string chart, string projectID)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };
            var chartImagen = chart.Split(',')[1];
            byte[] bytes = Convert.FromBase64String(chartImagen); 
            String path = Path.Combine(_hostingEnvironment.WebRootPath, @"images/chart/"); //Path 
            try
            {
                //Check if directory exist
                if (!System.IO.Directory.Exists(path))
                {
                    System.IO.Directory.CreateDirectory(path); //Create directory if it doesn't exist
                }

                string imageName = projectID + ".jpg";

                //set the image path
                string imgPath = Path.Combine(path, imageName);

                byte[] imageBytes = Convert.FromBase64String(chartImagen);

                System.IO.File.WriteAllBytes(imgPath, imageBytes);
                response.ErrorCode = 200;
                response.ErrorMessage = "todo ok";
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
            

           

            return response;
        }  

        [HttpPost]
        public async Task<IActionResult> getReportFactSheet(Guid? projectId, string token)
        {
            dynamic modelProjectTab = new ExpandoObject();
            List<ProjectTask> projectTaskFinally = new List<ProjectTask>();
            string stage = null;
            ParticipantUser participantUser = new ParticipantUser();
            string userId = GetTokenValue("UserId");
            if (!string.IsNullOrWhiteSpace(userId))
            {
                participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

            }

            if (!string.IsNullOrEmpty(projectId.ToString()))
            {
                ViewBag.ProjectSeleted = projectId;
                string appToken = Request.Cookies["pmctool-token-app"];
                var tabsheet = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", appToken } });
                foreach (var projectTab in tabsheet)
                {
                    stage = projectTab.Stage;
                }
                 modelProjectTab.tabsheet = tabsheet;
                
                if (!string.IsNullOrEmpty(stage))
                {
                    if (stage == "Preparativos de ejecución" || stage == "Ejecución")
                    {
                        var projectEvidences = await restClient.Get<List<FactSheetA_Evidences>>(baseUrl, $"/api/v1/projecttaba/{projectId}/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        modelProjectTab.ProjectEvidences = projectEvidences;

                        var projectTask = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projecttaba/gettaskdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        foreach (var data in projectTask)
                        {
                            if (data.WbsCode == "1" || data.WbsCode == "1.1" || data.WbsCode == "1.2" || data.WbsCode == "1.3" || data.WbsCode == "1.4")
                            {
                                 
                                ProjectTask taskAppend = new ProjectTask()
                                {
                                    text =  data.text,
                                    EndDateClient = data.EndDateClient,
                                    status = data.status,
                                    duration = data.duration
                                    
                                };
                                projectTaskFinally.Add(taskAppend);
                            }
                        }
                        ViewBag.ProjectID = projectId;
                        ViewBag.TokenQS = token;
                         
                        modelProjectTab.ProjectTask = projectTaskFinally;
                        modelProjectTab.participantUser = participantUser;

                        return PartialView("~/Views/FactSheet/A/_ParcialIndexQS.cshtml", modelProjectTab);
                    }
                    else
                    {
                       var projectTask = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projecttaba/gettaskdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        foreach (var data in projectTask)
                        {
                            if (data.WbsCode == "1" || data.WbsCode == "1.1" || data.WbsCode == "1.2" || data.WbsCode == "1.3" || data.WbsCode == "1.4")
                            {
                                ProjectTask taskAppend = new ProjectTask()
                                {
                                    text = data.text,
                                    start_date = data.start_date,
                                    duration = data.duration,
                                    status = data.status
                                };
                                projectTaskFinally.Add(taskAppend);
                            }
                        }

                        ViewBag.ProjectID = projectId;
                        modelProjectTab.ProjectTask = projectTaskFinally;

                        return PartialView("~/Views/FactSheet/A/_ParcialIndexD.cshtml", modelProjectTab);
                    }
                }
            }
            modelProjectTab.ProjectTask = projectTaskFinally;
            return PartialView("~/Views/FactSheet/A/_ParcialIndex.cshtml", modelProjectTab);
        }
        public IActionResult printReportFactSheetA(ProjectModelReport data)
        {
            string url = "/FactSheetA/printViewReportFactSheetA?model=";
            string requestParametersModel = JsonConvert.SerializeObject(data);

            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            });
        }
        public IActionResult printReportFactSheetADetail(ProjectModelReport data)
        {
            string url = "/FactSheetA/printViewReportFactSheetADetail?model=";
            string requestParametersModel = JsonConvert.SerializeObject(data);

            return Json(ExportToPDF(requestParametersModel, url, _hostingEnvironment), new JsonSerializerOptions
            {
                WriteIndented = true,
            });
        }
        public async Task<IActionResult> printViewReportFactSheetADetail(string model)
        {
            // xxx
            //List<ModelFilters> fullStates = new List<ModelFilters>();
            var modelo = model.Split('|')[0];
            var appToken = model.Split('|')[1];

            ProjectModelReport dataModel = JsonConvert.DeserializeObject<ProjectModelReport>(modelo);
            dynamic modelProjectTab = new ExpandoObject();

            try
            {
                ViewBag.ProjectSeleted = dataModel.project; 
                dynamic modelDetail = new ExpandoObject();

                List<ProjectTabA> pp = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}", new Dictionary<string, string>() { { "Authorization", appToken } });
                modelDetail.Project = pp;
                List<EvidencesLayerSpecifications> Evidences = await restClient.Get<List<EvidencesLayerSpecifications>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}/evidences", new Dictionary<string, string>() { { "Authorization", appToken } });
                modelDetail.Evidences = Evidences;
                List<IncidentsReportA> Incidents = await restClient.Get<List<IncidentsReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}/evidences/incidents", new Dictionary<string, string>() { { "Authorization", appToken } });
                modelDetail.Incidents = Incidents;
                List<ActionPlanReportA> ActionPlan = await restClient.Get<List<ActionPlanReportA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{dataModel.project}/actionsplan", new Dictionary<string, string>() { { "Authorization", appToken } });
                modelDetail.ActionPlan = ActionPlan;


                //puntos de control
                //var e = "3b22ab5e-1c2b-4d71-92b5-0cea81e961b4,422d8ae0-bf0d-4d8c-9063-a3e6b44df251";
                //var evidences = e.Split(',');
                //var evidences = dataModel.evidences.Split(',');
                List<ControlPoints> controlPointAll = new List<ControlPoints>();
                foreach (var evidence in Evidences)
                {
                    List<ControlPoints> controlPointsDb = await restClient.Get<List<ControlPoints>>(baseUrl, $"/api/v1/projecttaba/getdetail/{evidence.ProjectEvidenceID}/evidences/controlpoints", new Dictionary<string, string>() { { "Authorization", appToken } });
                    foreach (var item in controlPointsDb)
                    {
                        ControlPoints cp = new ControlPoints();
                        cp.ProjectEvidenceID = item.ProjectEvidenceID;
                        cp.Description = item.Description;
                        cp.Status = item.Status;
                        cp.PlannedEndDate = item.PlannedEndDate;
                        cp.Comments = item.Comments;
                        controlPointAll.Add(cp);

                    }

                }
                modelDetail.ControlPoints = controlPointAll;


                return View("~/Views/FactSheet/A/ProjectDetailReport.cshtml", modelDetail);



            }
            catch (HttpResponseException ex)
            {
                return Json(new { hasError = true, message = ex.Message });

            }
            catch (Exception ex)
            {
                return Json(new { hasError = true, message = ex.Message });
            }
        }
        public async Task<IActionResult> printViewReportFactSheetA(string model)
        {
            //List<ModelFilters> fullStates = new List<ModelFilters>();
            var modelo = model.Split('|')[0];
            var token = model.Split('|')[1];

            ProjectModelReport dataModel = JsonConvert.DeserializeObject<ProjectModelReport>(modelo);
            dynamic modelProjectTab = new ExpandoObject();
            List<ProjectTask> projectTaskFinally = new List<ProjectTask>();
            string stage = null;
            string projectId = dataModel.project;
            ParticipantUser participantUser = new ParticipantUser();
            string userId = GetTokenValue("UserId");
            try
            {
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", token } });

                }

                if (!string.IsNullOrEmpty(projectId.ToString()))
                {
                    ViewBag.ProjectSeleted = projectId;
                    var tabsheet = await restClient.Get<List<ProjectTabA>>(baseUrl, $"/api/v1/projecttaba/getdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", token } });
                    foreach (var projectTab in tabsheet)
                    {
                        stage = projectTab.Stage;
                    }
                    modelProjectTab.tabsheet = tabsheet;

                    if (!string.IsNullOrEmpty(stage))
                    {
                        if (stage == "Preparativos de ejecución" || stage == "Ejecución")
                        {
                            var projectEvidences = await restClient.Get<List<FactSheetA_Evidences>>(baseUrl, $"/api/v1/projecttaba/{projectId}/evidences", new Dictionary<string, string>() { { "Authorization", token } });
                            modelProjectTab.ProjectEvidences = projectEvidences;

                            var projectTask = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projecttaba/gettaskdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", token } });
                            foreach (var data in projectTask)
                            {
                                if (data.WbsCode == "1.5.2.1" || data.WbsCode == "1.5.2.3" || data.WbsCode == "1.5.2.4" || data.WbsCode == "1.5.2.5")
                                {

                                    ProjectTask taskAppend = new ProjectTask()
                                    {
                                        text = data.text == "Convocatoria / Oficio de adjudicación" ? "Convocatoria" : data.text,
                                        EndDateClient = data.EndDateClient,
                                        status = data.status
                                    };
                                    projectTaskFinally.Add(taskAppend);
                                }
                            }
                            ViewBag.ProjectID = projectId;
                            modelProjectTab.ProjectTask = projectTaskFinally;
                            modelProjectTab.participantUser = participantUser;

                            return View("~/Views/FactSheet/A/_ParcialIndexReportA.cshtml", modelProjectTab);
                        }
                        else
                        {
                            var projectTask = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projecttaba/gettaskdetail/{projectId}", new Dictionary<string, string>() { { "Authorization", token } });
                            foreach (var data in projectTask)
                            {
                                if (data.WbsCode == "1.1" || data.WbsCode == "1.2" || data.WbsCode == "1.3" || data.WbsCode == "1.4")
                                {
                                    ProjectTask taskAppend = new ProjectTask()
                                    {
                                        text = data.text,
                                        start_date = data.start_date,
                                        duration = data.duration,
                                        status = data.status
                                    };
                                    projectTaskFinally.Add(taskAppend);
                                }
                            }

                            ViewBag.ProjectID = projectId;
                            modelProjectTab.ProjectTask = projectTaskFinally;

                            return View("~/Views/FactSheet/A/_ParcialIndexReport.cshtml", modelProjectTab);
                        }
                    }
                }
                modelProjectTab.ProjectTask = projectTaskFinally;
                return View("~/Views/FactSheet/A/_ParcialIndexReport.cshtml", modelProjectTab);
            }
            catch (HttpResponseException ex)
            {
                return Json(new { hasError = true, message = ex.Message });

            }
            catch (Exception ex)
            {
                return Json(new { hasError = true, message = ex.Message });
            }
        }
        [HttpPatch]
        public async Task<JsonResult> UploadFileA(FactSheetA Request)
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

                if (data != null && Request.ProjectID != null)
                {
                    if (Request.Image != null)
                    {
                        
                        string FileName = Request.Type.ToString() + "-" + Request.ProjectID.ToString().Replace("-", "") + Path.GetExtension(Request.Image.FileName);
                        string PathRelativeImagen = "/client/sct/factsheeta/" + FileName;
                        string Pathfilename = Path.Combine(_hostingEnvironment.WebRootPath, @"client/sct/factsheeta/", FileName);
                        //Check if directory exist
                        if (!System.IO.Directory.Exists(Path.Combine(_hostingEnvironment.WebRootPath, @"client/sct/factsheeta/")))
                        {
                            System.IO.Directory.CreateDirectory(Path.Combine(_hostingEnvironment.WebRootPath, @"client/sct/factsheeta/")); //Create directory if it doesn't exist
                        }
                        using (FileStream DestinationStream = new FileStream(Pathfilename, FileMode.Create))
                        {
                            await Request.Image.CopyToAsync(DestinationStream);
                        }
                        //Guardar en DB
                        data.Image = @"client/sct/factsheeta/" + FileName;
                        //gurdamos en la bse de datos
                        bool statusApi = await restClient.Get<bool>(baseUrl, $"/api/v1/FactSheets/upload/imagen/" + Request.ProjectID + "?pathFile=" + data.Image + "&type=" + Request.Type, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        Random rnd = new Random();
                        response.IsSuccess = statusApi;
                        response.ValueString = PathRelativeImagen+"?v="+ rnd.Next(10000).ToString();
                        response.ValueString1 = Request.Type;
                        response.SuccessMessage = "Guardado correctamente";
                    }
                    else
                    {
                        response.IsSuccess = false;
                        response.SuccessMessage = "Error en los datos";
                    }

                }
                else {
                    response.IsSuccess = false;
                    response.SuccessMessage = "Error en los datos";
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
        public class ProjectModelReport
        {
            public string project { get; set; } 
            public string evidences { get; set; } 
        } 
    }
    
}
