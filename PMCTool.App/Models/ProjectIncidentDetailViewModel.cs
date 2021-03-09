using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectIncidentDetailViewModel
    {
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }

        public Guid ProjectIncidentID { get; set; }
        public Guid ElementID { get; set; }
        public string ElementName { get; set; }

        public Guid ProjectIncidentActionPlanID { get; set; }

        public int? ProjectPhase { get; set; }
        public int? ProjectChangeControl { get; set; }
        public bool ChangeControl { get; set; }
        public string ChangeControlComments { get; set; }
        public string ChangeControlAuthorizer { get; set; }
        public bool ChangeControlManual { get; set; }

        public ProjectIncident ProjectIncident { get; set; }
        public ProjectIncidentActionPlan ProjectIncidentActionPlan { get; set; }
        public int? ParticipantRole { get; set; }
        public bool ProjectEditable { get; set; }

        public ProjectIncidentDetailViewModel()
        {
            ProjectIncident = new ProjectIncident();
            ProjectIncidentActionPlan = new ProjectIncidentActionPlan();

            ChangeControl = false;
            ChangeControlManual = false;
        }
    }
}
