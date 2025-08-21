class projectSheet {
    constructor() {
        this.init();
        this.coloresEstatusProjectNumber = {
            '1': '#4CAF50',           // Verde
            '2': '#e6c702',            // Amarillo
            '3': '#dc3545',         // Rojo
            '4': '#d0d0d0',             // Gris claro
            '5': '#545454',                 // Gris oscuro
            '6': '#F1F5F9'     // Gris mas clarito
        }
    }
     init() {
         $('.btn-report').on('click', async (e) => {
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
            $('#titleClient').html(`${$('#selprojects option:selected').text()}`);
            LoaderShow();
            await this.requesDataReportProjectSheet(projectId);
            await this.requestGetReportGanttActivitiesById(projectId);
            $('#report').removeAttr('hidden');
            LoaderHide();
        });
    }
    async requesDataReportProjectSheet(projectId) {        
       
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
        

       
    }
    async requestGetReportGanttActivitiesById(projectId) {
        let resquest = await fetch(`/ActionsToMake/GetReportGanttActivitiesByID?projectId=${projectId}`);
        let data = await resquest.json();
        $('#project-phase-table').empty();
        $('#project-phase-table').append(`<tr>
                        <td scope="row" class="bg txt-center">${$.i18n._('Analytics5_011')}</td>
                        <td class="bg txt-center">${$.i18n._('Analytics5_016')}</td>
                        <td class="bg txt-center">${$.i18n._('Analytics5_017')}</td>
                        <td class="bg txt-center">${$.i18n._('Analytics5_025')}</td>
                        <td class="bg txt-center">${$.i18n._('Analytics5_006')}</td>
                    </tr>`);

        data.forEach(({ duration, endDateClient, progress, startDate, status, text }) => {
            console.log(duration, endDateClient, progress, startDate, status, text);
            $('#project-phase-table').append(`<tr>
                                                <td scope="row" class="txt-center">${text}</td>
                                                <td class="txt-center">${startDate}</td>
                                                <td class="txt-center">${endDateClient}</td>
                                                <td class="txt-center">${duration}</td>
                                                <td class="txt-center" style="background: ${this.coloresEstatusProjectNumber[status]};font-weight: 500;">${$.i18n._(`elementStatusName_${status}`)}</td>
                                            </tr>`);
        });
        console.log(data);
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
