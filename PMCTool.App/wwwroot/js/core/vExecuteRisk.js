$(document).ready(function () {

    setFormValidation('#frmMainMitigation');
    setFormValidation('#frmMainContingency');
    setFormValidation('#frmMainAnnotation');

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true);

    $('#MitigationProgress').mask('##0.00', { reverse: true });
    $('#ContingencyProgress').mask('##0.00', { reverse: true });
    $('#MitigationResponsiblePercentage').mask('##0.00', { reverse: true });
    $('#ContingencyResponsiblePercentage').mask('##0.00', { reverse: true });
    //$('#LastCommentLabel').hide();

    $('#datatableAgreement').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetRiskAgreements",
            data: { projectId: $("#ProjectID").val(), riskId: $("#ProjectRiskID").val() },
            beforeSend: function () {
                //LoaderShow();
            },
            complete: function () {
                //LoaderHide();
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

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetRiskMitigation",
            data: { projectId: $("#ProjectID").val(), riskId: $("#ProjectRiskID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';

                }
                return data;
            }
        },
        columns: [
            { data: "projectRiskMitigationID", visible: false },
            { data: "projectRiskID", visible: false },
            { data: "responsible", visible: false },
            { data: "status", visible: false },
            { data: "description", width: '20%' },
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
            //{
            //    data: "realStartDate",
            //    render: function (data, type, row, meta) {
            //        if (data !== null) {
            //            var array = data.split("T");
            //            data = array[0];
            //        }
            //        return data;
            //    }
            //},
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
            {
                data: "responsibleName",
                render: function (url, type, full) {
                    return '<div class="ws">' +
                        '<a href="#" class="none" onclick="getParticipantInfoModal(' + "'" + full.responsible + "'" + '); return false;">' + full.responsibleName + '</a>' +
                        '<div>';
                }
            },
            { data: "progress" },
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
        cleanMitigationForm();
        fillMitigationForm(data);

        if ($(e.target).attr('class') === 'fa fa-edit') {
            if (data.status == 5)
                $("#btnUpdateMitigation").html($('#Reopen').val());
            else
                $("#btnUpdateMitigation").html($('#Update').val());

            $("#btnUpdateMitigation").show();
            $("#btnCreateMitigation").hide();
            $("#dvStatusM").show();
            $('#editModalMitigation').modal('show');
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteMitigationEntry();
        }
        if ($(e.target).attr('class') == 'fas fa-ban') {
            cancelMitigationEntry();
        }
    });

    var table2 = $('#datatables2').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetRiskContingency",
            data: { projectId: $("#ProjectID").val(), riskId: $("#ProjectRiskID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {

                for (var i = 0, ien = data.length; i < ien; i++) {

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';

                }
                return data;
            }
        },
        columns: [
            { data: "projectRiskContingencyID", visible: false },
            { data: "projectRiskID", visible: false },
            { data: "responsible", visible: false },
            { data: "status", visible: false },
            { data: "description", width: '20%'},
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
            //{
            //    data: "realEndDate",
            //    render: function (data, type, row, meta) {
            //        if (data !== null) {
            //            var array = data.split("T");
            //            data = array[0];
            //        }
            //        return data;
            //    }
            //},
            {
                data: "responsibleName",
                render: function (url, type, full) {
                    return '<div class="ws">' +
                        '<a href="#" class="none" onclick="getParticipantInfoModal(' + "'" + full.responsible + "'" + '); return false;">' + full.responsibleName + '</a>' +
                        '<div>';
                }
            },
            { data: "progress" },
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

    $('#datatables2 tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table2.row(tr).data();
        cleanContingencyForm();
        fillContingencyForm(data);

        if ($(e.target).attr('class') === 'fa fa-edit') {
            if (data.status == 5)
                $("#btnUpdateContingency").html($('#Reopen').val());
            else
                $("#btnUpdateContingency").html($('#Update').val());

            $("#btnUpdateContingency").show();
            $("#btnCreateContingency").hide();
            $("#dvStatusC").show();
            $('#editModalContingency').modal('show');
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteContingencyEntry();
        }

        if ($(e.target).attr('class') == 'fas fa-ban') {
            cancelContingencyEntry();
        }
    });

    setStatusClassName('StatusIndicator', $('#RiskStatus').val());
    getParticipant();
    getNAnnotations($('#ProjectID').val(), $('#ProjectRiskID').val(), 5, 5);
});

function getRisk() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetRisk',
        dataType: 'json',
        data: { projectId: $('#ProjectID').val(), riskId: $('#ProjectRiskID').val()},
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            if (data != null) {
                $('#RiskStatus').val(data.status);
                $('#StatusIndicator').text($('#EnumProjectElementStatus_' + data.status).val());
                setStatusClassName('StatusIndicator', $('#RiskStatus').val());
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

function cleanMitigationForm() {
    var validator = $("#frmMainMitigation").validate();
    validator.resetForm();

    $('#ProjectRiskMitigationID').val('');
    $('#MitigationDescription').val('');
    $('#MitigationPlannedStartDate').val('');
    $('#MitigationPlannedEndDate').val('');
    $('#MitigationResponsible').val('');
    $('#MitigationStatus').val('');
    $('#MitigationResponsiblePercentage').val('0.00');
    $('#MitigationProgress').val('0.00');
    $('#MitigationWithImpact').prop('checked', false);
    $('#MitigationComments').val('');
}

function fillMitigationForm(data) {

    var psd = data.plannedStartDate.split("T");
    var ped = data.plannedEndDate.split("T");

    $('#ProjectRiskMitigationID').val(data.projectRiskMitigationID);
    $('#MitigationDescription').val(data.description);
    $('#MitigationPlannedStartDate').val(psd[0]);
    $('#MitigationPlannedEndDate').val(ped[0]);
    $('#MitigationResponsible').val(data.responsible);
    $('#MitigationResponsiblePercentage').val(data.responsiblePercentage);
    $('#MitigationStatus').val(data.status);
    $('#MitigationProgress').val(data.progress);
    $('#MitigationComments').val(data.comments);

    $('#StatusIndicatorM').text($(data.statusName).text());
    setStatusClassName('StatusIndicatorM', data.status);

    if (data.withImpact == true) {
        $('#MitigationWithImpact').prop('checked', true);
    }
    else {
        $('#MitigationWithImpact').prop('checked', false);
    }

    if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {

        $('#MitigationDescription').attr('readonly', true);
        $('#MitigationResponsiblePercentage').attr('readonly', true);
        $("#MitigationResponsible").prop("disabled", true);

    }
}

function newMitigationEntry() {
    cleanMitigationForm();
    $("#btnUpdateMitigation").hide();
    $("#btnCreateMitigation").show();
    $("#dvStatusM").hide();  
    $('#editModalMitigation').modal('show');
}

function createMitigationRecord(controller) {

    var form = $("#frmMainMitigation");
    form.validate();

    if (!form.valid())
        return;

    var plannedStartDate = new Date($("#MitigationPlannedStartDate").val());
    var plannedEndDate = new Date($("#MitigationPlannedEndDate").val());

    if (plannedEndDate.getTime() < plannedStartDate.getTime()) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#StartDateGreaterThanEndDate').val(),
            footer: '',
            onAfterClose: () => $("#MitigationPlannedStartDate").focus()
        });
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateRiskMitigation',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalMitigation').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadMitigation()
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

function updateMitigationRecord(controller) {

    var form = $("#frmMainMitigation");
    form.validate();

    if (!form.valid())
        return;

    if (form.valid()) {
        $("#MitigationResponsible").prop("disabled", false);
    }

    var plannedStartDate = new Date($("#MitigationPlannedStartDate").val());
    var plannedEndDate = new Date($("#MitigationPlannedEndDate").val());

    if (plannedEndDate.getTime() < plannedStartDate.getTime()) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#StartDateGreaterThanEndDate').val(),
            footer: '',
            onAfterClose: () => $("#MitigationPlannedStartDate").focus()
        });
        return;
    }

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateRiskMitigation',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalMitigation').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadMitigation()
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

function cancelMitigationRecord(controller) {

    var form = $("#frmMainMitigation");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PATCH',
        url: '/' + controller + '/CancelRiskMitigation',
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
                        onAfterClose: () => reloadMitigation()
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

function deleteMitigationRecord(controller) {

    var form = $("#frmMainMitigation");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/DeleteRiskMitigation',
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
                    onAfterClose: () => reloadMitigation()
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

function reloadMitigation() {
    location.reload();
    //getRisk();
    //$('#datatables').DataTable().ajax.reload();
}

function cancelMitigationEntry() {
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
            cancelMitigationRecord('Execution');
        }
    })
}

function deleteMitigationEntry() {
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
            deleteMitigationRecord('Execution');
        }
    });
}


function cleanContingencyForm() {
    var validator = $("#frmMainContingency").validate();
    validator.resetForm();

    $('#ProjectRiskContingencyID').val('');
    $('#ContingencyDescription').val('');
    $('#ContingencyPlannedStartDate').val('');
    $('#ContingencyPlannedEndDate').val('');
    $('#ContingencyResponsible').val('');
    $('#ContingencyResponsiblePercentage').val('0.00');
    $('#ContingencyStatus').val('');
    $('#ContingencyProgress').val('0.00');
    $('#ContingencyWithImpact').prop('checked', false);
    $('#ContingencyComments').val('');
}

function fillContingencyForm(data) {

    var psd = data.plannedStartDate.split("T");
    var ped = data.plannedEndDate.split("T");

    $('#ProjectRiskContingencyID').val(data.projectRiskContingencyID);
    $('#ContingencyDescription').val(data.description);
    $('#ContingencyPlannedStartDate').val(psd[0]);
    $('#ContingencyPlannedEndDate').val(ped[0]);
    $('#ContingencyResponsible').val(data.responsible);
    $('#ContingencyResponsiblePercentage').val(data.responsiblePercentage);
    $('#ContingencyStatus').val(data.status);
    $('#ContingencyProgress').val(data.progress);
    $('#ContingencyComments').val(data.comments);

    $('#StatusIndicatorC').text($(data.statusName).text());
    setStatusClassName('StatusIndicatorC', data.status);

    if (data.withImpact == true) {
        $('#ContingencyWithImpact').prop('checked', true);
    }
    else {
        $('#ContingencyWithImpact').prop('checked', false);
    }

    //if (data.status == 4 || status == 5) {
    //    $('#dvStatusCheckC').hide();
    //    $("#btnUpdateContingency").hide();
    //}
    if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {

        $('#ContingencyDescription').attr('readonly', true);
        $('#ContingencyResponsiblePercentage').attr('readonly', true);
        $("#ContingencyResponsible").prop("disabled", true);

    }
}

function newContingencyEntry() {
    cleanContingencyForm();
    $("#btnUpdateContingency").hide();
    $("#btnCreateContingency").show();
    $("#dvStatusC").hide();  
    $('#editModalContingency').modal('show');
}

function createContingencyRecord(controller) {

    var form = $("#frmMainContingency");
    form.validate();

    if (!form.valid())
        return;

    var plannedStartDate = new Date($("#ContingencyPlannedStartDate").val());
    var plannedEndDate = new Date($("#ContingencyPlannedEndDate").val());

    if (plannedEndDate.getTime() < plannedStartDate.getTime()) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#StartDateGreaterThanEndDate').val(),
            footer: '',
            onAfterClose: () => $("#ContingencyPlannedStartDate").focus()
        });
        return;
    }
       

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateRiskContingency',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalContingency').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadContingency()
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

function updateContingencyRecord(controller) {

    var form = $("#frmMainContingency");
    form.validate();

    if (!form.valid())
        return;

    if (form.valid()) {
        $("#ContingencyResponsible").prop("disabled", false);
    }

    var plannedStartDate = new Date($("#ContingencyPlannedStartDate").val());
    var plannedEndDate = new Date($("#ContingencyPlannedEndDate").val());

    if (plannedEndDate.getTime() < plannedStartDate.getTime()) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#StartDateGreaterThanEndDate').val(),
            footer: '',
            onAfterClose: () => $("#ContingencyPlannedStartDate").focus()
        });
        return;
    }

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateRiskContingency',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModalContingency').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadContingency()
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

function cancelContingencyRecord(controller) {

    var form = $("#frmMainContingency");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PATCH',
        url: '/' + controller + '/CancelRiskContingency',
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
                        onAfterClose: () => reloadContingency()
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

function deleteContingencyRecord(controller) {

    var form = $("#frmMainContingency");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/DeleteRiskContingency',
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
                    onAfterClose: () => reloadContingency()
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

function reloadContingency() {
    location.reload();
    //getRisk();
    //$('#datatables2').DataTable().ajax.reload();
}

function cancelContingencyEntry() {
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
            cancelContingencyRecord('Execution');
        }
    })
}

function deleteContingencyEntry() {
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
            deleteContingencyRecord('Execution');
        }
    });
}
