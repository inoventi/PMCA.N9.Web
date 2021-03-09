using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class PortfolioViewModel
    {
        public Dictionary<int,object> items { get; set; }
        public List<ProjectsByProgramId> Projects { get; set; }
        public List<PMCTool.Models.Environment.Program> Programs { get; set; }

        public PortfolioViewModel() {
            items = new Dictionary<int, object>();
            Projects = new List<ProjectsByProgramId>();
            Programs = new List<PMCTool.Models.Environment.Program>();
        }
    }
}
