using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace PMCTool.App.Controllers
{
    public class ProjectIndicatorsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Indicator()
        {
            return View();
        }
    }
}
