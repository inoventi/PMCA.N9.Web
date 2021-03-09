using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectMeetingDetailViewModel
    {
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }

        public Guid ProjectMeetingID { get; set; }
        public Guid ProjectMeetingParticipantID { get; set; }
        public Guid ProjectMeetingTopicID { get; set; }
        public Guid ProjectMeetingAgreementID { get; set; }
        public Guid ProjectMeetingNoteID { get; set; }

        public Guid? ElementID { get; set; }

        public bool IsNew { get; set; }
        public Guid Participants { get; set; }
        public string NoRegName { get; set; }
        public string NoRegEmail { get; set; }
        public Guid Topics { get; set; }
        public string Topic { get; set; }
        public string TopicDescription { get; set; }

        public int? ProjectPhase { get; set; }
        public int? ProjectChangeControl { get; set; }
        public bool ChangeControl { get; set; }
        public string ChangeControlComments { get; set; }
        public string ChangeControlAuthorizer { get; set; }
        public bool ChangeControlManual { get; set; }
        public bool ProjectEditable { get; set; }
        public int? ParticipantRole { get; set; }

        public string Comments { get; set; }

        public ProjectMeeting ProjectMeeting { get; set; }

        public ProjectMeetingDetailViewModel()
        {
            ProjectMeeting = new ProjectMeeting();
            ChangeControl = false;
            ChangeControlManual = false;
        }
    }
}
