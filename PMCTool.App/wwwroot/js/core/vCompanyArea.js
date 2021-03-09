$(document).ready(function () {
    $("#bulkLink").attr("href", "../templates/CompanyAreas_" + Cookies.get('pmctool-lang-app').substring(0, 2) + ".xlsx");

    setFormValidation('#frmMain');

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
            url: "/CompanyAreas/GetCompanyAreas",
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
            { data: "areaID", visible: false },
            { data: "code" },
            { data: "name" },
            { data: "description" },
            { data: "isActive" },
            { data: "responsibleName" },
            { data: "companyName" },
            { data: "escalationAreaName" },
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
                data: null, targets: 12,
                defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
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
        actualCompanyAreaCode = data.code;
        cleanForm();

        if ($(e.target).attr('class') == 'fa fa-edit') {
            fillForm(data, true);
            $("#btnUpdate").show();
            $("#btnCreate").hide();            
        }
        if ($(e.target).attr('class') == 'far fa-trash-alt') {
            fillForm(data, false);
            deleteEntry();
        }
    });

    $("#Code").focusout(function () {
        var companyAreaCode = $("#Code").val();
        if (companyAreaCode == actualCompanyAreaCode)
            return false;

        if (companyAreaCode != "")
            validateCompanyAreaCode(companyAreaCode);
        else
            return false;
    });

    $("#fileuploader").uploadFile({
        url: '/companyAreas/MasiveUploadFile',
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

    var actualCompanyAreaCode = "";

    $("#CompanyID").change(function () {
        getCompanyAreas($("#CompanyID").val());
    });

    //$("#EscalationArea").change(function () {
    //    getResponsibles($("#EscalationArea").val());
    //});
});

function showBulK() {
    $('#eventsmessage').text('');
    $('#bulkModal').modal('show');
}

function cleanForm() {
    $('#AreaID').val('');
    $('#Code').val('');
    $('#Name').val('');
    $('#Description').val('');
    $('#IsActive').prop('checked', false);
    $('#Responsible').val('');
    $('#EscalationArea').val('');
    $('#CompanyID').val('');

    var validator = $("#frmMain").validate();
    validator.resetForm();
}

function fillForm(data, modal) {

    $('#AreaID').val(data.areaID);
    $('#Code').val(data.code);
    $('#Name').val(data.name);
    $('#Description').val(data.description);

    if (data.isActive == $('#Active').val()) {
        $('#IsActive').prop('checked', true);
    }
    else {
        $('#IsActive').prop('checked', false);
    }
    
    if (modal) {
        $.when(getCompanies()).done(function () {
            $.when(getCompanyAreas(data.companyID)).done(function () {
                $.when(getResponsibles($('#AreaID').val())).done(function () {
                    $('#CompanyID').val(data.companyID);
                    $('#EscalationArea').val(data.escalationArea);
                    $('#Responsible').val(data.responsible);
                    $('#editModal').modal('show');
                });
            });
        });
    }
    else {
        $('#Responsible').val(data.responsible);
        $('#EscalationArea').val(data.escalationArea);
        $('#CompanyID').val(data.companyID);
    }

    var companyAreaCode = $("#Code").val();
}

function newEntry() {
    cleanForm();

    $.when(getCompanies()).done(function () {
        $("#btnUpdate").hide();
        $("#btnCreate").show();
        $('#IsActive').prop('checked', true);
        $('#editModal').modal('show');
    });

    $('#EscalationArea').find('option:not(:first)').remove();
    $('#Responsible').find('option:not(:first)').remove();
}

function createCompanyArea() {
    if ($("#Code").val() != "") {
        $.ajax({
            type: "GET",
            url: '/CompanyAreas/GetCompanyAreaByCode?code=' + $("#Code").val(),
            dataType: 'json',
            beforeSend: function () {
            },
            success: function (data) {
                if (data.valueBoolean)
                    return;

                else
                    create();

            },
            complete: function () {
            },
            error: function (xhr, status, error) {
                create();
            }
        })
    }
    else
        create();
   
}

function create() {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/CompanyAreas/CreateCompanyArea',
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
    })
}

function updateCompanyArea() {

    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/CompanyAreas/UpdateCompanyArea',
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
    })
}

function deleteCompanyArea() {

    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/CompanyAreas/DeleteCompanyArea',
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
    })
}

function reload() {
    $("body").css({ 'padding-right': '0px' });
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
            deleteCompanyArea();
        }
    })
}

function validateCompanyAreaCode(value) {
    $.ajax({
        type: "GET",
        url: '/CompanyAreas/GetCompanyAreaByCode?code=' + value,
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (data) {
            if (data.valueBoolean) {
                $("#Code").val("");
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.successMessage,
                    footer: ''
                });
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
        }
    })
}

function downloadCatalog() {
    $.ajax({
        type: 'GET',
        url: '/CompanyAreas/DownloadCatalog',
        dataType: 'json',
        data: {},
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                var path = '/CompanyAreas/DownloadFile?filePath=' + data.valueString;
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

function getCompanies() {
    return $.ajax({
        type: 'GET',
        url: '/CompanyAreas/GetCompaniesSelectionList',
        dataType: 'json',
        data: { },
        beforeSend: function () {
        },
        success: function (data) {
            document.getElementById('CompanyID').options.length = 0;
            select = document.getElementById('CompanyID');

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
            }

            //getCompanyAreas($("#CompanyID").val());
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
        }
    });
}

function getCompanyAreas(companyId) {

    return $.ajax({
        type: 'GET',
        url: '/CompanyAreas/GetCompanyAreasSelectionList',
        dataType: 'json',
        data: { companyId: companyId, companyAreaId: $('#AreaID').val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {

            document.getElementById('EscalationArea').options.length = 0;
            select = document.getElementById('EscalationArea');

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
        }
    });
}

function getResponsibles(areaId) {
    
    return $.ajax({
        type: 'GET',
        url: '/CompanyAreas/GetResponsiblesSelectionList',
        dataType: 'json',
        data: { areaId: areaId },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            document.getElementById('Responsible').options.length = 0;
            select = document.getElementById('Responsible');

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
        }
    });
}

