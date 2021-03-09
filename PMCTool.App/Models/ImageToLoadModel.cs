using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PMCTool.App.Models
{
    public class ImageToLoadModel
    {
        public Guid ID { get; set; }
        public IFormFile Image { get; set; }
    }
}
