using Microsoft.AspNetCore.Http;
using PMCTool.Models.Environment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ProjectEvidenceDetailViewModel
    {
        public Guid ProjectEvidenceID { get; set; }
        public Guid ActivityID { get; set; }
        public string ActivityName { get; set; }
        public Guid ProjectID { get; set; }
        public string ProjectName { get; set; }

        public Guid ProjectEvidenceControlPointID { get; set; }
        public Guid ProjectEvidenceReferenceID { get; set; }

        public ProjectEvidence ProjectEvidence { get; set; }
        public ProjectEvidenceControlPoint ProjectEvidenceControlPoint { get; set; }
        public ProjectEvidenceReference ProjectEvidenceReference { get; set; }

        public string NavBack { get; set; }
        public IFormFile Image { get; set; }
        public bool ProjectEditable { get; set; }
        public bool ReferenceEditable { get; set; }
        public int? ParticipantRole { get; set; }

        public ProjectEvidenceDetailViewModel()
        {
            ProjectEvidence = new ProjectEvidence();
            ProjectEvidenceControlPoint = new ProjectEvidenceControlPoint();
            ProjectEvidenceReference = new ProjectEvidenceReference();
        }
    }
}
