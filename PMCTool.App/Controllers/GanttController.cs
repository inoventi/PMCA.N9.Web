using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading;
using System.Threading.Tasks;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
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

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class GanttController : BaseController
    {
        private string _error;

        public GanttController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        public async Task<IActionResult> Index(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects", "Execution");

            var projectParticipant = await restClient.Get<ProjectParticipant>(baseUrl, $"/api/v1/projectparticipant/project/{id}/participant", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            if (projectParticipant == null)
                return RedirectToAction("Projects", "Execution");

            var pp = await GetProjectParticipant(id.Value); 

            if (pp == null || pp.Role == null || pp.Role == 3 || pp.Role == 1)
                return RedirectToAction("Projects", "Execution");

            var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            if (project == null)
                return RedirectToAction("Projects", "Execution");

            List<SelectionListItem> templates = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/templates/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
           
            Participant participant = await GetParticipant();


            ViewBag.ProjectEditable = project.ProjectEditable;
            ViewBag.ProjectName = project.Name;
            ViewBag.Role = pp.Role;
            ViewBag.ParticipantID = participant.ParticipantID; ; 
            ViewBag.Templates = templates;
            ViewBag.GanttID = id;
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Gantt"];
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> Get(Guid id)
        {
            ProjectGantt data = new ProjectGantt();
            try
            {
                //data = await restClient.Get<ProjectGantt>(baseUrl, $"/api/v1/gantt/" + id.ToString(), new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = await restClient.Get<ProjectGantt>(baseUrl, $"/api/v1/projects/{id.ToString()}/gantt", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetWithCancel(Guid id)
        {
            ProjectGantt data = new ProjectGantt();
            try
            {
                data = await restClient.Get<ProjectGantt>(baseUrl, $"/api/v1/projects/{id.ToString()}/gantt/cancel", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetTaskById(Guid projectId, Guid taskId)
        {
            ProjectTask data = new ProjectTask();
            try
            {
                data = await restClient.Get<ProjectTask>(baseUrl, $"api/v1/projects/{projectId}/tasks/{taskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetActivityCompleteInfoById(Guid projectId, Guid activityId)
        {
            ProjectTask data = new ProjectTask();
            try
            {
                data = await restClient.Get<ProjectTask>(baseUrl, $"api/v1/projects/{projectId}/activities/{activityId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetMilestoneCompleteInfoById(Guid projectId, Guid milestoneId)
        {
            ProjectTask data = new ProjectTask();
            try
            {
                data = await restClient.Get<ProjectTask>(baseUrl, $"api/v1/projects/{projectId}/milestones/{milestoneId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> CreateTask(ProjectTaskLocal data)
        {
            ResponseModel response = new ResponseModel() { IsSuccess = false };

            if (!ValidateData(data))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                ProjectTask result = await restClient.Post<ProjectTask, ProjectTaskLocal>(baseUrl, $"/api/v1/projects/{data.ProjectId.ToString()}/tasks", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> UpdateTask(ProjectTaskLocal data)
        {
            ResponseModel response = new ResponseModel() { IsSuccess = false };
             if (!ValidateData(data))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                var result = await restClient.Put<ProjectTask, ProjectTaskLocal>(baseUrl, $"/api/v1/projects/{data.ProjectId.ToString()}/tasks/{data.id.ToString()}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
                response.SuccessMessage = localizer.GetString("SuccessMsg");
                AppLogger.LogToFile("Success :" + response.ValueString+ " | response:" + response.ToString()+" | "+data.ToString(), "GanttController", true);

            }
            catch (HttpResponseException ex)
            {
                var apiError = GetApiError(ex.ServiceContent.ToString());
                response.ErrorCode = apiError.ErrorCode;
                response.ErrorMessage = localizer.GetString(response.ErrorCode.ToString());
                AppLogger.LogToFile("ErrorApi :" + ex.Source + " | Mesage: " + ex.Message + " | trace:" + ex.StackTrace+" | ErrorCode:"+ response.ErrorCode + " | ErrorMessage: " + response.ErrorMessage + " | apiError: "+ apiError.ToString()+" | data: " + data.ToString(), "GanttController", true);

            }
            catch (Exception ex)
            {

                response.ErrorMessage = ex.Source + ": " + ex.Message;
                AppLogger.LogToFile("ErrorException:" + response.ErrorMessage+" | trace:"+ex.StackTrace, "GanttController" + " | " + data.ToString(), true);

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            return Json(response);
        }

        [HttpPost]
        public async Task<JsonResult> DeleteTask(ProjectTask data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectId.ToString()}/tasks/{data.id.ToString()}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
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
        public async Task<JsonResult> CreateLink(ProjectLink data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                //ProjectLink result = await restClient.Post<ProjectLink, ProjectLink>(baseUrl, $"/api/v1/gantt/link", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ProjectLink result = await restClient.Post<ProjectLink, ProjectLink>(baseUrl, $"/api/v1/projects/{data.ProjectId.ToString()}/links", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> UpdateLink(ProjectLink data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                var result = await restClient.Put<ProjectLink, ProjectLink>(baseUrl, $"/api/v1/projects/{data.ProjectId.ToString()}/links/{data.id.ToString()}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> DeleteLink(ProjectLink data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //if (!ValidateData(data))
            //{
            //    response.ErrorMessage = _error;
            //    return Json(response);
            //}

            try
            {
                //var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/gantt/link/" + data.id.ToString(), "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectId.ToString()}/links/{data.id.ToString()}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetGanttConfig(Guid id)
        {
            ProjectGanttConfig data = new ProjectGanttConfig();
            //ProjectGantt data = new ProjectGantt();
            try
            {
                //data = await restClient.Get<ProjectGanttConfig>(baseUrl, $"/api/v1/gantt/" + id.ToString() + "/config", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = await restClient.Get<ProjectGanttConfig>(baseUrl, $"/api/v1/projects/{id.ToString()}/gantt/config", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }

            return Json(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetGanttTemplates()
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/templates/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
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
        public async Task<JsonResult> GetGanttTemplate(ProjectTemplate data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                ProjectTemplate result = await restClient.Post<ProjectTemplate, ProjectTemplate>(baseUrl, $"/api/v1/gantt/template", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CancelTask(ProjectTask data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Put<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectId.ToString()}/tasks/{data.id.ToString()}/cancel", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> ArchiveTask(ProjectTask data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                //var result = await restClient.Patch<ProjectTask, ProjectTask>(baseUrl, $"/api/v1/gantt/task/" + data.id.ToString() + "/cancel", null, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var result = await restClient.Patch<ProjectTask, ProjectTask>(baseUrl, $"/api/v1/projects/{data.ProjectId.ToString()}/activities/{data.id.ToString()}/archive", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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
        public async Task<JsonResult> GetGanttActivities(Guid id)
        {
            List<ProjectTask> data = new List<ProjectTask>();
            try
            {                
                var pp = await GetProjectParticipant(id);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectTask>>(baseUrl, $"api/v1/projects/{id.ToString()}/participants/{pp.ParticipantID}/roles/{pp.Role}/activities", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetGanttMilestones(Guid id)
        {
            List<ProjectTask> data = new List<ProjectTask>();
            try
            {
                var pp = await GetProjectParticipant(id);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectTask>>(baseUrl, $"api/v1/projects/{id.ToString()}/participants/{pp.ParticipantID}/roles/{pp.Role}/milestones", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetParentTaskStatus(Guid projectId, Guid taskId)
        {
            IEnumerable<ProjectParentTaskStatus> data = null;
            try
            {
                data = await restClient.Get<IEnumerable<ProjectParentTaskStatus>>(baseUrl, $"api/v1/projects/{projectId.ToString()}/tasks/{taskId.ToString()}/parent/status", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return Json(data);
        }

        protected async Task<ProjectParticipant> GetProjectParticipant(Guid projectId)
        {

            ProjectParticipant result = null;
            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result = await restClient.Get<ProjectParticipant>(baseUrl, $"/api/v1/projects/{projectId}/participants/{participantUser.ParticipantID.ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
            }
            catch (Exception ex)
            {

            }

            return result;
        }

        [HttpPatch]
        public async Task<JsonResult> UpdateBatchWbs(Guid projectId, List<BatchWbsUpdate> data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            //Guid projectId = data[0].ProjectId;

            try
            {
                //ProjectTask result = await restClient.Post<ProjectTask, ProjectTask>(baseUrl, $"/api/v1/gantt/task", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                Boolean result = await restClient.Post<Boolean, List<BatchWbsUpdate>>(baseUrl, $"/api/v1/projects/{projectId.ToString()}/tasks/wbs", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.ValueString = JsonConvert.SerializeObject(result);
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

        private bool ValidateData(ProjectTaskLocal data) 
        {
            _error = "";
            bool result = false;

            if (data.progress < 0 || data.progress > 1)
                _error = localizer.GetString("4028");

            if (string.IsNullOrEmpty(_error))
                result = true;

            return result;
        }

        [HttpGet]
        public async Task<JsonResult> DownloadGantt(Guid projectId)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            var wb = new XLWorkbook();

            try
            {

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var gantt = await restClient.Get<ProjectGantt>(baseUrl, $"/api/v1/projects/{projectId}/gantt/tasks", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                string fileName = Directory.GetCurrentDirectory() + @"/Temp/" + localizer.GetString("Gantt") + "_" + Guid.NewGuid().ToString() + ".xlsx";

                var wsResponsibles = wb.Worksheets.Add(localizer.GetString("Gantt"));

                wsResponsibles.Cell(1, 1).Value = "WBS";
                wsResponsibles.Cell(1, 2).Value = localizer.GetString("Activity");
                wsResponsibles.Cell(1, 3).Value = localizer.GetString("PlannedStartDate");
                wsResponsibles.Cell(1, 4).Value = localizer.GetString("PlannedEndDate");
                wsResponsibles.Cell(1, 5).Value = localizer.GetString("Duration");
                wsResponsibles.Cell(1, 6).Value = localizer.GetString("Responsable");
                wsResponsibles.Cell(1, 7).Value = localizer.GetString("PlannedProgress");
                wsResponsibles.Cell(1, 8).Value = localizer.GetString("RealProgress");

                int iRow = 2;
                gantt.data = gantt.data.OrderBy(t => t.sortorder).ToList();
                foreach (var data in gantt.data)
                {
                    var endDate = data.type == "task" ? data.EndDateClient.GetValueOrDefault() : DateTime.Parse(data.end_date);

                    wsResponsibles.Cell(iRow, 1).SetValue<string>(data.WbsCode);
                    wsResponsibles.Cell(iRow, 1).Style.NumberFormat.NumberFormatId = 0;  
                    wsResponsibles.Cell(iRow, 2).SetValue<string>(data.text);
                    wsResponsibles.Cell(iRow, 2).Style.NumberFormat.NumberFormatId = 0;
                    wsResponsibles.Cell(iRow, 3).SetValue<DateTime>(DateTime.Parse(data.start_date));
                    wsResponsibles.Cell(iRow, 3).Style.NumberFormat.NumberFormatId = 14;
                    wsResponsibles.Cell(iRow, 4).SetValue<DateTime>(endDate);
                    wsResponsibles.Cell(iRow, 4).Style.NumberFormat.NumberFormatId = 14;
                    wsResponsibles.Cell(iRow, 5).SetValue<int>(data.duration == null ? 0 : data.duration.Value);
                    wsResponsibles.Cell(iRow, 5).Style.NumberFormat.NumberFormatId = 0;
                    wsResponsibles.Cell(iRow, 6).SetValue<string>(string.IsNullOrWhiteSpace(data.owner_name) ? localizer.GetString("SelectListNotAssignedItem") : data.owner_name);
                    wsResponsibles.Cell(iRow, 6).Style.NumberFormat.NumberFormatId = 0;
                    wsResponsibles.Cell(iRow, 7).SetValue<double>(data.PlannedProgress);
                    wsResponsibles.Cell(iRow, 7).Style.NumberFormat.NumberFormatId = 10; 
                    wsResponsibles.Cell(iRow, 8).SetValue<double>(data.progress);
                    wsResponsibles.Cell(iRow, 8).Style.NumberFormat.NumberFormatId = 10;

                    iRow++;
                }

                var firstCell = wsResponsibles.FirstCellUsed();
                var lastCell = wsResponsibles.LastCellUsed();
                var range = wsResponsibles.Range(firstCell.Address, lastCell.Address);
                var table = range.CreateTable();
                wsResponsibles.Columns().AdjustToContents();

                using (FileStream fs = new FileStream(fileName, FileMode.Create))
                {
                    wb.SaveAs(fs);
                    fs.Flush();
                }
                response.IsSuccess = true;
                response.ValueString = fileName;
                response.ValueString1 = project.Name;

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

        public FileResult DownloadFile(string filePath, string projectName)
        {
            string fileName = projectName + Path.GetExtension(filePath);
            byte[] finalResult = System.IO.File.ReadAllBytes(filePath);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            return File(finalResult, "application/xlsx", fileName);
        }

        private async Task<Participant> GetParticipant()
        {

            Participant result = new Participant();
            try
            {
                string userId = GetTokenValue("UserId");
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var participantUser = await restClient.Get<ParticipantUser>(baseUrl, $"/api/v1/participantusers/user/{userId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result = await restClient.Get<Participant>(baseUrl, $"/api/v1/participants/{participantUser.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    result.ParticipantUser.Image = participantUser.Image;
                }
            }
            catch (Exception ex)
            {

            }

            return result;
        }
    }

    public class ProjectTaskLocal
    {
        public double RealCost { get; set; }
        public string type { get; set; }
        public bool readOnly { get; set; }
        public bool editable { get; set; }
        public Guid CreatedBy { get; set; }
        public Guid UpdatedBy { get; set; }
        public double Weight { get; set; }
        public bool ManualWeight { get; set; }
        public double PlannedProgress { get; set; }
        public string Comment { get; set; }
        public string owner_name { get; set; }
        public string Comments { get; set; }
        public bool WithImpact { get; set; }
        public int DependenciesCount { get; set; }
        public int EvidencesCount { get; set; }
        public bool ProgressEditable { get; set; }
        public Guid? ChangeControlAuthorizer { get; set; }
        public string ChangeControlComments { get; set; }
        public string owner_photo { get; set; }
        public bool ChangeControlManualInput { get; set; }
        public double RealProgress { get; set; }
        public string planned_start { get; set; }
        public Guid id { get; set; }
        public Guid? parent { get; set; }
        public Guid? owner_id { get; set; }
        public IEnumerable<ProjectTaskParticipant> resources { get; set; }
        public string text { get; set; }
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        public int? duration { get; set; }
        public string planned_end { get; set; }
        public double progress { get; set; }
        public string target { get; set; }
        public bool open { get; set; }
        public short sortorder { get; set; }
        public Guid ProjectId { get; set; }
        public string WbsCode { get; set; }
        public short status { get; set; }
        public string RealStartDate { get; set; }
        public string RealEndDate { get; set; }
        public double cost { get; set; }
        public DateTime? EndDateClient { get; set; }
    }

}
