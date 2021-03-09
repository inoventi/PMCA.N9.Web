using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
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
        #region P R O J E C T  E V I D E N C E S

        #region E V I D E N C E

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Evidences(Guid? id, Guid? layerId)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            var data = new ProjectEvidenceViewModel();
            var layers = new List<SelectionListItem>();
            int layerCount = 0;
            try
            {
                var projectParticipant = await restClient.Get<ProjectParticipant>(baseUrl, $"/api/v1/projectparticipant/project/{id}/participant", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectParticipant == null)
                    return RedirectToAction("Projects");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Projects");

                data.NavBack = Request.Headers["Referer"].ToString();

                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectPhase = project.Phase;
                data.ProjectChangeControl = project.ChangeManagement;
                data.ProjectEditable = project.ProjectEditable;

                if (project.Phase != null && project.Phase != 1 && project.ChangeManagement == (int)EnumFactory.ProjectChangeManagement.Optional)
                    data.ChangeControl = true;

                data.ProjectIndicator = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{id}/indicators/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                List<KeyValuePairItem> projectElementStatus = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.OnTime).ToString(), Value = localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.OnTime).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Delayed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Delayed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Closed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Closed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Canceled).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Canceled).ToString()) },
                };

                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{id}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);
                var activities = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{project.ProjectID}/activities/childs/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                var evidenceTypes = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/evidenceTypes/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                

                if (layerId == null)
                {
                    layers = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{project.ProjectID}/layers/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);

                    data.LayerID = null;
                    data.LayerParentID = null;
                }
                else {
                    var layer = await restClient.Get<ProjectLayer>(baseUrl, $"/api/v1/projects/{id}/Layers/{layerId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    layers.Add( new SelectionListItem() { Key = layer.ProjectLayerID, Value = layer.Name});

                    data.LayerID = layer.ProjectLayerID;
                    data.LayerName = layer.Name;
                    data.LayerParentID = layer.ParentID;
                    data.LayerParentName = layer.ParentName;
                    data.ProjectEvidence.ProjectLayerID = layer.ProjectLayerID;
                }
                var pp = await GetProjectParticipant(id.Value);
                data.ParticipantRole = pp.Role;

                layerCount = await restClient.Get<int>(baseUrl, $"/api/v1/projects/{id}/layers/count", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
                ViewBag.LayerCount = layerCount;
                ViewBag.ProjectElementStatus = projectElementStatus;
                ViewBag.ProjectParticipants = participants;
                ViewBag.ProjectActivities = activities;
                ViewBag.EvidenceTypes = evidenceTypes;
                ViewBag.Layers = layers;
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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Evidences"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Evidence(Guid? projectId, Guid? evidenceId)
        {
            ProjectEvidenceDetailViewModel data = new ProjectEvidenceDetailViewModel();

            try
            {
                if (projectId == null || projectId == Guid.Empty)
                    return RedirectToAction("Evidences");

                if (evidenceId == null || evidenceId == Guid.Empty)
                    return RedirectToAction("Evidences");

                var pp = await GetProjectParticipant(projectId.Value);
                if (pp == null)
                    return RedirectToAction("AccessNotAllowed", "Home");

                var projectEvidence = await restClient.Get<ProjectEvidence>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectEvidence == null)
                    return RedirectToAction("Evidences");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Evidences");

                if (pp.Role == (int)EnumFactory.ParticipantRole.Guest || pp.Role == (int)EnumFactory.ParticipantRole.Participant)
                {
                    if (pp.ParticipantID != projectEvidence.ResponsibleElaboration)
                    {
                        return RedirectToAction("AccessNotAllowed", "Home");
                    }
                }

                data.NavBack = Request.Headers["Referer"].ToString();

                data.ProjectEvidenceID = projectEvidence.ProjectEvidenceID;
                data.ProjectID = project.ProjectID;
                data.ActivityID = projectEvidence.ActivityID;
                data.ProjectName = project.Name;
                data.ProjectEditable = project.ProjectEditable;
                data.ProjectEvidence = projectEvidence;

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
                ViewBag.ParticipantId = pp.ParticipantID;
                ViewBag.Role = pp.Role;
                data.ParticipantRole = pp.Role;

                data.ReferenceEditable = true;

                if (pp.Role != null && (pp.Role != (int)EnumFactory.ParticipantRole.ProjectManager || pp.Role != (int)EnumFactory.ParticipantRole.Participant))
                {
                    if (pp.Role == (int)EnumFactory.ParticipantRole.Guest || pp.Role == (int)EnumFactory.ParticipantRole.GuestPlus)
                        data.ReferenceEditable = false;

                    if (pp.Role == (int)EnumFactory.ParticipantRole.ParticipantPlus)
                        data.ReferenceEditable = projectEvidence.ResponsibleElaboration == pp.ParticipantID ? true : false;
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

            SetActiveOption("3120");
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Evidence"];
            return View(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetEvidences(string projectId, Guid? layerId)
        {
            
            List<ProjectEvidence> data = new List<ProjectEvidence>();

            try
            {
                var pp = await GetProjectParticipant(new Guid(projectId));
                if (pp != null && pp.Role != null)
                {
                    if (layerId == null)
                    {

                        data = await restClient.Get<List<ProjectEvidence>>(baseUrl, $"api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    }
                    else
                    {
                        data = await restClient.Get<List<ProjectEvidence>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/layers/{layerId}/evidences", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpGet]
        public async Task<JsonResult> GetEvidence(Guid projectId, Guid evidenceId)
        {
            var data = new ProjectIncident();
            try
            {
                data = await restClient.Get<ProjectIncident>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetEvidenceByActivity(Guid projectId, Guid activityId)
        {
            List<SelectionListItem> data = new List<SelectionListItem>();
            try
            {
                data = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/activities/{activityId}/evidences/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);
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
        public async Task<JsonResult> CreateEvidence(ProjectEvidenceViewModel data)
        {
            ResponseModel response = new ResponseModel() { IsSuccess = false };

            if (!ValidateData(data.ProjectEvidence))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                data.ProjectEvidence.Status = (int)EnumFactory.ProjectElementStatus.OnTime;

                var result = await restClient.Post<ProjectEvidence, ProjectEvidence>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences", data.ProjectEvidence, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateEvidence(ProjectEvidenceViewModel data)
        {
            ResponseModel response = new ResponseModel() { IsSuccess = false };

            if (!ValidateData(data.ProjectEvidence))
            {
                response.ErrorMessage = _error;
                return Json(response);
            }

            try
            {
                data.ProjectEvidence.ProjectEvidenceID = data.ProjectEvidenceID;

                data.ProjectEvidence.ChangeControlComments = data.ChangeControlComments;
                data.ProjectEvidence.ChangeControlManualInput = data.ChangeControlManual;
                if (!string.IsNullOrWhiteSpace(data.ChangeControlAuthorizer))
                    data.ProjectEvidence.ChangeControlAuthorizer = Guid.Parse(data.ChangeControlAuthorizer);

                if (data.ProjectEvidence.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                    data.ProjectEvidence.Status != (int)EnumFactory.ProjectElementStatus.Canceled)
                {
                    if (data.ProjectEvidence.WithImpact)
                    {
                        data.ProjectEvidence.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                    }
                    else
                    {
                        data.ProjectEvidence.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                    }
                }

                var result = await restClient.Put<OkObjectResult, ProjectEvidence>(baseUrl, $"/api/v1/projects/{data.ProjectID}/Evidences/{data.ProjectEvidenceID}", data.ProjectEvidence, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CancelEvidence(ProjectEvidenceViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {

                var result = await restClient.Put<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}/cancel", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteEvidence(ProjectEvidenceViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetEvidenceAgreements(Guid projectId, Guid evidenceId)
        {
            var data = new List<ProjectMeetingAgreement>();
            try
            {
                //data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                
                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/evidences/{evidenceId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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
        public async Task<JsonResult> GetEvidenceActivities(Guid projectId, Guid evidenceId)
        {
            var data = new List<ProjectTask>();
            try
            {
                //data = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/activities", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectTask>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/evidences/{evidenceId}/activities", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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
        public async Task<JsonResult> GetEvidenceIncidents(Guid projectId, Guid evidenceId)
        {
            var data = new List<ProjectIncident>();
            try
            {
                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectIncident>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/evidences/{evidenceId}/incidents", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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

        private bool ValidateData(ProjectEvidence data)
        {
            _error = "";
            bool result = false;

            if (data.Progress < 0 || data.Progress > 100)
                _error = localizer.GetString("4028");

            if (string.IsNullOrEmpty(_error))
                result = true;

            return result;
        }

        #endregion

        #region C O N T R O L  P O I N T S

        [HttpGet]
        public async Task<JsonResult> GetEvidenceControlPoint(string projectId, string evidenceId)
        {
            var data = new List<ProjectEvidenceControlPoint>();
            try
            {
                //data = await restClient.Get<List<ProjectEvidenceControlPoint>>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/controlPoints", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(new Guid(projectId));
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectEvidenceControlPoint>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/evidences/{evidenceId}/controlpoints", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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
        public async Task<JsonResult> CreateEvidenceControlPoint(ProjectEvidenceDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectEvidenceControlPoint.EvidenceID = data.ProjectEvidenceID;
                data.ProjectEvidenceControlPoint.Status = (int)EnumFactory.ProjectElementStatus.OnTime;

                var result = await restClient.Post<ProjectEvidenceControlPoint, ProjectEvidenceControlPoint>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}/controlPoints", data.ProjectEvidenceControlPoint, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateEvidenceControlPoint(ProjectEvidenceDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectEvidenceControlPoint.EvidenceID = data.ProjectEvidenceID;
                data.ProjectEvidenceControlPoint.ProjectEvidenceControlPointID = data.ProjectEvidenceControlPointID;

                if (data.ProjectEvidenceControlPoint.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                    data.ProjectEvidenceControlPoint.Status != (int)EnumFactory.ProjectElementStatus.Canceled)
                {
                    if (data.ProjectEvidenceControlPoint.WithImpact)
                    {
                        data.ProjectEvidenceControlPoint.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                    }
                    else
                    {
                        data.ProjectEvidenceControlPoint.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                    }
                }

                var result = await restClient.Put<OkObjectResult, ProjectEvidenceControlPoint>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}/ControlPoints/{data.ProjectEvidenceControlPointID}", data.ProjectEvidenceControlPoint, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteEvidenceControlPoint(ProjectEvidenceDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}/controlPoints/{data.ProjectEvidenceControlPointID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CancelEvidenceControlPoint(ProjectEvidenceDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Patch<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID.ToString()}/evidences/{data.ProjectEvidenceID.ToString()}/controlpoints/{data.ProjectEvidenceControlPointID.ToString()}/cancel", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        #endregion

        #region R E F E R E N C E S

        [HttpGet]
        public async Task<JsonResult> GetEvidenceReference(string projectId, string evidenceId)
        {
            var data = new List<ProjectEvidenceReference>();
            try
            {
                data = await restClient.Get<List<ProjectEvidenceReference>>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/references", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateEvidenceReference(ProjectEvidenceDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectEvidenceReference.EvidenceID = data.ProjectEvidenceID;

                if(data.ProjectEvidenceReference.Location == null)
                {
                    data.ProjectEvidenceReference.Location = "";
                }

                var result = await restClient.Post<ProjectEvidenceReference, ProjectEvidenceReference>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}/references", data.ProjectEvidenceReference, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateEvidenceReference(ProjectEvidenceDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectEvidenceReference.EvidenceID = data.ProjectEvidenceID;
                data.ProjectEvidenceReference.ProjectEvidenceReferenceID = data.ProjectEvidenceReferenceID;

                if (data.ProjectEvidenceReference.Location == null)
                {
                    data.ProjectEvidenceReference.Location = "";
                }

                var result = await restClient.Put<OkObjectResult, ProjectEvidenceReference>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}/references/{data.ProjectEvidenceReferenceID}", data.ProjectEvidenceReference, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteEvidenceReference(ProjectEvidenceDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var reference = await restClient.Get<ProjectEvidenceReference>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}/references/{data.ProjectEvidenceReferenceID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/evidences/{data.ProjectEvidenceID}/references/{data.ProjectEvidenceReferenceID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.IsSuccess = true;
                response.SuccessMessage = localizer.GetString("SuccessMsg");

                if (System.IO.File.Exists(reference.FilePath))
                {
                    System.IO.File.Delete(reference.FilePath);
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

        [HttpPut]
        public async Task<JsonResult> UploadEvidenceReferenceFile(Guid projectId, Guid evidenceId, Guid referenceId, IFormFile file)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };
             try
            {
                var fileName = Guid.NewGuid().ToString().Replace(" - ", "") + Path.GetExtension(file.FileName);
                var directory = Path.Combine( _appSettings.Value.FileStorage,   GetTokenValue("Env").Replace("-", ""));

                var reference = await restClient.Get<ProjectEvidenceReference>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/references/{referenceId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                reference.FileName = file.FileName;
                reference.FileContentType = file.ContentType;
                reference.FilePath = Path.Combine(directory, fileName);
                var data = await restClient.Patch<ProjectEvidenceReference, ProjectEvidenceReference>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/references/{referenceId}/file", reference, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (!Directory.Exists(directory))
                {
                     Directory.CreateDirectory(directory);
                }

                using (FileStream DestinationStream = new FileStream(reference.FilePath, FileMode.Create))
                {
                     await file.CopyToAsync(DestinationStream);
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
        public async Task<FileResult> DownloadFile(Guid projectId, Guid evidenceId, Guid referenceId)
        {
            var reference = await restClient.Get<ProjectEvidenceReference>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/references/{referenceId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            byte[] data = System.IO.File.ReadAllBytes(reference.FilePath);
            return File(data, reference.FileContentType, reference.FileName);
        }

        #endregion

        #endregion
    }
}

