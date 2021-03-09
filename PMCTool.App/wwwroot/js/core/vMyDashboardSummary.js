var chart;
var oData;
var cn = {
    activeModal: function (proyecto) {
        $("._categoria").empty().html(proyecto);
        $("#graphModal").modal('show');
    }

}

$(document).ready(function () {
    drawChart([], [], []);
    getProjectByHours();
});

function drawChart(categories, plannedHours, realHours) {
    chart = new Highcharts.chart('grafica', {
        colors: ['#5BC6F7', '#F50909'],
        chart: {
            type: 'column',
            zoomType: 'x y',
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: $.i18n._('hoursByProject').toUpperCase()
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: categories,
            crosshair: true,
            /*labels: {
                rotation: 90
            }*/
        },
        yAxis: {
            min: 0,
            title: {
                text: $.i18n._('hours')
            },
            labels: {
                formatter: function () {
                    var hours = (((this.value / 1000) / 60) / 60).toFixed(2);
                    var hourPortion = hours.toString().split(".")[0];
                    var minPortion = hours.toString().split(".")[1];
                    var minPortionUsed = (parseInt(hours.toString().split(".")[1]) * 0.6).toFixed(0);
                    if (minPortionUsed < 10) {
                        minPortionUsed = '0' + minPortionUsed.toString();
                    }
                    return hourPortion + ':00:00';
                }
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
                return $.i18n._('hours') + ': ' + hourPortion + ':' + minPortionUsed + ':00';
            }
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                animation: {
                    duration: 1500
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            if (this.series.legendItem.textStr == $.i18n._('realHours')) {
                                projectDetail(oData[this.index].projectID, this.category);
                            }
                        }
                    }
                }
            }
        },
        series: [{
            name: $.i18n._('plannedHours'),
            data: plannedHours

        }, {
            name: $.i18n._('realHours'),
                data: realHours
        }]
    });
}

function getProjectByHours() {
    
    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetProjectByHours',
        dataType: 'json',
        data: { },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            oData = data;
            var categories = [];
            var plannedHours = [];
            var realHours = [];

            for (var i = 0; i < data.length; i++) {
                categories.push(data[i].projectName);
                plannedHours.push((((data[i].plannedHours * 1000) * 60) * 60));
                realHours.push((((data[i].workedHours * 1000) * 60) * 60));
            }

            chart.destroy();
            drawChart(categories, plannedHours, realHours);
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

function projectDetail(id, projectName) {
    $("#tHoursDetail").html('');

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetProjectByHoursDetail',
        dataType: 'json',
        data: { projectId: id },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            var th = 0;

            for (var i = 0; i < data.length; i++) {
                th = th + data[i].workedHours;

                var markup = '<tr>'
                    + '<td><a href="' + getNotificationLink(1, id, data[i].projectTaskID, null) + '">' + data[i].activityDescription + '</a></td>'
                    + '<td class="text-center">' + data[i].workedDate.substr(0, 10) + '</td>'
                    + '<td class="text-center">' + hourFormatter(data[i].workedHours) + '</td>'
                    + '</tr>';

                $("#tHoursDetail").append(markup);
            }
            var markup = '<tr>'
                + '<td></td>'
                + '<td class="text-right font-weight-bold"> Total:</td>'
                + '<td class="text-center font-weight-bold">' + hourFormatter(th) + ' hrs</td>'
                + '</tr>';
            $("#tHoursDetail").append(markup);

            $("#graphModalProjectName").text(projectName);

            $('#graphModal').modal('show');
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

function statusDetail(status) {
    $("#tdetail").html('');

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetSummaryByStatus',
        dataType: 'json',
        data: { status: status },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var markup = '<tr>'
                    + '<td>' + getElementTypeName(data[i].elementType) + '</td>'
                    + '<td><a href="' + getNotificationLink(data[i].elementType, data[i].projectID, data[i].elementID, data[i].parentID) + '">' + data[i].elementDescription + '</a></td>'
                    + '<td>' + data[i].projectName + '</td>'
                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                    + '</tr>';

                $("#tdetail").append(markup);
            }
            $('#countStatusModal').modal('show');
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

function projectStatusDetail(id, name, status) {
    $("#tProjectDetail").html('');

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetSummaryProjectStatus',
        dataType: 'json',
        data: { projectId: id, status: status },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var markup = '<tr>'
                    + '<td><a href="' + getNotificationLink(data[i].elementType, data[i].projectID, data[i].elementID, data[i].parentID) + '">' + getElementTypeName(data[i].elementType) + '</a></td>'
                    + '<td>' + data[i].elementDescription + '</td>'
                    + '<td class="text-center">' + data[i].endDate.substr(0, 10) + '</td>'
                    + '<td class="text-center">' + (data[i].progress * 100).toFixed(2) + '%</td>'
                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                    + '</tr>';

                $("#tProjectDetail").append(markup);
            }
            $("#pname").html(name);
            $('#countProjectModal').modal('show');
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