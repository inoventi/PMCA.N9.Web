using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PMCTool.Models.Environment;

namespace PMCTool.App.Models
{
    public class ProjectViewModel
    {
        public Project Project { get; set; }
        public Company Company { get; set; }
        public ProjectIndicator ProjectIndicator { get; set; }
        public string ProjectAcquiredValueStartDate { get; set; }
        public string ProjectAcquiredValueEndDate { get; set; }
    }
}
