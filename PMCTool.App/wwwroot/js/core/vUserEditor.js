$(document).ready(function () { 
    setFormValidation('#frmMain');

    //$("#Login").focusout(function () {
    //    var oldUsername = $("#OldUsername").val();
    //    var newUsername = $(this).val();

    //    if ((oldUsername != newUsername)) {
    //        usernameExist();
    //    }
    //    return false;
    //});
    var oldEmail = $("#OldEmail").val();
    //if ($("#OldEmail").val() == '') {
    //    $("#Email").focusout(function () {
    //        //var oldEmail = $("#OldEmail").val();
    //        var newEmail = $(this).val();

    //        if ((oldEmail != newEmail)) {
    //            emailExist();
    //        }
    //        return false;
    //    });
    //}
   
    $("#Name").focusout(function () {
        generateUsername();
        return false;
    });

    $("#Lastname").focusout(function () {
        generateUsername();
        return false;
    });

    $('select[name=Status]').val($("#St").val());

    $("#ParticipantID").prop("disabled", true);

    $("#CreateParticipant").click(function () {
        if ($(this).is(":checked")) {
            $("#ParticipantID").prop("disabled", true);
        } else {
            $("#ParticipantID").prop("disabled", false);
        }
    });

    $("#LanguageID").change(function () {
        getTimeZones($("#LanguageID").val());
    });

    getLanguages();
    $('#Login').val('');
    $('#Password').val('');
});

function getLanguages() {

    $.ajax({
        type: 'GET',
        url: '/User/GetLanguages',
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (data) {
            document.getElementById('LanguageID').options.length = 0;
            select = document.getElementById('LanguageID');
            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');
                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];
                select.appendChild(opt);
            }
            $('select[name=LanguageID]').val($("#Lang").val());
            $('.selectpicker').selectpicker('refresh');

            getTimeZones($("#LanguageID").val());
        },
        complete: function () {
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

function getTimeZones(languageId) {

    $.ajax({
        type: 'GET',
        url: '/User/GetTimeZones',
        dataType: 'json',
        data: { languageId: languageId },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            document.getElementById('TimeZoneID').options.length = 0;
            select = document.getElementById('TimeZoneID');

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');
                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];
                select.appendChild(opt);
            }
            $('select[name=TimeZoneID]').val($("#TZ").val());
            $('.selectpicker').selectpicker('refresh');
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

function usernameExist() {

    $.ajax({
        type: 'POST',
        url: '/User/ValidateUsername',
        dataType: 'json',
        data: { username: $("#Login").val() },
        beforeSend: function () {
        },
        success: function (data) {
            if (data.valueBoolean) {
                $("#Login").val($("#OldUsername").val());
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: $("#UsernameExist").val(),
                    footer: ''
                });
                $("#Login").css({ "border": "solid 3px orange", "background": "#fff6e7" });
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
        }
    })
}

function emailExist() {
    
    $.ajax({
        type: 'POST',
        url: '/User/ValidateUserEmail',
        dataType: 'json',
        data: { email: $("#Email").val() },
        beforeSend: function () {
        },
        success: function (data) {
            if (data.valueBoolean) {
                $("#Email").val($("#OldEmail").val());
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: $("#EmailExist").val(),
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

function createUser() {

    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/User/CreateUser',
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
                switch (data.errorCode) { 
                    case 6006:
                        $("#Login").css({ "border": "solid 3px orange", "background": "#fff6e7" });
                        break;
                    case 6005:
                        $("#Email").css({ "border": "solid 3px orange", "background": "#fff6e7" });
                        $("#Login").css({ "border": "solid 3px #4CAF50", "background": "#FDFFED" });
                        break;
                }
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

function updateUser() {

    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/User/UpdateUser',
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
                $("#Email").val($("#OldEmail").val());
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

function cancel() {
    LoaderShow();
    window.location.href = '/User/Index';
}

function generateUsername() {

    var name = $("#Name").val();
    var lastname = $("#Lastname").val();
    var username = $("#Login").val();

    if (name != null && name.trim() != '' &&
        lastname != null && lastname.trim() != '' &&
        username == '') {
        $.ajax({
            type: 'POST',
            url: '/User/GenerateUsername',
            dataType: 'json',
            data: { name: name, lastname: lastname },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.isSuccess && data.valueString != null && data.valueString != '') {
                    $("#Login").val(data.valueString);
                }
            },
            complete: function () {
            },
            error: function (xhr, status, error) {
            }
        })
    }
}