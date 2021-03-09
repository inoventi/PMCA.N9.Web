using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
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

    public partial class ExecutionController : BaseController
    {
        #region P R O J E C T  I N C I D E N T

        #region I N C I D E N T

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Incidents(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            var data = new ProjectIncidentViewModel();
            try
            {
                var projectParticipant = await restClient.Get<ProjectParticipant>(baseUrl, $"/api/v1/projectparticipant/project/{id}/participant", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectParticipant == null)
                    return RedirectToAction("Projects");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Projects");

                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectPhase = project.Phase;
                data.ProjectEditable = project.ProjectEditable;
                data.ProjectChangeControl = project.ChangeManagement;

                if (project.Phase != null && project.Phase != 1 && project.ChangeManagement == (int)EnumFactory.ProjectChangeManagement.Optional)
                    data.ChangeControl = true;

                //data.ProjectIndicator = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{id}/indicators/incidents", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
                var pp = await GetProjectParticipant(id.Value);
                data.ParticipantRole = pp.Role;

                List<KeyValuePairItem> projectElementStatus = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.OnTime).ToString(), Value = localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.OnTime).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Delayed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Delayed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Closed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Closed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Canceled).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Canceled).ToString()) },
                };

                List<KeyValuePairItem> projectElement = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementType.Activity).ToString(), Value = localizer.GetString("Activities") },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementType.Evidence).ToString(), Value =localizer.GetString("Evidences") },
                };

                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{id}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);

                ViewBag.ProjectElementStatus = projectElementStatus;
                ViewBag.ProjectElement = projectElement;
                ViewBag.ProjectParticipants = participants;
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

            SetActiveOption("3120");
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Incidents"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Incident(Guid? projectId, Guid? incidentId)
        {
            ProjectIncidentDetailViewModel data = new ProjectIncidentDetailViewModel();

            try
            {
                if (projectId == null || projectId == Guid.Empty)
                    return RedirectToAction("Incidents");

                if (incidentId == null || incidentId == Guid.Empty)
                    return RedirectToAction("Incidents");

                var pp = await GetProjectParticipant(projectId.Value);
                if (pp == null)
                    return RedirectToAction("AccessNotAllowed", "Home");

                var projectIncident = await restClient.Get<ProjectIncident>(baseUrl, $"/api/v1/projects/{projectId}/incidents/{incidentId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectIncident == null)
                    return RedirectToAction("Incidents");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Incidents");

                if (pp.Role == (int)EnumFactory.ParticipantRole.Guest || pp.Role == (int)EnumFactory.ParticipantRole.Participant)
                {
                    if (pp.ParticipantID != projectIncident.Responsible)
                    {
                        var actionPlans = await restClient.Get<List<ProjectIncidentActionPlan>>(baseUrl, $"/api/v1/projects/{projectId}/incident/{incidentId}/actionPlan", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        var actionPlan = actionPlans.Where(t => t.Responsible == pp.ParticipantID).FirstOrDefault();
                        if (actionPlan == null)
                            return RedirectToAction("AccessNotAllowed", "Home");
                    }
                }

                data.ProjectIncidentID = projectIncident.ProjectIncidentID;
                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectEditable = project.ProjectEditable;
                data.ProjectPhase = project.Phase;
                data.ProjectChangeControl = project.ChangeManagement;

                data.ProjectIncident = projectIncident;

                if (project.Phase != null && project.Phase != 1 && project.ChangeManagement == (int)EnumFactory.ProjectChangeManagement.Optional)
                    data.ChangeControl = true;

                List<KeyValuePairItem> projectElementStatus = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.OnTime).ToString(), Value = localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.OnTime).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Delayed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Delayed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Closed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Closed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Canceled).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Canceled).ToString()) },
                };

                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{project.ProjectID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);

                ViewBag.ProjectElementStatus = projectElementStatus;
                ViewBag.ProjectParticipants = participants;

                ViewBag.Role = pp.Role;
                data.ParticipantRole = pp.Role;
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

            SetActiveOption("3120");
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Incident"];
            return View(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetIncidents(string projectId)
        {
            List<ProjectIncident> data = new List<ProjectIncident>();
            try
            {
                var pp = await GetProjectParticipant(new Guid(projectId));
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectIncident>>(baseUrl, $"api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/incidents", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetIncident(Guid projectId, Guid incidentId)
        {
            var data = new ProjectIncident();
            try
            {
                data = await restClient.Get<ProjectIncident>(baseUrl, $"/api/v1/projects/{projectId}/incidents/{incidentId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateIncident(ProjectIncidentViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectIncident.Status = (int)EnumFactory.ProjectElementStatus.OnTime;

                var result = await restClient.Post<ProjectIncident, ProjectIncident>(baseUrl, $"/api/v1/projects/{data.ProjectID}/incidents", data.ProjectIncident, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateIncident(ProjectIncidentViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectIncident.ProjectIncidentID = data.ProjectIncidentID;

                data.ProjectIncident.ChangeControlComments = data.ChangeControlComments;
                data.ProjectIncident.ChangeControlManualInput = data.ChangeControlManual;
                if (!string.IsNullOrWhiteSpace(data.ChangeControlAuthorizer))
                    data.ProjectIncident.ChangeControlAuthorizer = Guid.Parse(data.ChangeControlAuthorizer);

                if (data.ProjectIncident.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                    data.ProjectIncident.Status != (int)EnumFactory.ProjectElementStatus.Canceled)
                {
                    if (data.ProjectIncident.WithImpact)
                    {
                        data.ProjectIncident.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                    }
                    else
                    {
                        data.ProjectIncident.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                    }
                }

                var result = await restClient.Put<OkObjectResult, ProjectIncident>(baseUrl, $"/api/v1/projects/{data.ProjectID}/incidents/{data.ProjectIncidentID}", data.ProjectIncident, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CancelIncident(ProjectIncidentViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Put<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/incidents/{data.ProjectIncidentID}/cancel", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteIncident(ProjectIncidentViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/incidents/{data.ProjectIncidentID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetIncidentAgreements(Guid projectId, Guid incidentId)
        {
            var data = new List<ProjectMeetingAgreement>();
            try
            {
                //data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/incidents/{incidentId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/incidents/{incidentId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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
        public async Task<JsonResult> GetIncidentSource(Guid projectId, Guid incidentId, Guid elementId, int type)
        {
            List<ProjectIncidentSourceModel> data = new List<ProjectIncidentSourceModel>();

            try
            {
                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                {
                    if (type == (int)EnumFactory.ProjectElementType.Activity)
                    {
                        var result = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/incidents/{incidentId}/activities", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        //var result = await restClient.Get<ProjectTask>(baseUrl, $"/api/v1/projects/{projectId}/activities/{elementId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        foreach(var activity in result)
                        {
                            var item = new ProjectIncidentSourceModel()
                            {
                                ProjectID = activity.ProjectId,
                                ElementID = activity.id,
                                ElementType = type,
                                TypeName = localizer.GetString("Activity"),
                                Description = activity.text,
                                PlannedStartDate = activity.start_date != "" ? (Convert.ToDateTime(activity.start_date)).ToString("yyyy-MM-dd") : "",
                                PlannedEndDate = activity.end_date != "" ? (Convert.ToDateTime(activity.EndDateClient)).ToString("yyyy-MM-dd") : "",
                                Progress = activity.progress,
                                Status = activity.status,
                                Comment = activity.Comment,
                                EditableByRol = activity.EditableByRol

                            };
                            data.Add(item);
                        }
                        
                    }
                    else
                    {
                        var result = await restClient.Get<List<ProjectEvidence>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/incidents/{incidentId}/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        //var result = await restClient.Get<ProjectEvidence>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{elementId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        foreach (var evidence in result)
                        {
                            var item = new ProjectIncidentSourceModel()
                            {
                                ProjectID = evidence.ProjectID,
                                ElementID = evidence.ProjectEvidenceID,
                                ElementType = type,
                                TypeName = localizer.GetString("Evidence"),
                                Description = evidence.Description,
                                PlannedStartDate = "",
                                PlannedEndDate = evidence.PlannedEndDate.ToString("yyyy-MM-dd"),
                                Progress = evidence.Progress,
                                Status = evidence.Status,
                                Comment = evidence.Comment,
                                EditableByRol = evidence.EditableByRol
                            };
                            data.Add(item);
                        }
                    }
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

            return Json(data);
        }

        #endregion

        #region I N C I D E N T  A C T I O N  P L A N 

        [HttpGet]
        public async Task<JsonResult> GetIncidentActionPlan(string projectId, string incidentId)
        {
            var data = new List<ProjectIncidentActionPlan>();
            try
            {
                //data = await restClient.Get<List<ProjectIncidentActionPlan>>(baseUrl, $"/api/v1/projects/{projectId}/incident/{incidentId}/actionPlan", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(new Guid(projectId));
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectIncidentActionPlan>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/incidents/{incidentId}/actionPlan", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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
        public async Task<JsonResult> CreateIncidentActionPlan(ProjectIncidentDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectIncidentActionPlan.ProjectIncidentID = data.ProjectIncidentID;
                data.ProjectIncidentActionPlan.Status = (int)EnumFactory.ProjectElementStatus.OnTime;

                var result = await restClient.Post<ProjectIncidentActionPlan, ProjectIncidentActionPlan>(baseUrl, $"/api/v1/projects/{data.ProjectID}/incident/{data.ProjectIncidentID}/actionPlan", data.ProjectIncidentActionPlan, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateIncidentActionPlan(ProjectIncidentDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectIncidentActionPlan.ProjectIncidentID = data.ProjectIncidentID;
                data.ProjectIncidentActionPlan.ProjectIncidentActionPlanID = data.ProjectIncidentActionPlanID;
                
                data.ProjectIncidentActionPlan.ChangeControlComments = data.ChangeControlComments;
                data.ProjectIncidentActionPlan.ChangeControlManualInput = data.ChangeControlManual;
                if (!string.IsNullOrWhiteSpace(data.ChangeControlAuthorizer))
                    data.ProjectIncidentActionPlan.ChangeControlAuthorizer = Guid.Parse(data.ChangeControlAuthorizer);

                if (data.ProjectIncidentActionPlan.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                    data.ProjectIncidentActionPlan.Status != (int)EnumFactory.ProjectElementStatus.Canceled)
                {
                    if (data.ProjectIncidentActionPlan.WithImpact)
                    {
                        data.ProjectIncidentActionPlan.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                    }
                    else
                    {
                        data.ProjectIncidentActionPlan.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                    }
                }

                var result = await restClient.Put<OkObjectResult, ProjectIncidentActionPlan>(baseUrl, $"/api/v1/projects/{data.ProjectID}/incident/{data.ProjectIncidentID}/actionPlan/{data.ProjectIncidentActionPlanID}", data.ProjectIncidentActionPlan, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpPatch]
        public async Task<JsonResult> CancelIncidentActionPlan(ProjectIncidentDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Patch<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID.ToString()}/incident/{data.ProjectIncidentID.ToString()}/actionPlan/{data.ProjectIncidentActionPlanID.ToString()}/cancel", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpDelete]
        public async Task<JsonResult> DeleteIncidentActionPlan(ProjectIncidentDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/incident/{data.ProjectIncidentID}/actionPlan/{data.ProjectIncidentActionPlanID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #endregion
    }
}