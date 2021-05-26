
$(document).ready(function () {
    $("#dvPassword").hide();
    $("#dvEnvironment").hide();
    setFormValidation('#frmLogin');
    setFormValidation('#frmPassword');

    $("#username").keypress(function (e) {
        if (e.which == 13)
            login();
    });

    $("#password").keypress(function (e) {
        if (e.which == 13)
            login();
    });

    $("#userRecover").keypress(function (e) {
        if (e.which == 13)
            passwordRecovery();
    });
});

function login() {

    var form = $("#frmLogin");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/Auth/Login',
        dataType: 'json',
        data: { username: $("#username").val(), password: $("#password").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                if (data.valueBoolean) {
                    window.location.href = '/Home/index';
                }
                else {

                    $("#tk").val(data.valueString1);

                    if (data.valueInt == 1) {
                        Swal.fire({
                            type: 'error',
                            title: '',
                            text: data.errorMessage,
                            footer: ''
                        });
                    }

                    if (data.valueInt == 2) {

                        $.ajax({
                            type: 'GET',
                            url: '/Auth/GetEnvironmentsByUser',
                            dataType: 'json',
                            data: { uid: data.valueString, tk: data.valueString1 },
                            beforeSend: function () {
                            },
                            success: function (data) {

                                document.getElementById('Environment').options.length = 0;
                                select = document.getElementById('Environment');

                                for (var i = 0; i < data.length; i++) {
                                    var opt = document.createElement('option');

                                    opt.value = data[i]["environmentID"];
                                    opt.innerHTML = data[i]["name"];

                                    select.appendChild(opt);
                                }

                                HideAndShow('dvLogin', 'dvEnvironment');
                            },
                            complete: function () {
                            },
                            error: function (xhr, status, error) {
                            }
                        });

                    }
                }
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
    });
}

function loginExt() {
    $.ajax({
        type: 'POST',
        url: '/Auth/LoginExt',
        dataType: 'json',
        data: { username: $("#username").val(), password: $("#password").val(), env: $("#Environment").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                if (data.valueBoolean) {
                    window.location.href = '/Home/index';
                }
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
    });
}

function acceptAgreement() {

    if (!$('#acceptEnrollment').is(':checked')) {
        Swal.fire({
            type: 'info',
            title: '',
            text: $("#AgreementVerification").val(),
            footer: ''
        });

        return false;
    }

    $.ajax({
        type: 'POST',
        url: '/Auth/AcceptAgreement',
        dataType: 'json',
        data: { username: $("#username").val(), password: $("#password").val(), tk: $("#tk").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                if (data.valueBoolean) {
                    window.location.href = '/Home/index';
                }
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
    });

}

function passwordRecovery() {

    var form = $("#frmPassword");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/Auth/PasswordRecover',
        dataType: 'json',
        data: { username: $("#userRecover").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $("#userRecover").val('');
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => HideAndShow('dvPassword', 'dvLogin')
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

function back() {
    $("#username").val('');
    $("#password").val('');
    HideAndShow('dvEnvironment', 'dvLogin');
}

function cancelAgreement() {
    $("#username").val('');
    $("#password").val('');
    $('#agreementModal').modal('toggle');
    $("#dvLogin").fadeIn('slow');
}
