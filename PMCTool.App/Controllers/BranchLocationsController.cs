using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using PMCTool.App.Models;

namespace PMCTool.App.Controllers
{
    public class BranchLocationsController : BaseController
    {
        public BranchLocationsController(IOptions<AppSettingsModel> appSettings, IStringLocalizer<SharedResource> localizer) : base(appSettings, localizer)
        {

        }
        public IActionResult Index()
        {
            return View();
        }
    }
}
