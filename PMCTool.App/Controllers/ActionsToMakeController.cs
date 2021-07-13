using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using PMCTool.App.Attributes;

namespace PMCTool.App.Controllers
{
    public class ActionsToMakeController : Controller
    {
        [PMCToolAuthentication]
        public IActionResult Index()
        {
            return View();
        }
    }
}
