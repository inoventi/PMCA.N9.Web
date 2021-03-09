$(document).ready(function () {
    //setFormValidation('#frmMain');
    //setFormValidation('#frmMainDetail');

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5],
            format: {
                body: function (data, row, column, node) {
                    if (column === 7) {
                        if (data.indexOf('far fa-check-square') > -1) {
                            data = $("#Yes").val();
                        }
                        else {
                            data = "No";
                        }
                    }

                    return data;
                }
            }
        }
    };

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/FactSheets/GetFactSheetDetails/" + $("#FactID").val(),
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                return data;
            }
        },
        columns: [
            { data: "factSheetDetailID", visible: false },
            // { data: "factSheetID", visible: false },
            { data: "key" },
            { data: "value" },
            { data: "order" },
            { data: "tooltip" },
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
            //{ data: "createdByName" },
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
            //{ data: "updatedByName" },
            {
                data: null, targets: 7,
                defaultContent: '<a class="btn btn-link btn-warning edit"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger remove"><i class="far fa-trash-alt"></i></a>'
            }

        ],
        language: {
            url: "../../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        dom: 'Bfrtip',
        buttons: [
            $.extend(true, {}, fileExportOptions, { extend: 'excelHtml5' }),
            $.extend(true, {}, fileExportOptions, { extend: 'pdfHtml5' })
        ],
        order: [[3, "asc"]],
        responsive: true,
        scrollX: true
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();
        cleanDetailForm();
        fillDetailForm(data);

        if ($(e.target).attr('class') === 'fa fa-edit') {
            $("#btnUpdateDetail").show();
            $("#btnCreateDetail").hide();
            $('#editModal').modal('show');
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteEntry();
        }
    });
});

function cleanDetailForm() {
    $('#FactSheetDetailID').val('');
    $('#Key').val('');
    $('#Value').val('');
    $('#Order').val('');
    $('#Tooltip').val('');

    $('#frmMainDetail').trigger("reset");
    var validator = $('#frmMainDetail').validate();
    validator.resetForm();
}

function fillDetailForm(data) {
    $('#FactSheetDetailID').val(data["factSheetDetailID"]);
    $('#Key').val(data["key"]);
    $('#Value').val(data["value"]);
    $('#Order').val(data["order"]);
    $('#Tooltip').val(data["tooltip"]);
}

function newDetailEntry() {
    cleanDetailForm();
    $("#btnUpdateDetail").hide();
    $("#btnCreateDetail").show();
    $('#editModal').modal('show');
}

function createRecord(controller) {
    var form = $("#frmMain");
    form.validate();
   
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
              
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => cancel()
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
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => cancel()
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

function createDetailRecord(controller) {
    var form = $("#frmMainDetail");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateDetail/' + $('#FactID').val(),
        dataType: 'json',
        data: form.serialize(),
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

function updateDetailRecord(controller) {
    var form = $("#frmMainDetail");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateDetail/' + $('#FactID').val(),
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

function deleteDetailRecord(controller) {
    var form = $("#frmMainDetail");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/deleteDetail/' + $('#FactID').val(),
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
function cancel() {
    window.location.href = '/FactSheets/Index';
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
            deleteDetailRecord('FactSheets');
        }
    });
}