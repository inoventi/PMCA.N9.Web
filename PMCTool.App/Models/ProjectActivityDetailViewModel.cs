using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectActivityDetailViewModel
    {
        public Guid ProjectTaskID { get; set; }
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }

        public int? ProjectPhase { get; set; }
        public int? ProjectChangeControl { get; set; }
        public bool ChangeControl { get; set; }
        public string ChangeControlComments { get; set; }
        public string ChangeControlAuthorizer { get; set; }
        public bool ChangeControlManual { get; set; }
        public bool ProjectEditable { get; set; }
        public int? ParticipantRole { get; set; }
        public Guid ResponsableID { get; set; }
        public string ResponsableName { get; set; }
        public string ResponsableEmail { get; set; }
        public string ResponsablePhone { get; set; }
        public Guid? ResponsableEscalationID { get; set; }
        public string ResponsableEscalationName { get; set; }
        public List<Participant> Participants { get; set; }


        public ProjectTaskTable ProjectActivity { get; set; }

        public ProjectActivityDetailViewModel()
        {
            ProjectActivity = new ProjectTaskTable();
            ChangeControl = false;
            ChangeControlManual = false;
            Participants = new List<Participant>();
        }
    }
}
