$(document).ready(function () {

    setFormValidation('#frmMain');

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true);
    
    $('#PlannedCost').mask('#,##0.00', { reverse: true });
    $('#RealCost').mask('#,##0.00', { reverse: true });
    $('#Progress').mask('##0.00', { reverse: true });

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetRisks",
            data: { projectID: $("#ProjectID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {

                    if (data[i]["impact"] != null)
                        data[i]["impactName"] = $("#EnumProjectRiskImpact_" + data[i]["impact"]).val();

                    if (data[i]["probability"] != null)
                        data[i]["probabilityName"] = $("#EnumProjectRiskProbability_" + data[i]["probability"]).val();

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';

                    if (data[i]["responsibleImage"] == null)
                        data[i]["responsibleImage"] = '../images/avatar/default-avatar.png';

                }
                return data;
            }
        },
        columns: [
            { data: "projectRiskID", visible: false },
            { data: "projectID", visible: false },
            { data: "impact", visible: false },
            { data: "probability", visible: false },
            { data: "status", visible: false },
            { data: "responsible", visible: false },
            { data: "plannedCost", visible: false },
            { data: "realCost", visible: false },
            { data: "progress", visible: false },
            {
                data: "riskDescription",
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
            { data: "impactName" },
            { data: "probabilityName" },
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
            { data: "comment" },
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
        order: [[5, "asc"]],
        responsive: true,
        scrollX: false,
        searching: false
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanForm();
        fillForm(data);
        if ($(e.target).attr('class') == null) {
            LoaderShow();
            location.href = '/Execution/Risk?projectId=' + data.projectID + '&riskId=' + data.projectRiskID;
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

            $('#editModal').modal('show');
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteEntry();
        }

        if ($(e.target).attr('class') == 'fas fa-ban') {
            cancelEntry();
        }

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

    $('#ProjectRiskID').val('');
    $('#RiskDescription').val('');
    $('#PlannedEndDate').val('');
    $('#Responsible').val('');
    $('#Impact').val('');
    $('#Probability').val('');
    $('#Status').val('');
    $('#PlannedCost').val('0.00');
    $('#RealCost').val('0.00');
    $('#Progress').val('0.00');
    $('#WithImpact').prop('checked', false);

    $('#ChangeControlEndDate').val('');
    $('#ChangeControlResponsible').val('');
    $('#ChangeControlManual').val('false');
}

function fillForm(data) {
    $('#card-title').text($('#Edit').val() + ' ' + $('#Risk').val());

    $('#dvStatusCheck').show();
    var array = data.plannedEndDate.split("T");

    $('#ProjectRiskID').val(data.projectRiskID);
    $('#RiskDescription').val(data.riskDescription);

    $('#PlannedEndDate').val(array[0]);
    $('#ChangeControlEndDate').val(array[0]);
    $('#Responsible').val(data.responsible);
    $('#ChangeControlResponsible').val(data.responsible);

    $('#Impact').val(data.impact);
    $('#Probability').val(data.probability);
    $('#PlannedCost').val(formatNumber(parseFloat(data.plannedCost).toFixed(2)));
    $('#RealCost').val(formatNumber(parseFloat(data.realCost).toFixed(2)));
    $('#Progress').val(parseFloat(data.progress).toFixed(2));

    $('#StatusIndicator').text($(data.statusName).text());
    setStatusClassName('StatusIndicator', data.status);

    if (data.withImpact == true) {
        $('#WithImpact').prop('checked', true);
    }
    else {
        $('#WithImpact').prop('checked', false);
    }

    if (data.progressEditable == false) {
        $('#dvStatusCheck').hide();
        $("#Progress").attr("readonly", true);

    }

    if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {

        $('#RiskDescription').attr('readonly', true);
        $("#Responsible").prop("disabled", true);
        $("#Impact").prop("disabled", true);
        $("#Probability").prop("disabled", true);
        $('#PlannedCost').attr('readonly', true);
        $('#RealCost').attr('readonly', true);

    }
}

function newEntry() {
    $('#card-title').text($('#New').val() + ' ' + $('#Risk').val());
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

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateRisk',
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
    var responsible = $('#Responsible').val();

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

    if (form.valid()) {
        $("#Responsible").prop("disabled", false);
        $("#Impact").prop("disabled", false);
        $("#Probability").prop("disabled", false);
    }

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateRisk',
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
        url: '/' + controller + '/DeleteRisk',
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
        html: $("#AreYouSureDelete").val() + '<br/>' + $("#AreYouSureDeleteRisk").val(),
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
        data: { projectId: $('#ProjectID').val(), type: 5 },
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

function cancelEntry() {
    Swal.fire({
        html: $("#AreYouSureCancel").val() + '<br/>' + $("#AreYouSureCancelRisk").val(),
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
        url: '/' + controller + '/CancelRisk',
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