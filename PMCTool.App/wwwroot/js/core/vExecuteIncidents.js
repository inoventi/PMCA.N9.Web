$(document).ready(function () {

    setFormValidation('#frmMain');

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true);

    $('#PlannedCost').mask('#,##0.00', { reverse: true });
    $('#RealCost').mask('#,##0.00', { reverse: true });
    $('#Progress').mask('##0.00', { reverse: true });

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetIncidents",
            data: { projectID: $("#ProjectID").val() },
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

                    if (data[i]["responsibleImage"] == null)
                        data[i]["responsibleImage"] = '../images/avatar/default-avatar.png';

                }
                return data;
            }
        },
        columns: [
            { data: "projectIncidentID", visible: false },
            { data: "projectID", visible: false },
            { data: "status", visible: false },
            { data: "responsible", visible: false },
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
        order: [[7, "asc"]],
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
        
        if ($(e.target).attr('class') == null) {
            LoaderShow();
            location.href = '/Execution/Incident?projectId=' + data.projectID + '&incidentId=' + data.projectIncidentID;
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

    $("#ElementType").change(function () {
        let opt = $("#ElementType").val();

        if (opt == 1) {
            getActivities();
        }
        else {
            getEvidences();
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

    $('#ProjectIncidentID').val('');
    $('#Description').val('');
    $('#PlannedEndDate').val('');
    $('#Responsible').val('');
    $('#Status').val('');
    $('#PlannedCost').val(parseFloat(0).toFixed(2));
    $('#RealCost').val(parseFloat(0).toFixed(2));
    $('#Progress').val(parseFloat(0).toFixed(2));
    $('#WithImpact').prop('checked', false);

    document.getElementById('ElementID').options.length = 0;
    $('#ElementType').val('');

    $('#ChangeControlEndDate').val('');
    $('#ChangeControlResponsible').val('');
    $('#ChangeControlManual').val('false');
}

function fillForm(data, show) {
    $('#card-title').text($('#Edit').val() + ' ' + $('#Incident').val());

    $('#dvStatusCheck').show();
    var array = data.plannedEndDate.split("T");

    $('#ProjectIncidentID').val(data.projectIncidentID);
    $('#ElementType').val(data.elementType);
    $('#Description').val(data.description);

    $('#PlannedEndDate').val(array[0]);
    $('#ChangeControlEndDate').val(array[0]);
    $('#Responsible').val(data.responsible);
    $('#ChangeControlResponsible').val(data.responsible);

    $('#Status').val(data.status);
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

    if (data.elementType == 1) {
        $.when(getActivities()).done(function () {
            $('#ElementID').val(data.elementID);
        }).then(function () {
            if (show == true)
                $('#editModal').modal('show');
        });
    }

    if (data.elementType == 3){
        $.when(getEvidences()).done(function () {
            $('#ElementID').val(data.elementID);
        }).then(function() {
            if(show == true)
                $('#editModal').modal('show');
        });
    }

 
    
    if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {

        $('#Description').attr('readonly', true);
        $('#Responsible').prop("disabled", true);
        $('#ElementType').prop("disabled", true);
        $('#ElementID').prop("disabled", true);
        $('#PlannedCost').attr('readonly', true);
        $('#RealCost').attr('readonly', true);

    }

}

function newEntry() {
    $('#card-title').text($('#New').val() + ' ' + $('#Incident').val());

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
        url: '/' + controller + '/CreateIncident',
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
        $('#Responsible').prop("disabled", false);
        $('#ElementType').prop("disabled", false);
        $('#ElementID').prop("disabled", false);
    }

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateIncident',
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
        url: '/' + controller + '/DeleteIncident',
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
        html: $("#AreYouSureDelete").val() + '<br/>' + $("#AreYouSureDeleteIncident").val(),
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

function getActivities() {
   return  $.ajax({
        type: 'GET',
       url: "/Execution/GetChildActivitiesSelectionList",
        dataType: 'json',
        data: { projectId: $("#ProjectID").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            document.getElementById('ElementID').options.length = 0;
            select = document.getElementById('ElementID');

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

function getEvidences() {
    return $.ajax({
        type: 'GET',
        url: "/Execution/GetEvidenceSelectionList",
        dataType: 'json',
        data: { projectId: $("#ProjectID").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {

            document.getElementById('ElementID').options.length = 0;
            select = document.getElementById('ElementID');

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
        data: { projectId: $('#ProjectID').val(), type: 4 },
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
        html: $("#AreYouSureCancel").val() + '<br/>' + $("#AreYouSureCancelIncident").val(),
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
        url: '/' + controller + '/CancelIncident',
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