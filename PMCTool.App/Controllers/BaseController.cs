using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using PMCTool.App.Models;
using PMCTool.Common.RestConnector;
using PMCTool.Models.Core;
using PMCTool.Models.Exceptions;
using Syncfusion.HtmlConverter;
using Syncfusion.Pdf;
using System;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace PMCTool.App.Controllers
{
    public class BaseController : Controller
    {
        public RestClient restClient;
        public string baseUrl;
        public readonly IStringLocalizer<SharedResource> localizer;
        public int? participantRole;
        public Guid? participantId;
        public string pdfUrl; 
        public string PlatformRun; 
        public ResponseModel responseModel;

        public BaseController(
                    IOptions<AppSettingsModel> appSettings,
                    IStringLocalizer<SharedResource> localizer)
        {
            this.restClient = new RestClient();
            this.baseUrl = appSettings.Value.BaseUrl;
            this.pdfUrl = appSettings.Value.UrlPDFViews;  
            this.localizer = localizer;
            this.PlatformRun = appSettings.Value.PlatformRun;

        }

        public ApiError GetApiError(string json)
        {
            return JsonConvert.DeserializeObject<ApiError>(json);
        }
        protected FileContentResult ExportToPDF(string requestParametersModel,string url, IHostingEnvironment _hostingEnvironment)
        {
            try
            {
                HtmlToPdfConverter htmlConverter = new HtmlToPdfConverter(HtmlRenderingEngine.WebKit);
                WebKitConverterSettings settings = new WebKitConverterSettings();
                if (PlatformRun == "Windows") {
                    settings.WebKitPath = Path.Combine(_hostingEnvironment.ContentRootPath, "References/QtBinariesWindows"); 
                }
                if (PlatformRun == "Linux")
                {
                   settings.WebKitPath = Path.Combine(_hostingEnvironment.ContentRootPath, "References/QtBinariesLinux");

                }
                settings.EnableJavaScript = true;
                settings.Margin = new Syncfusion.Pdf.Graphics.PdfMargins { Top = 20, Left = 30, Right = 30, Bottom = 30 };
                htmlConverter.ConverterSettings = settings;
                string token = requestParametersModel + "|" + GetTokenValue("Token"); 
                PdfDocument document = htmlConverter.Convert(pdfUrl + url + token);
                MemoryStream stream = new MemoryStream();
                document.Save(stream);
                FileContentResult archivo = File(stream.ToArray(), System.Net.Mime.MediaTypeNames.Application.Pdf, "Output.pdf");
                return archivo;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        protected string GetTokenValue(string key)
        {
            string value = "";
            string token = string.Empty;
            if (HttpContext != null && HttpContext.Request != null && HttpContext.Request.Cookies.ContainsKey("pmctool-token-app"))
                token = HttpContext.Request.Cookies["pmctool-token-app"];

            if (!string.IsNullOrEmpty(token))
            {
                var handler = new JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);

                switch (key)
                {
                    case "Token":
                        value = token;
                        break;

                    case "UserId":
                        value = jwt.Claims.FirstOrDefault(x => x.Type == "jti").Value;
                        break;

                    case "LoginId":
                        value = jwt.Claims.FirstOrDefault(x => x.Type == "sub").Value;
                        break;

                    default:
                        value = jwt.Claims.FirstOrDefault(x => x.Type == key).Value;
                        break;
                }
            }

            return value;
        }

        protected void SetActiveOption(string option)
        {
            HttpContext.Response.Cookies.Append("pmctool-option", option, new CookieOptions() { IsEssential = true });
        }

        protected string EnsureCorrectFilename(string filename)
        {
            if (filename.Contains("\\"))
                filename = filename.Substring(filename.LastIndexOf("\\") + 1);

            return filename;
        }

        protected string ConvertBulkResponse(BulkLoad result)
        {
            if (!result.HasErrors)
            {
                return localizer.GetString("SuccessMsg");
            }
            var message = new StringBuilder();
            message.AppendLine(localizer["BulkLoadResultTitle"]);
            message.AppendLine("<br />");
            foreach (RowError r in result.Errors)
            {
                message.AppendLine($"{localizer["Line"]} # : {r.RowNumber}");
                message.AppendLine("<br />");
                foreach (var e in r.ErrorDetails)
                {
                    message.AppendLine($"- {localizer[e.Code.ToString()]}"); 
                    message.AppendLine("<br />");
                }

                message.AppendLine("<br />");
            }

            return message.ToString();
        }

        protected DateTime DateTimeCultureInvariant(DateTime date)
        {
            CultureInfo currentCulture = Thread.CurrentThread.CurrentCulture;
            if(currentCulture.Name == "es-MX")
            {
                return new DateTime(date.Year, date.Month, date.Day);
            }
            
            else
            {
                return new DateTime(date.Year, date.Day, date.Month);
            }
        }

    }
}