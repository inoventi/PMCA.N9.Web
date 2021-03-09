using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ParticipantsReportAvailability
    {
        public Guid participantId { get; set; }
        public string projectsIds { get; set; }

        public string dateStart { get; set; }
        public string dateEnd { get; set; }
    }
}
