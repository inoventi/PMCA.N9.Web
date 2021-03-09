$(document).ready(function () {

    setFormValidation('#frmMain');

    $('#CostType').val($("#mCostType").val());

    $("#CompanyID").change(function () {
        getAreas();
        return false;
    });

    $("#CountryID").change(function () {
        var countryID = $("#CountryID").val();
        getStates(countryID);
        $("#State").change();
        return false;
    });

    $("#StateID").change(function () {
        var stateID = $("#StateID").val();
        getCities(stateID);
        return false;
    });

    $("#ZipCode").rules("add", { regex: "^[0-9]+$" })

    $("#Code").focusout(function () {
        var oldCode = $("#OldCode").val();
        var newCode = $(this).val();

        if ((oldCode != newCode)) {
            codeExist(newCode);
        }
        return false;
    });

    $("#Email").focusout(function () {
        var oldEmail = $("#OldEmail").val();
        var newEmail = $(this).val();

        if ((oldEmail != newEmail)) {
            emailExist(newEmail);
        }
        return false;
    });

    $('#Cost').mask('#,##0.00', { reverse: true });
    $('#Contact').mask('#');
});

function codeExist(code) {

    $.ajax({
        type: 'GET',
        url: '/Participants/GetByCode',
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

function emailExist(email) {

    $.ajax({
        type: 'GET',
        url: '/Participants/GetByEmail',
        dataType: 'json',
        data: { email: email },
        beforeSend: function () {
        },
        success: function (data) {
            if (data.valueBoolean) {
                $("#Email").val($("#OldEmail").val());
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: '',
                    onAfterClose: () => $("#Email").focus()
                });
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
        }
    })
}

function getStates(countryID) {
    document.getElementById("StateID").value = null;
    $.ajax({
        type: 'GET',
        url: '/Companies/GetStates?countryID=' + countryID,
        success: function (data) {
            select = document.getElementById('StateID');

            for (i = select.options.length - 1; i >= 0; i--) {
                select.remove(i);
            }

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');
                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];
                select.appendChild(opt);
            }
        }
    })
}

function getCities(stateID) {
    $.ajax({
        type: 'GET',
        url: '/Companies/GetCities?stateID=' + stateID,
        success: function (data) {
            select = document.getElementById('CityID');
            for (i = select.options.length - 1; i >= 0; i--) {
                select.remove(i);
            }

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');
                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];
                select.appendChild(opt);
            }
        }
    })
}

function getAreas() {

    var companyID = $("#CompanyID").val();

    $.ajax({
        type: 'GET',
        url: '/Participants/GetCompanyAreas?companyID=' + companyID,
        success: function (data) {
            select = document.getElementById('AreaID');
            for (i = select.options.length - 1; i >= 0; i--) {
                select.remove(i);
            }

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');
                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];
                select.appendChild(opt);
            }
        }
    })
}

function createParticipant() {
    if ($("#Code").val() != "") {
        $.ajax({
            type: 'GET',
            url: '/Participants/GetByCode',
            dataType: 'json',
            data: { code: $("#Code").val() },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.valueBoolean) {
                    return;
                }
                else {
                    create();
                }
            },
            complete: function () {
            },
            error: function (xhr, status, error) {
                create();
            }
        })
    }
    else {
        create();
    }
}
function create() {
    var form = $("#frmMain");
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/Participants/Post',
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
                    onAfterClose: () => returnParticipantList()
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
function updateParticipant() {

    var form = $("#frmMain");
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/Participants/Put',
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
                    onAfterClose: () => returnParticipantList()
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

function cancelParticipant() {
    LoaderShow();
    returnParticipantList();
}

function returnParticipantList() {
    LoaderShow();
    window.location = window.location.origin + '/participants/Index';
}

