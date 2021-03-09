$(document).ready(function () {

    setFormValidation('#frmMain');

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true);

    $('#PlannedCost').mask('#,##0.00', { reverse: true });
    $('#RealCost').mask('#,##0.00', { reverse: true });
    $('#Progress').mask('##0.00', { reverse: true });

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetEvidences",
            data: { projectId: $("#ProjectID").val(), layerId: $("#LayerID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    data[i]["progress"] = parseFloat(data[i]["progress"]).toFixed(2);

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';

                    if (data[i]["responsibleElaborationImage"] == null)
                        data[i]["responsibleElaborationImage"] = '../images/avatar/default-avatar.png';

                    if (data[i]["ResponsibleApprovalImage"] == null)
                        data[i]["ResponsibleApprovalImage"] = '../images/avatar/default-avatar.png';
                }
                return data;
            }
        },
        columns: [
            { data: "projectEvidenceID", visible: false },
            { data: "projectID", visible: false },
            { data: "activityID", visible: false },
            { data: "status", visible: false },
            { data: "responsibleElaboration", visible: false },
            { data: "responsibleApproval", visible: false },
            { data: "plannedCost", visible: false },
            { data: "realCost", visible: false },
            { data: "progress", visible: false },
            {
                data: "description",
                render: function (data, type, row, meta) {
                    if (data != null) {
                        data = "<a href='#'>" + data + "</a>";
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
            { data: "evidenceTypeName" },
            {
                data: "responsibleElaborationName",
                render: function (url, type, full) {
                    return '<div class="ws">' +
                        '<img class="box-p" src=' + full.responsibleElaborationImage + '>' +
                        '<a href="#" class="none" onclick="getParticipantInfoModal(' + "'" + full.responsibleElaboration + "'" + '); return false;">' + full.responsibleElaborationName + '</a>' +
                        '<div>';
                }
            },
            { data: "progress" },
            { data: "statusName" },
            { data: "comment" },
            {
                data: null,
                render: function (url, type, full) {
                    var result = '';

                    if (full.editableByRol /*|| $('#LayerID').val() != ""*/) {
                        result = result + '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;';
                    }

                    if ($('#ProjectEditable').val() == 'True' && (full.deleteableByRol /*|| $('#LayerID').val() != ""*/)) {
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
        order: [[9, "asc"]],
        responsive: true,
        scrollX: true,
        searching: false
    });

    $('#datatables tbody').on('click', 'a', async function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanForm();
        await getActivity(data.activityID);
        if ($(e.target).attr('class') == null) {
            LoaderShow();
            location.href = '/Execution/Evidence?projectId=' + data.projectID + '&evidenceId=' + data.projectEvidenceID;
        }

        if ($(e.target).attr('class') === 'fa fa-edit') {
            $("#btnUpdate").show();
            $("#btnCreate").hide();
            $("#dvStatus").show();

            if (data.status == 5) {
                $("#btnUpdate").html($('#Reopen').val());

                if (data.children != 0)
                    $("#btnUpdate").hide();
            }
            else
                $("#btnUpdate").html($('#Update').val());

            fillForm(data, true);
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            fillForm(data, false);
            deleteEntry();
        }

        if ($(e.target).attr('class') == 'fas fa-ban') {
            fillForm(data, false);
            cancelEntry();
        }
    });

    $("#LayerParentID").change(function () {
        getLayers();
    });

    elementStatusCount();

    if ($('#ChangeControl').val() == 'True') {
        setControlChangeEntry($("#ProjectID").val());
    }

    $('.indicadores-st').tooltip({
        placement: 'top'
    });

    // Helps datatable to be responsive in certain cases
    window.onresize = () => $("#datatables").DataTable().columns.adjust();
});

function cleanForm() {
    var validator = $("#frmMain").validate();
    validator.resetForm();

    $('#ProjectEvidenceID').val('');
    $('#EvidenceTypeID').val('');
    $('#ProjectLayerID').val('');
    $('#ActivityID').val('');
    $('#Description').val('');
    $('#PlannedEndDate').val('');
    $('#ResponsibleElaboration').val('');
    $('#ResponsibleApproval').val('');
    $('#Status').val('');
    $('#PlannedCost').val('0.00');
    $('#RealCost').val('0.00');
    $('#Progress').val('0.00');
    $('#WithImpact').prop('checked', false);

    $('#ChangeControlEndDate').val('');
    $('#ChangeControlResponsible').val('');
    $('#ChangeControlManual').val('false');

    $('.datepicker').data("DateTimePicker").minDate(new Date('2000-01-01')); // probably settinh project start date
    $('.datepicker').data("DateTimePicker").maxDate(new Date('2100-12-31')); // probably settinh project end date
}

function fillForm(data, showModal) {
    $('#card-title').text($('#Edit').val() + ' ' + $('#Evidence').val());
    $('#dvStatusCheck').show();
    var array = data.plannedEndDate.split("T");

    $('#ProjectEvidenceID').val(data.projectEvidenceID);
    $('#EvidenceTypeID').val(data.evidenceTypeID);
    
    $('#ActivityID').val(data.activityID);
    $('#Description').val(data.description);
    $('#EvidenceWeight').val(data.weight);
    $('#EvidenceManualWeight').val(data.manualWeight);
    $('.datepicker').data("DateTimePicker").date(array[0]);
    $('#PlannedEndDate').val(array[0]);
    $('#ChangeControlEndDate').val(array[0]);
    $('#ResponsibleElaboration').val(data.responsibleElaboration);
    $('#ChangeControlResponsible').val(data.responsibleElaboration);
    $('#ResponsibleApproval').val(data.responsibleApproval);
    $('#Status').val(data.status);
    $('#PlannedCost').val(formatNumber(parseFloat(data.plannedCost).toFixed(2)));
    $('#RealCost').val(formatNumber(parseFloat(data.realCost).toFixed(2)));
    $('#Progress').val(data.progress);
    $('#StatusIndicator').text($(data.statusName).text());
    setStatusClassName('StatusIndicator', data.status);

    if (data.withImpact == true) {
        $('#WithImpact').prop('checked', true);
    }
    else {
        $('#WithImpact').prop('checked', false);
    }

    if (!data.progressEditable) {
        $('#dvStatusCheck').hide();
        $("#Progress").attr("readonly", true);
    }
    if (data.progressEditable) {
        $("#Progress").attr("readonly", false);
    }
    if ($('#LayerID').val() != null && $('#LayerID').val() != '') {
        if (showModal) 
            $('#editModal').modal('show');
    }
    else {
        $('#LayerParentID').val(data.projectLayerParentID);

        $.when(getLayers()).done(function () {
            $('#ProjectLayerID').val(data.projectLayerID);
            if (showModal) 
                $('#editModal').modal('show');
        });
    }
    if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {
    
        $('#Description').attr('readonly', true);
        $('#PlannedCost').attr('readonly', true);
        $('#RealCost').attr('readonly', true);

        $('#EvidenceTypeID').prop("disabled", true);
        $('#ActivityID').prop("disabled", true);
        $('#LayerParentID').prop("disabled", true);
        $('#ProjectLayerID').prop("disabled", true);
        $('#ResponsibleElaboration').prop("disabled", true);
        $('#ResponsibleApproval').prop("disabled", true);
        
    }
    //getActivity(data.activityID);
}

function newEntry() {
    $('#card-title').text($('#New').val() + ' ' + $('#Evidence').val());
    cleanForm();
    $("#btnUpdate").hide();
    $("#btnCreate").show();
    $("#dvStatus").hide();
    $('#editModal').modal('show');
}

function createRecord(controller) {
    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    var progress = $("#Progress").val();
    if (progress < 0 || progress > 100) {
        Swal.fire({
            type: 'success',
            title: '',
            text: $("#m4028").val(),
            footer: ''
        });
    }

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateEvidence',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModal').modal('toggle');

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

function updateRecord(controller) {

    var ccEndDate = $('#ChangeControlEndDate').val();
    var ccResponsible = $('#ChangeControlResponsible').val();
    var endDate = $('#PlannedEndDate').val();
    var responsible = $('#ResponsibleElaboration').val();

    if ($('#ChangeControl').val() == 'True' && ccEndDate != '' && ccResponsible != '' && (ccEndDate != endDate || ccResponsible != responsible) && parseFloat($("#Progress").val()) <= 100) {
        $('#ChangeControlComments').val('');
        $('#ChangeControlAuthorizer').val('');
        $('#DLG005_CC_Comments').val('');
        $('#DLG005_CC_Authorizer').val('');
        $('#editModal').modal('toggle');
        $('#DLG005_CC').modal('show');
    }
    else {
        update(controller);
    }
}

function dismissChangeControl() {
    update('Execution');
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
    update('Execution');
}

function update(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    var progress = $("#Progress").val();
    if (progress < 0 || progress > 100) {
        Swal.fire({
            type: 'success',
            title: '',
            text: $("#m4028").val(),
            footer: ''
        });
    }

    if (form.valid()) {
        $('#EvidenceTypeID').prop("disabled", false);
        $('#ActivityID').prop("disabled", false);
        $('#LayerParentID').prop("disabled", false);
        $('#ProjectLayerID').prop("disabled", false);
        $('#ResponsibleElaboration').prop("disabled", false);
        $('#ResponsibleApproval').prop("disabled", false);
    }

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateEvidence',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            if (data.isSuccess) {

                if ($('#editModal').hasClass('show'))
                    $('#editModal').modal('toggle');

                if ($('#DLG005_CC').length == 0) {
                    if ($('#DLG005_CC').hasClass('show'))
                        $('#DLG005_CC').modal('toggle');
                }

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

function deleteRecord(controller) {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/DeleteEvidence',
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

function reload() {
    elementStatusCount();
    $('#datatables').DataTable().ajax.reload();
}

function deleteEntry() {
    Swal.fire({
        html: $("#AreYouSureDelete").val() + '<br/>' + $("#AreYouSureDeleteEvidence").val(),
        title: '',
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

function getLayers() {
    return $.ajax({
        type: 'GET',
        url: "/Execution/GetLayerSelectionList",
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), parentId: $("#LayerParentID").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            document.getElementById('ProjectLayerID').options.length = 0;
            select = document.getElementById('ProjectLayerID');

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
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

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat);
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function elementStatusCount() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetElementIndicators',
        dataType: 'json',
        data: { projectId: $('#ProjectID').val(), type: 3, layerId: $('#LayerID').val() },
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

function getActivity(taskId) {

    $('.datepicker').data("DateTimePicker").minDate(new Date('2000-01-01'));
    $('.datepicker').data("DateTimePicker").maxDate(new Date('2100-12-31'));

    return $.ajax({
        type: 'GET',
        url: "/Execution/GetActivityDates",
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), activityId: taskId },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            $('.datepicker').data("DateTimePicker").minDate(data.start_date);
            $('.datepicker').data("DateTimePicker").maxDate(data.end_date);
            $('.datepicker').data("DateTimePicker").date(data.end_date);
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

function cancelEntry() {
    Swal.fire({
        html: $("#AreYouSureCancel").val() + '<br/>' + $("#AreYouSureCancelEvidence").val(),
        title: '',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            cancelRecord('Execution');
        }
    })
}

function cancelRecord(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/CancelEvidence',
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
    })
}