using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class UserTokenCourses
    {
        public string userEmail { get; set; }
        public string token { get; set; }
        public int ErrorCode { get; set; }
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; }
        public string LicenseID { get; set; }

    }
}
