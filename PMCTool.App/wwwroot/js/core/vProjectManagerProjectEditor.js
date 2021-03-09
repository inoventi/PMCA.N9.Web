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
    projectManagerEditor.acCheckNotifications();
});

function cancelEntry() {
    if ($('#mPhase').val() != 3 && $('#Phase').val() == 3) {
        Swal.fire({
            title: '',
            text: $("#AreYouSureCancelProject").val(),
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'btn btn-default btn-fill',
            cancelButtonColor: 'btn btn-info btn-fill',
            cancelButtonText: $("#Cancel").val(),
            confirmButtonText: $("#Accept").val()
        }).then((result) => {
            if (result.value) {
                updateRecord('ProjectManager');
            }
        });
    }

    else
        updateRecord('ProjectManager')

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
        url: '/ProjectManager/GetByCode',
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
    location.href = '/ProjectManager/Projects';
}
var projectManagerEditor = {
    acCheckNotifications: function () { 
        let elementCheckNotifications = $('#Notifications');
        elementCheckNotifications.click(function () {
            if (elementCheckNotifications.prop('checked')) {
                Swal.fire({
                    title: $.i18n._('gp_002'),
                    text: $.i18n._('gp_001'),
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: $.i18n._('gp_003')
                }).then((result) => { 
                    if (result.value) { 
                        elementCheckNotifications.prop('checked', true);
                    } else { 
                         elementCheckNotifications.prop('checked', false);
                    }
                }) 
            }
        });
    }
}