using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectEvidenceViewModel
    {
        public Guid ProjectEvidenceID { get; set; }
        public Guid ActivityID { get; set; }
        public string ActivityName { get; set; }
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }
        public Guid? LayerID { get; set; }
        public string LayerName { get; set; }
        public Guid? LayerParentID { get; set; }
        public string LayerParentName { get; set; }

        public int? ProjectPhase { get; set; }
        public int? ProjectChangeControl { get; set; }
        public bool ChangeControl { get; set; }
        public string ChangeControlComments { get; set; }
        public string ChangeControlAuthorizer { get; set; }
        public bool ChangeControlManual { get; set; }
        public bool ProjectEditable { get; set; }
        public int? ParticipantRole { get; set; }
        public string NavBack { get; set; }

        public ProjectEvidence ProjectEvidence { get; set; }
        public ProjectIndicator ProjectIndicator { get; set; }

        public ProjectEvidenceViewModel()
        {
            ProjectEvidence = new ProjectEvidence();
            ChangeControl = false;
            ChangeControlManual = false;
        }
    }
}
