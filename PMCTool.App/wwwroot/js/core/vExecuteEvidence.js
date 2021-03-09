$(document).ready(function () {

    if ($('#ReferenceEditable').val() == 'False')
        $('#newReferenceBtn').hide();

    setFormValidation('#frmMainControlPoint');
    setFormValidation('#frmMainReference');
    setFormValidation('#frmFile');

    loadDateTimePicker($('#ProjectID').val(), $('.datepicker'), true);

    $('#ControlPointProgress').mask('##0.00', { reverse: true });
    $('#LastCommentLabel').hide();

    $('#datatableAgreement').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetEvidenceAgreements",
            data: { projectId: $("#ProjectID").val(), evidenceId: $("#ProjectEvidenceID").val() },
            beforeSend: function () {
                //LoaderShow();
            },
            complete: function () {
                //LoaderHide();
                var table = $('#datatableAgreement').DataTable();
                $('#BadgeAgreement').text(table.data().count());
                $('#collapseThree3').addClass('collapse');

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
        responsive: true,
        scrollX: true,
        searching: false
    });

    $('#datatablesActivities').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetEvidenceActivities",
            data: { projectId: $("#ProjectID").val(), evidenceId: $("#ProjectEvidenceID").val() },
            beforeSend: function () {
                //LoaderShow();
            },
            complete: function () {
                //LoaderHide();
                $('#collapseThree2').addClass('collapse');
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    data[i].progress = data[i].progress * 100;
                    data[i].progress = parseFloat(data[i]["progress"]).toFixed(2);
                    var type = data[i].elementType;
                    data[i].elementName = getElementTypeName(type);

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';
                }

                return data;
            }
        },
        columns: [
            { data: "wbsCode" },
            {
                data: "text",
                render: function (url, type, full) {
                    if (full.editableByRol) {
                        return "<a href='/Execution/Activity?projectId=" + full.projectId + "&activityId=" + full.id + "'>" + full.text + "</a>"
                    }
                    else {
                        return "<a href='#'>" + full.text + "</a>"
                    }
                }
            },
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
            {
                data: "endDateClient",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: "realEndDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            { data: "progress" },
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
        responsive: true,
        scrollX: true,
        searching: false
    });

    var table = $('#datatablesControlPoint').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetEvidenceControlPoint",
            data: { projectId: $("#ProjectID").val(), evidenceId: $("#ProjectEvidenceID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
                var table = $('#datatablesControlPoint').DataTable();
                $('#BadgeControlPoint').text(table.data().count());
                $('#collapseThree1').addClass('collapse');

            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    data[i]["weight"] = parseFloat(data[i]["weight"]).toFixed(2);
                    data[i]["progress"] = parseFloat(data[i]["progress"]).toFixed(2);

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';

                }
                return data;
            }
        },
        columns: [
            { data: "description" },
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
                data: "realEndDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            { data: "progress" },
            { data: "weight" },
            { data: "statusName" },
            { data: "comments" },
            {
                data: null,
                render: function (url, type, full) {
                    var result = '';

                    if (full.editableByRol) {
                        result = result + '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;';
                    }

                    if ($('#ProjectEditable').val() == 'True' && full.deleteableByRol) {
                        if(full.status != 4 && full.status != 5)
                            result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Cancel").val() + '"><i class="fas fa-ban"></i></a>&nbsp;';

                        result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;';
                    }

                    return result;
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        bFilter: false,
        lengthChange: false,
        order: [[4, "asc"]],
        responsive: true,
        scrollX: true,
        searching: false
    });

    $('#datatablesControlPoint tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanControlPointForm();
        fillControlPointForm(data);

        if ($(e.target).attr('class') === 'fa fa-edit') {
            if (data.status == 5)
                $("#btnUpdateControlPoint").html($('#Reopen').val());
            else
                $("#btnUpdateControlPoint").html($('#Update').val());
        
            $("#btnUpdateControlPoint").show();
            $("#btnCreateControlPoint").hide();
            $("#dvStatus").show();
            $('#editModalControlPoint').modal('show');
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteControlPointEntry();
        }
        if ($(e.target).attr('class') == 'fas fa-ban') {
            cancelControlPointEntry();
        }
    });

    var tableReference = $('#datatableReference').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetEvidenceReference",
            data: { projectId: $("#ProjectID").val(), evidenceId: $("#ProjectEvidenceID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
                var table = $('#datatableReference').DataTable();
                $('#BadgeReference').text(table.data().count());
                $('#collapseThree').addClass('collapse');

            },
            dataSrc: function (data) {

                for (var i = 0, ien = data.length; i < ien; i++) {

                    if (data[i]["isLink"] != null) {
                        if (data[i]["isLink"] == true) {
                            data[i]["locationLink"] = '<a class="underline-link" href="' + data[i]["location"] + '" target="_blank">' + data[i]["location"] + '</a>';
                        }
                        else {
                            data[i]["locationLink"] = data[i]["location"];
                        }                            
                    }
                }
                return data;
            }
        },
        columns: [
            { data: "projectEvidenceReferenceID", visible: false },
            { data: "evidenceID", visible: false },
            { data: "projectID", visible: false },
            { data: "reference" },
            { data: "locationLink" },
            { data: "comment" },
            //{
            //    data: null,
            //    defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
            //},
            {
                data: null,
                render: function (url, type, full) {
                    var result = '';
                    if ($('#ReferenceEditable').val() == 'True') {
                        result = result + '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '" > <i class="fa fa-edit"></i></a >';

                        if ($('#ProjectEditable').val() == 'True') {
                            if (full.filePath == null) {
                                result = result + '&nbsp;<a href="#" onclick="return false;" class="btn btn-link txt-blue" data-toggle="tooltip" title="' + $("#Upload").val() + '"><i class="fas fa-upload"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;';
                            }
                            else {
                                result = result + '&nbsp;<a href="#" onclick="return false;" class="btn btn-link txt-blue" data-toggle="tooltip" title="' + $("#Download").val() + '"><i class="fas fa-download"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;';
                            }
                        }
                    }
                    return result;
                   
                }
            },
            { data: "location", visible: false },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        bFilter: false,
        lengthChange: false,
        order: [[3, "asc"]],
        responsive: true,
        scrollX: true,
        searching: false
    });

    $('#datatableReference tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = tableReference.row(tr).data();
        cleanReferenceForm();
        fillReferenceForm(data);

        if ($(e.target).attr('class') === 'fa fa-edit') {
            $("#btnUpdateReference").show();
            $("#btnCreateReference").hide();
            $('#editModalReference').modal('show');
        }

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteReferenceEntry();
        }

        if ($(e.target).attr('class') === 'fas fa-upload') {
            $('#uploadModal').modal('show');
        }

        if ($(e.target).attr('class') === 'fas fa-download') {
            downloadFile();
        }

    });

    

    $("#Image").change(function () {
        var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'pdf', 'xlsx', 'docx'];
        if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
            Swal.fire({
                type: 'error',
                title: '',
                text: $("#FileExtensionNotAllowed").val(),
                footer: ''
            });
            $(this).val('');
        }

        var fileSize = ($(this)[0].files[0].size / 1024);
        var fileMaxSize = 15360;
        if (fileSize > fileMaxSize) {
            Swal.fire({
                type: 'error',
                title: '',
                text: $("#FileSizeNotAllowed").val(),
                footer: ''
            });
            $(this).val('');
        }
    
    });

    $('#datatablesIncidents').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetEvidenceIncidents",
            data: { projectId: $("#ProjectID").val(), evidenceId: $("#ProjectEvidenceID").val() },
            beforeSend: function () {
                //LoaderShow();
            },
            complete: function () {
                //LoaderHide();
                var table = $('#datatablesIncidents').DataTable();
                $('#BadgeIncident').text(table.data().count());
                $('#collapseThree4').addClass('collapse');

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
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        //pageLength: 50,
        paging: false,
        //order: [[2, "asc"]],
        responsive: false,
        scrollX: true,
        searching: false
    });

    setStatusClassName('StatusIndicator', $('#EvidenceStatus').val());
    getParticipant();
    getResponsibleApproval();
    getNAnnotations($('#ProjectID').val(), $('#ProjectEvidenceID').val(), 3, 5);
    getActivity($("#ActivityID").val());


});

function getEvidence() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetEvidence',
        dataType: 'json',
        data: { projectId: $('#ProjectID').val(), evidenceId: $('#ProjectEvidenceID').val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            if (data != null) {
                $('#EvidenceStatus').val(data.status);
                $("#EvidencePlannedEndDate")[0].innerText = data.plannedEndDate.split("T")[0];
                $('#StatusIndicator').text($('#EnumProjectElementStatus_' + data.status).val());
                $('#PercentageProgress').text("  " + parseFloat(data.progress).toFixed(2) +  " %");
                setStatusClassName('StatusIndicator', $('#EvidenceStatus').val());
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

function getParticipant() {

    $.ajax({
        type: 'GET',
        url: '/Execution/GetParticipant',
        dataType: 'json',
        data: { id: $("#ResponsibleElaboration").val() },
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

function getResponsibleApproval() {

    $.ajax({
        type: 'GET',
        url: '/Execution/GetParticipant',
        dataType: 'json',
        data: { id: $("#ResponsibleApproval").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            if (data != null) {

                $("#ResponsibleApprovalName").html(data.name + " " + data.lastname + " " + data.surname);
                $("#ApprovalEscalationName").html(data.escalation);
                $("#ApprovalEscalationName").attr("onclick", "getParticipantInfoModal(" + "'" + data.escalationID + "'" + ")");

                $("#ResponsibleApprovalPhone").html(data.contact.value);
                $("#ResponsibleApprovalPhone").attr("href", "tel:" + data.contact.value)

                $("#ResponsibleApprovalEmail").html(data.email);
                $("#ResponsibleApprovalEmail").attr("href", "mailto:" + data.email)
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

function cleanControlPointForm() {
    var dateApprovalPlanned = new Date($('#DateApprovalPlanned').val());
    var dateStartPlanned = new Date($('#DateStartPlanned').val());

    dateStartPlanned.setDate(dateStartPlanned.getDate());
    dateStartPlanned.setHours(0, 0, 0, 0);
    dateApprovalPlanned.setDate(dateApprovalPlanned.getDate());

    $('.datepicker').data("DateTimePicker").minDate(dateStartPlanned);
    $('.datepicker').data("DateTimePicker").maxDate(dateApprovalPlanned);

    var validator = $("#frmMainControlPoint").validate();
    validator.resetForm();

    $('#ProjectEvidenceControlPointID').val('');
    $('#ControlPointDescription').val('');
    $('#ControlPointPlannedEndDate').val('');
    $('#ControlPointStatus').val('');
    $('#ControlPointProgress').val('0.00');
    $('#ControlPointComments').val('');

    $('#ControlPointWithImpact').prop('checked', false);
}

function fillControlPointForm(data) {
    var ped = data.plannedEndDate.split("T");

    $('#ProjectEvidenceControlPointID').val(data.projectEvidenceControlPointID);
    $('#ControlPointDescription').val(data.description);
    $('#ControlPointPlannedEndDate').val(ped[0]);
    $('#ControlPointStatus').val(data.status);
    $('#ControlPointProgress').val(data.progress);
    $('#ControlPointComments').val(data.comments);
    $('#ControlPointWeight').val(data.weight / 100);
    $('#ControlPointManualWeight').val(data.manualWeight);

    $('#StatusIndicatorControlPoint').text($(data.statusName).text());
    setStatusClassName('StatusIndicatorControlPoint', data.status);

    if (data.withImpact == true) {
        $('#ControlPointWithImpact').prop('checked', true);
    }
    else {
        $('#ControlPointWithImpact').prop('checked', false);
    }

    //if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {
    if ($('#ParticipantRole').val() == 3) {
        $('#ControlPointDescription').attr('readonly', true);
    }
}

function newControlPointEntry() {
    cleanControlPointForm();
    $("#btnUpdateControlPoint").hide();
    $("#btnCreateControlPoint").show();
    $("#dvStatus").hide();
    $('#editModalControlPoint').modal('show');
}

function createControlPointRecord(controller) {

    var form = $("#frmMainControlPoint");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateEvidenceControlPoint',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalControlPoint').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => {
                        reloadControlPoint()
                        reloadActivity()
                    }
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

function updateControlPointRecord(controller) {

    var form = $("#frmMainControlPoint");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateEvidenceControlPoint',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalControlPoint').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => {
                        reloadControlPoint()
                        reloadActivity()
                    }
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

function cancelControlPointRecord(controller) {
    var form = $("#frmMainControlPoint");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PATCH',
        url: '/' + controller + '/CancelEvidenceControlPoint',
        dataType: 'json',
        data: $("form").serialize(),
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
                        onAfterClose: () => reloadControlPoint()
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

function deleteControlPointRecord(controller) {

    var form = $("#frmMainControlPoint");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/DeleteEvidenceControlPoint',
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
                    onAfterClose: () => reloadControlPoint()
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

function reloadControlPoint() {
    getEvidence();
    $('#datatablesControlPoint').DataTable().ajax.reload();
}

function reloadActivity() {
    $('#datatablesActivities').DataTable().ajax.reload();
}

function deleteControlPointEntry() {
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
            deleteControlPointRecord('Execution');
        }
    });
}

function cancelControlPointEntry() {
    Swal.fire({
        title: '',
        text: $("#AreYouSureCancel").val(),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            cancelControlPointRecord('Execution');
        }
    })
}

function cleanReferenceForm() {
    var validator = $("#frmMainReference").validate();
    validator.resetForm();

    $('#ProjectEvidenceReferenceID').val('');
    $('#Reference').val('');
    $('#ReferenceLocation').val('');
    $('#ReferenceComment').val('');

    $('#ReferenceIsLink').prop('checked', false);
}

function fillReferenceForm(data) {

    $('#ProjectEvidenceReferenceID').val(data.projectEvidenceReferenceID);
    $('#Reference').val(data.reference);
    $('#ReferenceLocation').val(data.location);
    $('#ReferenceComment').val(data.comment);

    if (data.isLink == true) {
        $('#ReferenceIsLink').prop('checked', true);
    }
    else {
        $('#ReferenceIsLink').prop('checked', false);
    }

}

function newReferenceEntry() {
    cleanReferenceForm();
    $("#btnUpdateReference").hide();
    $("#btnCreateReference").show();
    $('#editModalReference').modal('show');
}

function createReferenceRecord(controller) {
    var form = $("#frmMainReference");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateEvidenceReference',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalReference').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadReference()
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

function updateReferenceRecord(controller) {

    var form = $("#frmMainReference");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateEvidenceReference',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalReference').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadReference()
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

function deleteReferenceRecord(controller) {

    var form = $("#frmMainReference");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/DeleteEvidenceReference',
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
                    onAfterClose: () => reloadReference()
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

function reloadReference() {
    $('#datatableReference').DataTable().ajax.reload();
}

function deleteReferenceEntry() {
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
            deleteReferenceRecord('Execution');
        }
    });
}

function uploadFile() {
    var form = $("#frmFile");
    if (!form.valid())
        return;

    formData = new FormData();
    formData.append("projectId", $("#ProjectID").val());
    formData.append("evidenceId", $("#ProjectEvidenceID").val());
    formData.append("referenceId", $("#ProjectEvidenceReferenceID").val());
    formData.append("file", $("#Image")[0].files[0]);

    $.ajax({
        type: 'PUT',
        url: '/Execution/UploadEvidenceReferenceFile/',
        dataType: 'json',
        data: formData,
        processData: false,
        contentType: false,
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
                    onAfterClose: function () {
                        $('#uploadModal').modal('toggle');
                        reloadReference();
                    }
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

function downloadFile() {
    var path = '/Execution/DownloadFile?projectId=' + $("#ProjectID").val() + '&evidenceId=' + $("#ProjectEvidenceID").val() + '&referenceId=' + $("#ProjectEvidenceReferenceID").val();
    $(location).attr('href', path);
}

function getActivity(taskId) {

    return $.ajax({
        type: 'GET',
        url: "/Execution/GetActivityDates",
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), activityId: taskId },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            $('#DateStartPlanned').val(data.start_date)
            $('#DateApprovalPlanned').val(data.end_date)
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
