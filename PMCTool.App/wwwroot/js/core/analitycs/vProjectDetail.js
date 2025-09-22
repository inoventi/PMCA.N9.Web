class projectDetail {
    constructor() {
        this.indicators = {
            '1': 'st-entiempo',
            '2': 'st-atrasado',
            '3': 'st-cimpacto'
        }
        this.barIndicator = {
            '1': 'bg-success',
            '2': 'bg-warning',
            '3': 'bg-danger',
            '4': 'bg-dark'
        };
        this.init();
    }
    init() {
        
        $('.btn-report').on('click', async () => {
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
            $('.section').removeAttr('hidden');
            this.initDataTable();
            await this.getIndividualReportPerProject(projectId);
            
            await this.getControlChangesDatesParticipansByPorject(projectId);
            await this.getElementsSummaryByProjectID(projectId);
            await this.getProjectElementsByProjectID(projectId);
            LoaderHide();
        });
    }
    initDataTable() {
        $(`.table-elements`).DataTable({
            destroy: true,
            paging: true,
            searching: true,
            processing: true,
            responsive: true,
            order: [],
            columns: [
                {
                    data: 'elementType', render: (elementType) => {
                        return $.i18n._("E0" + elementType);
                    }
                },
                {
                    data: 'description', render: (description, data, { projectId, elementId, elementType }) => {
                        let url = '';
                        switch (elementType) {
                            case 1:
                                url = `/Execution/Activity?projectId=${projectId}&activityId=${elementId}`;
                                break;
                            case 2:
                                url = `/Execution/Milestone?projectId=${projectId}&milestoneId=${elementId}`;
                                break;
                            case 3:
                                url = `/Execution/Evidence?projectId=${projectId}&evidenceId=${elementId}`;
                                break;
                            case 4:
                                url = `/Execution/Incident?projectId=${projectId}&incidentId=${elementId}`;
                                break;
                            case 5:
                                url = `/Execution/Risk?projectId=${projectId}&riskId=${elementId}`;
                                break;
                        }
                        return `<a target="_blank" href="${window.baseUrl}${url}">${description}</a>`;
                    }
                },
                {
                    data: 'date', render: (date) => {
                        return date?.split('T')[0];
                    }
                },
                {
                    data: 'status', render: (status) => {
                        return `<span class="bold ${this.indicators[status]} font7em float-center">${$.i18n._("elementStatusName_" + status)}</span>`;
                    }
                }
            ],
            language: {
                url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
            },
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: $.i18n._(`Analytics5_023`),
                    exportOptions: {
                        modifier: {
                            page: 'all',       // exporta todas las páginas
                            search: 'applied'  // respeta el filtro activo (opcional)
                        },
                        columns: ':visible'   // sólo columnas visibles (opcional)
                    }
                }
            ],
        });
    }
    async getIndividualReportPerProject(projectId) {
        let request = await fetch(`/Project/individualReportPerProject?projectId=${projectId}`);
        let { plannedProgress, progress, totalChanges, totalParticipants, totalRisk, totalRiskClosed, totalTask, totalTaskDelayed, proyectStatus } = await request.json();
        $('.tt-participants').html(totalParticipants);
        $('.tt-task').html(totalTask);
        $('.tt-task-delayed').html(totalTaskDelayed);
        $('.tt-risk').html(totalRisk);
        $('.tt-risk-closed').html(totalRiskClosed);
        $('.tt-changes').html(totalChanges);

        //CLEAN CLASS PROGRESS
        $('.graphic-real-progress').removeClass('bg-success');
        $('.graphic-real-progress').removeClass('bg-warning');
        $('.graphic-real-progress').removeClass('bg-danger');
        $('.graphic-real-progress').removeClass('bg-dark');

        $('.graphic-real-progress').addClass(this.barIndicator[proyectStatus]);
        progress = (progress == null) ? 0 : progress;
        plannedProgress = (plannedProgress == null) ? 0 : plannedProgress;
        $('.real-progress').html(`${parseFloat(progress).toFixed(2)}%`);
        $('.graphic-real-progress').css('width', `${parseFloat(progress).toFixed(2)}%`);

        $('.planned-progress').html(`${parseFloat(plannedProgress).toFixed(2)}%`);
        $('.graphic-planned-progress').css('width', `${parseFloat(plannedProgress).toFixed(2) }%`);


    }
    async getControlChangesDatesParticipansByPorject(projectId) {
        let request = await fetch(`/Project/controlChangesDatesParticipansByPorject?projectId=${projectId}`);
        let { totalChangesOfDates, totalChangesOfleadership } = await request.json();
        Highcharts.chart('container1', {
            chart: {
                type: 'pie',
                zooming: {
                    type: 'xy'
                },
                panning: {
                    enabled: true,
                    type: 'xy'
                },
                panKey: 'shift',
                backgroundColor: 'white'
            },
            title: { text: null },       // 
            subtitle: { text: null },    // 
            tooltip: {
                valueSuffix: ''
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    borderColor: 'white',
                    borderWidth: 0,
                    slicedOffset: 10, // separación más visible
                    states: {
                        hover: {
                            enabled: true,
                            halo: false,
                            brightness: 0,
                        }
                    },
                    dataLabels: [{
                        enabled: true,
                        distance: 20
                    }, {
                        enabled: true,
                        distance: -40,
                        format: '{point.percentage:.1f}%',
                        style: {
                            fontSize: '1.2em',
                            textOutline: 'none',
                            opacity: 0.7
                        }
                    }]
                }
            },
            series: [
                {
                    states: {
                        inactive: {
                            enabled: false // Esto es lo que realmente previene el opacado
                        }
                    },
                    name: $.i18n._("Analytics5_008"),
                    colorByPoint: true,
                    data: [
                        {
                            name: 'Cambios en fechas',
                            y: totalChangesOfDates
                        },
                        {
                            name: 'Cambios en responsables',
                            y: totalChangesOfleadership,
                            color: 'black'
                        },
                    ],
                    point: {
                        events: {
                            mouseOver: function () {
                                this.slice(true); // separa al pasar el mouse
                            },
                            mouseOut: function () {
                                this.slice(false); // regresa cuando se quita el mouse
                            },
                        }
                    }
                }
            ]
        });
    }
    async getElementsSummaryByProjectID(projectId) {
        let request = await fetch(`/Project/elementsSumaryByProjecID?projectId=${projectId}`);
        let data = await request.json();

        let categories = data.map((e) => e.participantName);
        let total = data.map((e) => e.total);
        Highcharts.chart('container2', {
            chart: {
                type: 'bar',
                backgroundColor: 'white',
                spacingTop: 24, // más aire arriba; sube a 32 si alguna vez se corta
            },
            title: {
                text: null, 
            },
            subtitle: {
                text: null,
                y: 30,
                style: { color: '#000' }
            },

            xAxis: {
                categories: categories,
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
            series: [{
                name: 'Total',
                data: total
            }]
        });
    }
    async getProjectElementsByProjectID(projectId) {
        let request = await fetch(`/Project/projectElementsByProject?projectId=${projectId}`);
        let data = await request.json();
        console.log(data);
        $('.table-elements').DataTable().clear().draw();
        $('.table-elements').DataTable().columns.adjust().draw();
        $('.table-elements').DataTable().rows.add(data).draw();
    }
}


document.addEventListener("DOMContentLoaded", () => {
    new projectDetail();
});
