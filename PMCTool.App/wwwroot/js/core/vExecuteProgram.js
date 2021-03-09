var chart;
var sdate;
var edate;

$(document).ready(function () {
    moment.locale('es-us');

    sdate = $("#StartDate").val().split('-');
    edate = $("#EndDate").val().split('-');
    drawChart([]);
    getProgramProjects();
});

function drawChart(data) {
    Highcharts.setOptions({
        lang: {
            loading: $("#Loading").val() + '...',
            months: [
                $("#January").val(),
                $("#February").val(),
                $("#March").val(),
                $("#April").val(),
                $("#May").val(),
                $("#June").val(),
                $("#July").val(),
                $("#August").val(),
                $("#September").val(),
                $("#October").val(),
                $("#November").val(),
                $("#December").val()
            ],
            weekdays: [
                $("#Sunday").val(),
                $("#Monday").val(),
                $("#Tuesday").val(),
                $("#Wednesday").val(),
                $("#Thursday").val(),
                $("#Friday").val(),
                $("#Saturday").val(),
            ],
            shortMonths: [
                $("#January").val().substring(0, 3),
                $("#February").val().substring(0, 3),
                $("#March").val().substring(0, 3),
                $("#April").val().substring(0, 3),
                $("#May").val().substring(0, 3),
                $("#June").val().substring(0, 3),
                $("#July").val().substring(0, 3),
                $("#August").val().substring(0, 3),
                $("#September").val().substring(0, 3),
                $("#October").val().substring(0, 3),
                $("#November").val().substring(0, 3),
                $("#December").val().substring(0, 3)
            ],
            exportButtonTitle: $("#Export").val(),
            printButtonTitle: $("#Import").val(),
            rangeSelectorFrom: $("#From").val(),
            rangeSelectorTo: $("#To").val(),
            rangeSelectorZoom: $("#Zoom").val(),
            viewFullscreen: $("#ViewFullScreen").val(),
            exitFullscreen: $("#ExitFullScreen").val(),
            downloadPNG: $("#DownloadImage").val() + ' PNG',
            downloadJPEG: $("#DownloadImage").val() + ' JPEG',
            downloadPDF: $("#DownloadImage").val() + ' PDF',
            downloadSVG: $("#DownloadImage").val() + ' SVG',
            printChart: $("#Print").val(),
            resetZoom: $("#Reload").val() + ' zoom',
            resetZoomTitle: $("#Reload").val() + ' zoom',
            thousandsSep: ",",
            decimalPoint: '.',
        }
    });
    chart = new Highcharts.ganttChart('chart_div', {
        chart: {
            events: {
                load() {
                    let chart = this;
                    chart.xAxis[0].setExtremes(Date.UTC(parseInt(sdate[0]), parseInt(sdate[1]) - 1, parseInt(sdate[2])), Date.UTC(parseInt(edate[0]), parseInt(edate[1]) - 1, parseInt(edate[2])))
                }
            }
        },
        plotOptions: {
            series: {
                point: {
                    events: {
                        click: function (e) {
                            location.href = '/Execution/Project?id=' + e.point.proyectID;
                        }
                    }
                }
            }
        },
        title: {
            //text: 'Gantt Chart with Progress Indicators'
        },
        xAxis: [
            {
                min: Date.UTC(parseInt(sdate[0]), parseInt(sdate[1]) - 1, parseInt(sdate[2])),
                dateTimeLabelFormats: {
                    week: {
                        list: [$("#Week").val() + '%W', $("#Week").val().substring(0, 1) + '%W']
                    }
                }
            },
            {
                max: Date.UTC(parseInt(edate[0]), parseInt(edate[1]) - 1, parseInt(edate[2])),
                dateTimeLabelFormats: {
                    week: $("#Week").val() + '%W'
                }
            },
        ],
        tooltip: {
            formatter: function () {
                let startDate = moment(this.point.options.start).add(1, "days").format("dddd, MMM DD, YYYY");
                let endDate = moment(this.point.options.end).add(1, "days").format("dddd, MMM DD, YYYY");

                return `
                    ${this.series.name}<br>
                    <strong>${this.point.name}</strong><br>
                    ${$("#Start").val()}: ${startDate}<br>
                    ${$("#End").val()}: ${endDate}<br>
                `;
            },
            useHTML: true
        },
        yAxis: {
            uniqueNames: true
        },
        navigator: {
            enabled: true,
            liveRedraw: true,
            series: {
                type: 'gantt',
                pointPlacement: 0.5,
                pointPadding: 0.25
            },
            yAxis: {
                min: 0,
                max: 3,
                reversed: true,
                categories: []
            }
        },
        scrollbar: {
            enabled: true
        },
        rangeSelector: {
            enabled: true,
            selected: 0,
            buttons: [{
                type: 'month',
                count: 1,
                text: '1' + $("#Month").val().toLowerCase().substring(0, 1)
            }, {
                type: 'month',
                count: 3,
                text: '3' + $("#Month").val().toLowerCase().substring(0, 1)
            }, {
                type: 'month',
                count: 6,
                text: '6' + $("#Month").val().toLowerCase().substring(0, 1)
            }, {
                type: 'ytd',
                text: $("#YTD").val()
            }, {
                type: 'year',
                count: 1,
                text: '1' + $("#Year").val().toLowerCase().substring(0, 1)
            }, {
                type: 'all',
                text: $("#All").val()
            }]
        },
        series: [{
            name: $.i18n._('project'),
            data: data
        }]
    });
}

function getProgramProjects() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetProgramProjects',
        dataType: 'json',
        data: { programId: $("#ProgramID").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            var projects = [];

            for (var i = 0; i < data.length; i++) {
                var sd = "";
                var ed = "";

                if (data[i].startDate != null && data[i].endDate != null) {
                    sd = data[i].startDate.substr(0, 10).split('-');
                    ed = data[i].endDate.substr(0, 10).split('-');
                }

                var progress = 0.00;

                var fill = '';
                var color = '';

                switch (parseInt(data[i].status)) {
                    case 1:
                        fill = '#4CAF50';
                        color = '#62e066';
                        break;
                    case 2:
                        fill = '#ffc107';
                        color = '#ffdc08';
                        break;
                    case 3:
                        fill = '#dc3545';
                        color = '#FF4858';
                        break;
                    case 4:
                        fill = '#6c757d';
                        color = '#6c757d';
                        break;
                    default:
                }
                var ProjectName = data[i].name;
                if (ProjectName.length > 30) {
                    ProjectName = ProjectName.substr(0, 31) + '...';
                }
                projects.push({
                    proyectID: data[i].projectID,
                    name: ProjectName,
                    start: sd != "" ? Date.UTC(parseInt(sd[0]), parseInt(sd[1]) - 1, parseInt(sd[2])) : sd,
                    end: ed != "" ? Date.UTC(parseInt(ed[0]), parseInt(ed[1]) - 1, parseInt(ed[2])) : ed,
                    completed: {
                        amount: parseFloat(data[i].progress.toFixed(4)),
                        fill: fill
                    },
                    color: color
                });
            }

            chart.destroy();
            drawChart(projects);
        },
        complete: function () {
            //LoaderHide();
        },
        error: function (xhr, status, error) {
            LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}

// THE CHART
//Highcharts.ganttChart('chart_div', {
//    plotOptions: {
//        series: {
//            point: {
//                events: {
//                    click: function (e) {
//                    }
//                }
//            }
//        }
//    },
//    title: {
//        //text: 'Gantt Chart with Progress Indicators'
//    },
//    xAxis: {
//        min: Date.UTC(2019, 10, 17),
//        max: Date.UTC(2019, 11, 01)
//    },
//    yAxis: {
//        uniqueNames: true
//    },
//    navigator: {
//        enabled: true,
//        liveRedraw: true,
//        series: {
//            type: 'gantt',
//            pointPlacement: 0.5,
//            pointPadding: 0.25
//        },
//        yAxis: {
//            min: 0,
//            max: 3,
//            reversed: true,
//            categories: []
//        }
//    },
//    scrollbar: {
//        enabled: true
//    },
//    rangeSelector: {
//        enabled: true,
//        selected: 0
//    },
//    series: [{
//        name: 'Project 1',
//        data: [{
//            name: '1 KAB-C. Permaducto. Equipo José Luis Cortes',
//            proyectID: 'fg566',
//            start: Date.UTC(2019, 10, 18),
//            end: Date.UTC(2019, 12, 25),
//            completed: {
//                amount: 0.10,
//                fill: '#dc3545'
//            },
//            color: '#FF4858'
//        }, {
//            name: '2 Interconexiones - DIAVAZ- Equipo de Ricardo Loyo',
//            proyectID: 'hg400',
//            start: Date.UTC(2019, 10, 27),
//            end: Date.UTC(2019, 11, 29),
//            completed: {
//                amount: 0.05,
//                fill: '#ffc107'
//            },
//            color: '#ffdc08'
//        }, {
//            name: '3 Ayatsil L-1 y L-10. Mcdermott. Equipo Luis Fernando Ortíz',
//            proyectID: 'pl90',
//            start: Date.UTC(2019, 10, 20),
//            end: Date.UTC(2019, 10, 25),
//            completed: {
//                amount: 0.12,
//                fill: '#4CAF50'
//            },
//            color: '#62e066'
//        }]
//    }]
//});