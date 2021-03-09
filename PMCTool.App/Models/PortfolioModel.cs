using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class PortfolioModel
    {
        public int Type { get; set; }
        public object Value { get; set; }
        public int Order { get; set; }
    }
}
