$(document).ready(function () {

    setFormValidation('#frmMain');

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

    $("#Code").focusout(function () {
        var companyCode = $("#Code").val();

        if (companyCode == actualCompanyCode)
            return false;

        if (companyCode != "")
            validateCompanyCode(companyCode);
        else

        return false;
    });

    var actualCompanyCode = $("#Code").val();

    $("#ZipCode").rules("add", { regex: "^[0-9]+$" })
});

function createCompany() {
    if ($("#Code").val() != "") {
        $.ajax({
            type: "GET",
            url: '/Companies/GetCompanyByCode?code=' + $("#Code").val(),
            dataType: 'json',
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
    form.validate();

    if (!form.valid())
        return;

    if ($("#IsActive").prop('checked')) {
        $("#IsActive").val('true');
    } else {
        $("#IsActive").val('false');
    }
    formData = new FormData();
    formData.append("CompanyID", $("#CompanyID").val());
    formData.append("Code", $("#Code").val());
    formData.append("Name", $("#Name").val());
    formData.append("IsActive", $("#IsActive").val());
    formData.append("Address.Street", $("#Street").val());
    formData.append("Address.ExtNum", $("#ExtNum").val());
    formData.append("Address.IntNum", $("#IntNum").val());
    formData.append("Address.District", $("#District").val());
    formData.append("Address.CityID", $("#CityID").val());
    formData.append("Address.StateID", $("#StateID").val());
    formData.append("Address.CountryID", $("#CountryID").val());
    formData.append("Address.ZipCode", $("#ZipCode").val());
    formData.append("Contact.Value", $("#Contact").val());
    $.ajax({
        type: 'POST',
        url: '/Companies/CreateCompany',
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
                    onAfterClose: () => returnCompanyList()
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

function updateCompany() {
    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    if ($("#IsActive").prop('checked')) {
        $("#IsActive").val('true');
    } else {
        $("#IsActive").val('false');
    }
    formData = new FormData();
    formData.append("CompanyID", $("#CompanyID").val());
    //formData.append("Image", $("#Image")[0].files[0]);
    formData.append("Code", $("#Code").val());
    formData.append("Name", $("#Name").val());
    formData.append("IsActive", $("#IsActive").val());
    formData.append("Address.Street", $("#Street").val());
    formData.append("Address.ExtNum", $("#ExtNum").val());
    formData.append("Address.IntNum", $("#IntNum").val());
    formData.append("Address.District", $("#District").val());
    formData.append("Address.CityID", $("#CityID").val());
    formData.append("Address.StateID", $("#StateID").val());
    formData.append("Address.CountryID", $("#CountryID").val());
    formData.append("Address.ZipCode", $("#ZipCode").val());
    formData.append("Contact.Value", $("#Contact").val());

    $.ajax({
        type: 'POST',
        url: '/Companies/UpdateCompany',
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
                    onAfterClose: () => returnCompanyList()
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

function cancelCompany() {
    LoaderShow();
    returnCompanyList();
}

function returnCompanyList() {
    LoaderShow();
    window.location = window.location.origin + '/companies/Index';
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

function validateCompanyCode(value) {
    $.ajax({
        type: "GET",
        url: '/Companies/GetCompanyByCode?code=' + value,
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