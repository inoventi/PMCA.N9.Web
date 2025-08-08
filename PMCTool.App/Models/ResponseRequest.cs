namespace PMCTool.App.Models
{
    public class ResponseRequest
    {
        public bool IsSuccess { get; set; }
        public string SuccessMessage { get; set; }
        public object Data { get; set; }

    }
}