class projectSheet {
    constructor() {
        this.init();
    }
    init() {
        $('.btn-report').on('click', (e) => {
            this.requesDataReportProjectSheet();
        });
    }
    async requesDataReportProjectSheet() {
        LoaderShow();
        let projectId = $('#selprojects').val();
        let resquest = await fetch(`/ActionsToMake/ReportGetProjectSheetByID?projectId=${projectId}`);
        let { amountMinOfContract, client, endDateProject, idProjectClient, leader, maxContractAmount, priority, projectDimension, projectName, projectOverview, projetManager, startDateProject } = await resquest.json();
        this.resetRows();

        $('#clientRow').html(client);
        $('#leaderRow').html(leader);
        $('#idProjectClientRow').html(idProjectClient);
        $('#startDateProjectRow').html(startDateProject);
        $('#amountMinOfContractRow').html(amountMinOfContract);

        $('#priorityRow').html(priority);
        $('#projectManagerRow').html(projetManager);
        $('#projectDimensionRow').html(projectDimension);
        $('#endDateProjectRow').html(endDateProject);
        $('#maxContractAmountRow').html(maxContractAmount);

        LoaderHide();
    }
    resetRows() {
        $('#clientRow').empty();
        $('#leaderRow').empty();
        $('#idProjectClientRow').empty();
        $('#startDateProjectRow').empty();
        $('#amountMinOfContractRow').empty();

        $('#priorityRow').empty();
        $('#prokectManagerRow').empty();
        $('#projectDimensionRow').empty();
        $('#endDateProjectRow').empty();
        $('#maxContractAmountRow').empty();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new projectSheet();
});
