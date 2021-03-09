$(document).ready(function () {

    $('#Progress').mask('##0.00', { reverse: true });

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true);

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetAgreements",
            data: { projectId: $("#ProjectID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
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
            { data: "projectMeetingAgreementID", visible: false },
            { data: "projectMeetingID", visible: false },
            { data: "elementID", visible: false },
            { data: "elementType", visible: false },
            { data: "responsible", visible: false },
            { data: "status", visible: false },
            {
                data: "description",
                render: function (url, type, full) {
                    return "<a href='/Execution/AgreementDetail?projectId=" + full.projectID + "&meetingId=" + full.projectMeetingID + '&agreementId=' + full.projectMeetingAgreementID + "'>" + full.description + "</a>"
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
                    var img = ''
                    if (full.responsibleImage == null || full.responsibleImage == "") 
                        img = "/images/avatar/default-avatar.png"
                    
                    else 
                        img = full.responsibleImage;

                    return '<div class="ws">' +
                        '<img class="box-p" src="' + img + '">' +
                        '<a href="#" class="none" onclick="getParticipantInfoModal(' + "'" + full.responsible + "'" + '); return false;">' + full.responsibleName + '</a>' +
                        '<div>';
                }
            },
            { data: "statusName" },
            { data: "comments" },
            { data: "objective" },
            { data: "elementDescription" },
            {
                data: null,
                render: function (url, type, full) {
                    var result = ''
                    if (full.editableByRol)
                        result = result + '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>';
                    
                    if ($('#ProjectEditable').val() == 'True' && full.deleteableByRol) {
                        if (full.status != 4 && full.status != 5)
                            result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Cancel").val() + '"><i class="fas fa-ban"></i></a>&nbsp;';

                        result = result + '&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>';
                    }
                    return result;
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        bLengthChange: false,
        bFilter: false,
        pageLength: 50,
        order: [[4, "asc"]],
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
        gtr = tr;

        cleanAgreementForm();
        
        if ($(e.target).attr('class') === 'fa fa-edit') {
            if (data.status == 5)
                $("#btnUpdate").html("Reabir");
            else
                $("#btnUpdate").html("Actualizar");

            $("#btnUpdate").show();
            $("#btnCreate").hide();
            $("#dvStatus").show();
            fillAgreementForm(data, 1);
        }

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            fillAgreementForm(data, 2);
            deleteEntry();
        }

        if ($(e.target).attr('class') == 'fas fa-ban') {
            fillAgreementForm(data, 2);
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

    $("select#ElementType").change(function () {
        var opt = $(this).children("option:selected").val();
        getElements(opt, 'ElementName')
    })

    // Helps datatable to be responsive in certain cases
    window.onresize = () => $("#datatables").DataTable().columns.adjust();
});

function elementStatusCount() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetElementIndicators',
        dataType: 'json',
        data: { projectId: $('#ProjectID').val(), type: 6 },
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

function cleanAgreementForm() {
    var validator = $("#frmAgreement").validate();
    validator.resetForm();

    $('#projectMeetingAgreementID').val('');
    $('#ElementID').val('');
    $('#Description').val('');
    $('#Responsible').val('');
    $('#PlannedEndDate').val('');

    $('#ElementName').val('');
    $('#ElementDescription').val('');
    $('#WithImpact').prop('checked', false);
    $('#Comments').val('');

    $('#ChangeControlEndDate').val('');
    $('#ChangeControlResponsible').val('');
    $('#ChangeControlManual').val('false');

    $('#ElementType').val(1);
  //  $("select#ElementType").children("option:selected").val(1);

    //$.when(getElements(1, 'ElementName')).done(function () {
    //});

}

function fillAgreementForm(data, opt) {
    var array = data.plannedEndDate.split("T");

    $('#ProjectMeetingID').val(data.projectMeetingID);
    $('#ProjectMeetingAgreementID').val(data.projectMeetingAgreementID);
    $('#ElementID').val(data.elementID);
    $('#Description').val(data.description);

    $('#Responsible').val(data.responsible);
    $('#ChangeControlResponsible').val(data.responsible);

    $('#PlannedEndDate').val(array[0]);
    $('#ChangeControlEndDate').val(array[0]);

    $('#ElementDescription').val(data.elementDescription);
    $('#Comments').val(data.comments);
    $('#Progress').val(parseFloat(data.progress).toFixed(2));

    $('#StatusIndicator').text($(data.statusName).text());
    setStatusClassName('StatusIndicator', data.status);

    if (data.withImpact == true) {
        $('#WithImpact').prop('checked', true);
    }
    else {
        $('#WithImpact').prop('checked', false);
    }

    $('#ElementType  option[value="' + data.elementType + '"]').prop('selected', true)
    $('#ElementType option[value="' + data.elementType + '"]')

    document.getElementById('ElementName').options.length = 0;

    if (data.elementType != '99') {
        $.when(getElements(data.elementType, 'ElementName', data.elementID)).done(function () {
            if (opt == '1') {
                $('#editAgreementModal').modal('show');
            }
        });
    }
    else {
        $('#editAgreementModal').modal('show');

    }
    if ($('#ParticipantRole').val() == 3 || $('#ParticipantRole').val() == 4) {

        $('#Description').attr('readonly', true);
        $('#ElementDescription').attr('readonly', true);
        $("#Responsible").prop("disabled", true);
        $("#ElementType.form-control").prop("disabled", true);
        $("#ElementName").prop("disabled", true);

    }

}

function addAgreement() {

    var form = $("#frmAgreement");
    form.validate();

    if (!form.valid())
        return;

    var exists = false;
    var elementId = $('#agreementElementName').val();
    var elementType = parseInt($('#agreementElementType').val());
    var table = $('#datatableAgreement').DataTable();

    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var tdata = this.data();
        var index = this.index();

        if (elementType != 99 && tdata.elementID == elementId)
            exists = true;
    });

    if (exists)
        return;

    table.row.add({
        "projectMeetingAgreementID": '00000000-0000-0000-0000-000000000000',
        "projectMeetingID": '00000000-0000-0000-0000-000000000000',
        "elementID": $('#agreementElementName').val(),
        "elementType": $('#agreementElementType').val(),
        "responsible": $('#agreementResponsible').val(),
        "status": 1,
        "description": $('#agreementDescription').val(),
        "plannedEndDate": $('#agreementPlannedEndDate').val() + 'T00:00:00',
        "responsibleName": $("#agreementResponsible option:selected").text(),
        "statusName": '<span class="bold ' + getStatusClassName(1) + ' ws">' + $("#EnumProjectElementStatus_1").val() + '</span>',
        "comments": $('#agreementComment').val(),
        "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '" > <i class="far fa-trash-alt"></i></a >',
        "operation": '1',
        "elementDescription": $('#agreementElementDescription').val()
    }).draw();

    $('#editAgreementModal').modal('toggle');
}

function updateAgreement() {

    var ccEndDate = $('#ChangeControlEndDate').val();
    var ccResponsible = $('#ChangeControlResponsible').val();
    var endDate = $('#PlannedEndDate').val();
    var responsible = $('#Responsible').val();
    $('#ElementID').val($('#ElementName').val());

    if ($('#ChangeControl').val() == 'True' && ccEndDate != '' && ccResponsible != '' &&
        (ccEndDate != endDate || ccResponsible != responsible)
        && parseFloat($("#Progress").val()) <= 100) {
        $('#ChangeControlComments').val('');
        $('#ChangeControlAuthorizer').val('');
        $('#DLG005_CC_Comments').val('');
        $('#DLG005_CC_Authorizer').val('');
        $('#editAgreementModal').modal('toggle');
        $('#DLG005_CC').modal('show');
    }
    else {
        updAgreement();
    }
}

function dismissChangeControl() {
    updAgreement();
}

function updateChangeControl() {

    var form = $("#DLG005_CC_frmChangeControl");
    form.validate();

    if (!form.valid())
        return;

    $('#ChangeControlComments').val($('#DLG005_CC_Comments').val());
    $('#ChangeControlAuthorizer').val($('#DLG005_CC_Authorizer').val());
    $('#ChangeControlManualInput').val('true');
    $('#DLG005_CC').modal('toggle');
    updAgreement();
}

function updAgreement() {
    var form = $("#frmAgreement");
    form.validate();

    if (!form.valid() || ($('select[name=ElementType] option').filter(':selected').val() != 99 && $('#ElementName').val() == null ))
        return;

    if (form.valid()) {
        $("#Responsible").prop("disabled", false);
        $("#ElementType.form-control").prop("disabled", false);
        $("#ElementName").prop("disabled", false);
    }

    $.ajax({
        type: 'PUT',
        url: '/Execution/PutAgreement',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {

                if ($('#editAgreementModal').hasClass('show'))
                    $('#editAgreementModal').modal('toggle');

                if ($('#DLG005_CC').length == 0) {
                    if ($('#DLG005_CC').hasClass('show'))
                        $('#DLG005_CC').modal('toggle');
                }

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: function () {
                        reload();
                    }
                });
            }
            else {
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

function getElements(type, obj, element) {

    document.getElementById(obj).options.length = 0;

    $.ajax({
        type: 'GET',
        url: '/Execution/GetElementSelectionList',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), type: type },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            document.getElementById(obj).options.length = 0;
            select = document.getElementById(obj);

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
            }
            if (element != null) {
                $('#ElementName  option[value="' + element + '"]').attr('selected', true)
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

function cancelEntry() {
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
            cancelRecord('Execution');
        }
    })
}

function cancelRecord(controller) {
    var form = $("#frmMain");
    form.validate();

    $.ajax({
        type: 'PATCH',
        url: '/' + controller + '/CancelAgreement',
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

function deleteRecord(controller) {

    var form = $("#frmMain");
    form.validate();

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/DeleteAgreement',
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