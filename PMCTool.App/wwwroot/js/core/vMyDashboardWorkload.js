var chart;

$(document).ready(function () {

    $('.datepicker').datetimepicker({
        format: 'YYYY-MM-DD',
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        },
        locale: Cookies.get('pmctool-lang-app').substring(0, 2),
    });

    var table = $('#datatables').DataTable({
        columns: [
            { data: "projectName" },
            { data: "projectTaskText" },
            {
                data: "plannedHours", render: function (data, type, row, meta) {
                    if (data !== null) {
                        data = hourFormatter(data);
                    }
                    return data;
                }
            },
            {
                data: "workedHours",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        data = hourFormatter(data);
                    }
                    return data;
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

            $('td:eq(0)', nRow).addClass('text-left');
            $('td:eq(1)', nRow).addClass('text-center');

            return nRow;
        },
        pageLength: 20,
        buttons: [],
        responsive: true,
        scrollX: true,
        bFilter: false,
        bPaginate: true,
        bLengthChange: false,
        ordering: false,
        info: false,
    });

    drawChart([], [], []);
    //refresh();
});

function drawChart(categories, plannedHours, limit) {
    chart = new Highcharts.chart('grafica', {
        colors: ['#5BC6F7', '#F50909', '#1587BB', '#940909', '#ccc', '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
        chart: { type: 'line', zoomType: 'x y' }, title: { text: '' }, subtitle: { text: '' },
        xAxis: { categories: categories },
        yAxis: {
            title: { text: $.i18n._('manHours') },
            labels: {
                formatter: function () {
                    var hours = (((this.value / 1000) / 60) / 60).toFixed(2);
                    var hourPortion = hours.toString().split(".")[0];
                    var minPortion = hours.toString().split(".")[1];
                    var minPortionUsed = (parseInt(hours.toString().split(".")[1]) * 0.6).toFixed(0);
                    if (minPortionUsed < 10) {
                        minPortionUsed = '0' + minPortionUsed.toString();
                    }
                    if (hourPortion.length < 2)
                        hourPortion = "0" + hourPortion;
                    return hourPortion + ':' + minPortionUsed + ':00';
                }
            }
        },
        tooltip: {
            formatter: function () {
                var hora = this.y;
                var hourPortion = hora.toString().split(".")[0];
                var minPortion = hora.toString().split(".")[1];
                var minPortionUsed = (parseInt(hora.toString().split(".")[1]) * 0.6).toFixed(2);
                var longitud = minPortionUsed.length;
                if (longitud == 1) {
                    minPortionUsed = minPortionUsed * 10;
                }
                if (minPortionUsed < 10) {
                    minPortionUsed = '0' + minPortionUsed.toString();
                }
                var minu = isNaN(minPortionUsed);
                if (minu == true) {
                    minPortionUsed = '00';
                }
                if (hourPortion.length < 2)
                    hourPortion = "0" + hourPortion;
                return 'Horas: ' + hourPortion + ':' + minPortionUsed + ':00';
                //return 'Horas: ' + Highcharts.dateFormat('%H:%M:%S', this.y);
            }
        },
        tooltip: {
            formatter: function () {
                var hours = (((this.y / 1000) / 60) / 60).toFixed(2);
                var hourPortion = hours.toString().split(".")[0];
                var minPortion = hours.toString().split(".")[1];
                var minPortionUsed = (parseInt(hours.toString().split(".")[1]) * 0.6).toFixed(0);
                if (minPortionUsed < 10) {
                    minPortionUsed = '0' + minPortionUsed.toString();
                }
                if (hourPortion.length < 2)
                    hourPortion = "0" + hourPortion;
                return 'Horas: ' + hourPortion + ':' + minPortionUsed + ':00';
                //return 'Horas: ' + Highcharts.dateFormat('%H:%M:%S', this.y);
            }
        },
        plotOptions: {
            series: {
                animation: {
                    duration: 1500
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            if (this.series.legendItem.textStr == $.i18n._('plannedHours')) {
                                getWorkloadDetail(this.category);
                            }
                        }
                    }
                }
            }
        }
        , series: [{ name: $.i18n._('plannedHours'), data: plannedHours }, { name: $.i18n._('Limit'), data: limit }]
    });
}

function refresh() {

    if (new Date($("#StartDate").val()) > new Date($("#EndDate").val())) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#m4025').val(),
            footer: '',
        });
        return false;
    }

    getWorkloadData();
}

function getWorkloadData() {
    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetWorkloadData',
        dataType: 'json',
        data: { participantId: $("#ParticipantID").val(), startDate: $("#StartDate").val(), endDate: $("#EndDate").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            getWorkloadByDay(data.timeSheetByDate);
            getWorkloadByProject(data.timeSheetByProject);
        },
        complete: function () {
            LoaderHide();
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

function getWorkloadByDay(data) {
    var categories = [];
    var series = [];
    var limit = [];

    for (var i = 0; i < data.length; i++) {
        categories.push(data[i].date.substring(0, 10));
        series.push((((data[i].plannedHours * 1000) * 60) * 60));
        limit.push(28800000);
    }

    chart.destroy();
    drawChart(categories, series, limit);
}

function getWorkloadByProject(data) {
    var table = $('#datatables').DataTable();
    table.clear().draw();

    for (var i = 0; i < data.length; i++) {
        table.row.add(data[i]).draw();
    }
}

function getWorkloadDetail(date) {
    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetWorkloadDetail',
        dataType: 'json',
        data: { participantId: $("#ParticipantID").val(), date: date },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            $("#tdetail").html('');

            for (var i = 0; i < data.length; i++) {
                var markup = '<tr>'
                    + '<td><a href="../Execution/Project?id=' + data[i].projectID + '">' + data[i].projectName + '</a></td>'
                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws"></span> <a href="../Execution/Activity?projectId=' + data[i].projectID + '&activityId=' + data[i].projectTaskID+ '">' + data[i].projectTaskText + '</a ></td>'
                    + '<td>' + data[i].date.substring(0, 10) + '</td>'
                    + '<td class="text-center">' + hourFormatter(data[i].plannedHours) + '</td>'
                    + '</tr>';
                $("#tdetail").append(markup);
            }

            $('#category').text(date);
            $('#workloadModal').modal('show');
        },
        complete: function () {
            LoaderHide();
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