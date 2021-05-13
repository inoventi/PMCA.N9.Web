using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class AppSettingsModel
    {
        public string BaseUrl { get; set; }
        public string ImageLogicalPath { get; set; }
        public string FileStorage { get; set; }
        public string PmMenuCodes { get; set; }
        public string UrlPMCTool { get; set; }
        public string UrlPDFViews { get; set; }
        public string UrlAPP { get; set; }
        public string PlatformRun { get; set; }
    }
}
