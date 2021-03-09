using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectRiskDetailViewModel
    {
        
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }
        public Guid ProjectRiskID { get; set; }
        public Guid ProjectRiskMitigationID { get; set; }
        public Guid ProjectRiskContingencyID { get; set; }
        public ProjectRisk ProjectRisk { get; set; }
        public ProjectRiskMitigation ProjectRiskMitigation { get; set; }
        public ProjectRiskContingency ProjectRiskContingency { get; set; }
        public bool ProjectEditable { get; set; }
        public int? ParticipantRole { get; set; }

        public ProjectRiskDetailViewModel()
        {
            ProjectRisk = new ProjectRisk();
            ProjectRiskMitigation = new ProjectRiskMitigation();
            ProjectRiskContingency = new ProjectRiskContingency();
        }
    }
}
