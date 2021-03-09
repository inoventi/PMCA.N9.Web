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
    public class ProjectManagerController : BaseController
    {
        private string _error;

        public ProjectManagerController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        #region P R O J E C T S

        [PMCToolAuthorizePM(ObjectCode = "3117")]
        [HttpGet]
        public IActionResult Projects()
        {
            SetActiveOption("3117");
            ViewBag.Title = localizer["ViewTitleProjectManager"];
            return View();
        }

        [HttpGet]
        public async Task<JsonResult> Get()
        {
            var data = new List<Project>();
            try
            {
                data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/projectmanager", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #endregion

        #region P R O J E C T  E D I T O R

        [PMCToolAuthorizePM(ObjectCode = "3117")]
        [HttpGet]
        public async Task<IActionResult> ProjectEditor(Guid? id)
        {
            Project m = new Project();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            try
            {
                var data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/projectmanager", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var item = data.Where(t => t.ProjectID == id.Value).FirstOrDefault();
                if (item == null)
                    return RedirectToAction("Projects");

                m = item;
            }
            catch (Exception ex)
            {
                RedirectToAction("Projects");
            }

            List<KeyValuePairItem> projectPhase = new List<KeyValuePairItem>();

            if (m.Phase == (int)EnumFactory.ProjectPhase.Planning)
            {
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Planning).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Planning).ToString()) });
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Execution).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Execution).ToString()) });
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Canceled).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Canceled).ToString()) });
            }

            if (m.Phase == (int)EnumFactory.ProjectPhase.Execution || m.Phase == (int)EnumFactory.ProjectPhase.Suspended)
            {
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Execution).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Execution).ToString()) });
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Canceled).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Canceled).ToString()) });
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Suspended).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Suspended).ToString()) });
            }

            if (m.Phase == (int)EnumFactory.ProjectPhase.Canceled)
            {
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Canceled).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Canceled).ToString()) });
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Execution).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Execution).ToString()) });
            }

            if (m.Phase == (int)EnumFactory.ProjectPhase.Close)
            {
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Close).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Close).ToString()) });
                projectPhase.Add(new KeyValuePairItem() { Key = ((int)EnumFactory.ProjectPhase.Execution).ToString(), Value = localizer.GetString("EnumProjectPhase_" + ((int)EnumFactory.ProjectPhase.Execution).ToString()) });
            }

            List<KeyValuePairItem> projectManagementType = new List<KeyValuePairItem>() {
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectManagementType.ByElement).ToString(), Value = localizer.GetString("EnumProjectManagementType_" + ((int)EnumFactory.ProjectManagementType.ByElement).ToString()) },
                //new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectManagementType.ByEffort).ToString(), Value =localizer.GetString("EnumProjectManagementType_" + ((int)EnumFactory.ProjectManagementType.ByEffort).ToString()) },
            };

            List<KeyValuePairItem> projectChangeManagement = new List<KeyValuePairItem>() {
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectChangeManagement.Optional).ToString(), Value = localizer.GetString("EnumProjectChangeManagement_" + ((int)EnumFactory.ProjectChangeManagement.Optional).ToString()) },
                //new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectChangeManagement.Mandatory).ToString(), Value =localizer.GetString("EnumProjectChangeManagement_" + ((int)EnumFactory.ProjectChangeManagement.Mandatory).ToString()) },
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectChangeManagement.None).ToString(), Value =localizer.GetString("EnumProjectChangeManagement_" + ((int)EnumFactory.ProjectChangeManagement.None).ToString()) },
            };

            List<KeyValuePairItem> projectWeighingManagement = new List<KeyValuePairItem>() {
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectWeighingManagement.ByTime).ToString(), Value = localizer.GetString("EnumProjectWeighingManagement_" + ((int)EnumFactory.ProjectWeighingManagement.ByTime).ToString()) },
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectWeighingManagement.ByEvidence).ToString(), Value =localizer.GetString("EnumProjectWeighingManagement_" + ((int)EnumFactory.ProjectWeighingManagement.ByEvidence).ToString()) },
                //new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectWeighingManagement.ByClosedActivity).ToString(), Value =localizer.GetString("EnumProjectWeighingManagement_" + ((int)EnumFactory.ProjectWeighingManagement.ByClosedActivity).ToString()) },
            };

            List<KeyValuePairItem> projectCalendarType = new List<KeyValuePairItem>() {
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectCalendarType.MondayToFriday).ToString(), Value = localizer.GetString("EnumProjectCalendarType_" + ((int)EnumFactory.ProjectCalendarType.MondayToFriday).ToString()) },
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectCalendarType.MondayToSaturday).ToString(), Value =localizer.GetString("EnumProjectCalendarType_" + ((int)EnumFactory.ProjectCalendarType.MondayToSaturday).ToString()) },
                new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectCalendarType.MondayToSunday).ToString(), Value =localizer.GetString("EnumProjectCalendarType_" + ((int)EnumFactory.ProjectCalendarType.MondayToSunday).ToString()) },
            };

            List<SelectionListItem> companies = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/companies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            List<SelectionListItem> factsheets = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/factsheets/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> sponsor = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            List<SelectionListItem> leader = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            List<SelectionListItem> projectManager = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            List<SelectionListItem> currencies = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/currencies/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
            List<SelectionListItem> meetingTemplate = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/meetingNoteTemplates/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

            projectPhase = projectPhase.OrderBy(o => o.Value).ToList();
            companies = companies.OrderBy(o => o.Value).ToList();

            ViewBag.ProjectPhase = projectPhase;
            ViewBag.ProjectManagementType = projectManagementType;
            ViewBag.ProjectChangeManagement = projectChangeManagement;
            ViewBag.ProjectWeighingManagement = projectWeighingManagement;
            ViewBag.ProjectCalendarType = projectCalendarType;
            ViewBag.Companies = companies;
            ViewBag.FactSheets = factsheets;
            ViewBag.Sponsor = sponsor;
            ViewBag.Leader = leader;
            ViewBag.ProjectManager = projectManager;
            ViewBag.Currencies = currencies;
            ViewBag.MeetingTemplate = meetingTemplate;

            SetActiveOption("3117");
            ViewBag.Title = localizer["ViewTitleProjectManager"];
            return View(m);
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

                if (dbProject.Phase != null && dbProject.Phase != (int)EnumFactory.ProjectPhase.Planning)
                {
                    data.ManagementType = dbProject.ManagementType;
                    data.ChangeManagement = dbProject.ChangeManagement;
                    data.WeighingManagement = dbProject.WeighingManagement;
                    data.CalendarType = dbProject.CalendarType;
                   // data.Phase = dbProject.Phase;
                    data.DelayBasedPlannedProgress = dbProject.DelayBasedPlannedProgress;
                    data.CurrencyID = dbProject.CurrencyID;
                }

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

        #endregion

        #region P R O J E C T  P A R T I C I P A N T S

        [PMCToolAuthorizePM(ObjectCode = "3117")]
        [HttpGet]
        public async Task<IActionResult> ProjectParticipants(Guid? id)
        {
            Project m = new Project();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            try
            {
                var data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/projectmanager", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var item = data.Where(t => t.ProjectID == id.Value).FirstOrDefault();
                if (item == null)
                    return RedirectToAction("Projects");

                m = item;
            }
            catch (Exception ex)
            {
                RedirectToAction("Projects");
            }

            SetActiveOption("3117");
            ViewBag.Title = localizer["ViewTitleProjectManager"] + ": " + localizer["Participants"];
            return View(m);
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

        #region P R O J E C T  L A Y E R

        [PMCToolAuthorizePM(ObjectCode = "3117")]
        [HttpGet]
        public async Task<IActionResult> Layers(Guid? id)
        {
            ProjectLayer m = new ProjectLayer();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            try
            {
                var data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/projectmanager", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var item = data.Where(t => t.ProjectID == id.Value).FirstOrDefault();
                if (item == null)
                    return RedirectToAction("Projects");

                m.ProjectID = item.ProjectID;
                m.ProjectName = item.Name;

            }
            catch (Exception ex)
            {
                RedirectToAction("Projects");
            }

            SetActiveOption("3117");
            ViewBag.Title = localizer["ViewTitleProjectManager"] + ": " + localizer["Layers"];
            return View(m);
        }

        [PMCToolAuthorizePM(ObjectCode = "3117")]
        [HttpGet]
        public async Task<IActionResult> Layer(Guid? projectId, Guid? layerId)
        {
            ProjectLayer m = new ProjectLayer();

            if (projectId == null || projectId == Guid.Empty)
                return RedirectToAction("Layers");

            if (layerId == null || layerId == Guid.Empty)
                return RedirectToAction("Layers");

            try
            {
                m = await restClient.Get<ProjectLayer>(baseUrl, $"/api/v1/projects/{projectId}/Layers/{layerId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/projectmanager", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var item = data.Where(t => t.ProjectID == projectId.Value).FirstOrDefault();
                if (item == null)
                    return RedirectToAction("Projects");

            }
            catch (Exception ex)
            {
                RedirectToAction("Projects");
            }

            SetActiveOption("3117");
            ViewBag.Title = localizer["ViewTitleProjectManager"] + ": " + localizer["Layers"];
            return View(m);
        }

        #endregion

        #region P R O J E C T  W E I G H I N G

        [PMCToolAuthorizePM(ObjectCode = "3119")]
        [HttpGet]
        public IActionResult ProjectWeighing()
        {
            SetActiveOption("3119");
            ViewBag.Title = localizer["ViewTitleProjectManager"];
            return View();
        }

        [PMCToolAuthorizePM(ObjectCode = "3119")]
        [HttpGet]
        public async Task<IActionResult> Weighings(Guid? id)
        {
            Project m = new Project();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            try
            {
                var data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/projectmanager", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var item = data.Where(t => t.ProjectID == id.Value).FirstOrDefault();
                if (item == null)
                    return RedirectToAction("Projects");

                var activities = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{id}/activities/parents/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                var rootOption = new SelectionListItem()
                {
                    Key = Guid.Empty,
                    Value = localizer.GetString("Root")
                };

                activities.Insert(1, rootOption);

                m.ProjectID = item.ProjectID;
                m.Name = item.Name;

                ViewBag.Activities = activities;

            }
            catch (Exception ex)
            {
                RedirectToAction("Projects");
            }

            SetActiveOption("3119");
            ViewBag.Title = localizer["ViewTitleProjectManager"] + ": " + localizer["Weighing"];
            return View(m);
        }

        [PMCToolAuthorizePM(ObjectCode = "3119")]
        [HttpGet]
        public async Task<IActionResult> ControlPointsWeighing(Guid? id)
        {
            ProjectEvidenceControlPoint m = new ProjectEvidenceControlPoint();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            try
            {
                var data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/projectmanager", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var item = data.Where(t => t.ProjectID == id.Value).FirstOrDefault();
                if (item == null)
                    return RedirectToAction("Projects");
                var activities = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{id}/activities/evidences/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                m.ProjectID = item.ProjectID;
                m.ProjectName = item.Name;
                ViewBag.Activities = activities;

            }
            catch (Exception ex)
            {
                RedirectToAction("Projects");
            }

            SetActiveOption("3119");
            ViewBag.Title = localizer["ViewTitleProjectManager"] + ": " + localizer["ControlPointsWeighing"];
            return View(m);
        }
        [PMCToolAuthorizePM(ObjectCode = "3119")]
        [HttpGet]
        public async Task<IActionResult> EvidenceWeighing(Guid? id)
        {
            ProjectEvidence m = new ProjectEvidence();

            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            try
            {
                var data = await restClient.Get<List<Project>>(baseUrl, $"/api/v1/Projects/projectmanager", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var item = data.Where(t => t.ProjectID == id.Value).FirstOrDefault();
                if (item == null)
                    return RedirectToAction("Projects");                                                                   
                var activities = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{id}/activities/evidences/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                m.ProjectID = item.ProjectID;
                m.ProjectName = item.Name;
                ViewBag.Activities = activities;

            }
            catch (Exception ex)
            {
                RedirectToAction("Projects");
            }

            SetActiveOption("3119");
            ViewBag.Title = localizer["ViewTitleProjectManager"] + ": " + localizer["EvidencesWeighing"];
            return View(m);
        }

        #endregion
    }
}