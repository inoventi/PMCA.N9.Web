//var intentos = 0;
$(function () {
    AjaxGetParticipantID();
});

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
                    //intentos++;
                    //AjaxGetParticipantID();
                } else {
                    getProjects(participant);
                    getChangeControlProjects(participant);
                    getElementsProject(participant);
                    getProjectTask($("#ProjectID").val());
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
    //}
}

function refresh(id, text) {
    getProjectTask(id);
}
function getProjectTask(id) {
    $.ajax({
        type: "GET",
        url: '/Analytics/GetDataParticipantTaskByProject?projectId='+ id,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            //console.log(data);
            if (data.isSuccess != false) {
                var categories = [];
                var series = [];
                var projectName = data[0].projectName;
                for (var i = 0; i < data.length; i++) {
                    categories.push(data[i].activityName);
                /*Base */
                    if (data[i].baseStartDate != null) {
                        var baseStartDate = data[i].baseStartDate.substr(0, 10).split('-');
                        var baseStart = Date.UTC(parseInt(baseStartDate[0]), parseInt(baseStartDate[1]) - 1, parseInt(baseStartDate[2]));
                    } else {
                        var baseStart = null;
                    }
                    if (data[i].baseEndDate != null) {
                        var baseEndDate = data[i].baseEndDate.substr(0, 10).split('-');
                        var baseEnd = Date.UTC(parseInt(baseEndDate[0]), parseInt(baseEndDate[1]) - 1, parseInt(baseEndDate[2]));
                    } else {
                        var baseEnd = null;
                    }
                    /*Planeada */
                    var startDate = data[i].startDate.substr(0, 10).split('-');
                    var endDate = data[i].endDate.substr(0, 10).split('-');
                    /*Real */
                    var realStartDate = data[i].realStartDate.substr(0, 10).split('-');
                    var realEndDate = data[i].realEndDate.substr(0, 10).split('-');
                    series.push(
                        {
                            x: Date.UTC(parseInt(startDate[0]), parseInt(startDate[1]) - 1, parseInt(startDate[2])),
                            x2: Date.UTC(parseInt(endDate[0]), parseInt(endDate[1]) - 1, parseInt(endDate[2])),
                            y: parseInt(data[i].order) - 1,
                            pointWidth: 25,
                            className: 'clase',
                            color: 'rgb(124, 181, 236)'
                        },
                        {
                            x: Date.UTC(parseInt(realStartDate[0]), parseInt(realStartDate[1]) - 1, parseInt(realStartDate[2])),
                            x2: Date.UTC(parseInt(realEndDate[0]), parseInt(realEndDate[1]) - 1, parseInt(realEndDate[2])),
                            y: parseInt(data[i].order) - 1,
                            pointWidth: 15,
                            className: 'clase',
                            color: 'red'
                        },
                        {
                            x: baseStart,
                            x2: baseEnd,
                            y: parseInt(data[i].order) - 1,
                            pointWidth: 5,
                            className: 'clase',
                            color: 'grey'
                        }
                    );
                    //console.log(series);
                }
                var length = categories.length;
                prjectComparative(categories, series, projectName, length);
            }             
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}

function getElementsProject(participant) {
    $.ajax({
        type: "GET",
        url: '/Analytics/GetDataProjectsElementsByParticipant?participantID=' + participant,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess != false) {
                //var obj = '[{"ProjectID":"1","ProjectName":"Guadalupe-Reyes","Activity":"10","Milestone":"5","Evidence":"16","Incident":"12","Risk":"1","Agreement":"4"},{"ProjectID":"2","ProjectName":"Nuevo project","Activity":"3","Milestone":"4","Evidence":"5","Incident":"6","Risk":"7","Agreement":"8"},{"ProjectID":"3","ProjectName":"Proyecto concluido","Activity":"15","Milestone":"28","Evidence":"10","Incident":"21","Risk":"5","Agreement":"1"},{"ProjectID":"4","ProjectName":"Proyecto de Abraham","Activity":"0","Milestone":"0","Evidence":"1","Incident":"0","Risk":"0","Agreement":"0"}]';
                //var data = jQuery.parseJSON(obj);
                //console.log(data);
                var categories = [];
                //var series = [];
                var countAct = []; var countM = []; var countE = []; var countI = []; var countR = []; var countAgree = [];
                for (var i = 0; i < data.length; i++) {
                    categories.push(data[i].projectName);
                    countAct.push(parseInt(data[i].activity))
                    countM.push(parseInt(data[i].milestone))
                    countE.push(parseInt(data[i].evidence))
                    countI.push(parseInt(data[i].incident))
                    countR.push(parseInt(data[i].risk))
                    countAgree.push(parseInt(data[i].agreement))
                    
                }
    
                elementsProject(categories, countAct, countM, countE, countI, countR, countAgree);
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}


function getProjects(participant) {
    $.ajax({
        type: "GET",
        url: '/Analytics/GetDataProjectsByParticipant?participantID=' + participant,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess != false) {
                //console.log(data);
            var projects = [];
            var StartDates = [];
            var EndDates = [];
            for (var i = 0; i < data.length; i++) {  
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
                if (data[i].startDate != null || data[i].endDate != null) {
                    var sd = data[i].startDate.substr(0, 10).split('-');
                    var ed = data[i].endDate.substr(0, 10).split('-');
                    var ProjectName = data[i].projectName;
                    if (ProjectName.length > 30) {
                        ProjectName = ProjectName.substr(0, 31) + '...';
                    }
                    projects.push({
                        proyectID: data[i].projectID,
                        name: ProjectName,
                        start: Date.UTC(parseInt(sd[0]), parseInt(sd[1]) - 1, parseInt(sd[2])),
                        end: Date.UTC(parseInt(ed[0]), parseInt(ed[1]) - 1, parseInt(ed[2])),
                        completed: {
                            amount: parseFloat(data[i].progress.toFixed(4)),
                            fill: fill
                        },
                        color: color
                    });
                    StartDates.push(
                        new Date(data[i].startDate)
                    );
                    EndDates.push(
                        new Date(data[i].endDate)
                    );
                }
            }
            var min = new Date(Math.min.apply(null, StartDates));
            var min = min.setDate(min.getDate() + 0);
            var max = new Date(Math.max.apply(null, EndDates));
            var max = max.setDate(max.getDate() + 0);
            Projects(projects,min,max);
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}

function getChangeControlProjects(participant) {
    $.ajax({
        type: "GET",
        url: '/Analytics/GetDataChangeControlProjectsByParticipant?participantID=' + participant,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess != false) {
                //var obj = '[{"ProjectID":"1","ProjectName":"Guadalupe-Reyes","Total":"50"},{"ProjectID":"2","ProjectName":"Nuevo project","Total":"40"},{"ProjectID":"1","ProjectName":"Proyecto concluido","Total":"15"},{"ProjectID":"1","ProjectName":"Proyecto de Abraham","Total":"50"}]';
                //var data = jQuery.parseJSON(obj);
                var series = [];
                var contador = 0;
                for (var i = 0; i < data.length; i++) {
                    if (contador == 0) {
                        series.push
                            ({
                                name: '(' + data[i].total + ') ' + data[i].projectName,
                                y: parseInt(data[i].total),
                                sliced: true,
                                selected: true
                            });
                    } else {
                        series.push
                            ({
                                name: '(' + data[i].total + ') ' +  data[i].projectName,
                                y: parseInt(data[i].total)
                            });
                    }
                    contador = i + 1;
                }
                ChangeControlProjects(series);
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
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
function Projects(projects, startDate, EndDate) {
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
    chartProjects = new Highcharts.ganttChart('proyectos', {
        title: false,
        events: {
            load() {
                let chart = this;
                chart.xAxis[0].setExtremes(Date.UTC(parseInt(startDate[0]), parseInt(startDate[1]) - 1, parseInt(startDate[2])), Date.UTC(parseInt(EndDate[0]), parseInt(EndDate[1]) - 1, parseInt(EndDate[2])))
            }
        },
        /*title: {
            text: 'PROYECTOS',
            style: {
                color: '#205280',
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },*/

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
                            location.href = '/Analytics/Project?projectId=' + e.point.proyectID;
                        }
                    }
                }
            }
        },
        series: [{
            name: $.i18n._('project'),
            data: projects
        }]
    });
}

// Build the chart
function ChangeControlProjects(series) {
    chartChangeControl = new Highcharts.chart('cambiosProyectos', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: false,
        /*title: {
            text: 'CAMBIOS EN PROYECTOS',
            style: {
                color: '#205280',
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },*/
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            //pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Porcentaje',
            colorByPoint: true,
            data: series
        }]
    });
}


function elementsProject(categories, countAct, countM, countE, countI, countR, countAgree) {
    chartElements = new Highcharts.chart('elementosProyecto', {
        chart: {
            type: 'bar'
        },
        title: false,
        /*title: {
            text: 'ELEMENTOS POR PROYECTO',
            style: {
                color: '#205280',
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },*/
        subtitle: {
            //text: 'Source: <a href="https://en.wikipedia.org/wiki/World_population">Wikipedia.org</a>'
        },
        xAxis: {
            categories: categories,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            valueSuffix: ''
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 80,
            floating: true,
            borderWidth: 1,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [{
            name: $.i18n._('activity'),
            data: countAct
        }, {
            name: $.i18n._('milestone'),
            data: countM
        }, {
            name: $.i18n._('evidence'),
            data: countE
        }, {
            name: $.i18n._('incident'),
            data: countI
        }, {
            name: $.i18n._('risk'),
            data: countR
        }, {
            name: $.i18n._('agreement'),
            data: countAgree
        }]
    });
}


function prjectComparative(categories, seriesA, projectName, length) {
    var min;
    var max;
    if (length < 10) { min = null; max = null } else { min = 0; max = 9; }
    chartProjectComparative = new Highcharts.chart('comparativoPlan', {
        chart: {
            type: 'xrange'
        },
        title: false,
        title: {
            text: $.i18n._('project')+': '+ projectName,
            //style: {
            //    color: '#205280',
            //    fontWeight: 'bold',
            //    textAlign: 'center'
            //}
        },
        accessibility: {
            point: {
                descriptionFormatter: function (point) {
                    var ix = point.index + 1,
                        seriesA = point.seriesA,
                        from = new Date(point.x),
                        to = new Date(point.x2);
                    return ix + '. ' + seriesA + ', ' + from.toDateString() +
                        ' to ' + to.toDateString() + '.';
                }
            }
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: ''
            },
            categories: categories,
            className: 'clase',
            reversed: true,
            min: min,
            max: max,
            scrollbar: {
                enabled: true
            },
        },
        tooltip: {
            xDateFormat: '%Y-%m-%d',
            shared: false
        },
        series: [{
            name: projectName,
            borderColor: 'gray',
            data: seriesA,
            dataLabels: {
                enabled: true
            }
        }],
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