$(document).ready(function () {

    setFormValidation('#frmMain');

    $("#Code").focusout(function () {
        var oldCode = $("#OldCode").val();
        var newCode = $(this).val();

        if ((oldCode != newCode)) {
            codeExist(newCode);
        }
        return false;
    });

});

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

function codeExist(code) {

    $.ajax({
        type: 'GET',
        url: '/Programs/GetByCode',
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

function cancel() {
    LoaderShow();
    location.href = '/Programs';
}