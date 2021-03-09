$(document).ready(function () {
    $('.indicadores-st').tooltip({
        placement: 'top'
    });

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
                    return data;
                }
            }
        }
    };

    var urlParams = new URLSearchParams(location.search);

    var projectId = urlParams.get('id');
    var projectConfig = getProjectConfig(projectId);
    var participants = getParticipants(projectId);
    var projectMilestones = getProjectMilestones(projectId);

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

    if (projectConfig.project.calendarType == 2) {
        gantt.setWorkTime({ day: 6, hours: [8, 17] });
    }
    else if (projectConfig.project.calendarType == 3) {
        gantt.setWorkTime({ day: 6 })
        gantt.setWorkTime({ day: 0 })
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
                if ($('#end_date').val() == '' || $('#end_date').val() == null)
                    return;

                return new gantt.Promise(function (resolve, reject) {

                    var task = gantt.getTask(data.id)

                    data.projectId = projectId;
                    data.wbsCode = gantt.getWBSCode(gantt.getTask(data.id));
                    data.changeControlAuthorizer = $('#ChangeControlAuthorizer').val();
                    data.changeControlComments = $('#ChangeControlComments').val();
                    data.changeControlManualInput = $('#ChangeControlManual').val();

                    if (task.id == $('#id').val()) {
                        data.start_date = $('#end_date').val();
                        data.end_date = $('#end_date').val();
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
                                    Swal.fire({
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

    var table = $('#datatables').DataTable({
        columns: [
            { data: "id", visible: false },
            {
                data: "description", targets: 1,
                render: function (url, type, full) {
                    return '<div class="ws">' +
                        '<a href="/Execution/Milestone?projectId=' + projectId + '&milestoneId=' + full.id + '">' + full.description + '</a>' +
                        '<div>';
                }
            },
            //{ data: "start_date" },
            {
                data: "start_date",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            //{ data: "end_date" },
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
            {
                data: "owner_photo", targets: 4,
                render: function (url, type, full) {
                    return '<div class="ws">' +
                        '<img class="box-p" src=' + full.owner_photo + '>' +
                        '<a href="#" onclick="getParticipantInfoModal(' + "'" + full.owner_id + "'" + '); return false;">' + full.owner_name + '</a>' +
                        '<div>';
                }
            },
            {
                data: "status", targets: 5,
                render: function (url, type, full) {
                    return '<span class="bold ' + getStatusClassName(full.status) + ' ws">' + $("#EnumProjectElementStatus_" + full.status).val() + '</span>';
                }
            },
            { data: "comment" },
            {
                data: "actions", targets: 7,
                render: function (url, type, full) {
                    var result = '';

                    if (full.editableByRol) {
                        result = result + '<a class="btn btn-link btn-warning" data-toggle="modal" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;';
                    }

                    if ($('#ProjectEditable').val() == 'True' && full.projectPhase == 1 && full.deleteableByRol) {
                        result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;';
                    }

                    if ($('#ProjectEditable').val() == 'True' && full.deleteableByRol) {
                        if (full.status != 5 && full.status != 4)
                            result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Cancel").val() + '"><i class="fas fa-ban"></i></a>&nbsp;';
                        if (full.status == 5)
                            result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Archive").val() + '"><i class="fas fa-ban"></i></a>&nbsp;';
                    }

                    return result;
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        buttons: [
            $.extend(true, {}, fileExportOptions, { extend: 'excelHtml5' }),
        ],
        order: [[1, "asc"]],
        responsive: true,
        scrollX: false,
        searching: false
    });

    table.button('1-4').remove();

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanForm();
        fillForm(data);

        if ($(e.target).attr('class') == 'fa fa-edit') {
            $("#btnUpdate").show();
            $('#editModal').modal('show');
        }
        if ($(e.target).attr('class') == 'fas fa-ban') {
            if (data.status != 5 && data.status != 4)
                cancelProjectMilestone(projectId);

            if (data.status == 5)
                archiveProjectMilestone(projectId);
        }
    })

    gantt.attachEvent("onAfterAutoSchedule", function () {
        var projectMilestoneTable = [];

        var table = $('#datatables').DataTable();
        table.clear();
        projectMilestones.forEach(function (projectMilestone, index) {
            var task = gantt.getTask(projectMilestone.id);
            var owner = byId(gantt.serverList('staff'), projectMilestone.owner_id);
            projectMilestoneTable.push({
                "id": task.id,
                "wbsCode": gantt.getWBSCode(task),
                "description": task.text,
                //"start_date": convertDate(task.start_date),
                //"end_date": convertDate(task.end_date),
                "start_date": projectMilestone.endDateClient,
                "end_date": projectMilestone.endDateClient,
                "realProgress": (task.realProgress || 0).toFixed(2) + '%',
                "progress": task.progress.toFixed(2) + '%',
                "owner_photo": (projectMilestone.owner_photo == null || projectMilestone.owner_photo == '') ? '../images/avatar/default-avatar.png' : projectMilestone.owner_photo,
                "owner_name": owner,
                "owner_id": projectMilestone.owner_id,
                "status": task.status,
                "comment": projectMilestone.comment,
                "withImpact": task.status == 3 ? true : false,
                "statusName": '<span class="bold ' + getStatusClassName(task.status) + ' ws">' + $("#EnumProjectElementStatus_" + task.status).val() + '</span>',
                "editableByRol": projectMilestone.editableByRol,
                "deleteableByRol": projectMilestone.deleteableByRol,
                "projectPhase": projectMilestone.projectPhase
            });
        });
        table.rows.add(projectMilestoneTable);
        table.draw();
    });

    gantt.attachEvent("onAfterTaskUpdate", function () {
        gantt.autoSchedule();
    });

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), false);

    getParticipant();
    elementStatusCount();

    if ($('#ChangeControl').val() == 'True') {
        setControlChangeEntry($("#ProjectID").val());
    }

    // Helps datatable to be responsive in certain cases
    window.onresize = () => $("#datatables").DataTable().columns.adjust();
});

function getParticipant() {

    $.ajax({
        type: 'GET',
        url: '/Execution/GetParticipant',
        dataType: 'json',
        data: { id: $("#ParticipantID").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            if (data != null) {

                $("#ResponsibleName").html(data.name + " " + data.lastname + " " + data.surname);
                $("#EscalationName").html(data.escalation);
                $("#EscalationName").attr("onclick", "getParticipantInfoModal(" + "'" + data.escalationID + "'" + ")");
                if (data.contact != null) {
                    $("#ResponsiblePhone").html(data.contact.value);
                    $("#ResponsiblePhone").attr("href", "tel:" + data.contact.value)
                }

                $("#ResponsibleEmail").html(data.email);
                $("#ResponsibleEmail").attr("href", "mailto:" + data.email)
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
    var sd = data.start_date.split("T");
    var ed = data.end_date.split("T");

    $('#id').val(data["id"]);
    //$('#start_date').val(data["start_date"]);
    //$('#end_date').val(data["end_date"]);
    $('#start_date').val(sd[0]);
    $('#end_date').val(ed[0]);

    let progress = data.progress.split(".")[0];
    if (progress == 1 || data.status == 4)
        $("#RealProgress").attr('checked', true);
    else
        $("#RealProgress").attr('checked', false);

    //$('#RealProgress').val(0);
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

function getProjectMilestones(projectId) {
    var result = [];
    $.ajax({
        method: "GET",
        url: "/Gantt/GetGanttMilestones?id=" + projectId,
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

function cancelProjectMilestone(projectId) {
    Swal.fire({
        html: $("#AreYouSureCancel").val() + '<br/>' + $("#AreYouSureCancelMilestone").val(),
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
                Swal.fire({
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

function archiveProjectMilestone(projectId) {
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
        data: { projectId: $('#ProjectID').val() , type : 2 },
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

    var ccStartDate = $('#ChangeControlStartDate').val();
    var ccEndDate = $('#ChangeControlEndDate').val().split("T");;
    var ccResponsible = $('#ChangeControlResponsible').val();

    var startDate = $('#start_date').val();
    var endDate = $('#end_date').val();
    var responsible = $('#owner_id').val();


    if ($('#ChangeControl').val() == 'True' && ccEndDate[0] != '' && ccResponsible != '' &&
        (ccEndDate[0] != endDate || ccResponsible != responsible)) {
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
    var form = $("#frmMain");
    form.validate();
    if (!form.valid()) {
        $("#RealProgress-error").css("color", "red");
        $("#RealProgress-error").css("text-transform", "none");
        return;
    }

    if (form.valid()) {
        $('#owner_id').prop("disabled", false);
    }

    var taskId = $("#id").val();
    var task = gantt.getTask(taskId);

    var milestone_date = new Date($("#end_date").val() + "T00:00:00");
    milestone_date.setDate(milestone_date.getDate() + 1);

    task.start_date = milestone_date;
    task.duration = 0;

    task.owner_id = $("#owner_id").val();
    if (task.start_date.getTime() < new Date().getTime()) {
        task.status = 2;
    }
    else {
        task.status = 1;
    }

    if ($("#RealProgress").is(':checked')) {
        task.progress = 1;
        task.status = 4;
    }

    if (!$("#RealProgress").is(':checked')) {
        task.progress = 0;
    }

    if ($('#WithImpact').is(":checked")) {
        task.status = 3;
        task.withImpact = true;
    }
    if (!$('#WithImpact').is(":checked"))  {
        task.withImpact = false;
    }

    gantt.updateTask(taskId);
    gantt.refreshData();
    elementStatusCount();
    $('#editModal').modal('hide');
}


