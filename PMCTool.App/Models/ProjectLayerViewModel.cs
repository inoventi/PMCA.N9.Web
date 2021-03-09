using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectLayerViewModel
    {
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }
        public List<ProjectLayer> Layers { get; set; }

        public ProjectLayerViewModel() {
            Layers = new List<ProjectLayer>();
        }
    }
}
