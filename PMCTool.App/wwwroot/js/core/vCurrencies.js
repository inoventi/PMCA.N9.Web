$(document).ready(function () {
    $("#bulkLink").attr("href", "../templates/Currencies_" + Cookies.get('pmctool-lang-app').substring(0, 2) + ".xlsx");

    setFormValidation('#frmMain');
    setFormValidation('#frmMain2');
    setFormValidation('#frmMain3');

    $('#ExchangeRate').mask('#,##0.000', { reverse: true });

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
            url: "/Currencies/GetCurrencies",
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
            { data: "currencyID", visible: false },
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
                defaultContent: '<a class="btn btn-link btn-info" data-toggle="tooltip" title="' + $("#Parity").val() + '"><i class= "fas fa-exchange-alt" ></i ></a>&nbsp;<a class="btn btn-link btn-warning edit" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger remove" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
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

    var datatableRates = $('#datatableRates').DataTable({
        columns: [
            { data: "currencyExchangeRateID", visible: false },
            { data: "targetCode" },
            { data: "targetName" },
            { data: "rate" },
            {
                data: null,
                defaultContent: '<a class="btn btn-link btn-warning edit" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger remove" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

            //$('td:eq(0)', nRow).addClass('text-left');
            //$('td:eq(2)', nRow).addClass('text-right');

            return nRow;
        },
        bLengthChange: false,
        bFilter: false,
        pageLength: 50,
        order: [[1, "asc"]],
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

        if ($(e.target).attr('class') === 'fas fa-exchange-alt') {
            $("#SourceCode").text(data.code);
            $("#SourceName").text(data.name);
            $("#ExchangeRate").val('');

            var validator = $("#frmMain2").validate();
            validator.resetForm();
            
            getCurrenciesList();
            reloadExchange();
        }
    });

    $('#datatableRates tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = datatableRates.row(tr).data();

        if ($(e.target).attr('class') === 'fa fa-edit') {
            $("#RateID").val(data.currencyExchangeRateID);
            $("#Rate").val('');
            $("#CurrenciesVsTitle").text($("#SourceName").text() + ' : ' + data.targetName);

            var validator = $("#frmMain3").validate();
            validator.resetForm();

            $('#upRateModal').modal('show');
        }

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            $("#RateID").val(data.currencyExchangeRateID);
            deleteEntryExchangeRate();
        }

    });

    $("#fileuploader").uploadFile({
        url: '/currencies/UploadFile',
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

    $('#ratesModal').on('shown.bs.modal', function () {
        $('#datatableRates').DataTable().columns.adjust().draw();
        $('#datatableRates').DataTable().draw();
    })
});

function cleanForm() {
    $('#CurrencyID').val('');
    $('#Code').val('');
    $('#Name').val('');
    $('#Parity').val(0);
    $('#IsActive').prop('checked', false);

    var validator = $("#frmMain").validate();
    validator.resetForm();
}

function fillForm(data) {
    $('#CurrencyID').val(data["currencyID"]);
    $('#Code').val(data["code"]);
    $('#Name').val(data["name"]);
    $('#Parity').val(data["parity"]);

    if (data["isActive"] == $('#Active').val()) {
        $('#IsActive').prop('checked', true);
    }
    else {
        $('#IsActive').prop('checked', false);
    }
}

function showBulK() {
    $('#eventsmessage').text('');
    $('#bulkModal').modal('show');
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
            deleteRecord('Currencies');
        }
    });
}

function getCurrenciesList() {
    $.ajax({
        type: 'GET',
        url: '/currencies/GetCurrenciesList',
        dataType: 'json',
        data: { },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            document.getElementById('CurrencTargetID').options.length = 0;
            select = document.getElementById('CurrencTargetID');

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
            }

            $('#ratesModal').modal('show');
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

function createExchangeRate() {

    var form = $("#frmMain2");
    form.validate();
    
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/Currencies/CreateExchangeRate',
        dataType: 'json',
        data: { sourceId: $("#CurrencyID").val(), targetId: $("#CurrencTargetID").val(), rate: $("#ExchangeRate").val() },
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
                    onAfterClose: () => reloadExchange()
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

function updateExchangeRate() {

    var form = $("#frmMain3");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PUT',
        url: '/Currencies/UpdateExchangeRate',
        dataType: 'json',
        data: { currencyId: $("#CurrencyID").val(), rateId: $("#RateID").val(), rate: $("#Rate").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            $('#upRateModal').modal('toggle');

            if (data.isSuccess) {
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => reloadExchange()
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

function reloadExchange() {
    $.ajax({
        type: 'GET',
        url: "/Currencies/GetCurrencyRates",
        data: { currencyId: $("#CurrencyID").val() },
        dataType: 'json',
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            var table = $('#datatableRates').DataTable();
            table.clear().draw();

            for (var i = 0; i < data.length; i++) {
                table.row.add(data[i]).draw();
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

function deleteEntryExchangeRate() {
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
            deleteRecordExchangeRate();
        }
    });
}

function deleteRecordExchangeRate() {

    $.ajax({
        type: 'DELETE',
        url: '/Currencies/DeleteExchangeRate',
        dataType: 'json',
        data: { currencyId: $("#CurrencyID").val(), rateId: $("#RateID").val() },
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
                    onAfterClose: () => reloadExchange()
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