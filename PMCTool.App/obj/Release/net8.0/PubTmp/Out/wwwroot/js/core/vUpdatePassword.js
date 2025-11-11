
$(document).ready(function () {
    setFormValidation('#frmMain');
});

function updatePassword()
{
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/User/UpdatePassword',
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
                    footer: ''
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
