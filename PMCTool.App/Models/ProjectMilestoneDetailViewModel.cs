using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectMilestoneDetailViewModel
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

        public ProjectTaskTable ProjectMilestone { get; set; }
        public ProjectIndicator ProjectIndicator { get; set; }

        public ProjectMilestoneDetailViewModel()
        {
            ProjectMilestone = new ProjectTaskTable();
            ProjectIndicator = new ProjectIndicator();
            ChangeControl = false;
            ChangeControlManual = false;
        }
    }
}
