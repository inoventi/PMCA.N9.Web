//var intentos = 0;
$(function () {
    setInterval(hora, 100);
    AjaxGetParticipantID();
    
})

function AjaxGetParticipantID() {
    //if (intentos != 2) {
        $.ajax({
            type: 'GET',
            url: '../Analytics/GetPartcipantID',
            dataType: 'json',
            data: {},
            beforeSend: function () {
                //LoaderShow();
            },
            success: function (participant) {
                 //console.log(participant);
                if (participant == '00000000-0000-0000-0000-000000000000') {
                    //console.log(intentos);
                    //intentos++;
                    //AjaxGetParticipantID();
                } else {
                    AjaxStatusElementsCount(participant);
                    AjaxQualityTracingByElements(participant);
                    AjaxComplianceGoal(participant);
                    AjaxProjectsByParticipantHome(participant);
                    AjaxSessionToken();
                }
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
   // }
}
function AjaxSessionToken() {
    $.ajax({
        type: 'GET',
        url: '../Analytics/GetSessionToken',
        dataType: 'json',
        data: {},
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (sessionToken) {
            //console.log(sessionToken);
            var fecha = sessionToken[2].createdOn;
            var meses = new Array($.i18n._('January'), $.i18n._('February'), $.i18n._('March'), $.i18n._('April'), $.i18n._('May'), $.i18n._('June'), $.i18n._('July'), $.i18n._('August'), $.i18n._('September'), $.i18n._('October'), $.i18n._('November'), $.i18n._('December'));
            var diasSemana = new Array($.i18n._('Sunday'), $.i18n._('Monday'), $.i18n._('Tuesday'), $.i18n._('Wednesday'), $.i18n._('Thursday'), $.i18n._('Friday'), $.i18n._('Saturday'));
            var fdate = new Date(fecha);
            $('.LastDate').append(diasSemana[fdate.getDay()] + ", " + fdate.getDate() + "-" + meses[fdate.getMonth()] + "-" + fdate.getFullYear());
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
function AjaxProjectsByParticipantHome(participantid) {
    $.ajax({
        type: 'GET',
        url: '../Analytics/GetProjectsByParticipantHome',
        dataType: 'json',
        data: { participantID: participantid},
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (projectsdata) {
            var projectsdatas = projectsdata.data;
            if (projectsdatas.isSuccess != false) {
                if (projectsdatas == "") {
                    $('#qualityTracing').empty();
                    $('#divprojects').append('<h4 style="margin-top: 18%;margin-bottom: 19%;" class="card-subtitle p-2 pt-1">' + $.i18n._('noRecordsFound')+'.</h4>');
                } else if (projectsdatas.isSuccess == false) {
                    $('#qualityTracing').empty();
                    $('#divprojects').append('<h4 style="margin-top: 18%;margin-bottom: 19%;" class="card-subtitle p-2 pt-1">' + $.i18n._('noRecordsFound') +'.</h4>');
                } else {
                var projects = [];
                var StartDates = [];
                var EndDates = [];
                    for (var i = 0; i < projectsdatas.length; i++) {
                    var fill = '';
                    var color = '';
                        switch (parseInt(projectsdatas[i].status)) {
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
                        if (projectsdatas[i].startDate != null || projectsdatas[i].endDate != null) {
                            var sd = projectsdatas[i].startDate.substr(0, 10).split('-');
                            var ed = projectsdatas[i].endDate.substr(0, 10).split('-');
                            var ProjectName = projectsdatas[i].projectName;
                            if (ProjectName.length > 30) {
                                ProjectName = ProjectName.substr(0, 31) + '...';
                            }
                        projects.push({
                            proyectID: projectsdatas[i].projectID,
                            name: ProjectName,
                            start: Date.UTC(parseInt(sd[0]), parseInt(sd[1]) - 1, parseInt(sd[2])),
                            end: Date.UTC(parseInt(ed[0]), parseInt(ed[1]) - 1, parseInt(ed[2])),
                            completed: {
                                amount: parseFloat(projectsdatas[i].progress.toFixed(4)),
                                fill: fill
                            },
                            color: color
                        });
                        StartDates.push(
                            new Date(projectsdatas[i].startDate)
                        );
                        EndDates.push(
                            new Date(projectsdatas[i].endDate)
                        );
                    }
                }
                var min = new Date(Math.min.apply(null, StartDates));
                var min = min.setDate(min.getDate() + 0);
                var max = new Date(Math.max.apply(null, EndDates));
                var max = max.setDate(max.getDate() + 0);
                ProjectsByParticipantHomeGantt(projects, min, max);
                }
            }
        },
        complete: function () {
            //LoaderHide();
        },
        error: function (xhr, status, error) {
            //LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}
function AjaxComplianceGoal(participantid) {
    $.ajax({
        type: 'GET',
        url: '../Analytics/GetComplianceGoal_ByParticipant',
        dataType: 'json',
        data: { participantID: participantid},
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (ComplianceGoal) {
            //console.log(ComplianceGoal);
            if (ComplianceGoal.isSuccess == false) {
                $('#ComplianceGoal').empty();
                $('#divComplianceGoal').append('<h4 style="margin-top: 18%;margin-bottom: 19%;" class="card-subtitle p-2 pt-1">' + $.i18n._('noRecordsFound') + '.</h4>');
            } else if (ComplianceGoal[0].totalElements == 0) {
                $('#ComplianceGoal').empty();
                $('#divComplianceGoal').append('<h4 style="margin-top: 18%;margin-bottom: 19%;" class="card-subtitle p-2 pt-1">' + $.i18n._('noRecordsFound') + '.</h4>');
            } else {
                for (var i = 0; i < ComplianceGoal.length; i++) {
                    var Porcentaje = ComplianceGoal[i].porcentaje;
                }
                var PorcentajeY = Porcentaje.toFixed(2);
                PorcentajeY = parseFloat(PorcentajeY);
                    ComplianceGoalChart(PorcentajeY);
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            //LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}
function AjaxQualityTracingByElements(participantid) {
    $.ajax({
        type: 'GET',
        url: '../Analytics/GetQualityTracing_ByElements',
        dataType: 'json',
        data: { participantID: participantid},
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (QualityData) {
            //console.log(QualityData);
            if (QualityData.isSuccess == false) {
                $('#QualityTracing').empty();
                $('#divQualityTracing').append('<h4 style="margin-top: 18%;margin-bottom: 19%;" class="card-subtitle p-2 pt-1">' + $.i18n._('noRecordsFound') + '.</h4>');
            } else {
                //console.log(QualityData[0].totalElementosA);
                if (QualityData[0].totalElementosA != 0) {
                    var dataElementParticipant = QualityData;
                    var arrayElements = [];
                    var objetoElement = Object.keys(QualityData[0]);
                    for (var a = 0; a < objetoElement.length; a++) {
                        var campo = objetoElement[a];
                        if (campo == "activity" || campo == "agreement" || campo == "evidence" || campo == "incident" || campo == "milestone" || campo == "risk") {
                            arrayElements.push(parseInt(dataElementParticipant[0][campo]));
                        }
                        
                    }
                    
                    CalidadSeguimiento(arrayElements);
                } else {
                    $('#QualityTracing').empty();
                    $('#divQualityTracing').append('<h4 style="margin-top: 18%;margin-bottom: 19%;" class="card-subtitle p-2 pt-1">' + $.i18n._('noRecordsFound') + '.</h4>');
                }
            }
        },
        complete: function () {
           //LoaderHide();
        },
        error: function (xhr, status, error) {
            //LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}
function AjaxStatusElementsCount(participantid) {
    $.ajax({
        type: 'GET',
        url: '../Analytics/GetElementsStatusCount_ByParticipant',
        dataType: 'json',
        data: { participantID: participantid},
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            //console.log(data);
            if (data.isSuccess == false) {
                $('#StatusElements').empty();
                $('#divStatusElements').append('<h4 style="margin-top: 18%;margin-bottom: 19%;" class="card-subtitle p-2 pt-1">' + $.i18n._('noRecordsFound') + '.</h4>');
            } else if (data == "") {
                $('#StatusElements').empty();
                $('#divStatusElements').append('<h4 style="margin-top: 18%;margin-bottom: 19%;" class="card-subtitle p-2 pt-1">' + $.i18n._('noRecordsFound') +'.</h4>');

            } else {
                var arrayOnTime = [];
                var arrayDelayed = [];
                var arrayWhitImpact = [];
                var arrayClosed = [];
                var arrayCanceled = [];
                const categorias = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].elementType == 1) {
                        categorias.push($.i18n._('activity'));
                    } else if (data[i].elementType == 2) {
                        categorias.push($.i18n._('milestone'));
                    } else if (data[i].elementType == 3) {
                        categorias.push($.i18n._('evidence'));
                    } else if (data[i].elementType == 4) {
                        categorias.push($.i18n._('incident'));
                    } else if (data[i].elementType == 5) {
                        categorias.push($.i18n._('risk'));
                    } else if (data[i].elementType == 6) {
                        categorias.push($.i18n._('agreement'));
                    }
                    arrayOnTime.push(parseInt(data[i].onTime));
                    arrayDelayed.push(parseInt(data[i].delayed));
                    arrayWhitImpact.push(parseInt(data[i].withImpact));
                    arrayClosed.push(parseInt(data[i].closed));
                    arrayCanceled.push(parseInt(data[i].canceled));
                }
                StatusElements(categorias, arrayOnTime, arrayDelayed, arrayWhitImpact, arrayClosed, arrayCanceled);
            }
        },
        complete: function () {
            //LoaderHide();
        },
        error: function (xhr, status, error) {
            //LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    return [year, month, day].join('-');
}
function ProjectsByParticipantHomeGantt(projects, startDate, EndDate) {
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
    Highcharts.ganttChart('chartGantt', {
        /*title: {
            text: 'PROYECTOS',
            style: {
                color: '#205280',
                fontWeight: 'bold'
            }
        },*/
        title: false,
        events: {
            load() {
                let chart = this;
                chart.xAxis[0].setExtremes(Date.UTC(parseInt(startDate[0]), parseInt(startDate[1]) - 1, parseInt(startDate[2])), Date.UTC(parseInt(EndDate[0]), parseInt(EndDate[1]) - 1, parseInt(EndDate[2])))
            }
        },
        xAxis: [
            {
                min: startDate,
                dateTimeLabelFormats: {
                    week: {
                        list: [$("#Week").val() + '%W', $("#Week").val().substring(0, 1) + '%W']
                    }
                }
            },
            {
                max: EndDate,
                dateTimeLabelFormats: {
                    week: $("#Week").val() + '%W'
                }
            },
        ],
        tooltip: {
            formatter: function () {
                let startDateT = moment(this.point.options.start).add(1, "days").format("dddd, MMM DD, YYYY");
                let endDateT = moment(this.point.options.end).add(1, "days").format("dddd, MMM DD, YYYY");

                return `
                    ${this.series.name}<br>
                    <strong>${this.point.name}</strong><br>
                    ${$("#Start").val()}: ${startDateT}<br>
                    ${$("#End").val()}: ${endDateT}<br>
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
                categories: [],
                cursor: 'pointer'
            }
        },
        scrollbar: {
            enabled: true
        },
        rangeSelector: {
            enabled: true,
            selected: false,
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
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (e) {
                            //console.log(e.point);
                            //console.log(e.point.proyectID);
                            location.href = '/Execution/Project?id=' + e.point.proyectID;
                        }
                    }
                }
            }
        },
        series: [{
            data: projects
        }]
    });
}
function ComplianceGoalChart(Porcent) {
    HighF.chart('container2', {
        credits: false,
        chart: {
            type: 'solidgauge',
            marginTop: 50,
        },
        /*title: {
            text: 'CUMPLIMIENTO DE METAS',
            style: {
                color: '#205280',
                fontWeight: 'bold'
            }
        },*/
        title: false,
        exporting: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        pane: {
            startAngle: 0,
            endAngle: 360,
            background: [{
                outerRadius: '116%',
                innerRadius: '85%',
                backgroundColor: Highcharts.Color('#205180').setOpacity(0.3).get(),
                borderWidth: 0
            }]
        },
        yAxis: {
            min: 0,
            max: 100,
            lineWidth: 0,
            tickPositions: []
        },
        plotOptions: {
            solidgauge: {
                borderWidth: '30px',
                dataLabels: {
                    enabled: true,
                    y: -35,
                    borderWidth: 0,
                    backgroundColor: 'none',
                    useHTML: true,
                    shadow: false,
                    style: {
                        fontSize: '16px'
                    },
                    formatter: function () {
                        return '<div style="width:100%;text-align:center;"><span style="font-size:1.2em;font-weight:bold;">' + this.point.series.name + '</span><br/><span style="font-size:3em;color:' + Highcharts.getOptions().colors[0] + ';font-weight:bold;">' + this.y + '</span>';
                    }
                },
                linecap: 'round',
                stickyTracking: true,
                rounded: true
            }
        },
        series: [{
            name: $.i18n._('Home_006'),
            data: [{
                color: '#205180',
                radius: '112%',
                innerRadius: '88%',
                y: Porcent
            }]
        }],
        lang: {
            noData: "No data to display"
        },
        noData: {
            style: {
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#333333'
            }
        }
    });
}
function StatusElements(categorias, OnTime, Delayed, WithImpact, Closed, Canceled) {
    //BARRAS
    Highstock.chart('container3', {
        chart: {
            type: 'column'
        },
        title: false,
        /*title: {
            text: 'ESTATUS DE LOS ELEMENTOS',
            style: {
                color: '#205280',
                fontWeight: 'bold'
            }
        },*/
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: categorias,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: $.i18n._('Home_005')
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px; text-transform: uppercase"><b>{point.key}</span></b><table>',
            pointFormat: '<tr style="background-color:{series.color};padding:0;color:#f7f6f6 !important;"><td><b>{series.name}:</b> </td>' +
                '<td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: [{
            name: $.i18n._('elementStatusName_1'),
            color: '#4CAF50',
            data: OnTime

        }, {
            name: $.i18n._('elementStatusName_2'),
            color: '#f7d408',
            data: Delayed

        }, {
            name: $.i18n._('elementStatusName_3'),
            color: '#dc3545',
            data: WithImpact
        }, {
                name: $.i18n._('elementStatusName_4'),
            color: '#aaabad',
            data: Closed

        }, {
            name: $.i18n._('elementStatusName_5'),
            color: '#0e0e0e',
            data: Canceled

        }]
    });
}
function CalidadSeguimiento(QualityTracingData) {
    // UNO
    Highstock.chart('container', {

        chart: {
            polar: true,
            type: 'line'
        },
        title: false,
        /*title: {
            text: 'CALIDAD DE SEGUIMIENTO',
            style: {
                color: '#205280',
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },*/

        pane: {
            size: '90%'
        },

        xAxis: {
            categories: [
                $.i18n._('activity'),
                $.i18n._('milestone'),
                $.i18n._('evidence'),
                $.i18n._('incident'),
                $.i18n._('risk'),
                $.i18n._('agreement')
            ],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}"><b>{point.y:,.0f}%</b><br/>'
        },

        legend: {
            align: 'center',
            verticalAlign: 'middle',
            layout: 'vertical'
        },
        series: [{
            showInLegend: false,
            data: QualityTracingData,
            pointPlacement: 'on'
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    pane: {
                        size: '90%'
                    }
                }
            }]
        }

    });
}

function renderIcons() {

    // Move icon
    if (!this.series[0].icon) {
        this.series[0].icon = this.renderer.path(['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8])
            .attr({
                stroke: '#303030',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': 2,
                zIndex: 10
            })
            .add(this.series[2].group);
    }
    this.series[0].icon.translate(
        this.chartWidth / 2 - 10,
        this.plotHeight / 2 - this.series[0].points[0].shapeArgs.innerR -
        (this.series[0].points[0].shapeArgs.r - this.series[0].points[0].shapeArgs.innerR) / 2
    );

    // Exercise icon
    if (!this.series[1].icon) {
        this.series[1].icon = this.renderer.path(
            ['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8,
                'M', 8, -8, 'L', 16, 0, 8, 8
            ]
        )
            .attr({
                stroke: '#ffffff',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': 2,
                zIndex: 10
            })
            .add(this.series[2].group);
    }
    this.series[1].icon.translate(
        this.chartWidth / 2 - 10,
        this.plotHeight / 2 - this.series[1].points[0].shapeArgs.innerR -
        (this.series[1].points[0].shapeArgs.r - this.series[1].points[0].shapeArgs.innerR) / 2
    );

    // Stand icon
    if (!this.series[2].icon) {
        this.series[2].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
            .attr({
                stroke: '#303030',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': 2,
                zIndex: 10
            })
            .add(this.series[2].group);
    }

    this.series[2].icon.translate(
        this.chartWidth / 2 - 10,
        this.plotHeight / 2 - this.series[2].points[0].shapeArgs.innerR -
        (this.series[2].points[0].shapeArgs.r - this.series[2].points[0].shapeArgs.innerR) / 2
    );
}


$(function () {
    setTimeout(function () {
        let elementDiv = $(".highcharts-series, .highcharts-series-0, .highcharts-solidgauge-series, .highcharts-tracker");
        if (elementDiv.length) {
            elementDiv.trigger('hover');
        }


    }, 600);


});
function hora() {
    $('.fecha').empty();
    $('.hora').empty();
    
    var meses = new Array($.i18n._('January'), $.i18n._('February'), $.i18n._('March'), $.i18n._('April'), $.i18n._('May'), $.i18n._('June'), $.i18n._('July'), $.i18n._('August'), $.i18n._('September'), $.i18n._('October'), $.i18n._('November'), $.i18n._('December'));
    var diasSemana = new Array($.i18n._('Sunday'), $.i18n._('Monday'), $.i18n._('Tuesday'), $.i18n._('Wednesday'), $.i18n._('Thursday'), $.i18n._('Friday'), $.i18n._('Saturday'));
    var f = new Date();
    $('.fecha').append(diasSemana[f.getDay()] + ", " + f.getDate() + "-" + meses[f.getMonth()] + "-" + f.getFullYear());

    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    var meridiano = " am";
    if (hour == 00) { hour = 12; meridiano = "a.m" }
    if (hour == 12) { hour = 12; meridiano = " p.m" }
    if (hour == 13) { hour = '0' + 1; meridiano = "p.m" }
    if (hour == 14) { hour = '0' + 2; meridiano = "p.m" }
    if (hour == 15) { hour = '0' + 3; meridiano = "p.m" }
    if (hour == 16) { hour = '0' + 4; meridiano = "p.m" }
    if (hour == 17) { hour = '0' + 5; meridiano = "p.m" }
    if (hour == 18) { hour = '0' + 6; meridiano = "p.m" }
    if (hour == 19) { hour = '0' + 7; meridiano = "p.m" }
    if (hour == 20) { hour = '0' + 8; meridiano = "p.m" }
    if (hour == 21) { hour = '0' + 9; meridiano = "p.m" }
    if (hour == 22) { hour = 10; meridiano = "p.m" }
    if (hour == 23) { hour = 11; meridiano = "p.m" }
    if (hour < 10) { hour = '' + hour }
    if (minute < 10) { minute = '0' + minute }
    if (second < 10) { second = '0' + second }
    var time = hour + ':' + minute + ':' + second + ' ' + meridiano;
    $('.hora').append(time);
}
