using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.Net.Http.Headers;
using System.Net.Http;
using System.IO;
using PMCTool.App.Attributes;
using PMCTool.Models.Core;
using PMCTool.App.Helpers;
using PMCTool.Models.Exceptions;
using Newtonsoft.Json;
using PMCTool.Models.Enumeration;

namespace PMCTool.App.Controllers
{
    [PMCToolAuthentication]
    public class MyDashboardController : BaseController
    {

        public MyDashboardController(IOptions<AppSettingsModel> appSettings,
            IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {
        }

        #region S U M M A R Y

        [PMCToolAuthorize(ObjectCode = "3124")]
        [HttpGet]
        public IActionResult Index()
        {
            return RedirectToAction("Summary");
            //return View();
        }

        [PMCToolAuthorize(ObjectCode = "3124")]
        [HttpGet]
        public async Task<IActionResult> Summary()
        {
            ParticipantSummary summary = new ParticipantSummary();

            try
            {
                Participant participant = await GetParticipant();
                if(participant.ParticipantID != null && participant.ParticipantID != Guid.Empty)
                {
                    ViewBag.ParticipantName = participant.Name + " " + participant.Lastname + " " + participant.Surname;
                    ViewBag.ParticipantLogo = participant.ParticipantUser.Image;
                    ViewBag.ParticipantCompany = participant.Company;
                    ViewBag.ParticipantID = participant.ParticipantID;

                    summary = await restClient.Get<ParticipantSummary>(baseUrl, $"/api/v1/mydashboard/summary/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            SetActiveOption("3124");
            ViewBag.Title = localizer["ViewTitleMyDashboard"];
            return View(summary);
        }

        [HttpGet]
        public async Task<JsonResult> GetProjectByHours()
        {
            List<ParticipantSummary_ProjectHoursSum> data = new List<ParticipantSummary_ProjectHoursSum>();
            try
            {
                Participant participant = await GetParticipant();
                var result = await restClient.Get<ParticipantSummary>(baseUrl, $"/api/v1/mydashboard/summary/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = result.ProjectByHoursSum;
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
        public async Task<JsonResult> GetProjectByHoursDetail(Guid projectId)
        {
            List<ParticipantSummaryDailyHours> data = new List<ParticipantSummaryDailyHours>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<ParticipantSummaryDailyHours>>(baseUrl, $"/api/v1/mydashboard/summary/dailyHours/participant/{participant.ParticipantID}/project/{projectId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetSummaryByStatus(int status)
        {
            List<ParticipantSummaryDetail> data = new List<ParticipantSummaryDetail>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<ParticipantSummaryDetail>>(baseUrl, $"/api/v1/mydashboard/summary/participant/{participant.ParticipantID}/status/{status}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetSummaryProjectStatus(Guid projectId, int status)
        {
            List<ParticipantSummaryDetail> data = new List<ParticipantSummaryDetail>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<ParticipantSummaryDetail>>(baseUrl, $"/api/v1/mydashboard/summary/participant/{participant.ParticipantID}/project/{projectId}/status/{status}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region P E N D I N G S

        [PMCToolAuthorize(ObjectCode = "3124")]
        [HttpGet]
        public async Task<IActionResult> Pendings()
        {
            MyDashboardPendings myDashboardPendings = new MyDashboardPendings();

            try
            {
                Participant participant = await GetParticipant();
                if (participant.ParticipantID != null && participant.ParticipantID != Guid.Empty)
                {
                    ViewBag.ParticipantName = participant.Name + " " + participant.Lastname + " " + participant.Surname;
                    ViewBag.ParticipantLogo = participant.ParticipantUser.Image;
                    ViewBag.ParticipantCompany = participant.Company;
                    ViewBag.ParticipantID = participant.ParticipantID;

                    ParticipantSummary summary = await restClient.Get<ParticipantSummary>(baseUrl, $"/api/v1/mydashboard/summary/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    myDashboardPendings.ParticipantSummary = summary;

                    List<SelectionListItem> projects = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/assigned/participant/{participant.ParticipantID}/status/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    ViewBag.Projects = projects;

                    if (projects.Count > 0)
                    {
                        myDashboardPendings.ProjectID = projects[0].Key.Value;
                        myDashboardPendings.ProjectName = projects[0].Value;
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
            }
            catch (Exception ex)
            {
                ResponseModel response = new ResponseModel
                {
                    ErrorMessage = ex.Source + ": " + ex.Message
                };

                if (ex.InnerException != null)
                    response.ErrorMessage = response.ErrorMessage + ex.InnerException.ToString();
            }

            SetActiveOption("3124");
            ViewBag.Title = localizer["ViewTitleMyDashboard"];
            return View(myDashboardPendings);
        }

        [HttpGet]
        public async Task<JsonResult> GetPendingSummary(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            ParticipantSummary data = new ParticipantSummary();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<ParticipantSummary>(baseUrl, $"/api/v1/mydashboard/summary/participant/{participant.ParticipantID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingActivities(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingActivitiesMyDashboard> data = new List<PendingActivitiesMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingActivitiesMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/activities/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingMilestones(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingMilestonesMyDashboard> data = new List<PendingMilestonesMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingMilestonesMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/milestones/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingEvidences(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingEvidencesMyDashboard> data = new List<PendingEvidencesMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingEvidencesMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/evidences/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingControlPoints(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingEvidenceControlPointsMyDashboard> data = new List<PendingEvidenceControlPointsMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingEvidenceControlPointsMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/evidenceControlPoints/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingAgreements(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingAgreementsMyDashboard> data = new List<PendingAgreementsMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingAgreementsMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/meetingAgreements/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingIncidents(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingIncidentsMyDashboard> data = new List<PendingIncidentsMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingIncidentsMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/incidents/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingRisks(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingRisksMyDashboard> data = new List<PendingRisksMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingRisksMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/risks/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingMitigations(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingRiskMitigationsMyDashboard> data = new List<PendingRiskMitigationsMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingRiskMitigationsMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/riskMitigations/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingContingencies(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingRiskContingenciesMyDashboard> data = new List<PendingRiskContingenciesMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingRiskContingenciesMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/riskContingencies/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetPendingActionPlans(Guid projectId, bool onTime, bool delayed, bool withImpact)
        {
            List<PendingIncidentActionPlansMyDashboard> data = new List<PendingIncidentActionPlansMyDashboard>();
            try
            {
                Participant participant = await GetParticipant();
                data = await restClient.Get<List<PendingIncidentActionPlansMyDashboard>>(baseUrl, $"/api/v1/mydashboard/pending/incidentActionPlans/participant/{participant.ParticipantID}/project/{projectId}/onTime/{onTime}/delayed/{delayed}/withImpact/{withImpact}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        [HttpPut]
        public async Task<JsonResult> UpdatePendingElement(MyDashboardPendings m)
        {
            ResponseModel response = new ResponseModel();

            if (m.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                m.Status != (int)EnumFactory.ProjectElementStatus.Canceled &&
                m.Status != (int)EnumFactory.ProjectElementStatus.Archived)
            {
                if (m.WithImpact)
                {
                    m.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                }
                else
                {
                    m.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                }
            }

            switch (m.ElementType)
            {
                case (int)EnumFactory.ProjectElementType.Activity:
                case (int)EnumFactory.ProjectElementType.Milestone:
                    response = await UpdatePendingTask(m.ProjectID, m.ElementID, m.Status, m.Progress, m.Comments, m.ElementType);
                    break;
                case (int)EnumFactory.ProjectElementType.Evidence:
                    response = await UpdatePendingEvidence(m.ProjectID, m.ElementID, m.Status, m.Progress, m.Comments);
                    break;
                case (int)EnumFactory.ProjectElementType.Incident:
                    response = await UpdatePendingIncident(m.ProjectID, m.ElementID, m.Status, m.Progress, m.Comments);
                    break;
                case (int)EnumFactory.ProjectElementType.Risk:
                    response = await UpdatePendingRisk(m.ProjectID, m.ElementID, m.Status, m.Progress, m.Comments);
                    break;
                case (int)EnumFactory.ProjectElementType.Agreement:
                    response = await UpdatePendingAgreement(m.ProjectID, m.ParentID.Value, m.ElementID, m.Status, m.Progress, m.Comments);
                    break;
                case (int)EnumFactory.ProjectElementType.IncidentActionPlan:
                    response = await UpdatePendingActionPlan(m.ProjectID, m.ParentID.Value, m.ElementID, m.Status, m.Progress, m.Comments);
                    break;
                case (int)EnumFactory.ProjectElementType.RiskMitigation:
                    response = await UpdatePendingMitigation(m.ProjectID, m.ParentID.Value, m.ElementID, m.Status, m.Progress, m.Comments);
                    break;
                case (int)EnumFactory.ProjectElementType.Riskcontingency:
                    response = await UpdatePendingContingency(m.ProjectID, m.ParentID.Value, m.ElementID, m.Status, m.Progress, m.Comments);
                    break;
                case (int)EnumFactory.ProjectElementType.EvidenceControlPoint:
                    response = await UpdatePendingControlPoint(m.ProjectID, m.ParentID.Value, m.ElementID, m.Status, m.Progress, m.Comments);
                    break;
                default:
                    break;
            }

            return Json(response);
        }

        private async Task<ResponseModel> UpdatePendingTask(Guid projectId, Guid taskId, int status, double progress, string comment, int type) {
            
            ResponseModel response = new ResponseModel() {
                IsSuccess = false,
            };

            ProjectTask element = new ProjectTask();
            ProjectTask data = new ProjectTask();
            try
            {
                if (type == (int)EnumFactory.ProjectElementType.Activity)
                {
                    data = await restClient.Get<ProjectTask>(baseUrl, $"/api/v1/projects/{projectId}/tasks/{taskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    var dataChildren = await restClient.Get<ProjectTask>(baseUrl, $"/api/v1/projects/{projectId}/activities/{taskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                    data.Children = dataChildren.Children;
                }
                else
                {
                    data = await restClient.Get<ProjectTask>(baseUrl, $"/api/v1/projects/{projectId}/tasks/{taskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
                data.status = (short)status;
                data.progress = progress / 100;
                if (data.Children == 0)
                {
                    if (!string.IsNullOrWhiteSpace(data.start_date))
                        data.start_date = DateTime.Parse(data.start_date).ToString("yyyy-MM-dd");

                    if (!string.IsNullOrWhiteSpace(data.end_date))
                        data.end_date = DateTime.Parse(data.end_date).ToString("yyyy-MM-dd");

                    var result = await restClient.Put<OkObjectResult, ProjectTask>(baseUrl, $"/api/v1/projects/{projectId}/tasks/{taskId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
                if (type == (int)EnumFactory.ProjectElementType.Activity)
                {
                    element = await restClient.Get<ProjectTask>(baseUrl, $"/api/v1/projects/{projectId}/activities/{taskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
                else
                {
                    element = await restClient.Get<ProjectTask>(baseUrl, $"/api/v1/projects/{projectId}/milestones/{taskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                }
                
                if (element.Comment != comment)
                {
                    var i = CreateAnnotation(projectId, type, taskId, comment);
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

            return response;
        }

        private async Task<ResponseModel> UpdatePendingEvidence(Guid projectId, Guid evidenceId, int status, double progress, string comment)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<ProjectEvidence>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Status = status;
                data.Progress = progress;

                var result = await restClient.Put<OkObjectResult, ProjectEvidence>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (data.Comment != comment)
                {
                    var i = CreateAnnotation(projectId, (int)EnumFactory.ProjectElementType.Evidence, evidenceId, comment);
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

            return response;
        }

        private async Task<ResponseModel> UpdatePendingControlPoint(Guid projectId, Guid evidenceId, Guid controlPointId, int status, double progress, string comment)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<ProjectEvidenceControlPoint>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/controlpoints/{controlPointId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Status = status;
                data.Progress = progress;
                data.Comments = comment;

                var result = await restClient.Put<OkObjectResult, ProjectEvidenceControlPoint>(baseUrl, $"/api/v1/projects/{projectId}/evidences/{evidenceId}/controlpoints/{controlPointId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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

            return response;
        }

        private async Task<ResponseModel> UpdatePendingAgreement(Guid projectId, Guid meetingId, Guid agreementId, int status, double progress, string comment)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<ProjectMeetingAgreement>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/agreements/{agreementId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Status = status;
                data.Progress = progress;

                var result = await restClient.Put<OkObjectResult, ProjectMeetingAgreement>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/agreements/{agreementId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (data.Comments != comment)
                {
                    var i = CreateAnnotation(projectId, (int)EnumFactory.ProjectElementType.Agreement, agreementId, comment);
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

            return response;
        }

        private async Task<ResponseModel> UpdatePendingIncident(Guid projectId, Guid incidentId, int status, double progress, string comment)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<ProjectIncident>(baseUrl, $"/api/v1/projects/{projectId}/incidents/{incidentId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Status = status;
                data.Progress = progress;

                var result = await restClient.Put<OkObjectResult, ProjectIncident>(baseUrl, $"/api/v1/projects/{projectId}/incidents/{incidentId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (data.Comment != comment)
                {
                    var i = CreateAnnotation(projectId, (int)EnumFactory.ProjectElementType.Incident, incidentId, comment);
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

            return response;
        }

        private async Task<ResponseModel> UpdatePendingRisk(Guid projectId, Guid riskId, int status, double progress, string comment)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<ProjectRisk>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Status = status;
                data.Progress = progress;

                var result = await restClient.Put<OkObjectResult, ProjectRisk>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                if (data.Comment != comment)
                {
                    var i = CreateAnnotation(projectId, (int)EnumFactory.ProjectElementType.Risk, riskId, comment);
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

            return response;
        }

        private async Task<ResponseModel> UpdatePendingMitigation(Guid projectId, Guid riskId, Guid mitigationId, int status, double progress, string comment)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<ProjectRiskMitigation>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/mitigations/{mitigationId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Status = status;
                data.Progress = progress;
                data.Comments = comment;

                var result = await restClient.Put<OkObjectResult, ProjectRiskMitigation>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/mitigations/{mitigationId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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

            return response;
        }

        private async Task<ResponseModel> UpdatePendingContingency(Guid projectId, Guid riskId, Guid contingencyId, int status, double progress, string comment)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<ProjectRiskContingency>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/contingencies/{contingencyId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Status = status;
                data.Progress = progress;
                data.Comments = comment;

                var result = await restClient.Put<OkObjectResult, ProjectRiskContingency>(baseUrl, $"/api/v1/projects/{projectId}/risks/{riskId}/contingencies/{contingencyId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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

            return response;
        }

        private async Task<ResponseModel> UpdatePendingActionPlan(Guid projectId, Guid incidentId, Guid actionPlanId, int status, double progress, string comment)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var data = await restClient.Get<ProjectIncidentActionPlan>(baseUrl, $"/api/v1/projects/{projectId}/incident/{incidentId}/actionPlan/{actionPlanId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.Status = status;
                data.Progress = progress;
                data.Comments = comment;

                var result = await restClient.Put<ProjectIncidentActionPlan, ProjectIncidentActionPlan>(baseUrl, $"/api/v1/projects/{projectId}/incident/{incidentId}/actionPlan/{actionPlanId}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

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

            return response;
        }

        private async Task<bool> CreateAnnotation(Guid projectId, int type, Guid elementId, string annotation)
        {
            bool response = false;

            try
            {
                ProjectAnnotation data = new ProjectAnnotation()
                {
                    ProjectID = projectId,
                    ElementType = type,
                    ElementID = elementId,
                    Annotation = annotation
                };

                var result = await restClient.Post<ProjectAnnotation, ProjectAnnotation>(baseUrl, $"/api/v1/projects/{projectId}/elements/{elementId}/annotations", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response = true;
            }
            catch (HttpResponseException ex)
            {
            }
            catch (Exception ex)
            {
            }

            return response;
        }

        #endregion

        #region T I M E S H E E T S

        [PMCToolAuthorize(ObjectCode = "3124")]
        [HttpGet]
        public async Task<IActionResult> Timesheet()
        {
            TimeSheet m = new TimeSheet();

            Participant participant = await GetParticipant();
            if (participant.ParticipantID != null && participant.ParticipantID != Guid.Empty)
            {
                ViewBag.ParticipantName = participant.Name + " " + participant.Lastname + " " + participant.Surname;
                ViewBag.ParticipantLogo = participant.ParticipantUser.Image;
                ViewBag.ParticipantCompany = participant.Company;
                ViewBag.ParticipantID = participant.ParticipantID;

                List<SelectionListItem> projects = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/assigned/participant/{participant.ParticipantID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                ViewBag.Projects = projects;
                List<SelectionListItem> activities = new List<SelectionListItem>();
                ViewBag.Activities = activities;

                m.ParticipantID = participant.ParticipantID;
                if (projects.Count > 0)
                {
                    m.ProjectID = projects[0].Key.Value;
                    m.ProjectName = projects[0].Value;

                    activities = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{m.ProjectID}/activities/assigned/participant/{participant.ParticipantID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    activities = activities.OrderBy(o => o.Value).ToList();
                    ViewBag.Activities = activities;
                }
            }

            SetActiveOption("3124");
            ViewBag.Title = localizer["ViewTitleMyDashboard"];
            return View(m);
        }

        [HttpGet]
        public async Task<JsonResult> GetTimesheetChart(Guid participantId, Guid projectId, string date, int days)
        {
            List<ParticipantWorkedHours> data = new List<ParticipantWorkedHours>();
            try
            {
                data = await restClient.Get<List<ParticipantWorkedHours>>(baseUrl, $"/api/v1/mydashboard/workedhours/participant/{participantId}/project/{projectId}/todate/{date}/numberofdays/{days}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetTimesheetSummaryPerDay(Guid participantId, string date, int days)
        {
            List<ParticipantWorkedHours> data = new List<ParticipantWorkedHours>();
            try
            {
                data = await restClient.Get<List<ParticipantWorkedHours>>(baseUrl, $"/api/v1/mydashboard/workedhours/participant/{participantId}/todate/{date}/numberofdays/{days}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetTimesheetSummaryPerDayDetail(Guid participantId, string date)
        {
            List<ParticipantWorkedHoursByDay> data = new List<ParticipantWorkedHoursByDay>();
            try
            {
                data = await restClient.Get<List<ParticipantWorkedHoursByDay>>(baseUrl, $"/api/v1/mydashboard/workedhours/participant/{participantId}/byday/{date}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetTimeSheetsByParticipant(Guid participantId, int page, int size)
        {
            List<TimeSheetMyDashboard> data = new List<TimeSheetMyDashboard>();
            try
            {
                data = await restClient.Get<List<TimeSheetMyDashboard>>(baseUrl, $"/api/v1/mydashboard/timesheets/participant/{participantId}/page/{page}/size/{size}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetTimesheets(Guid participantId, Guid projectId, int page, int size)
        {
            List<TimeSheetMyDashboard> data = new List<TimeSheetMyDashboard>();
            try
            {
                data = await restClient.Get<List<TimeSheetMyDashboard>>(baseUrl, $"/api/v1/mydashboard/timesheets/participant/{participantId}/project/{projectId}/page/{page}/size/{size}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateTimesheet(TimeSheet data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                Participant participant = await GetParticipant();
                data.ParticipantID = participant.ParticipantID;
                var result = await restClient.Post<TimeSheet, TimeSheet>(baseUrl, $"/api/v1/timesheets", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateTimesheet(TimeSheet data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                Participant participant = await GetParticipant();
                data.ParticipantID = participant.ParticipantID;
                var result = await restClient.Put<OkObjectResult, TimeSheet>(baseUrl, $"/api/v1/timesheets/{data.TimeSheetID}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteTimesheet(TimeSheet data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/timesheets/{data.TimeSheetID}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region M E E T I N G S

        [PMCToolAuthorize(ObjectCode = "3124")]
        [HttpGet]
        public async Task<IActionResult> Meetings()
        {
            Participant participant = await GetParticipant();
            if (participant.ParticipantID != null && participant.ParticipantID != Guid.Empty)
            {
                ViewBag.ParticipantName = participant.Name + " " + participant.Lastname + " " + participant.Surname;
                ViewBag.ParticipantLogo = participant.ParticipantUser.Image;
                ViewBag.ParticipantCompany = participant.Company;
                ViewBag.ParticipantID = participant.ParticipantID;
            }


            SetActiveOption("3124");
            ViewBag.Title = localizer["ViewTitleMyDashboard"];
            return View(participant);
        }

        [HttpGet]
        public async Task<JsonResult> GetMeetings(Guid participantId, string fromDate, int pageNumber, int pageSize)
        {
            List<ProjectMeetingParticipantMyDashboard> data = new List<ProjectMeetingParticipantMyDashboard>();
            try
            {
                data = await restClient.Get<List<ProjectMeetingParticipantMyDashboard>>(baseUrl, $"/api/v1/mydashboard/meetings/participant/{participantId}/fromDate/{fromDate}/page/{pageNumber}/size/{pageSize}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetMeeting(Guid projectId, Guid meetingId)
        {
            ProjectMeeting data = new ProjectMeeting();
            data.ProjectMeetingTopic = new List<ProjectMeetingTopic>();

            try
            {
                data = await restClient.Get<ProjectMeeting>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data.ProjectMeetingTopic = await restClient.Get<List<ProjectMeetingTopic>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/topics", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region W O R K L O A D

        [PMCToolAuthorize(ObjectCode = "3124")]
        [HttpGet]
        public async Task<IActionResult> Workload()
        {
            Participant participant = await GetParticipant();
            if (participant.ParticipantID != null && participant.ParticipantID != Guid.Empty)
            {
                ViewBag.ParticipantName = participant.Name + " " + participant.Lastname + " " + participant.Surname;
                ViewBag.ParticipantLogo = participant.ParticipantUser.Image;
                ViewBag.ParticipantCompany = participant.Company;
                ViewBag.ParticipantID = participant.ParticipantID;

                ViewBag.StartDate = DateTime.Now.AddMonths(-1).ToString("yyyy-MM-dd");
                ViewBag.EndDate = DateTime.Now.AddMonths(1).ToString("yyyy-MM-dd");
            }

            SetActiveOption("3124");
            ViewBag.Title = localizer["ViewTitleMyDashboard"];
            return View(participant);
        }

        [HttpGet]
        public async Task<JsonResult> GetWorkloadByDay(Guid participantId, string startDate, string endDate)
        {
            List<ParticipantPlannedHoursByDate> data = new List<ParticipantPlannedHoursByDate>();
            try
            {
                var result = await restClient.Get<ParticipantPlannedHoursMyDashboard>(baseUrl, $"/api/v1/mydashboard/plannedhours/participant/{participantId}/startdate/{startDate}/enddate/{endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = result.TimeSheetByDate;
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
        public async Task<JsonResult> GetWorkloadByProject(Guid participantId, string startDate, string endDate)
        {
            List<ParticipantPlannedHoursByProject> data = new List<ParticipantPlannedHoursByProject>();
            try
            {
                var result = await restClient.Get<ParticipantPlannedHoursMyDashboard>(baseUrl, $"/api/v1/mydashboard/plannedhours/participant/{participantId}/startdate/{startDate}/enddate/{endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                data = result.TimeSheetByProject;
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
        public async Task<JsonResult> GetWorkloadData(Guid participantId, string startDate, string endDate)
        {
            ParticipantPlannedHoursMyDashboard data = new ParticipantPlannedHoursMyDashboard();
            try
            {
                data = await restClient.Get<ParticipantPlannedHoursMyDashboard>(baseUrl, $"/api/v1/mydashboard/plannedhours/participant/{participantId}/startdate/{startDate}/enddate/{endDate}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
            }
            catch (TaskCanceledException ex)
            {
                // Check ex.CancellationToken.IsCancellationRequested here.
                // If false, it's pretty safe to assume it was a timeout.
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
        public async Task<JsonResult> GetWorkloadDetail(Guid participantId, string date)
        {
            List<ParticipantPlannedHoursByDay> data = new List<ParticipantPlannedHoursByDay>();
            try
            {
                data = await restClient.Get<List<ParticipantPlannedHoursByDay>>(baseUrl, $"/api/v1/mydashboard/plannedhours/participant/{participantId}/byday/{date}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region C A L E N D A R

        [PMCToolAuthorize(ObjectCode = "3124")]
        [HttpGet]
        public async Task<IActionResult> Calendar()
        {
            Participant particpant = await GetParticipant();
            if (particpant.ParticipantID != null && particpant.ParticipantID != Guid.Empty)
            {
                ViewBag.ParticipantName = particpant.Name + " " + particpant.Lastname + " " + particpant.Surname;
                ViewBag.ParticipantLogo = particpant.ParticipantUser.Image;
                ViewBag.ParticipantCompany = particpant.Company;
                ViewBag.ParticipantID = particpant.ParticipantID;
            }

            SetActiveOption("3124");
            ViewBag.Title = localizer["ViewTitleMyDashboard"];
            return View();
        }
        [HttpGet]
        public async Task<JsonResult> getDataCalendar(int month, int year)
        {
            Participant participant = await GetParticipant();
            List<ParticipantCalendar> data = new List<ParticipantCalendar>();
            try
            {
                if (participant.ParticipantID != null && participant.ParticipantID != Guid.Empty)
                    data = await restClient.Get<List<ParticipantCalendar>>(baseUrl, $"/api/v1/mydashboard/calendar/participant/{participant.ParticipantID}/month/{month}/year/{year}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region N O T I F I C A T I O N S

        [PMCToolAuthorize(ObjectCode = "3124")]
        [HttpGet]
        public async Task<IActionResult> Notifications()
        {
            Participant participant = await GetParticipant();
            if (participant.ParticipantID != null && participant.ParticipantID != Guid.Empty)
            {
                ViewBag.ParticipantName = participant.Name + " " + participant.Lastname + " " + participant.Surname;
                ViewBag.ParticipantLogo = participant.ParticipantUser.Image;
                ViewBag.ParticipantCompany = participant.Company;
                ViewBag.ParticipantID = participant.ParticipantID;
            }

            SetActiveOption("3124");
            ViewBag.Title = localizer["ViewTitleMyDashboard"];
            return View(participant);
        }

        [HttpGet]
        public async Task<JsonResult> GetNotifications(string participantId, int pageNumber, int pageSize)
        {
            List<NotificationMyDashboard> data = new List<NotificationMyDashboard>();
            try
            {
                data = await restClient.Get<List<NotificationMyDashboard>>(baseUrl, $"/api/v1/mydashboard/notifications/participant/{participantId}/page/{pageNumber}/size/{pageSize}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetNotification(Guid id)
        {
            Notification data = new Notification();
            try
            {
                data = await restClient.Get<Notification>(baseUrl, $"/api/v1/notification/{id}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region G L O B A L

        public async Task<List<SelectionListItem>> GetAssignedTaskSelectionList(Guid projectId)
        {
            List<SelectionListItem> result = new List<SelectionListItem>();
            try
            {
                Participant participant = await GetParticipant();
                result = await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/projects/{projectId}/activities/assigned/participant/{participant.ParticipantID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                result = result.OrderBy(o => o.Value).ToList();
            }
            catch (Exception ex)
            {

            }

            return result;
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

        #endregion

    }
}