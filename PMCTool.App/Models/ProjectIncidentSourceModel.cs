using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PMCTool.Models.Environment;

namespace PMCTool.App.Models
{
    public class ProjectIncidentSourceModel
    {
        public Guid ProjectID { get; set; }
        public Guid ElementID { get; set; }
        public int ElementType { get; set; }
        public string TypeName { get; set; }
        public string Description { get; set; }
        public string PlannedStartDate { get; set; }
        public string PlannedEndDate { get; set; }
        public double Progress { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; }
        public bool WithImpact { get; set; }
        public string Comment { get; set; }
        public bool EditableByRol { get; set; }

        public ProjectIncidentSourceModel() {
        }

    }
}
