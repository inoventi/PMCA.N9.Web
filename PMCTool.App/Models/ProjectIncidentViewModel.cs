using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectIncidentViewModel
    {
        public Guid ProjectIncidentID { get; set; }
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }
        public Guid ElementID { get; set; }
        public string ElementName { get; set; }

        public int? ProjectPhase { get; set; }
        public int? ProjectChangeControl { get; set; }
        public bool ChangeControl { get; set; }
        public string ChangeControlComments { get; set; }
        public string ChangeControlAuthorizer { get; set; }
        public bool ChangeControlManual { get; set; }
        public bool ProjectEditable { get; set; }
        public int? ParticipantRole { get; set; }
        public ProjectIncident ProjectIncident { get; set; }
        public ProjectIndicator ProjectIndicator { get; set; }

        public ProjectIncidentViewModel()
        {
            ProjectIncident = new ProjectIncident();
            ChangeControl = false;
            ChangeControlManual = false;
        }
    }
}
