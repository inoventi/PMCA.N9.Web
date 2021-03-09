using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectMeetingViewModel
    {
        public Guid ProjectMeetingID { get; set; }
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }
        public bool ProjectEditable { get; set; }
        public ProjectMeeting ProjectMeeting { get; set; }
        public ProjectIndicator ProjectIndicator { get; set; }


        public ProjectMeetingViewModel()
        {
            ProjectMeeting = new ProjectMeeting();
        }
    }
}
