using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class PasswordRecoverModel
    {
        public string Token { get; set; }
        public string Password { get; set; }
        public string Confirm { get; set; }
    }
}
