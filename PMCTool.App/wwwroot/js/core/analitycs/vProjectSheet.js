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
            await this.requestGetProjectElementCountByParticipant(projectId);
            await this.requestReportGetProjectSheedById002(projectId);
            $('#report').removeAttr('hidden');

            LoaderHide();

        });
    }
    async requestReportGetProjectSheedById002(projectId) {
        let resquest = await fetch(`/ActionsToMake/reportGetProjectSheedById002?projectId=${projectId}`);
        let data = await resquest.json();
        this.construcGraphic2(data);
    }
    async requestGetProjectElementCountByParticipant(projectId) {
        let resquest = await fetch(`/ActionsToMake/GetProjectElementCountByParticipant?projectId=${projectId}`);
        let data = await resquest.json();
        this.construcGraphic1(data);
    }
    construcGraphic1({ activity, agreement, evidence, incident, milestone, risk }) {
        Highcharts.chart('container1', {
            chart: {
                type: 'bar',
                backgroundColor: 'white',
                spacingTop: 24, // más aire arriba; sube a 32 si alguna vez se corta
            },
            title: {
                text: `${$.i18n._("Analytics1_003")}`,
                style: { color: '#000', fontWeight: 'bold' }
            },
            subtitle: {
                text: 'Source: <a href="https://www.pmc-tool.com/" target="_blank">PMC-tool.com</a>',
                y: 30,
                style: { color: '#000' }
            },

            xAxis: {
                categories: [
                    $.i18n._("activity"),
                    $.i18n._("incident"),
                    $.i18n._("evidence"),
                    $.i18n._("risk"),
                    $.i18n._("agreements"),
                    $.i18n._("milestone")
                ],
                title: { text: null },
                gridLineWidth: 1,
                lineWidth: 0,
                labels: { overflow: 'justify', style: { color: 'black' } }
            },

            yAxis: {
                min: 0,
                title: { text: 'Total', align: 'high' },
                labels: { overflow: 'justify', style: { color: 'black' } },
                gridLineWidth: 0,
                tickmarkPlacement: 'between', // ← líneas ENTRE categorías
                tickWidth: 0,
                lineWidth: 0
            },

            tooltip: {
                // Muestra "Serie: valor"
                pointFormat: '<span style="font-weight:600">{series.name}:</span> <b>{point.y}</b>'
            },

            plotOptions: {
                series: {
                    borderWidth: 0,          // sin contorno
                    borderColor: 'transparent',
                    clip: false       // <-- evita que se “corte” la barra superior
                },
                bar: {
                    borderRadius: 10,
                    dataLabels: { enabled: true },
                    groupPadding: 0.15,
                    pointPadding: 0,
                    pointWidth: 20
                }
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                // texto negro y en negritas
                itemStyle: {
                    color: '#000',
                    fontWeight: 'bold'
                },
                itemHoverStyle: {
                    color: '#000'
                }
            },

            credits: { enabled: false },

            // Una serie por tipo, con datos "dispersos"
            series: [
                { name: $.i18n._("activity"), data: [activity, null, null, null, null, null] },
                { name: $.i18n._("incident"), data: [null, incident, null, null, null, null] },
                { name: $.i18n._("evidence"), data: [null, null, evidence, null, null, null] },
                { name: $.i18n._("risk"), data: [null, null, null, risk, null, null] },
                { name: $.i18n._("agreements"), data: [null, null, null, null, agreement, null] },
                { name: $.i18n._("milestone"), data: [null, null, null, null, null, milestone] }
            ]
        });
    }
    construcGraphic2({ projectName, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15 }) {
        Highcharts.chart('container2', {
            chart: {
                type: 'column',
                backgroundColor: 'white'
            },
            title: {
                text: `${projectName}`,
                style: { color: '#000', fontWeight: 'bold' }   // negro
            },
            subtitle: {
                text: 'Source: <a href="https://www.pmc-tool.com/" target="_blank">PMC-tool.com</a>',
                style: { color: '#000' }                        // negro
            },
            xAxis: {
                categories: [
                    'LAPTOP', 'LAPTOP INTERMEDIA', 'LAPTOP CON DOCKING', 'LAPTOP', 'LAPTOP CON DOCKING',
                    'APPLE MACBOOK AIR', 'EQUIPO APPLE DE ESCRITORIO IMAC', 'TABLETA LIGERA',
                    'TABLETA ESPECIALIZADA', 'ESQUIPO DE ESCRITORIO INTERMEDIO',
                    'EQUIPO DE ESCRITORIO ESPECIALIZADO', 'TECLADO Y MOUSE , P02 PERIFERICOS CONFERENCIA',
                    'MONITOR', 'CANDADO PARA EQUIPO DE COMPUTO', 'VIDEO PROYECTOR'
                ],
                crosshair: true,
                accessibility: { description: 'Piezas' },
                labels: { style: { color: '#000', fontWeight: 'bold' } }, // letras negras (y en negrita)
                lineColor: '#000',
                tickColor: '#000'
            },
            yAxis: {
                min: 0,
                title: {
                    text: '1000 metric tons (MT)',    
                },
                labels: { style: { color: '#000', fontWeight: 'bold' } },  // negro
                gridLineColor: '#e6e6e6'
            },
            legend: {
                itemStyle: { color: '#000', fontWeight: 'bold' }           // si hay leyenda
            },
            tooltip: { valueSuffix: ' (1000 MT)' },
            plotOptions: {
                column: { pointPadding: 0.2, borderWidth: 0 }
                // Si quieres que los números sobre las columnas también sean negros:
                // , series: { dataLabels: { enabled: true, style: { color: '#000', textOutline: 'none', fontWeight: 'bold' } } }
            },
            series: [{
                name: 'Total',
                data: [parseInt(c1), parseInt(c2), parseInt(c3), parseInt(c4), parseInt(c5),
                parseInt(c6), parseInt(c7), parseInt(c8), parseInt(c9), parseInt(c10),
                parseInt(c11), parseInt(c12), parseInt(c13), parseInt(c14), parseInt(c15)]
            }]
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
                                                <td class="txt-center">${startDate.split('T')[0]}</td>
                                                <td class="txt-center">${endDateClient.split('T')[0]}</td>
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
