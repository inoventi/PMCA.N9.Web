$(document).ready(function () {

    setFormValidation('#frmMain');

    var fileExportOptions = {
        exportOptions: {
            columns: [ 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
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
            url: "/Portfolios/Get",
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
            { data: "portfolioID", visible: false },
            //{ data: "weighingManagement", visible: false },
            { data: "code" },
            { data: "name" },
            { data: "description" },
            { data: "isActive" },
            { data: "parentName" },
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
                data: null,
                render: function (url, type, full) {
                    if (full.isActive == $('#Active').val())
                        return '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#ImageLabel").val() + '"><i class="far fa-file-image"></i></a>&nbsp;<a class="btn btn-link btn-success" data-toggle="tooltip" title="' + $("#PortfolioLabel").val() + '"><i class="fas fa-share-alt"></i></a>';
                    else
                        return '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#ImageLabel").val() + '"><i class="far fa-file-image"></i></a>';

                }
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        dom: 'Bfrtip',
        buttons: [
            
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

        if ($(e.target).attr('class') == 'far fa-file-image') {
            $('#Image').val("");
            $('#ID').val(data["portfolioID"]);
            $('#umProjectName').text(data["name"]);
            $("#umProjectImage").attr("src", "");

            if (data["image"] != null) {
                $("#umProjectImage").attr("src", data["image"]);
            }

            $('#uploadModal').modal('show');
            if (data.image == null)
                $('#deleteImage').hide();
            else
                $('#deleteImage').show();
        }

        if ($(e.target).attr('class') === 'fas fa-share-alt') {
            location.href = '/Portfolios/Connection?id=' + data["portfolioID"];
        }
    });

    $("#Code").focusout(function () {
        var oldCode = $("#OldCode").val();
        var newCode = $(this).val();

        if ((oldCode != newCode)) {
            codeExist(newCode);
        }
        return false;
    });

    $("#Image").change(function () {
        var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
        if ($.inArray($(this).val().split('.').pop().toLowerCase(), fileExtension) == -1) {
            Swal.fire({
                type: 'error',
                title: '',
                text: $("#ImageFormatAllowed").val(),
                footer: ''
            });
            $(this).val('');
        }
    });
});

function cleanForm() {
    $('#portfolioID').val('');
    $('#Code').val('');
    $('#Name').val('');
    $('#Description').val('');
    $('#IsActive').prop('checked', false);

    var validator = $("#frmMain").validate();
    validator.resetForm();
}

function fillForm(data) {
    $('#PortfolioID').val(data.portfolioID);
    $('#Code').val(data.code);
    $('#Name').val(data.name);
    $('#Description').val(data.description);
    //$('#WeighingManagement').val(data.weighingManagement);
    //$('#ParentID').val(data.parentID);

    if (data.isActive == $('#Active').val()) {
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
            deleteRecord('Portfolios');
        }
    });
}

function codeExist(code) {

    $.ajax({
        type: 'GET',
        url: '/Portfolios/GetByCode',
        dataType: 'json',
        data: { code: code },
        beforeSend: function () {
        },
        success: function (data) {
            if (data.valueBoolean) {
                $("#Code").val($("#OldCode").val());
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: '',
                    onAfterClose: () => $("#Code").focus()
                });
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
        }
    })
}

function uploadFile() {

    var form = $("#frmFile");
    if (!form.valid())
        return;

    formData = new FormData();
    formData.append("ID", $("#ID").val());
    formData.append("Image", $("#Image")[0].files[0]);

    $.ajax({
        type: 'POST',
        url: '/Portfolios/UploadFile',
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
                        LoaderShow();

                        setTimeout(function () {
                            location.reload(true);
                        }, 2000);
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
function deleteFile() {
    formData = new FormData();
    formData.append("ProjectID", $("#ID").val());

    $.ajax({
        type: 'POST',
        url: '/Portfolios/DeleteFile/',
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
                        LoaderShow();

                        setTimeout(function () {
                            location.reload(true);
                        }, 2000);
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