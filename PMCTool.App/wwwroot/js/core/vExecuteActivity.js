$(document).ready(function () {

    //setFormValidation('#frmMainAnnotation');

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

    //$('#LastCommentLabel').hide();

    $('#datatablesEvicence').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetActivityEvidences",
            data: { projectId: $("#ProjectID").val(), activityId: $("#ProjectTaskID").val() },
            beforeSend: function () {
                //LoaderShow();
            },
            complete: function () {
                //LoaderHide();
                var table = $('#datatablesEvicence').DataTable();
                $('#BadgeEvidence').text(table.data().count());
                $('#collapseThree').addClass('collapse');

            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    var type = data[i].elementType;
                    data[i].elementName = getElementTypeName(type);

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';
                }

                return data;
            }
        },
        columns: [
            {
                data: "description",
                render: function (url, type, full) {
                    if (full.editableByRol) {
                        return "<a href='/Execution/Evidence?projectId=" + full.projectID + "&evidenceId=" + full.projectEvidenceID + "'>" + full.description + "</a>"
                    }
                    else {
                        return "<a href='#'>" + full.description + "</a>"
                    }
                }
            },
            {
                data: "plannedEndDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            { data: "progress"},
            { data: "statusName" },
            { data: "comment" },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        bLengthChange: false,
        bFilter: false,
        pageLength: 50,
        order: [[0, "asc"]],
        responsive: false,
        scrollX: true,
        searching: false
    });

    $('#datatablesIncidents').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetActivityIncidents",
            data: { projectId: $("#ProjectID").val(), activityId: $("#ProjectTaskID").val() },
            beforeSend: function () {
                //LoaderShow();
            },
            complete: function () {
                //LoaderHide();
                var table = $('#datatablesIncidents').DataTable();
                $('#BadgeIncident').text(table.data().count());
                $('#collapseThree1').addClass('collapse');

            },
            dataSrc: function (data) {
                return data;
            }
        },
        columns: [
            { data: "projectIncidentID", visible: false },
            {
                data: "description", targets: 1,
                render: function (url, type, full) {
                    if (full.editableByRol) {
                        return '<div class="ws">' +
                            '<a href="/Execution/Incident?projectId=' + full.projectID + '&incidentId=' + full.projectIncidentID + '">' + full.description + '</a>' +
                            '<div>';
                    }
                    else {
                        return '<div class="ws"><a href="#">' + full.description + '</a><div>';
                    }
                }
            },
            {
                data: "createdOn",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: "plannedEndDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: "status", targets: 4,
                render: function (url, type, full) {
                    return '<span class="bold ' + getStatusClassName(full.status) + ' ws">' + $("#EnumProjectElementStatus_" + full.status).val() + '</span>';
                }
            },
            { data: "comment" }
        ],
        language:   {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        //pageLength: 50,
        paging: false,
        //order: [[2, "asc"]],
        responsive: false,
        scrollX: true,
        searching: false
    });

    $('#datatableAgreement').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetActivityAgreements",
            data: { projectId: $("#ProjectID").val(), activityId: $("#ProjectTaskID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
                var table = $('#datatableAgreement').DataTable();
                $('#BadgeAgreement').text(table.data().count());
                $('#collapseThree2').addClass('collapse');

            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {

                    var type = data[i].elementType;
                    data[i].elementName = getElementTypeName(type);

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';
                }

                return data;
            }
        },
        columns: [
            {
                data: "description",
                render: function (url, type, full) {
                    if (full.editableByRol) {
                        return "<a href='/Execution/AgreementDetail?projectId=" + full.projectID + "&meetingId=" + full.projectMeetingID + "&agreementId=" + full.projectMeetingAgreementID + "'>" + full.description + "</a>"
                    }
                    else {
                        return "<a href='#'>" + full.description + "</a>"
                    }
                }
            },
            {
                data: "plannedEndDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: "Responsible",
                render: function (url, type, full) {
                    return '<div class="ws">' +
                        '<img class="box-p" src=' + full.responsibleImage + '>' +
                        '<a href="#" class="none" onclick="getParticipantInfoModal(' + "'" + full.responsible + "'" + '); return false;">' + full.responsibleName + '</a>' +
                        '<div>';
                }
            },
            { data: "statusName" },
            { data: "comments" },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        bLengthChange: false,
        bFilter: false,
        pageLength: 50,
        order: [[0, "asc"]],
        responsive: false,
        scrollX: true,
        searching: false
    });

    $('#datatablesH').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetActivityTimeSheets",
            data: { projectId: $("#ProjectID").val(), activityId: $("#ProjectTaskID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
                var table = $('#datatablesH').DataTable();
                $('#BadgeHours').text(table.data().count());
                $('#collapseThree3').addClass('collapse');

            },
            dataSrc: function (data) {
                return data;
            }
        },
        columns: [
            {data: "createdByName"},
            {
                data: "workedDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: "hours",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        data = hourFormatter(data);
                    }
                    return data;
                }
            },
            { data: "comments" },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        bLengthChange: false,
        bFilter: false,
        pageLength: 50,
        order: [[0, "asc"]],
        responsive: false,
        scrollX: true,
        searching: false
    });

    setStatusClassName('StatusIndicator', $('#ActivityStatus').val());
    //getParticipant();
    getNAnnotations($('#ProjectID').val(), $('#ProjectTaskID').val(), 1, 5);
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

                $("#ResponsiblePhone").html(data.contact.value);
                $("#ResponsiblePhone").attr("href", "tel:" + data.contact.value)

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