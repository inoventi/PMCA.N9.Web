using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DinkToPdf;
using DinkToPdf.Contracts;
using DocumentFormat.OpenXml.Office.CustomUI;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
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
    public partial class ExecutionController : BaseController
    {
        #region P R O J E C T  M E E T I N G S

        #region M E E T I N G S

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Meetings(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            var data = new ProjectMeetingViewModel();
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
                data.ProjectEditable = project.ProjectEditable;
                data.ProjectIndicator = await restClient.Get<ProjectIndicator>(baseUrl, $"/api/v1/projects/{id}/indicators/meetings", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                var pp = await GetProjectParticipant(id.Value);
                ViewBag.Role = pp.Role;

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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Meetings"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Meeting(Guid? projectId, Guid? meetingId)
        {
            ProjectMeetingDetailViewModel data = new ProjectMeetingDetailViewModel();

            try
            {
                if (projectId == null || projectId == Guid.Empty)
                    return RedirectToAction("Meetings");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Meetings");

                var pp = await GetProjectParticipant(projectId.Value);
                ViewBag.Role = pp.Role;

                if (pp.Role != (int)EnumFactory.ParticipantRole.ProjectManager)
                    return RedirectToAction("Meetings");

                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectEditable = project.ProjectEditable;
                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{project.ProjectID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);

                if (meetingId == null)
                {
                    data.IsNew = true;
                }
                else
                {
                    data.IsNew = false;

                    var meeting = await restClient.Get<ProjectMeeting>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    if (meeting == null)
                        return RedirectToAction("Meetings");

                    data.ProjectMeetingID = meeting.ProjectMeetingID;
                    data.ProjectMeeting = meeting;
                }

                ViewBag.Participants = participants;
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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Meeting"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Agreements(Guid? id)
        {
            ProjectMeetingDetailViewModel data = new ProjectMeetingDetailViewModel();

            try
            {
                if (id == null || id == Guid.Empty)
                    return RedirectToAction("Projects");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Projects");

                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectPhase = project.Phase;
                data.ProjectChangeControl = project.ChangeManagement;
                data.ProjectEditable = project.ProjectEditable;
                data.ProjectPhase = project.Phase;
                data.ProjectChangeControl = project.ChangeManagement;

                if (project.Phase != null && project.Phase != 1 && project.ChangeManagement == (int)EnumFactory.ProjectChangeManagement.Optional)
                    data.ChangeControl = true;

                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{project.ProjectID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);
                ViewBag.Participants = participants;

                var pp = await GetProjectParticipant(id.Value);
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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Agreements"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Agreement(Guid? projectId, Guid? meetingId)
        {
            ProjectMeetingDetailViewModel data = new ProjectMeetingDetailViewModel();

            try
            {
                if (projectId == null || projectId == Guid.Empty)
                    return RedirectToAction("Meetings");

                if (meetingId == null || meetingId == Guid.Empty)
                    return RedirectToAction("Meetings");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Meetings");

                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectEditable = project.ProjectEditable;
                var meeting = await restClient.Get<ProjectMeeting>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (meeting == null)
                    return RedirectToAction("Meetings");

                var pp = await GetProjectParticipant(projectId.Value);
                if (pp == null)
                    return RedirectToAction("AccessNotAllowed", "Home");

                ViewBag.Role = pp.Role;

                //if (pp.Role == 5)
                //    return RedirectToAction("Meetings");

                data.ProjectMeetingID = meeting.ProjectMeetingID;
                data.ProjectMeeting = meeting;
                data.ProjectPhase = project.Phase;
                data.ProjectChangeControl = project.ChangeManagement;

                if (project.Phase != null && project.Phase != 1 && project.ChangeManagement == (int)EnumFactory.ProjectChangeManagement.Optional)
                    data.ChangeControl = true;

                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{project.ProjectID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);
                ViewBag.Participants = participants;

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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Agreements"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> AgreementDetail(Guid? projectId, Guid? meetingId, Guid? agreementId)
        {
            ProjectMeetingAgreementViewModel data = new ProjectMeetingAgreementViewModel();

            try
            {
                if (projectId == null || projectId == Guid.Empty)
                    return RedirectToAction("Agreements");

                if (meetingId == null || meetingId == Guid.Empty)
                    return RedirectToAction("Agreements");

                if (agreementId == null || agreementId == Guid.Empty)
                    return RedirectToAction("Agreements");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Agreements");
                
                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;
                data.ProjectEditable = project.ProjectEditable;
                data.ProjectMeetingAgreement = await restClient.Get<ProjectMeetingAgreement>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/agreements/{agreementId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (data.ProjectMeetingAgreement == null)
                    return RedirectToAction("Agreements");

                var pp = await GetProjectParticipant(projectId.Value);
                if (pp == null)
                    return RedirectToAction("AccessNotAllowed", "Home");

                ViewBag.Role = pp.Role;

                data.ProjectPhase = project.Phase;
                data.ProjectChangeControl = project.ChangeManagement;

                if (project.Phase != null && project.Phase != 1 && project.ChangeManagement == (int)EnumFactory.ProjectChangeManagement.Optional)
                    data.ChangeControl = true;

                var participants = SelectionListHelper.AddNullOption(await restClient.Get<List<SelectionListItem>>(baseUrl, $"/api/v1/participants/project/{project.ProjectID}/selectionList", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } }), localizer["SelectListNotAssignedItem"]);
                ViewBag.Participants = participants;
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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Agreement"];
            return View(data);
        }

        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> MeetingTemplate(Guid? projectId, Guid? meetingId)
        {
            MeetingNoteTemplate m = new MeetingNoteTemplate();
            string meetingHTML = "";
            string headerPath = "";
            string footerPath = "";
            List<string> pages = new List<string>();

            try
            {
                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{projectId}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                m = await restClient.Get<MeetingNoteTemplate>(baseUrl, $"/api/v1/meetingNoteTemplates/{project.MeetingNoteTemplateID}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (m != null)
                {
                    var meeting = await restClient.Get<ProjectMeeting>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    var meetingNotes = await restClient.Get<List<ProjectMeetingNote>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/notes", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    var meetingAgreements = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    var meetingParticipants = await restClient.Get<List<ProjectMeetingParticipant>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/participants", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                    var meetingTopics = await restClient.Get<List<ProjectMeetingTopic>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/topics", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });

                    string notes = "";
                    string agreements = "";
                    string participants = "";
                    string topics = "";
                    string participantsSignature = "";
                    int agreementCount = 1;
                    int signatureCount = 0;

                    foreach (var agreement in meetingAgreements)
                    {
                        string[] date = agreement.PlannedEndDate.ToString().Split(' ');
                        agreements = agreements + "<tr><td style='text-align: center;'>" + agreementCount +
                                                "</td><td style='text-align: justify;'>" + agreement.Description +
                                                "</td><td style='text-align: center;'>" + date[0] +
                                                "</td><td style='text-align: center;'>" + agreement.ResponsibleName +
                                                "</td><td style='text-align: justify;'>" + agreement.Comments + "</td></tr>";
                        agreementCount++;
                    }

                    participantsSignature = "<table width='100%' cellspacing='100'><tr>";
                    foreach (var participant in meetingParticipants)
                    {
                        participants = participants + "<tr><td>" + participant.Name + "</td><td>Requiere su participación</td></tr>";

                        if (signatureCount < 3)
                        {
                            participantsSignature += "<td width='33%' style='text-align: center; border-top: 1px solid;'>" + participant.Name + "</td>";
                            signatureCount++;
                        }
                        else
                        {
                            participantsSignature += "</tr><tr>";
                            participantsSignature += "<td width='33%' style='text-align: center; border-top: 1px solid;'>" + participant.Name + "</td>";
                            signatureCount = 1;
                        }
                    }
                    participantsSignature += "</tr></table>";

                    foreach (var topic in meetingTopics)
                    {
                        topics = topics + "<tr><td style='text-align: justify; padding-right: 15px;'>" + topic.Topic + " " + topic.Description + "</td><td>" +
                            localizer.GetString("EnumProjectElementType_" + ((int)topic.ElementType).ToString()) + "</td></tr>";
                    }

                    foreach (var note in meetingNotes)
                    {
                        notes = notes + note.Note + "<br/><br/>";
                    }
                    var notcomments = localizer["MeetingTemplete001"];
                    notes = (notes == "") ? notcomments : notes;

                    meetingHTML = m.Template
                           .Replace("#=meeting.objetive#", meeting.Objective)
                           .Replace("#=meeting.duration#", meeting.Duration)
                           .Replace("#=meeting.meetingDate#", meeting.MeetingDate)
                           .Replace("#=meeting.meetingTime#", meeting.MeetingTime)
                           .Replace("#=meeting.place#", meeting.Place)
                           .Replace("#=meeting.comments#", notes)
                           .Replace("#=meeting.participants#", participants)
                           .Replace("#=meeting.topics#", topics)
                           .Replace("#=meeting.agreements#", agreements)
                           .Replace("#=meeting.participantSignature#", participantsSignature);


                    if (meetingHTML.Contains("#=pageBreak#"))
                    {
                        var splitHtml = meetingHTML.Split("#=pageBreak#");

                        for(var i = 0; i < splitHtml.Length; i++)
                        {
                            pages.Add(splitHtml[i]);
                        }

                    }

                    else
                    {
                        pages.Add(meetingHTML);
                    }

                    //*****************************************************************
                    // TEMPORARY HEADER FILE
                    //*****************************************************************
                    headerPath = Path.Combine(_hostingEnvironment.ContentRootPath, @"Temp/" + m.MeetingNoteTemplateID + "_header.html");
                    using (FileStream fs = new FileStream(headerPath, FileMode.Create))
                    {
                        using (StreamWriter w = new StreamWriter(fs, Encoding.UTF8))
                        {
                            w.WriteLine("<!DOCTYPE html>");
                            w.WriteLine("<div style='display: inline-table!important; flex-direction: row!important; width: 100% !important;'>");
                            w.WriteLine("<div style='display: table-cell!important; height: 175px!important;'>");
                            w.Write(m.Header);
                            w.WriteLine("</div></div>");
                        }
                    }
                    //*****************************************************************
                    // TEMPORARY FOOTER FILE
                    //*****************************************************************
                    footerPath = Path.Combine(_hostingEnvironment.ContentRootPath, @"Temp/" + m.MeetingNoteTemplateID + "_footer.html");
                    using (FileStream fs = new FileStream(footerPath, FileMode.Create))
                    {
                        using (StreamWriter w = new StreamWriter(fs, Encoding.UTF8))
                        {
                            w.WriteLine("<!DOCTYPE html>");
                            w.WriteLine("<div style='display: inline-table!important; flex-direction: row!important; width: 100% !important;'>");
                            w.WriteLine("<div style='display: table-cell!important; height: 90px!important;'>");
                            w.Write(m.Footer);
                            w.WriteLine("</div></div>");
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
            
            var doc = new HtmlToPdfDocument()
            {
                GlobalSettings = {
                    ColorMode = ColorMode.Color,
                    Orientation = Orientation.Portrait,
                    Margins = new MarginSettings() { Top = 40, Right = 10, Bottom =  22, Left = 10 },
                    DocumentTitle = "Minuta PDF",
                    PaperSize = PaperKind.Letter,
                },
            };

            foreach(var item in pages)
            {
                var page = new ObjectSettings()
                {
                    HtmlContent = item,
                    WebSettings = { DefaultEncoding = "utf-8" },
                    HeaderSettings = { FontName = "Arial", FontSize = 9, Line = false, HtmUrl = headerPath },
                    FooterSettings = { FontName = "Arial", FontSize = 9, Line = false, HtmUrl = footerPath}
                };
                doc.Objects.Add(page);
            }

            SetActiveOption("3120");
            var file = _converter.Convert(doc);

            try
            {
                if (System.IO.File.Exists(headerPath))
                {
                    System.IO.File.Delete(headerPath);
                }

                if (System.IO.File.Exists(footerPath))
                {
                    System.IO.File.Delete(footerPath);
                }
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

            return File(file, "application/pdf");

        }   
        [HttpGet]
        public async Task<JsonResult> GetMeetings(Guid projectId)
        {
            var data = new List<ProjectMeeting>();
            try
            {
                data = await restClient.Get<List<ProjectMeeting>>(baseUrl, $"/api/v1/projects/{projectId}/meetings", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CreateMeeting(ProjectMeeting meeting, List<ProjectMeetingParticipant> participants, List<ProjectMeetingTopic> topics)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                meeting.Date = DateTime.Parse(meeting.MeetingDate + " " + meeting.MeetingTime);
                meeting.ProjectMeetingParticipant = participants;
                meeting.ProjectMeetingTopic = topics;

                var result = await restClient.Post<ProjectMeeting, ProjectMeeting>(baseUrl, $"/api/v1/projects/{meeting.ProjectID}/meetings", meeting, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                response.ValueString = result.ProjectMeetingID.ToString();
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
        public async Task<JsonResult> CreateMeetingInvite(ProjectMeeting meeting)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Post<ProjectMeeting, ProjectMeeting>(baseUrl, $"/api/v1/projects/{meeting.ProjectID}/meetings/{meeting.ProjectMeetingID}/invite", meeting, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateMeeting(
            ProjectMeeting meeting, List<ProjectMeetingParticipant> participants, List<ProjectMeetingTopic> topics, 
            List<Guid> removedParticipants, List<Guid> removedTopics)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                meeting.Date = DateTime.Parse(meeting.MeetingDate + " " + meeting.MeetingTime);
                meeting.ProjectMeetingParticipant = participants;
                meeting.ProjectMeetingTopic = topics;

                foreach (var item in removedParticipants)
                {
                    var participant = new ProjectMeetingParticipant() {
                        ProjectMeetingParticipantID = item,
                        Operation = (int)EnumFactory.ProjectMeetingOperation.Deleted,
                    };

                    meeting.ProjectMeetingParticipant.Add(participant);
                }

                foreach (var item in removedTopics)
                {
                    var topic = new ProjectMeetingTopic() {
                        ProjectMeetingTopicID = item,
                        Operation = (int)EnumFactory.ProjectMeetingOperation.Deleted,
                    };

                    meeting.ProjectMeetingTopic.Add(topic);
                }

                var result = await restClient.Put<OkObjectResult, ProjectMeeting>(baseUrl, $"/api/v1/projects/{meeting.ProjectID}/meetings/{meeting.ProjectMeetingID}", meeting, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> UpdateAgreement(
            ProjectMeeting meeting, List<ProjectMeetingParticipant> participants, List<ProjectMeetingTopic> topics,
            List<ProjectMeetingAgreement> agreements, List<ProjectMeetingNote> notes,
            List<Guid> removedParticipants, List<Guid> removedTopics,
            List<Guid> deletedAgreements, List<Guid> deletedNotes)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                meeting.Date = DateTime.Parse(meeting.MeetingDate + " " + meeting.MeetingTime);
                meeting.ProjectMeetingParticipant = participants;
                meeting.ProjectMeetingTopic = topics;
                meeting.ProjectMeetingAgreement = agreements;
                meeting.ProjectMeetingNote = notes;

                foreach (var item in removedParticipants)
                {
                    var participant = new ProjectMeetingParticipant()
                    {
                        ProjectMeetingParticipantID = item,
                        Operation = (int)EnumFactory.ProjectMeetingOperation.Deleted,
                    };

                    meeting.ProjectMeetingParticipant.Add(participant);
                }

                foreach (var item in removedTopics)
                {
                    var topic = new ProjectMeetingTopic()
                    {
                        ProjectMeetingTopicID = item,
                        Operation = (int)EnumFactory.ProjectMeetingOperation.Deleted,
                    };

                    meeting.ProjectMeetingTopic.Add(topic);
                }

                foreach (var item in deletedAgreements)
                {
                    var agreement = new ProjectMeetingAgreement()
                    {
                        ProjectMeetingAgreementID = item,
                        Operation = (int)EnumFactory.ProjectMeetingOperation.Deleted,
                    };

                    meeting.ProjectMeetingAgreement.Add(agreement);
                }

                foreach (var item in deletedNotes)
                {
                    var note = new ProjectMeetingNote()
                    {
                        ProjectMeetingNoteID = item,
                        Operation = (int)EnumFactory.ProjectMeetingOperation.Deleted,
                    };

                    meeting.ProjectMeetingNote.Add(note);
                }

                var result = await restClient.Put<OkObjectResult, ProjectMeeting>(baseUrl, $"/api/v1/projects/{meeting.ProjectID}/meetings/{meeting.ProjectMeetingID}", meeting, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteMeeting(Guid projectId, Guid meetingId)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region A G R E E M E N T S

        [HttpGet]
        public async Task<JsonResult> GetAgreements(Guid projectId)
        {
            List<ProjectMeetingAgreement> data = new List<ProjectMeetingAgreement>();
            try
            {
                var pp = await GetProjectParticipant(projectId);
                if (pp != null && pp.Role != null)
                    data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"api/v1/projects/{projectId}/participants/{pp.ParticipantID}/roles/{pp.Role}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetMeetingAgreements(Guid projectId, Guid? meetingId)
        {
            var data = new List<ProjectMeetingAgreement>();
            try
            {
                if (meetingId == null || meetingId == Guid.Empty)
                    return Json(data);

                data = await restClient.Get<List<ProjectMeetingAgreement>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/agreements", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetMeetingAgreement(Guid projectId, Guid meetingId, Guid agreementId)
        {
            var data = new ProjectMeetingAgreement();
            try
            {
                data = await restClient.Get<ProjectMeetingAgreement>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/agreements/{agreementId}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> GetMeetingAgreementsCount(Guid projectId, Guid? meetingId)
        {
            int data = 0;
            try
            {
                if (meetingId == null || meetingId == Guid.Empty)
                    return Json(data);

                data = await restClient.Get<int>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/agreements/count", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> PutAgreement(ProjectMeetingAgreement data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                if (data.Status != (int)EnumFactory.ProjectElementStatus.Closed &&
                    data.Status != (int)EnumFactory.ProjectElementStatus.Canceled)
                {
                    if (data.WithImpact)
                    { 
                        data.Status = (int)EnumFactory.ProjectElementStatus.WithImpact;
                    }
                    else
                    {
                        data.Status = (int)EnumFactory.ProjectElementStatus.OnTime;
                    }
                }

                var result = await restClient.Put<OkObjectResult, ProjectMeetingAgreement>(baseUrl, $"/api/v1/projects/{data.ProjectID}/meetings/{data.ProjectMeetingID}/agreements/{data.ProjectMeetingAgreementID}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> CancelAgreement(ProjectMeetingAgreement data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Patch<OkObjectResult, string>(baseUrl, $"/api/v1/projects/{data.ProjectID.ToString()}/meetings/{data.ProjectMeetingID.ToString()}/agreements/{data.ProjectMeetingAgreementID.ToString()}", "", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
        public async Task<JsonResult> DeleteAgreement(ProjectMeetingAgreement data)
        {
            ResponseModel response = new ResponseModel()
            {
                IsSuccess = false,
            };

            try
            {
                var result = await restClient.Delete<OkObjectResult, ProjectMeetingAgreement>(baseUrl, $"/api/v1/projects/{data.ProjectID}/meetings/{data.ProjectMeetingID}/agreements/{data.ProjectMeetingAgreementID}", data, new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region N O T E S

        [HttpGet]
        public async Task<JsonResult> GetMeetingNotes(Guid projectId, Guid? meetingId)
        {
            var data = new List<ProjectMeetingNote>();
            try
            {
                if (meetingId == null || meetingId == Guid.Empty)
                    return Json(data);

                data = await restClient.Get<List<ProjectMeetingNote>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/notes", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region P A R T I C I P A N T S

        [HttpGet]
        public async Task<JsonResult> GetMeetingParticipants(Guid projectId, Guid? meetingId)
        {
            var data = new List<ProjectMeetingParticipant>();
            try
            {
                if (meetingId == null || meetingId == Guid.Empty)
                    return Json(data);

                data = await restClient.Get<List<ProjectMeetingParticipant>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/participants", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #region T O P I C S

        [HttpGet]
        public async Task<JsonResult> GetMeetingTopics(Guid projectId, Guid? meetingId)
        {
            var data = new List<ProjectMeetingTopic>();
            try
            {
                if (meetingId == null || meetingId == Guid.Empty)
                    return Json(data);

                data = await restClient.Get<List<ProjectMeetingTopic>>(baseUrl, $"/api/v1/projects/{projectId}/meetings/{meetingId}/topics", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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

        #endregion
    }
}