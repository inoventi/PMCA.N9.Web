$(document).ready(function () {

    $('#RealProgress').mask('##0.00', { reverse: true });

    var today = new Date();
    function byId(list, id) {
        for (var i = 0; i < list.length; i++) {
            if (id == null)
                id = "";
            if (list[i].key == id)
                return list[i].label || "";
        }
        return "";
    }

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 8, 9],
            format: {
                body: function (data, row, column, node) {
                    if (column == 1) {
                        data = table.cell(row, 2).nodes().to$().find('a').text();
                    }
                    if (column == 6) {
                        data = table.cell(row, 8).nodes().to$().find('span').text();
                    }
                    return data;
                }
            }
        }
    };
    
    var urlParams = new URLSearchParams(location.search);

    var projectId = urlParams.get('id');
    var projectConfig = getProjectConfig(projectId);
    var participants = getParticipants(projectId);
    var projectTasks = getProjectTasks(projectId);

    $('#ProjectID').val(projectId);

    // ***** Initiating Gantt data *****
    
    gantt.load("/Gantt/GetWithCancel?id=" + projectId);
    gantt.plugins({ // fix update 
        auto_scheduling: true 
    });
    // ***** Server lists *****
    gantt.serverList("staff", participants);

    // ***** Gantt configuration *****
    gantt.config.work_time = true;  // removes non-working time from calculations 
    //gantt.config.scale_unit = "day";
    //gantt.config.date_scale = "%D, %d";
    gantt.config.scales = [{ unit: "day", format: "%D, %d" }];
    gantt.config.duration_unit = "day";

    //gantt.config.skip_off_time = true;    // hides non-working time in the chart
    gantt.config.date_format = "%Y-%m-%d %H:%i";

    gantt.config.columns = [
        { name: "wbs", label: "WBS", width: 40, template: gantt.getWBSCode },
        { name: "text", width: "*", tree: true },
        { name: "start_date", width: 100, align: "center" },
        {
            name: "end_date",
            width: 100,
            label: gantt.locale.labels.column_end_date,
            template: function (task) {
                //return convertDate(gantt.date.add(task.end_date, -1, gantt.config.duration_unit))
                return convertDate(task.end_date)
            },
            align: "center"
        },
        { name: "duration", align: "center" },
        {
            name: "owner", label: gantt.locale.labels.column_owner, width: 80, align: "center", template: function (item) {
                return byId(gantt.serverList('staff'), item.owner_id)
            }
        },
        {
            name: "progress", label: gantt.locale.labels.column_progress, width: 80, align: "center", template: function (item) {
                return taskStatus(gantt, item);
            }
        }
    ];

    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_strict = true;

    // ***** Calendar type *****
    // https://docs.dhtmlx.com/gantt/api__gantt_setworktime.html
    // The default working time is the following:
    //   - Working days: Monday - Friday.
    //   - Working hours: 08: 00 - 17: 00.

    if (projectConfig.project.calendarType == 2) {
        gantt.setWorkTime({ day: 6, hours: [8, 17] });
    }
    else if (projectConfig.project.calendarType == 3) {
        gantt.setWorkTime({ day: 6 })
        gantt.setWorkTime({ day: 0 })
        //gantt.setWorkTime({ day: 0, hours: [8, 17] });
        //gantt.setWorkTime({ day: 6, hours: [8, 17] });
    }


    // ***** Days off (weekends and holidays) *****
    // gantt.setWorkTime({ date: new Date(2019, 6, 15), hours: false })  //makes a specific date a day-off
    for (var i = 0; i < projectConfig.holidays.length; i++) {
        gantt.setWorkTime({ date: new Date(projectConfig.holidays[i]), hours: false })  //makes a specific date a day-off    
    }

    gantt.init("gantt");

    // initializing dataProcessor

    var dp = gantt.createDataProcessor({
        //url: "/Gant",
        //mode: "REST",
        task: {
            create: function (data) {

                return new gantt.Promise(function (resolve, reject) {
                    data.projectId = projectId;
                    data.wbsCode = gantt.getWBSCode(gantt.getTask(data.id));
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/CreateTask',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (result) {
                            var newTask = JSON.parse(result.valueString);
                            return resolve({ tid: newTask.id });
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                            return reject();
                        }
                    });
                });
            },
            update: function (data, id) {

                //if (data.id != $('#id').val())
                //    return;
                return new gantt.Promise(function (resolve, reject) {
                    var task = gantt.getTask(data.id)

                    data.projectId = projectId;
                    data.wbsCode = gantt.getWBSCode(gantt.getTask(data.id));

                    if (data.id == $('#id').val()) {
                        data.changeControlAuthorizer = $('#ChangeControlAuthorizer').val();
                        data.changeControlComments = $('#ChangeControlComments').val();
                        data.changeControlManualInput = $('#ChangeControlManual').val();
                    }

                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/UpdateTask',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            if (task.id == $('#id').val()) {
                                if (data.isSuccess) {
                                    Swal
                                        .fire({
                                            type: 'success',
                                            title: '',
                                            text: data.successMessage,
                                            footer: '',
                                            onAfterClose: () => { LoaderShow(); location.reload() }
                                        });
                                } else {
                                    Swal.fire({
                                        type: 'error',
                                        title: '',
                                        text: data.errorMessage,
                                        footer: ''
                                    });
                                }
                            }
                            
                            return resolve();
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                            return reject();
                        }
                    });
                });
            },
            delete: function (id) {
                return new gantt.Promise(function (resolve, reject) {
                    var data = {
                        id: id
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/DeleteTask',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            return resolve();
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                            return reject();
                        }
                    });
                });
            }
        },
        link: {
            create: function (data) {
                return new gantt.Promise(function (resolve, reject) {
                    data.projectId = projectId;
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/CreateLink',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            var newLink = JSON.parse(data.valueString);
                            return resolve({ tid: newLink.id });
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                        }
                    });
                });
            },
            update: function (data, id) {
                return new gantt.Promise(function (resolve, reject) {
                    data.projectId = projectId;
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/UpdateLink',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            return resolve();
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                            return reject();
                        }
                    });
                });
            },
            delete: function (id) {
                return new gantt.Promise(function (resolve, reject) {
                    var data = {
                        id: id
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/DeleteLink',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {

                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                        }
                    });
                });
            }
        }
    });

    // and attaching it to gantt
    dp.init(gantt);

    // Add a search input for every column
    $('#datatables thead tr').clone(true).prependTo('#datatables thead');
    $('#datatables thead tr:nth-child(2) th').each(function (index, value) {
        if (index == 10) {
            value.hidden = true; // Hide "Actions header"
        } else {
            let columnName = $(this).text();

            $(this).html('<input id=index' + index + ' data-columnindexforrender="' + index + '" type="text" placeholder="' + $("#Search").val() + " " + columnName + '" title="' + $("#Search").val() + " " + columnName + '" class="form-control"/>');

            $('input', this).on('keyup change', function () {
                if (table.column(index).search() !== this.value) {
                    table.column(index).search(this.value).draw();
                }
            });
        }
    });

    var table = $('#datatables').DataTable({
        columns: [
            { data: "id", visible: false },
            { data: "wbsCode" },
            {
                data: "description", targets: 2,
                render: function (url, type, full) {

                    return '<div>' +
                        '<a href="/Execution/Activity?projectId=' + projectId + '&activityId=' + full.id + '">' + full.description + '</a>' +
                        '<div>';
                }
            },
            { data: "start_date" },
            {
                data: "end_date",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            { data: "progress" },
            { data: "plannedProgress" },
            {
                data: "owner_photo", targets: 7,
                render: function (url, type, full) {
                    return '<div class="ws">' +
                        '<img class="box-p" src=' + full.owner_photo + '>' +
                        '<a href="#" onclick="getParticipantInfoModal(' + "'" + full.owner_id + "'" + '); return false;">' + full.owner_name + '</a>' +
                        '<div>';
                }
            },
            {
                data: "status", targets: 8,
                render: function (url, type, full) {
                    return '<span class="bold ' + getStatusClassName(full.status) + ' ws">' + $("#EnumProjectElementStatus_" + full.status).val() + '</span>';
                }
            },
            { data: "comment" },
            {
                data: "actions", targets: 10,
                render: function (url, type, full) {
                    var result = '';
                    if (full.editableByRol) {
                        result = result + '<a class="btn btn-link btn-warning" data-toggle="modal" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;';
                    }
                    if (full.projectPhase == 1 && full.deleteableByRol) {
                        result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;';
                    }

                    if (!full.hasChild && full.projectPhase == 2 && full.deleteableByRol) {
                        if (full.status != 5 && full.status != 4)
                            result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Cancel").val() + '"><i class="fas fa-ban"></i></a>&nbsp;';
                        if (full.status == 5 && full.children == 0)
                            result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Archive").val() + '"><i class="fas fa-ban"></i></a>&nbsp;';

                    }
                    return result;
                }
            },
            { data: "sortorder", visible: false },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        //dom: 'Bfrtip',
        buttons: [
            $.extend(true, {}, fileExportOptions, { extend: 'excelHtml5' }),
        ],
        order: [[11, "asc"]],
        //responsive: true,
        scrollX: true,
        searching: true,
        orderCellsTop: true,
        //fixedHeader: true,
        responsive: {
            details: {
                renderer: function (api, rowIdx, columns) {
                    var data = $.map(columns, function (col, i) {
                        if (col.hidden) {
                            anyHidden = true;
                        }
                        var hidden = col.hidden ? true : !table.column(col.columnIndex).visible();
                        
                        if (hidden)
                            $("#index" + col.columnIndex).hide();
                        else
                            $("#index" + col.columnIndex).show();

                        return (hidden && col.columnIndex != 0 && col.columnIndex != 11) ? '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '">' + '<td><b>' + col.title + ':' + '</b></td> ' + '<td>' + table.cell(rowIdx, i).render('display') + '</td>' + '</tr>' : '';
                    }).join('');

                    $("#datatables").DataTable().columns.adjust();
                    $("#datatables").DataTable().responsive.recalc();

                    return anyHidden ? $('<table/>').append(data) : false;
                }
            }
        },
        fnInitComplete: function (oSettings, json) {
            hideSearchBars();
        }
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanForm();
        fillForm(data);
        if ($(e.target).attr('class') == 'fa fa-edit') {
            if (data.hasChild) {
                $("#dvStartDate").hide();
                $("#dvEndDate").hide();
                $("#dvProgress").hide();
                $("#dvStatus").hide();

            }
            if (!data.hasChild) {
                $("#dvStartDate").show();
                $("#dvEndDate").show();
                $("#dvProgress").show();
                $("#dvStatus").show();

            }
            if (!data.progressEditable) {
                $('#RealProgress').prop('readonly', true);
            }
            else {
                $('#RealProgress').prop('readonly', false);
            }

            $("#btnUpdate").show();

            if (data.status == 5) {
                $("#btnUpdate").html($('#Reopen').val());

                if (data.children != 0)
                    $("#btnUpdate").hide();
            }
            else
                $("#btnUpdate").html($('#Update').val());

            $('#editModal').modal('show');
        }
        if ($(e.target).attr('class') == 'fas fa-ban') {
            if (data.status != 5 && data.status != 4)
                cancelProjectTask(projectId);

            if (data.status == 5)
                archiveProjectTask(projectId);

        }
    })

    gantt.attachEvent("onAfterAutoSchedule", function () {
        var projectTaskTable = [];

        var table = $('#datatables').DataTable();
        table.clear();

        projectTasks.forEach(function (projectTask, index) {
            var task = gantt.getTask(projectTask.id);
            var owner = byId(gantt.serverList('staff'), projectTask.owner_id);
            projectTaskTable.push({
                "id": task.id,
                "wbsCode": gantt.getWBSCode(task),
                "description": task.text,
                "start_date": projectTask.start_date,
                "end_date": projectTask.endDateClient,
                "realProgress": ((projectTask.realProgress || 0) * 100).toFixed(2),
                "progress": ((task.progress) * 100).toFixed(2),
                "plannedProgress": ((projectTask.plannedProgress) * 100).toFixed(2),
                "owner_photo": (projectTask.owner_photo == null || projectTask.owner_photo == '') ? '../images/avatar/default-avatar.png' : projectTask.owner_photo,
                "owner_name": projectTask.owner_id == null ? owner : projectTask.owner_name,
                "owner_id": projectTask.owner_id,
                "status": task.status,
                "comment": projectTask.comment,
                "withImpact": task.status == 3 ? true : false,
                "statusName": '<span class="bold ' + getStatusClassName(task.status) + ' ws">' + $("#EnumProjectElementStatus_" + task.status).val() + '</span>',
                "editableByRol": projectTask.editableByRol,
                "deleteableByRol": projectTask.deleteableByRol,
                "projectPhase": projectTask.projectPhase,
                "hasChild": projectTask.hasChild,
                "progressEditable": projectTask.progressEditable,
                "children": projectTask.children,
                "sortorder": projectTask.sortorder,
            });
        });

        table.rows.add(projectTaskTable);
        table.draw();
    });

    gantt.attachEvent("onAfterTaskUpdate", function () {
        gantt.autoSchedule();
    });

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true);

    elementStatusCount();

    if ($('#ChangeControl').val() == 'True') {
        setControlChangeEntry($("#ProjectID").val());
    }

    // Helps datatable to be responsive in certain cases
    window.onresize = () => {
        //$("#datatables").DataTable().rows().invalidate().draw();
        hideSearchBars();
    }
});

function hideSearchBars() {
    let columns = getHiddenColumns()

    for (let i = 1; i < 10; i++) {
        let searchBar = document.getElementById("index" + i);
        if (searchBar != null) {
            if (columns.find((index) => index == i) === undefined)
                searchBar.hidden = false;
            else
                searchBar.hidden = true;
        }
    }

    $("#datatables").DataTable().columns.adjust();
    $("#datatables").DataTable().responsive.recalc();
}

function getHiddenColumns() {
    let tds = document.querySelectorAll("td");
    let hiddenColumns = [];

    tds.forEach((td) => {
        let index = td.cellIndex + 1;
        if (td.style.display == "none")
            if (hiddenColumns.find((colIndex) => index == colIndex) === undefined)
                hiddenColumns.push(index);
    });

    return hiddenColumns;
}

function cleanForm() {
    $('#id').val('');
    $('#start_date').val('');
    $('#end_date').val('');
    $('#RealProgress').val('');
    //var validator = $("#frmMain").validate();
    //validator.resetForm();
}

function fillForm(data) {

    var ed = null;

    if (data.end_date != null) {
         ed = data.end_date.split("T");
        $('#end_date').val(ed[0]);
    }

    $('#id').val(data["id"]);
    $('#start_date').val(data["start_date"]);
    $('#RealProgress').val(data["progress"]);
    $('#owner_id').val(data["owner_id"]);
    $('#StatusIndicator').text($(data.statusName).text());

    setStatusClassName('StatusIndicator', data.status);

    $('#ChangeControlStartDate').val(data["start_date"]);
    $('#ChangeControlEndDate').val(data["end_date"]);
    $('#ChangeControlResponsible').val(data["owner_id"]);

    if (data.withImpact == true) {
        $('#WithImpact').prop('checked', true);
    }
    else {
        $('#WithImpact').prop('checked', false);
    }
    if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {
        $('#owner_id').prop("disabled", true);

    }
}

function getHolidays() {
    var result = [];
    $.ajax({
        method: "GET",
        url: "/Holidays/GetHolidays",
        async: false,
        success: function (data) {
            for (var i = 0, ien = data.length; i < ien; i++) {
                result[i] = data[i]["date"];
            }
        }
    });
    return result;
}

function getProjectConfig(projectId) {
    var result = {};
    $.ajax({
        method: "GET",
        url: "/Gantt/GetGanttConfig?id=" + projectId,
        async: false,
        success: function (data) {
            result.project = data.project;
            result.holidays = [];

            for (var i = 0, ien = data.holidays.length; i < ien; i++) {
                result.holidays[i] = data.holidays[i]["date"];
            }
        }
    });
    return result;
}

function getProjectTasks(projectId) {
    var result = [];
    $.ajax({
        method: "GET",
        url: "/Gantt/GetGanttActivities?id=" + projectId,
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return result;
}

function getParticipants(projectId) {
    var result = [];
    $.ajax({
        method: "GET",
        url: "/Participants/GetByProjectSelectionItemList?projectID=" + projectId,
        async: false,
        success: function (data) {
            data.forEach(function (participant) {
                if (participant.key !== null) {
                    result.push({
                        key: participant.key,
                        label: participant.value
                    });
                }
                else {
                    result.push({
                        key: "",
                        label: participant.value
                    });
                }
            });
        }
    });
    return result;
}

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date();
    if (inputFormat !== undefined) {
        d = new Date(inputFormat);
    }
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function taskStatus(gantt, task) {
    if (task.progress >= 1)
        return gantt.locale.labels.task_status_completed;
    if (task.progress == 0)
        return gantt.locale.labels.task_status_not_started
    return Math.round(task.progress * 100) + "%";
}

function cancelProjectTask(projectId) {
    Swal.fire({
        html: $("#AreYouSureCancel").val() + '<br/>' + $("#AreYouSureCancelActivity").val(),
        title: '',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            cancelEntry(projectId);
        }
    })
}

function cancelEntry(projectId) {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    var taskId = $("#id").val();
    var task = gantt.getTask(taskId);
    task.projectId = projectId;
    task.realProgress = $("#RealProgress").val();
    task.owner_id = $("#owner_id").val();
    task.wbsCode = gantt.getWBSCode(gantt.getTask(task.id));

    $.ajax({
        type: 'PUT',
        url: '/Gantt/CancelTask/',
        dataType: 'json',
        data: task,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                Swal
                    .fire({
                        type: 'success',
                        title: '',
                        text: data.successMessage,
                        footer: '',
                        onAfterClose: () => location.reload()
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
    })
}

function archiveProjectTask(projectId) {
    Swal.fire({
        title: '',
        text: $("#AreYouSureArchive").val(),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            archiveEntry(projectId);
        }
    })
}

function archiveEntry(projectId) {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    var taskId = $("#id").val();
    var task = gantt.getTask(taskId);
    task.projectId = projectId;
    task.realProgress = $("#RealProgress").val();
    task.owner_id = $("#owner_id").val();
    task.wbsCode = gantt.getWBSCode(gantt.getTask(task.id));

    $.ajax({
        type: 'PATCH',
        url: '/Gantt/ArchiveTask/',
        dataType: 'json',
        data: task,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                Swal
                    .fire({
                        type: 'success',
                        title: '',
                        text: data.successMessage,
                        footer: '',
                        onAfterClose: () => location.reload()
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
    })
}

function elementStatusCount() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetElementIndicators',
        dataType: 'json',
        data: { projectId: $('#ProjectID').val(), type: 1 },
        beforeSend: function () {
        },
        success: function (data) {
            if (data != null) {

                var st = 1;

                $('#withImpact').text(' ' + data.projectElementIndicator.withImpact);
                $('#onTime').text(' ' + data.projectElementIndicator.onTime);
                $('#delayed').text(' ' + data.projectElementIndicator.delayed);
                $('#closed').text(' ' + data.projectElementIndicator.closed);

                if (data.projectElementIndicator.withImpact == 0 &&
                    data.projectElementIndicator.onTime == 0 &&
                    data.projectElementIndicator.delayed == 0 &&
                    data.projectElementIndicator.closed > 0) {
                    st = 4;
                }

                if (data.projectElementIndicator.delayed > 0) {
                    st = 2;
                }

                if (data.projectElementIndicator.withImpact > 0) {
                    st = 3;
                }

                setStatusClassName('groupStatus', st);
                $('#groupStatus').text(getElementStatusName(st));
            }
        },
        complete: function () {
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

    var ccStartDate = $('#ChangeControlStartDate').val().split("T");
    var ccEndDate = $('#ChangeControlEndDate').val().split("T");
    var ccResponsible = $('#ChangeControlResponsible').val();

    var startDate = $('#start_date').val();
    var endDate = $('#end_date').val();
    var responsible = $('#owner_id').val();

    if ($('#ChangeControl').val() == 'True' &&
        ccStartDate[0] != '' && ccEndDate[0] != '' && ccResponsible != '' &&
        (ccStartDate[0] != startDate || ccEndDate[0] != endDate || ccResponsible != responsible) 
        && parseFloat($("#RealProgress").val()) <= 100) {
        $('#ChangeControlComments').val('');
        $('#ChangeControlAuthorizer').val('');
        $('#DLG005_CC_Comments').val('');
        $('#DLG005_CC_Authorizer').val('');
        $('#editModal').modal('toggle');
        $('#DLG005_CC').modal('show');
    }
    else {
        update();
    }
}

function dismissChangeControl() {
    update();
}

function updateChangeControl() {

    var form = $("#DLG005_CC_frmChangeControl");
    form.validate();

    if (!form.valid())
        return;

    $('#ChangeControlComments').val($('#DLG005_CC_Comments').val());
    $('#ChangeControlAuthorizer').val($('#DLG005_CC_Authorizer').val());
    $('#ChangeControlManual').val('true');
    $('#DLG005_CC').modal('toggle');
    update();
}

function update() {

    var progress = $("#RealProgress").val();

    var form = $("#frmMain");
    form.validate();

    if (!form.valid()) {
        $("#owner_id-error").css("color", "red");
        $("#RealProgress-error").css("color", "red");
        return;
    }

    if (progress < 0 || progress > 100) {
        Swal.fire({
            type: 'success',
            title: '',
            text: $("#m4028").val(),
            footer: ''
        });
    }

    if (form.valid()) {
        $('#owner_id').prop("disabled", false);
    }

    var taskId = $("#id").val();
    var task = gantt.getTask(taskId);

    task.start_date = new Date($("#start_date").val() + "T00:00:00");

    var end_date = new Date($("#end_date").val() + "T00:00:00");
    end_date.setDate(end_date.getDate() + 1);
    task.end_date = end_date;

    //task.realProgress = $("#RealProgress").val();
    task.progress = parseFloat($("#RealProgress").val()) / 100;
    task.owner_id = $("#owner_id").val();

    task.duration = gantt.calculateDuration(task.start_date, task.end_date);

    if ($('#WithImpact').is(":checked")) {
        task.status = 3;
        task.withImpact = true;
    }
    else {
        task.status = 1;
        task.withImpact = false;
    }

    gantt.updateTask(taskId);
    gantt.refreshData();
    elementStatusCount();
    $('#editModal').modal('hide');
}

function compareDate() {
    var startDate = $("#start_date").val();
    var endDate = $("#end_date").val();

    if (moment(startDate).isAfter(endDate)) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#StartDateGreaterThanEndDate').val(),
            footer: '',
            onAfterClose: () => {
                $("#start_date").focus()

            }
        });
    }
    //if (event.target.id == "end_date") {
    //    event.target.value = startDate;
    //}
    //else {
    //    event.target.value = endDate;
    //}   
}