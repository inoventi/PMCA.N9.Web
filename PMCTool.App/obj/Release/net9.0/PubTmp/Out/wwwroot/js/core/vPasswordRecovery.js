
$(document).ready(function () {
    setFormValidation('#frmMain');
});

function restore() {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/Auth/PasswordRecovery',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $("#Password").val('');
                $("#Confirm").val('');
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => window.location.href = "/Auth/Login"
                });
            } else {
                if (data.errorCode == '5021') {
                    Swal.fire({
                        type: 'error',
                        title: '',
                        text: data.errorMessage,
                        footer: '',
                        onAfterClose: () => window.location.href = "/Auth/Login"
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
