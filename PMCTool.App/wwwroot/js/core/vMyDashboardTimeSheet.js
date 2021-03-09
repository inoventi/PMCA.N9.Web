var chart;
var pageNumber = 1;
var pageSize = 30;
let filtered = false;
let filteredProject = '';
var cn = {
    activeModal: function (proyecto) {
        $("._categoria").empty().html(proyecto);
        $("#modalHoras").modal('show');
    },
    getColor: function (code) {
        var min = Math.ceil(0);
        var max = Math.floor(10);
        var colores = ["#CB4335", "#7D3C98", "#2874A6", "#148F77", "#1E8449", "#B7950B", "#D35400", "#34495E", "#7B241C", "#5B2C6F"];
        var code = Math.floor(Math.random() * (max - min + 1)) + min;
        return colores[code];
    }
}

$(document).ready(function () {

    setFormValidation('#frmMain');

    $("#btnLoadMore").hide();

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
    $('.datepicker').data("DateTimePicker").maxDate(new Date());
    $('.datepicker').data("DateTimePicker").date(new Date());


    $('#WorkedTime').datetimepicker({
        format: 'H:mm',
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
        tooltips: {
            pickHour: $.i18n._('hours'),
            pickMinute: $.i18n._('minutes')
        },
        locale: Cookies.get('pmctool-lang-app').substring(0, 2),
    });

    $("#ProjectID").change(function () {
        getActivities($("#ProjectID").val());
    });

    $('.refresChart').click(function () {
        $("#ProjectName").val($(this).html());
        chart.setTitle({ text: $(this).html() });
    });

    var table = $('#datatables').DataTable({
        columns: [
            { data: "projectName", bSortable: false },
            {
                data: "projectTaskText", bSortable: false,
                render: function (url, type, full) {
                    return '<a href="' + '../Execution/Activity?projectId=' + full.projectID + '&activityId=' + full.projectTaskID + '">' + full.projectTaskText + '</a>';
                }
            },
            { data: "comments", bSortable: false },
            {
                data: "hours", bSortable: false,
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        data = hourFormatter(data);
                    }
                    return data;
                }
            },
            {
                data: "workedDate", bSortable: false,
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: null,
                render: function (url, type, full) {
                    return '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>';
                }
            },
            { data: "timeSheetID", visible: false },
            { data: "projectTaskParticipantID", visible: false },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

            $('td:eq(0)', nRow).addClass('text-left');
            $('td:eq(1)', nRow).addClass('text-left');
            $('td:eq(2)', nRow).addClass('text-justify');
            $('td:eq(3)', nRow).addClass('text-center');
            $('td:eq(4)', nRow).addClass('ws');

            return nRow;
        },
        pageLength: 20,
        buttons: [],
        responsive: true,
        scrollX: true,
        bFilter: false,
        bPaginate: false,
        bLengthChange: false,
        ordering: false,
        info: false,
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanForm();

        if ($(e.target).attr('class') === 'fa fa-edit') {
            $("#btnUpdate").show();
            $("#btnCreate").hide();
            fillForm(data, true);
        }

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            fillForm(data, false);
            deleteEntry();
        }
    });

    drawChart([], []);
    chart.setTitle({ text: $('#ProjectName').val() });
    getChart($('#Project_ID').val());
    summaryPerDay();
    getAllTimesheets(true);

    $("#btnLoadMore").click((event) => {
        pageNumber ++;
        if (filtered) {
            getTimesheets(filteredProject, false);
        }
        else {
            getAllTimesheets(false);
        }
    });
});

function drawChart(categories, workedHours) {
    chart = new Highcharts.chart('grafica', {
        chart: {
            events: {
                redraw: function () {
                    var label = this.renderer.label($.i18n._('drawingChart'), 100, 120)
                        .attr({
                            fill: Highcharts.getOptions().colors[0],
                            padding: 10,
                            r: 5,
                            zIndex: 8
                        })
                        .css({
                            color: '#FFFFFF'
                        })
                        .add();

                    setTimeout(function () {
                        label.fadeOut();
                    }, 1500);
                }
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: categories
        },
        yAxis: {
            title: { text: $.i18n._('values') },
            labels: {
                formatter: function () {
                    var hours = this.value.toFixed(2);
                    var hourPortion = hours.toString().split(".")[0];
                    var minPortion = hours.toString().split(".")[1];
                    var minPortionUsed = (parseInt(hours.toString().split(".")[1]) * 0.6).toFixed(0);
                    if (minPortionUsed < 10) {
                        minPortionUsed = '0' + minPortionUsed.toString();
                    }
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
                minPortionUsed = minPortionUsed.split(".")[0];
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
                return 'Horas: ' + hourPortion + ':' + minPortionUsed + ':00';
            }
        },
        series: [{
            name: $.i18n._('dates'),
            id: $.i18n._('dates'),
            data: workedHours
        }]
    });
}

function getChart(id) {

    var fromDate = new Date(Date.now());
    //fromDate.setDate(fromDate.getDate() - 1);
    fromDate.setDate(fromDate.getDate());
    fromDate = fromDate.toISOString().substring(0, 10);

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetTimesheetChart',
        dataType: 'json',
        data: { participantId: $("#ParticipantID").val(), projectId: id, date: fromDate, days: 15 },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            $('#Project_ID').val(id);

            var categories = [];
            var series = [];

            for (var i = 0; i < data.length; i++) {
                categories.push(data[i].date.substring(0, 10));
                series.push(data[i].workedHours);
            }

            chart.destroy();
            drawChart(categories, series);
            chart.setTitle({ text: $('#ProjectName').val() });
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

function summaryPerDay() {

    var fromDate = new Date(Date.now());
    //fromDate.setDate(fromDate.getDate() - 1);
    fromDate.setDate(fromDate.getDate());
    fromDate = fromDate.toISOString().substring(0, 10);

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetTimesheetSummaryPerDay',
        dataType: 'json',
        data: { participantId: $("#ParticipantID").val(), date: fromDate, days: 9 },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            $('#thhistoric').html('');
            $('#tbhistoric').html('');

            var h = '<tr class="bg-black">';
            var b = '<tr>';

            for (var i = 0; i < data.length; i++) {
                h = h + '<th scope="col" class="text-center">' + data[i].date.substring(0, 10) + '</th>';
                b = b + '<td class="text-center"><a href="#" onclick="summaryPerDayDetail(\'' + data[i].date.substring(0, 10) + '\'); return false;">' + hourFormatter(data[i].workedHours) + '</a></td>';
            }

            h = h + '</tr>';
            b = b + '</tr>';

            $('#thhistoric').append(h);
            $('#tbhistoric').append(b);
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

function summaryPerDayDetail(date) {
    $("#tActivityDailyDetail").html('');

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetTimesheetSummaryPerDayDetail',
        dataType: 'json',
        data: { participantId: $("#ParticipantID").val(), date: date },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var markup = '<tr>'
                    + '<td>' + data[i].projectTaskText + '</td>'
                    + '<td class="text-center">' + hourFormatter(data[i].workedHours) + '</td>'
                    + '<td class="text-center">' + data[i].workedDate.substr(0, 10) + '</td>'
                    + '</tr>';

                $("#tActivityDailyDetail").append(markup);
            }
            $('#modalHoras').modal('show');
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

function getTimesheets(id, firstTime) {
    filtered = true;
    filteredProject = id;
    var table = $('#datatables').DataTable();

    if (firstTime) {
        pageNumber = 1;
        table.clear().draw();
    }

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetTimesheets',
        dataType: 'json',
        data: { participantId: $("#ParticipantID").val(), projectId: id, page: pageNumber, size: pageSize },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.length < pageSize) {
                $("#btnLoadMore").hide();
            }
            else {
                $("#btnLoadMore").show();
            }

            for (var i = 0; i < data.length; i++) {
                table.row.add(data[i]).draw();
            }
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

function getAllTimesheets(firstTime) {
    filtered = false;
    var table = $('#datatables').DataTable();

    if (firstTime) {
        pageNumber = 1;
        table.clear().draw();
    }

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetTimeSheetsByParticipant',
        dataType: 'json',
        data: { participantId: $("#ParticipantID").val(), page: pageNumber, size: pageSize },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.length < pageSize) {
                $("#btnLoadMore").hide();
            }
            else {
                $("#btnLoadMore").show();
            }

            for (var i = 0; i < data.length; i++) {
                table.row.add(data[i]).draw();
            }
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

function cleanForm() {
    var validator = $("#frmMain").validate();
    validator.resetForm();

    $('#Hours').val('');
    $('#WorkedDate').val('');
    $('#Comments').val('');
}

function fillForm(data, show) {

    var array = data.workedDate.split("T");

    $('#TimeSheetID').val(data.timeSheetID);
    $('#ProjectID').val(data.projectID);
    $('#Hours').val(data.hours);
    $('#WorkedTime').val(hourFormatter(data.hours).substr(0,5));
    $('#WorkedDate').val(array[0]);

    $('#Comments').val(data.comments);

    if (show == true) {
        $.when(getActivities(data.projectID)).done(function () {
            $('#ProjectTaskID').val(data.projectTaskID);
            $('#timesheetModal').modal('show');
        });
    }
}

function newEntry() {
    cleanForm();
    $("#btnUpdate").hide();
    $("#btnCreate").show();
    $("#dvStatus").hide();
    getActivities($("#ProjectID").val());
    $('#timesheetModal').modal('show');
}

function createRecord() {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    var h = parseFloat($("#WorkedTime").val().toString().split(":")[0]);
    var m = parseFloat($("#WorkedTime").val().toString().split(":")[1]);

    if (h == 0 && m == 0) {
        return false;
    }

    $("#Hours").val(timeStringToFloat($("#WorkedTime").val()));

    $.ajax({
        type: 'POST',
        url: '/MyDashboard/CreateTimesheet',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#timesheetModal').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reload()
                });
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
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

function updateRecord() {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    var h = parseFloat($("#WorkedTime").val().toString().split(":")[0]);
    var m = parseFloat($("#WorkedTime").val().toString().split(":")[1]);

    if (h == 0 && m == 0) {
        return false;
    }
    
    $("#Hours").val(timeStringToFloat($("#WorkedTime").val()));

    $.ajax({
        type: 'PUT',
        url: '/MyDashboard/UpdateTimesheet',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#timesheetModal').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reload()
                });
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
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

function deleteRecord() {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/MyDashboard/DeleteTimesheet',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reload()
                });
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
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

function getActivities(id) {

    document.getElementById('ProjectTaskID').options.length = 0;
    select = document.getElementById('ProjectTaskID');

    return $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetAssignedTaskSelectionList',
        dataType: 'json',
        data: { projectId: id },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
            }
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

function reload() {
    $("body").css({ 'padding-right': '0px' });
    if ($('#Project_ID').val() == $('#ProjectID').val())
        getChart($('#Project_ID').val());
    summaryPerDay();
    getAllTimesheets(true);
}

function deleteEntry() {
    Swal.fire({
        title: '',
        text: $("#AreYouSureDelete").val(),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            deleteRecord('Execution');
        }
    });
}