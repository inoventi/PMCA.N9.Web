using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class ProjectsController : BaseController
    {
        private string _error;

        public ProjectsController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        #region PROJECTS MAINTENANCE

        [PMCToolAuthorize(ObjectCode = "3108")]
        [HttpGet]
        public IActionResult Index()
        {
            SetActiveOption("3108");
            ViewBag.Title = localizer["ViewTitleProject"];
            return View();
        }

        [PMCToolAuthorize(ObjectCode = "3108")]
        [HttpGet]
        public async Task<IActionResult> Editor(Guid? id)
        {
            Project m = new Project();
            if (id == null)
            {
                ViewBag.IsNew = true;
            }
            else
            {
                if (id.Value == Guid.Empty)
                    RedirectToAction("Index", "Projects");

                ViewBag.IsNew = false;

                try
                {
                    m = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
                catch (Exception ex)
                {
                    RedirectToAction("Index", "Projects");
                }
            }

            if (m.ManagementType != null)
                m.ManagementTypeName = localizer.GetString("EnumProjectManagementType_" + m.ManagementType).ToString();

            if (m.ChangeManagement != null)
                m.ChangeManagementName = localizer.GetString("EnumProjectChangeManagement_" + m.ChangeManagement).ToString();

            if (m.WeighingManagement != null)
                m.WeighingManagementName = localizer.GetString("EnumProjectWeighingManagement_" + m.WeighingManagement).ToString();

            if (m.CalendarType != null)
                m.CalendarName = localizer.GetString("EnumProjectCalendarType_" + m.CalendarType).ToString();

            if (m.Phase != null)
                m.PhaseName = localizer.GetString("EnumProjectPhase_" + m.Phase).ToString();

            List<SelectionListItem> companies = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> factsheets = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/factsheets/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> sponsor = SelectionListHelper.AddNullOption( await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> leader = SelectionListHelper.AddNullOption( await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> projectManager = SelectionListHelper.AddNullOption( await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

            companies = companies.OrderBy(o => o.Value).ToList();

            ViewBag.Companies = companies;
            ViewBag.FactSheets = factsheets;
            ViewBag.Sponsor = sponsor;
            ViewBag.Leader = leader;
            ViewBag.ProjectManager = projectManager;
            //ViewBag.ProjectType = projectType;

            SetActiveOption("3108");
            ViewBag.Title = localizer["ViewTitleProject"];
            return View(m);
        }

        public async Task<JsonResult> Get()
        {
            var data = new List<Project>();
            try
            {
                data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
                var data = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/code/{code}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                if (data != null)
                {
                    response.ValueBoolean = true;
                    response.ErrorMessage = string.Format(localizer.GetString("4017"), localizer.GetString("Code"));
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
        public async Task<JsonResult> GetById(Guid? id)
        {
            var data = new Project();
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ValueBoolean = true,
            };

            if (id.Value == Guid.Empty)
            {
                response.ErrorMessage = string.Format(localizer.GetString("4012"), localizer["Code"]);
                return Json(response);
            }

            try
            {
                data = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                if (data == null)
                    response.ValueBoolean = false;
                else
                    response.ErrorMessage = string.Format(localizer.GetString("4017"), localizer.GetString("Code"));
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

            return Json(data);
        }

        [HttpPost]
        public async Task<JsonResult> Create(Project data)
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
                data.IsActive = true;
                data.Status = (int)EnumFactory.ProjectStatus.Active;
                data.Type = (int)EnumFactory.ProjectType.Project;
                data.Phase = (int)EnumFactory.ProjectPhase.Planning;
                data.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                data.Progress = 0;

                var result = await restClient.Post<CreatedResult, Project>(baseUrl, $"/api/v1/projects", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> Update(Project data)
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
                var dbProject = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{data.ProjectID}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                data.IsActive = true;
                data.Status = (int)EnumFactory.ProjectStatus.Active;
                data.Type = (int)EnumFactory.ProjectType.Project;
                data.ManagementType = dbProject.ManagementType;
                data.ChangeManagement = dbProject.ChangeManagement;
                data.WeighingManagement = dbProject.WeighingManagement;
                data.CalendarType = dbProject.CalendarType;
                data.Phase = dbProject.Phase;
                data.DelayBasedPlannedProgress = dbProject.DelayBasedPlannedProgress;
                data.CurrencyID = dbProject.CurrencyID;
                data.Notifications = dbProject.Notifications;
                data.MeetingNoteTemplateID = dbProject.MeetingNoteTemplateID;

                var result = await restClient.Put<OkObjectResult, Project>(baseUrl, $"/api/v1/projects/" + data.ProjectID.ToString(), data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpDelete]
        public async Task<JsonResult> Delete(Project data)
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
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        private bool ValidateData(Project data, bool isNew)
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

            return true;
        }

        [HttpGet]
        public async Task<JsonResult> GetParent(int type)
        {
            if (type == (int)EnumFactory.ProjectType.Program)
            {
                return await GetPrograms();
            }
            else if (type == (int)EnumFactory.ProjectType.Portfolio)
            {
                return await GetPortfolios();
            }

            return Json(new List<SelectionListItem>());
        }

        [HttpGet]
        public async Task<JsonResult> GetPrograms()
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/Projects/selectionList/{((int)EnumFactory.ProjectType.Program).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPortfolios()
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/Projects/selectionList/{((int)EnumFactory.ProjectType.Portfolio).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #endregion

        #region PROJECT MAINTENANCE <-> PARTICIPANTS

        [PMCToolAuthorize(ObjectCode = "3108")]
        [HttpGet]
        public async Task<IActionResult> Participants(Guid? id)
        {
            if (id == null || id.Value == Guid.Empty)
                RedirectToAction("Index", "Projects");

            Project project = new Project();

            try
            {
                project = await restClient.Get<Project>(baseUrl, $"/api/v1/Projects/{id.ToString()}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (Exception ex)
            {
                RedirectToAction("Index", "Projects");
            }

            SetActiveOption("3108");
            ViewBag.Title = localizer["ViewTitleProject"] + ": " + localizer["Participants"];
            return View(project);
        }

        [HttpGet]
        public async Task<JsonResult> GetParticipants(string id)
        {
            List<ProjectParticipantSelection> data = new List<ProjectParticipantSelection>();
            try
            {
                data = await restClient.Get<List<ProjectParticipantSelection>>(baseUrl, $"/api/v1/projects/{id}/participant/kardex", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetparticipantRoles(string id)
        {
            List<LicenseRole> data = new List<LicenseRole>();
            try
            {
                data = await restClient.Get<List<LicenseRole>>(baseUrl, $"/api/v1/roles/user/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateParticipant(Guid id, Guid participantID, int? role)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            try
            {
                ProjectParticipantSelection data = new ProjectParticipantSelection()
                {
                    ProjectID = id,
                    ParticipantID = participantID,
                    Role = role,
                };
                string result = await restClient.Post<string, ProjectParticipantSelection>(baseUrl, $"/api/v1/projects/{id}/participant", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteParticipant(Guid id, Guid participantID)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
                ErrorMessage = ""
            };

            try
            {
                var result = await restClient.Delete<OkResult, string>(baseUrl, $"/api/v1/projects/{id}/participant/{participantID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
    }
}