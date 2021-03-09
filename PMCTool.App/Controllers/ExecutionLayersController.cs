using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
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
        [PMCToolAuthorize(ObjectCode = "3120")]
        [HttpGet]
        public async Task<IActionResult> Layers(Guid? id)
        {
            if (id == null || id == Guid.Empty)
                return RedirectToAction("Projects");

            var data = new ProjectLayerViewModel();
            try
            {
                var projectParticipant = await restClient.Get<ProjectParticipant>(baseUrl, $"/api/v1/projectparticipant/project/{id}/participant", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (projectParticipant == null)
                    return RedirectToAction("Projects");

                var project = await restClient.Get<Project>(baseUrl, $"/api/v1/projects/{id}/type/{((int)EnumFactory.ProjectType.Project).ToString()}", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
                if (project == null)
                    return RedirectToAction("Projects");

                var pp = await GetProjectParticipant(id.Value);
                if (pp.Role == (int)EnumFactory.ParticipantRole.Participant || pp.Role == (int)EnumFactory.ParticipantRole.Guest)
                    return RedirectToAction("Projects");

                data.ProjectID = project.ProjectID;
                data.ProjectName = project.Name;

                data.Layers = await restClient.Get<List<ProjectLayer>>(baseUrl, $"/api/v1/projects/{id}/layers", new Dictionary<string, string>() { { "Authorization", GetTokenValue("Token") } });
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
            ViewBag.Title = localizer["ViewTitleProjectExecution"] + " : " + localizer["Layers"];
            return View(data);
        }
    }
}