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
        
        let projectId = $('#selprojects').val();
        if (projectId.length == 0) {
            Swal.fire({
                type: 'error',
                title: '',
                text: $.i18n._("Analytics5_024"),
                footer: ''
            });
            return;
        }
        LoaderShow();
        let resquest = await fetch(`/ActionsToMake/ReportGetProjectSheetByID?projectId=${projectId}`);
        let { amountMinOfContract, client, endDateProject, idProjectClient, leader, maxContractAmount, priority, projectDimension, projectName, projectOverview, projetManager, startDateProject } = await resquest.json();
        this.resetRows();

        $('#clientRow').html(client);
        $('#leaderRow').html(leader);
        $('#idProjectClientRow').html(idProjectClient);
        $('#startDateProjectRow').html(startDateProject != null ? startDateProject.split('T')[0] : '');
        $('#amountMinOfContractRow').html(`$${(amountMinOfContract == "" || amountMinOfContract == null) ? 0 : amountMinOfContract}`);

        $('#priorityRow').html(priority);
        $('#projectManagerRow').html(projetManager);
        $('#projectDimensionRow').html(projectDimension);
        $('#endDateProjectRow').html(endDateProject != null ? endDateProject.split('T')[0] : '');
        $('#maxContractAmountRow').html(`$${(maxContractAmount == "" || maxContractAmount == null) ? 0 : maxContractAmount}`);


        $('#projectOverviewRow').html(projectOverview);
        $('#report').removeAttr('hidden');

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

        $('#projectOverviewRow').empty();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new projectSheet();
});
