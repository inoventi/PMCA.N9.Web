$(document).ready(function () {

    setFormValidation('#frmMainActionPlan');
    setFormValidation('#frmMainAnnotation');

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true);

    $('#ActionPlanProgress').mask('##0.00', { reverse: true });
    $('#ActionPlanResponsiblePercentage').mask('##0.00', { reverse: true });
    //$('#LastCommentLabel').hide();

    $('#datatableAgreement').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetIncidentAgreements",
            data: { projectId: $("#ProjectID").val(), incidentId: $("#ProjectIncidentID").val() },
            beforeSend: function () {
                //LoaderShow();
            },
            complete: function () {
                //LoaderHide();
                var table = $('#datatableAgreement').DataTable();
                $('#BadgeAgreement').text(table.data().count());
                $('#collapseFour').addClass('collapse');

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
                        return "<a href='#'>" + full.description + "</a>";
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
            url: "/Execution/GetIncidentSource",
            data: { projectId: $("#ProjectID").val(), incidentId: $("#ProjectIncidentID").val(), elementId: $("#ElementID").val(), type: $("#ElementType").val() },
            beforeSend: function () {
                //LoaderShow();
            },
            complete: function () {
                //LoaderHide();
                $('#collapseThree').addClass('collapse');
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    var type = data[i].elementType;
                    if (type == 1) {
                        data[i].progress = data[i].progress * 100;
                        data[i].progress = parseFloat(data[i]["progress"]).toFixed(2);
                    } else {
                        data[i].progress = parseFloat(data[i]["progress"]).toFixed(2);
                    }
                    data[i].elementName = getElementTypeName(type); 
                    data[i].typeName = getElementTypeName(type); 
                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';
                } 

                return data;
            }
        },
        columns: [
            { data: "typeName" },
            {
                data: "description",
                render: function (url, type, full) {
                    if (full.editableByRol) {
                        if (full.elementType == 1) {
                            return "<a href='/Execution/Activity?projectId=" + full.projectID + "&activityId=" + full.elementID + "'>" + full.description + "</a>"
                        }
                        else {
                            return "<a href='/Execution/Evidence?projectId=" + full.projectID + "&evidenceId=" + full.elementID + "'>" + full.description + "</a>"
                        }
                    }
                    else {
                        return "<a href='#'>" + full.description + "</a>";
                    }
                }
            },
            { data: "plannedStartDate" },
            { data: "plannedEndDate" },
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

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetIncidentActionPlan",
            data: { projectId: $("#ProjectID").val(), incidentId: $("#ProjectIncidentID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status)  + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';

                }
                return data;
            }
        },
        columns: [
            { data: "projectIncidentActionPlanID", visible: false },
            { data: "projectIncidentID", visible: false },
            { data: "responsible", visible: false },
            { data: "status", visible: false },
            { data: "description" },
            {
                data: "plannedStartDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: "realStartDate",
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
                data: "realEndDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            { data: "responsibleName" },
            { data: "statusName" },
            { data: "progress" },
            { data: "comments" },
            {
                data: null,
                render: function (url, type, full) {
                    var result = '';

                    if (full.editableByRol) {
                        result = result + '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;';
                    }

                    if ($('#ProjectEditable').val() == 'True' && full.deleteableByRol) {
                        if (full.status != 4 && full.status != 5)
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
        order: [[4, "asc"]],
        responsive: true,
        scrollX: true,
        searching: false
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanActionPlanForm();
        fillActionPlanForm(data);

        if ($(e.target).attr('class') === 'fa fa-edit') {
            if (data.status == 5)
                $("#btnUpdateActionPlan").html($('#Reopen').val());
            else
                $("#btnUpdateActionPlan").html($('#Update').val());

            $("#btnUpdateActionPlan").show();
            $("#btnCreateActionPlan").hide();
            $("#dvStatus").show(); 
            $('#editModalActionPlan').modal('show');
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteActionPlanEntry();
        }
        if ($(e.target).attr('class') == 'fas fa-ban') {
            cancelActionPlanEntry();
        }
    });

    setStatusClassName('StatusIndicator', $('#IncidentStatus').val());
    getParticipant();
    getNAnnotations($('#ProjectID').val(), $('#ProjectIncidentID').val(), 4, 5);

    if ($('#ChangeControl').val() == 'True') {
        setControlChangeEntry($("#ProjectID").val());
    }

});

function getIncident() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetIncident',
        dataType: 'json',
        data: { projectId: $('#ProjectID').val(), incidentId: $('#ProjectIncidentID').val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            if (data != null) {
                $('.percentage').empty();
                $('.percentage').append(data.progress + '.00 %');
                $('#IncidentStatus').val(data.status);
                $('#StatusIndicator').text($('#EnumProjectElementStatus_' + data.status).val());
                setStatusClassName('StatusIndicator', $('#IncidentStatus').val());
                if (data.realEndDate != null && data.realEndDate != '') {
                    var array = data.realEndDate.split('T');
                    $('#RealEndDate').text(array[0]);
                }
                else 
                    $('#RealEndDate').text('---- -- --');
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

function cleanActionPlanForm() {
    var validator = $("#frmMainActionPlan").validate();
    validator.resetForm();

    $('#ProjectIncidentActionPlanID').val('');
    $('#ActionPlanDescription').val('');
    $('#ActionPlanPlannedStartDate').val('');
    $('#ActionPlanPlannedEndDate').val('');
    $('#ActionPlanResponsible').val('');
    $('#ActionPlanResponsiblePercentage').val('0.00');
    $('#ActionPlanStatus').val('');
    $('#ActionPlanProgress').val('0.00');
    $('#ActionPlanComments').val('');

    $('#ChangeControlEndDate').val('');
    $('#ChangeControlResponsible').val('');
    $('#ChangeControlManual').val('false');
}

function fillActionPlanForm(data) {
    var psd = data.plannedStartDate.split("T");
    var ped = data.plannedEndDate.split("T");

    $('#ProjectIncidentActionPlanID').val(data.projectIncidentActionPlanID);
    $('#ActionPlanDescription').val(data.description);
    $('#ActionPlanPlannedStartDate').val(psd[0]);
    $('#ActionPlanPlannedEndDate').val(ped[0]);
    $('#ActionPlanResponsible').val(data.responsible);
    $('#ActionPlanResponsiblePercentage').val(data.responsiblePercentage);
    $('#ActionPlanStatus').val(data.status);
    $('#ActionPlanProgress').val(data.progress);
    $('#ActionPlanComments').val(data.comments);

    $('#ChangeControlStartDate').val(psd[0]);
    $('#ChangeControlEndDate').val(ped[0]);
    $('#ChangeControlResponsible').val(data.responsible);

    $('#StatusIndicatorActionPlan').text($(data.statusName).text());
    setStatusClassName('StatusIndicatorActionPlan', data.status);

    if (data.withImpact == true) {
        $('#ActionPlanWithImpact').prop('checked', true);
    }
    else {
        $('#ActionPlanWithImpact').prop('checked', false);
    }

    if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {

        $('#ActionPlanDescription').attr('readonly', true);
        $('#ActionPlanResponsible').prop("disabled", true);
        $('#ActionPlanResponsiblePercentage').attr('readonly', true);

    }
}

function newActionPlanEntry() {
    cleanActionPlanForm();
    $("#btnUpdateActionPlan").hide();
    $("#btnCreateActionPlan").show();
    $("#dvStatus").hide(); 
    $('#editModalActionPlan').modal('show');
}

function createActionPlanRecord(controller) {
    var form = $("#frmMainActionPlan");
    form.validate();

    if (!form.valid())
        return;

    var plannedStartDate = new Date($("#ActionPlanPlannedStartDate").val());
    var plannedEndDate = new Date($("#ActionPlanPlannedEndDate").val());

    if (plannedEndDate.getTime() < plannedStartDate.getTime()) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#StartDateGreaterThanEndDate').val(),
            footer: '',
            onAfterClose: () => $("#ActionPlanPlannedStartDate").focus()
        });
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateIncidentActionPlan',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalActionPlan').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadActionPlan()
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

function updateActionPlanRecord(controller) {
    var form = $("#frmMainActionPlan");
    form.validate();

    if (!form.valid())
        return;
    if (form.valid()) {
        $('#ActionPlanResponsible').prop("disabled", false);
    }

    var plannedStartDate = new Date($("#ActionPlanPlannedStartDate").val());
    var plannedEndDate = new Date($("#ActionPlanPlannedEndDate").val());

    if (plannedEndDate.getTime() < plannedStartDate.getTime()) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#StartDateGreaterThanEndDate').val(),
            footer: '',
            onAfterClose: () => $("#ActionPlanPlannedStartDate").focus()
        });
        return;
    }

    let ccStartDate = $('#ChangeControlStartDate').val().split("T");
    let ccEndDate = $('#ChangeControlEndDate').val().split("T");
    let ccResponsible = $('#ChangeControlResponsible').val();

    let startDate = $('#ActionPlanPlannedStartDate').val();
    let endDate = $('#ActionPlanPlannedEndDate').val();
    let responsible = $('#ActionPlanResponsible').val();

    if ($('#ChangeControl').val() == 'True' &&
        ccStartDate[0] != '' && ccEndDate[0] != '' && ccResponsible != '' &&
        (ccStartDate[0] != startDate || ccEndDate[0] != endDate || ccResponsible != responsible)
        && parseFloat($("#ActionPlanProgress").val()) <= 100) {
        $('#ChangeControlComments').val('');
        $('#ChangeControlAuthorizer').val('');
        $('#DLG005_CC_Comments').val('');
        $('#DLG005_CC_Authorizer').val('');
        $('#editModalActionPlan').modal('toggle');
        $('#DLG005_CC').modal('show');
    }
    else {
        updateActionPlan(controller);
    }
}

function dismissChangeControl() {
    updateActionPlan("Execution");
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
    updateActionPlan("Execution");
}

function updateActionPlan(controller) {
    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateIncidentActionPlan',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                if ($('#editModalActionPlan').hasClass('show'))
                    $('#editModalActionPlan').modal('toggle');

                if ($('#DLG005_CC').length == 0) {
                    if ($('#DLG005_CC').hasClass('show'))
                        $('#DLG005_CC').modal('toggle');
                }

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadActionPlan()
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

function cancelActionPlanRecord(controller) {
    var form = $("#frmMainActionPlan");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PATCH',
        url: '/' + controller + '/CancelIncidentActionPlan',
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
                        onAfterClose: () => reloadActionPlan()
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

function deleteActionPlanRecord(controller) {

    var form = $("#frmMainActionPlan");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/DeleteIncidentActionPlan',
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
                    onAfterClose: () => reloadActionPlan()
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

function reloadActionPlan() {
    getIncident();
    $('#datatables').DataTable().ajax.reload();
}

function cancelActionPlanEntry() {
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
            cancelActionPlanRecord('Execution');
        }
    })
}

function deleteActionPlanEntry() {
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
            deleteActionPlanRecord('Execution');
        }
    });
}
