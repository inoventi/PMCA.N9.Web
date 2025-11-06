using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Models;

namespace PMCTool.App.Controllers
{
    public class MainbitController : BaseController
    {
        private readonly IOptions<AppSettingsModel> _appSettings;
        private IHttpContextAccessor _httpContextAccessor;
        public MainbitController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer, IHttpContextAccessor httpContextAccessor) : base(appSettings,localizer)
        {
            _appSettings = appSettings;
            _httpContextAccessor = httpContextAccessor;
        }
        public ActionResult GrupoMainbit()
        {
            return View();
        }
        public ActionResult ProyectosInternos()
        {
            return View();
        }
    }
}
