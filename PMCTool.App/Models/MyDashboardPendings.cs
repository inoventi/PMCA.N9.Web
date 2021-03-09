using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class MyDashboardPendings
    {
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }
        public Guid ElementID { get; set; }
        public int ElementType { get; set; }
        public Guid? ParentID { get; set; }
        public int Status { get; set; }
        public double Progress { get; set; }
        public string Comments { get; set; }
        public bool WithImpact { get; set; }
        public ParticipantSummary ParticipantSummary { get; set; }
    }
}
