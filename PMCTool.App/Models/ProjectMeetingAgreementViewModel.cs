using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectMeetingAgreementViewModel
    {
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }
        public int? ProjectPhase { get; set; }
        public int? ProjectChangeControl { get; set; }
        public bool ChangeControl { get; set; }
        public string ChangeControlComments { get; set; }
        public string ChangeControlAuthorizer { get; set; }
        public bool ChangeControlManual { get; set; }
        public bool ProjectEditable { get; set; }
        public ProjectMeetingAgreement ProjectMeetingAgreement { get; set; }

        public ProjectMeetingAgreementViewModel() 
        {
            ProjectMeetingAgreement = new ProjectMeetingAgreement();
            ChangeControl = false;
            ChangeControlManual = false;
        }
    }
}
