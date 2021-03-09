using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class KpisParticipant
    {
        public int Serie { get; set; }
        public Guid ParticipantID { get; set; }
        public string ParticipantName { get; set; }
        public int TotalClosedInTimeA { get; set; }
        public int TotalClosedA { get; set; }
        public int TotalDelayedB { get; set; }
        public int TotalElementsActiveB { get; set; }
        public int TotalDelayedCustomD { get; set; }
        public int TotalOnTimeCustomD { get; set; }
        public string OwnerPhoto { get; set; }
    }
}
