using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App
{
    public class AppSettings
    {
        private static AppSettings _appSettings;

        public string BaseUrl { get; set; }

        public string ImageLogicalPath { get; set; }
        public string FileStorage { get; set; }

        public string PmMenuCodes { get; set; }
        public string UrlPMCTool { get; set; }
        public string UrlAnalytics { get; set; }
        public string AppState { get; set; }

        public AppSettings(IConfiguration config)
        {
            this.BaseUrl = config.GetValue<string>("BaseUrl");
            this.ImageLogicalPath = config.GetValue<string>("ImageLogicalPath");
            this.FileStorage = config.GetValue<string>("FileStorage");
            this.PmMenuCodes = config.GetValue<string>("PmMenuCodes");
            this.AppState = config.GetValue<string>("AppState");
            this.UrlPMCTool = config.GetValue<string>("UrlPMCTool");
            this.UrlAnalytics = config.GetValue<string>("UrlAnalytics");

            _appSettings = this;
        }

        public static AppSettings Current
        {
            get
            {
                if (_appSettings == null)
                {
                    _appSettings = GetCurrentSettings();
                }

                return _appSettings;
            }
        }

        public static AppSettings GetCurrentSettings()
        {
            var builder = new ConfigurationBuilder()
              .SetBasePath(AppContext.BaseDirectory)
              .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
              .AddEnvironmentVariables();
            IConfigurationRoot configuration = builder.Build();

            var settings = new AppSettings(configuration.GetSection("AppSettings"));
            return settings;
        }
    }
}
