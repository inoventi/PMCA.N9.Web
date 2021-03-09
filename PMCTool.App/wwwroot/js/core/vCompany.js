$(document).ready(function () {
    $("#bulkLink").attr("href", "../templates/Companies_" + Cookies.get('pmctool-lang-app').substring(0, 2) + ".xlsx");

    setFormValidation('#frmFile');

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 5, 6, 7, 8, 9, 11, 13, 15, 16, 17, 18, 19, 20],
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
            url: "/Companies/GetCompanies",
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["isActive"] == true) {
                        data[i]["isActive"] = $('#Active').val();
                    }
                    else {
                        data[i]["isActive"] = $('#Inactive').val();
                    }
                }
                return data;
            },
        },
        columns: [
            { data: "companyID", visible: false },
            { data: "code" },
            { data: "name" },
            { data: "isActive" },
            { data: "logo", visible: false },
            { data: "address.street" },
            { data: "address.extNum" },
            { data: "address.intNum" },
            { data: "address.district" },
            { data: "address.city" },
            { data: "address.cityID", visible: false },
            { data: "address.state" },
            { data: "address.stateID", visible: false },
            { data: "address.country" },
            { data: "address.countryID", visible: false },
            { data: "address.zipCode" },
            { data: "contact.value" },
            {
                data: "createdOn",
                render: function (data, type, row, meta) {
                    if (data != null) {
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
                    if (data != null) {
                        var array = data.split("T");
                        data = array[0] + ' ' + array[1].substr(0, 5);
                    }
                    return data;
                }
            },
            { data: "updatedByName" },
            {
                data: null, targets: 21,
                defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#ImageLabel").val() + '"><i class="far fa-file-image"></i></a>'
            },
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
        if (data.isActive == $('#Active').val())
            data.isActive = true;
        else
            data.isActive = false;

        var data2 = {
            'companyID': data.companyID,
            'code': data.code,
            'name': data.name,
            'isActive': data.isActive,
            'address.street': data.address.street,
            'address.extNum': data.address.extNum,
            'address.intNum': data.address.intNum,
            'address.district': data.address.district,
            'address.countryID': data.address.countryID,
            'address.stateID': data.address.stateID,
            'address.cityID': data.address.cityID,
            'address.zipCode': data.address.zipCode,
            'contact.value': data.contact.value
        }

        if ($(e.target).attr('class') == 'fa fa-edit') {
            var baseUrl = window.location.origin + '/companies/Editor';
            var queryString = $.param(data2);
            window.location = baseUrl + '?' + queryString;
        }
        if ($(e.target).attr('class') == 'far fa-trash-alt') {
            deleteEntry(data);
        }
        if ($(e.target).attr('class') == 'far fa-file-image') {
            $('#Image').val("");
            $('#CompanyID').val(data.companyID);
            $('#umCompanyName').text(data["name"]);
            $("#umEnvironmentImage").attr("src", "");

            if (data.logo != null) {
                $("#umEnvironmentImage").attr("src", data.logo);
            }

            $('#uploadModal').modal('show');
            if (data.logo == null)
                $('#deleteImage').hide();
            else 
                $('#deleteImage').show();

        }

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

    $("#fileuploader").uploadFile({
        url: '/companies/MasiveUploadFile',
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

function showBulK() {
    $('#eventsmessage').text('');
    $('#bulkModal').modal('show');
}

function newEntry() {
    window.location = window.location.origin + '/companies/New';
}

function deleteCompany(data) {
    $.ajax({
        type: 'POST',
        url: '/Companies/DeleteCompany',
        dataType: 'json',
        data: data,
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
    })
}

function reload() {
    $('#uploadModal').modal('hide');
    $('#datatables').DataTable().ajax.reload()
}

function deleteEntry(data) {
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
            deleteCompany(data);
        }
    })
}

function uploadFile() {
    var form = $("#frmFile");
    if (!form.valid())
        return;

    formData = new FormData();
    formData.append("CompanyID", $("#CompanyID").val());
    formData.append("Image", $("#Image")[0].files[0]);

    $.ajax({
        type: 'POST',
        url: '/Companies/UploadFile/',
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
    formData.append("CompanyID", $("#CompanyID").val());

    $.ajax({
        type: 'POST',
        url: '/Companies/DeleteFile/',
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
function downloadCatalog() {
    $.ajax({
        type: 'GET',
        url: '/Companies/DownloadCatalog',
        dataType: 'json',
        data: {},
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                var path = '/Companies/DownloadFile?filePath=' + data.valueString;
                $(location).attr('href', path);
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
    })
}
