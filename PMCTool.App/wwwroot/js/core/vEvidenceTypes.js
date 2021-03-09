$(document).ready(function () {
    $("#bulkLink").attr("href", "../templates/EvidenceType_" + Cookies.get('pmctool-lang-app').substring(0, 2) + ".xlsx");

    setFormValidation('#frmMain');

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7],
            format: {
                body: function (data, row, column, node) {
                    

                    return data;
                }
            }
        }
    };

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/EvidenceTypes/GetEvidenceTypes",
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["isActive"] === true) {
                        data[i]["isActive"] = $('#Active').val();
                    }
                    else {
                        data[i]["isActive"] = $('#Inactive').val();
                    }
                }
                return data;
            }
        },
        columns: [
            { data: "evidenceTypeID", visible: false },
            { data: "code" },
            { data: "name" },
            { data: "isActive" },
            {
                data: "createdOn",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0] + ' ' + array[1].substr(0, 5);
                    }
                    return data;
                }
            },
            { data: "createdByName" },
            {
                data: "lastUpdatedOn",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0] + ' ' + array[1].substr(0, 5);
                    }
                    return data;
                }
            },
            { data: "updatedByName" },
            {
                data: null, targets: 7,
                defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        dom: 'Bfrtip',
        buttons: [
            $.extend(true, {}, fileExportOptions, { extend: 'excelHtml5' }),
        ],
        order: [[2, "asc"]],
        responsive: true,
        scrollX: true
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanForm();
        fillForm(data);

        if ($(e.target).attr('class') === 'fa fa-edit') {
            $("#btnUpdate").show();
            $("#btnCreate").hide();
            $('#editModal').modal('show');
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteEntry();
        }
    });

    $("#fileuploader").uploadFile({
        url: '/EvidenceTypes/UploadFile',
        multiple: false,
        dragDrop: true,
        fileName: "files",
        allowedTypes: "xls,xlsx,csv",
        dragDropStr: "<span style='color:#B2B2B2; font-size:18px; opacity:1;'>" + $("#DragDrop").val() + "</span>",
        extErrorStr: $("#FileExtension").val() + ". " + $("#FormatAllowed").val() + ": ",
        uploadStr: $("#Upload").val(),
        onSuccess: function (files, data, xhr, pd) {
            $('#bulkModal').modal('toggle');
            LoaderHide();
            let mType = data.hasErrors ? 'warning' : 'success';
            Swal.fire({
                type: mType,
                title: '',
                footer: '',
                html: data.successMessage,
                onAfterClose: () => reload()
            });
        },
        onError: function (files, status, errMsg, pd) {
            LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: data.errorMessage,
                footer: ''
            });
        },
        onSubmit: function (files, status, errMsg, pd) {
            LoaderShow();
        },
        onCancel: function (files, status, errMsg, pd) {
            LoaderShow();
        }
    });
});

function cleanForm() {
    $('#EvidenceTypeID').val('');
    $('#Code').val('');
    $('#Name').val('');
    $('#IsActive').prop('checked', false);

    var validator = $("#frmMain").validate();
    validator.resetForm();
}

function fillForm(data) {
    $('#EvidenceTypeID').val(data["evidenceTypeID"]);
    $('#Code').val(data["code"]);
    $('#Name').val(data["name"]);

    if (data["isActive"] == $('#Active').val()) {
        $('#IsActive').prop('checked', true);
    }
    else {
        $('#IsActive').prop('checked', false);
    }
}

function newEntry() {
    cleanForm();
    $("#btnUpdate").hide();
    $("#btnCreate").show();
    $('#IsActive').prop('checked', true);
    $('#editModal').modal('show');
}

function createRecord(controller) {
    var form = $("#frmMain");
    form.validate();
    console.log(form.validate());
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/create',
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
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/update',
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

function deleteRecord(controller) {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/delete',
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
    $('#datatables').DataTable().ajax.reload();
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
            deleteRecord('EvidenceTypes');
        }
    });
}

function showBulK() {
    $('#eventsmessage').text('');
    $('#bulkModal').modal('show');
}