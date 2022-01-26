using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectIndicatorsExcel
    {
        public Guid ParticipantID { get; set; }
        public Guid ProjectID { get; set; }
        public IFormFile Excel { get; set; }
        public string Type { get; set; }
    }
}
