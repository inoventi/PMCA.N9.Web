using System;
using System.Collections.Generic;
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
        #region P R O J E C T  R I S K S

        #region R I S K

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Risks(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            var data = new ProjectRiskViewModel();
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
                data.ProjectChangeControl = project.ChangeManagement;
                data.ProjectEditable = project.ProjectEditable;

                var pp = await GetProjectParticipant(id.Value);
                data.ParticipantRole = pp.Role;

                if (project.Phase != null && project.Phase != 1 && project.ChangeManagement == (int)EnumFactory.ProjectChangeManagement.Optional)
                    data.ChangeControl = true;

                //data.ProjectIndicator = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{id}/indicators/risks", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                List<KeyValuePairItem> projectRiskProbability = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = null, Value =  localizer.GetString("SelectListNullItem").ToString() },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectRiskProbability.Low).ToString(), Value = localizer.GetString("EnumProjectRiskProbability_" + ((int)EnumFactory.ProjectRiskProbability.Low).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectRiskProbability.Medium).ToString(), Value =localizer.GetString("EnumProjectRiskProbability_" + ((int)EnumFactory.ProjectRiskProbability.Medium).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectRiskProbability.High).ToString(), Value =localizer.GetString("EnumProjectRiskProbability_" + ((int)EnumFactory.ProjectRiskProbability.High).ToString()) },
                };

                List<KeyValuePairItem> projectRiskImpact = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = null, Value =  localizer.GetString("SelectListNullItem").ToString() },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectRiskImpact.Low).ToString(), Value = localizer.GetString("EnumProjectRiskImpact_" + ((int)EnumFactory.ProjectRiskImpact.Low).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectRiskImpact.Medium).ToString(), Value =localizer.GetString("EnumProjectRiskImpact_" + ((int)EnumFactory.ProjectRiskImpact.Medium).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectRiskImpact.High).ToString(), Value =localizer.GetString("EnumProjectRiskImpact_" + ((int)EnumFactory.ProjectRiskImpact.High).ToString()) },
                };

                List<KeyValuePairItem> projectElementStatus = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.OnTime).ToString(), Value = localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.OnTime).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Delayed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Delayed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Closed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Closed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Canceled).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Canceled).ToString()) },
                };

                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{id}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNullItem"]);

                ViewBag.ProjectRiskProbability = projectRiskProbability;
                ViewBag.ProjectRiskImpact = projectRiskImpact;
                ViewBag.ProjectElementStatus = projectElementStatus;
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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Risks"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Risk(Guid? projectId, Guid? riskId)
        {
            ProjectRiskDetailViewModel data = new ProjectRiskDetailViewModel();

            try
            {
                if (projectId == null || projectId == Guid.Empty)
                    return RedirectToAction("Risks");

                if (riskId == null || riskId == Guid.Empty)
                    return RedirectToAction("Risks");

                var pp = await GetProjectParticipant(projectId.Value);
                if (pp == null)
                    return RedirectToAction("AccessNotAllowed", "Home");

                var projectRisk = await restClient.Get<ProjectRisk>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectRisk == null)
                    return RedirectToAction("Risks");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Risks");

                if (pp.Role == (int)EnumFactory.ParticipantRole.Guest || pp.Role == (int)EnumFactory.ParticipantRole.Participant)
                {
                    if (pp.ParticipantID != projectRisk.Responsible)
                    {
                        List<Guid> items = new List<Guid>();
                        var mitigations = await restClient.Get<List<ProjectRiskMitigation>>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/mitigations", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                        var contingencies = await restClient.Get<List<ProjectRiskContingency>>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/contingencies", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                        items.AddRange(mitigations.Where(t => t.Responsible == pp.ParticipantID).Select(t => t.ProjectRiskID).ToList());
                        items.AddRange(contingencies.Where(t => t.Responsible == pp.ParticipantID).Select(t => t.ProjectRiskID).ToList());

                        if (items.Count == 0)
                            return RedirectToAction("AccessNotAllowed", "Home");
                    }
                }

                data.ProjectRiskID = projectRisk.ProjectRiskID;
                data.ProjectID = projectRisk.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectEditable = project.ProjectEditable;
                data.ProjectRisk = projectRisk;

                List<KeyValuePairItem> projectElementStatus = new List<KeyValuePairItem>() {
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.OnTime).ToString(), Value = localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.OnTime).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Delayed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Delayed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.WithImpact).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Closed).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Closed).ToString()) },
                    new KeyValuePairItem(){ Key = ((int)EnumFactory.ProjectElementStatus.Canceled).ToString(), Value =localizer.GetString("EnumProjectElementStatus_" + ((int)EnumFactory.ProjectElementStatus.Canceled).ToString()) },
                };

                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{projectRisk.ProjectID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);

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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Risk"];
            return View(data);
        }

        [HttpGet]
        public async Task<JsonResult> GetRisks(string projectID)
        {
            List<ProjectRisk> data = new List<ProjectRisk>();
            try
            {
                var pp = await GetProjectParticipant(new Guid(projectID));
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectRisk>>(baseUrl, $"api/v1/projects/{projectID}/participants/{pp.ParticipantID}/roles/{pp.Role}/risks", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetRisk(Guid projectId, Guid riskId)
        {
            var data = new ProjectRisk();
            try
            {
                data = await restClient.Get<ProjectRisk>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateRisk(ProjectRiskViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectRisk.ProjectID = data.ProjectID;
                data.ProjectRisk.Status = (int)EnumFactory.ProjectElementStatus.OnTime;

                var result = await restClient.Post<ProjectRisk, ProjectRisk>(baseUrl, $"/api/v1/projects/{data.ProjectRisk.ProjectID}/risks", data.ProjectRisk, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateRisk(ProjectRiskViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectRisk.ProjectID = data.ProjectID;
                data.ProjectRisk.ProjectRiskID = data.ProjectRiskID;
             
                data.ProjectRisk.ChangeControlComments = data.ChangeControlComments;
                data.ProjectRisk.ChangeControlManualInput = data.ChangeControlManual;
                if (!string.IsNullOrWhiteSpace(data.ChangeControlAuthorizer))
                    data.ProjectRisk.ChangeControlAuthorizer = Guid.Parse(data.ChangeControlAuthorizer);

                if (data.ProjectRisk.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                    data.ProjectRisk.Status != (int)EnumFactory.ProjectElementStatus.Canceled)
                {
                    if (data.ProjectRisk.WithImpact)
                    {
                        data.ProjectRisk.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                    }
                    else
                    {
                        data.ProjectRisk.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                    }
                }

                var result = await restClient.Put<OkObjectResult, ProjectRisk>(baseUrl, $"/api/v1/projects/{data.ProjectRisk.ProjectID}/risks/{data.ProjectRisk.ProjectRiskID}", data.ProjectRisk, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CancelRisk(ProjectRiskViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Put<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/risks/{data.ProjectRiskID}/cancel", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteRisk(ProjectRiskViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/risks/{data.ProjectRiskID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetRiskAgreements(Guid projectId, Guid riskId)
        {
            var data = new List<ProjectMeetingAgreement>();
            try
            {
                //data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/risks/{riskId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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

        #region R I S K  M I T I G A T I O N

        [HttpGet]
        public async Task<JsonResult> GetRiskMitigation(string projectId, string riskId)
        {
            var data = new List<ProjectRiskMitigation>();
            try
            {
                //data = await restClient.Get<List<ProjectRiskMitigation>>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/mitigations", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(new Guid(projectId));
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectRiskMitigation>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/risks/{riskId}/mitigations", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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
        public async Task<JsonResult> CreateRiskMitigation(ProjectRiskDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectRiskMitigation.ProjectRiskID = data.ProjectRiskID;
                data.ProjectRiskMitigation.Status = (int)EnumFactory.ProjectElementStatus.OnTime;

                var result = await restClient.Post<ProjectRiskContingency, ProjectRiskMitigation>(baseUrl, $"/api/v1/projects/{data.ProjectID}/risks/{data.ProjectRiskID}/mitigations", data.ProjectRiskMitigation, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateRiskMitigation(ProjectRiskDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectRiskMitigation.ProjectRiskID = data.ProjectRiskID;
                data.ProjectRiskMitigation.ProjectRiskMitigationID = data.ProjectRiskMitigationID;

                if (data.ProjectRiskMitigation.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                    data.ProjectRiskMitigation.Status != (int)EnumFactory.ProjectElementStatus.Canceled)
                {
                    if (data.ProjectRiskMitigation.WithImpact)
                    {
                        data.ProjectRiskMitigation.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                    }
                    else
                    {
                        data.ProjectRiskMitigation.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                    }
                }

                var result = await restClient.Put<OkObjectResult, ProjectRiskMitigation>(baseUrl, $"/api/v1/projects/{data.ProjectID}/risks/{data.ProjectRiskID}/mitigations/{data.ProjectRiskMitigationID}", data.ProjectRiskMitigation, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CancelRiskMitigation(ProjectRiskDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Patch<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID.ToString()}/risks/{data.ProjectRiskID.ToString()}/mitigations/{data.ProjectRiskMitigationID.ToString()}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteRiskMitigation(ProjectRiskDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/risks/{data.ProjectRiskID}/mitigations/{data.ProjectRiskMitigationID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region R I S K  C O N T I N G E N C Y

        [HttpGet]
        public async Task<JsonResult> GetRiskContingency(string projectId, string riskId)
        {
            var data = new List<ProjectRiskContingency>();
            try
            {
                //data = await restClient.Get<List<ProjectRiskContingency>>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/contingencies", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(new Guid(projectId));
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectRiskContingency>>(baseUrl, $"/api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/risks/{riskId}/contingencies", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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
        public async Task<JsonResult> CreateRiskContingency(ProjectRiskDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectRiskContingency.ProjectRiskID = data.ProjectRiskID;
                data.ProjectRiskContingency.Status = (int)EnumFactory.ProjectElementStatus.OnTime;

                var result = await restClient.Post<ProjectRiskContingency, ProjectRiskContingency>(baseUrl, $"/api/v1/projects/{data.ProjectID}/risks/{data.ProjectRiskID}/contingencies", data.ProjectRiskContingency, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateRiskContingency(ProjectRiskDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                data.ProjectRiskContingency.ProjectRiskID = data.ProjectRiskID;
                data.ProjectRiskContingency.ProjectRiskContingencyID = data.ProjectRiskContingencyID;

                if (data.ProjectRiskContingency.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                    data.ProjectRiskContingency.Status != (int)EnumFactory.ProjectElementStatus.Canceled)
                {
                    if (data.ProjectRiskContingency.WithImpact)
                    {
                        data.ProjectRiskContingency.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                    }
                    else
                    {
                        data.ProjectRiskContingency.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                    }
                }

                var result = await restClient.Put<OkObjectResult, ProjectRiskContingency>(baseUrl, $"/api/v1/projects/{data.ProjectID}/risks/{data.ProjectRiskID}/contingencies/{data.ProjectRiskContingencyID}", data.ProjectRiskContingency, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CancelRiskContingency(ProjectRiskDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Patch<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID.ToString()}/risks/{data.ProjectRiskID.ToString()}/contingencies/{data.ProjectRiskContingencyID.ToString()}/cancel", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteRiskContingency(ProjectRiskDetailViewModel data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID}/risks/{data.ProjectRiskID}/contingencies/{data.ProjectRiskContingencyID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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