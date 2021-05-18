namespace PMCTool.App.Models
{
    public class ResponseModel
    {
        public bool IsSuccess { get; set; }
        public string SuccessMessage { get; set; }

        public bool HasErrors { get; set; }
        public int? ErrorCode { get; set; }
        public string ErrorMessage { get; set; }

        public int? ValueInt { get; set; }
        public bool? ValueBoolean { get; set; }
        public string ValueString { get; set; }
        public string ValueString1 { get; set; }
        public string ValueString2 { get; set; }
        public dynamic Result { get; set; }
        public string Redirect { get; set; }

    }
}