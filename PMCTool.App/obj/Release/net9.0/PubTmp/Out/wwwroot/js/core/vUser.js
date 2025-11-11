
$(document).ready(function () {

    setFormValidation('#frmConnectivity');

    var fileExportOptions = {
        exportOptions: {
            columns: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            format: {
                body: function (data, row, column, node) {
                    return data;
                }
            }
        }
    };

    $('#datatablesIP').DataTable({
        data: [],
        columns: [
            { data: "id", visible: false },
            { data: "ip" },
            {
                data: "id", targets: 2,
                render: function (data, type, row, meta) {
                    if (data != null) {
                        data = '<a onclick="deleteEntryConnection(' + "'" + data + "'" + ');" class="btn btn-link btn-danger"><i class="far fa-trash-alt"></i></a>';
                    }
                    return data;
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 5,
        order: [[1, "asc"]],
        responsive: true,
        bFilter: false,
        bLengthChange: false,
        bInfo: false,
        scrollX: true
    });

    $('#datatableLicensing').DataTable({
        data: [],
        columns: [
            { data: "type", visible:false },
            {
                data: "licenseType",
                render: function (data, type, row, meta) {
                    if (data != null) {
                        data = $("#EnumUserLicenseType_" + data).val();
                    }
                    return data;
                }
            },
            { data: "amount" },
            { data: "assignedLicenses" },

        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 5,
        order: [[0, "desc"]],
        responsive: true,
        scrollX: true,
        bFilter: false,
        bLengthChange: false,
        bInfo: false
    });

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/User/GetUsers",
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["status"] == 1)
                        data[i]["status"] = $("#Active").val();

                    if (data[i]["status"] == 2)
                        data[i]["status"] = $("#Inactive").val();

                    if (data[i]["status"] == 3)
                        data[i]["status"] = $("#Locked").val();

                    if (data[i]["licenseType"] != null)
                        data[i]["licenseTypeName"] = $("#EnumUserLicenseType_" + data[i]["licenseType"]).val();

                    if (data[i]["surname"] == null)
                        data[i]["surname"] = "";

                    data[i]["name"] = data[i]["name"] + " " + data[i]["lastname"] + " " + data[i]["surname"];

                }
                return data;
            },
        },
        columns: [
            { data: "userID", visible: false },
            { data: "licenseType", visible: false },
            { data: "name" },
            //{ data: "lastname" },
            //{ data: "surname" },
            { data: "login" },
            { data: "status" },
            { data: "licenseTypeName" },
            { data: "languageName" },
            { data: "timeZoneName" },
            { data: "email" },
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
                data: "status", targets: 13,
                render: function (data, type, row, meta) {
                    let icons = '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;<a class="btn btn-link btn-info" data-toggle="tooltip" title="' + $("#Profile").val() + '"><i class="nc-icon nc-vector"></i></a>&nbsp;<a class="btn btn-link btn-info" data-toggle="tooltip" title="' + $("#Connectivity").val() + '"><i class="fab fa-bluetooth-b"></i></a>&nbsp;<a class="btn btn-link btn-primary" style="color:#1d4e79;" data-toggle="tooltip" title="' + $("#License").val() + '"><i class="fas fa-id-badge"></i></a>';

                    if (data == $("#Locked").val())
                        icons = icons + '&nbsp;<a class="btn btn-link btn-success" data-toggle="tooltip" title="' + $("#Unlock").val() + '"><i class="fas fa-unlock-alt"></i></a>';

                    return icons;
                }
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

        if ($(e.target).attr('class') == 'fa fa-edit') {
            window.location.href = '/User/Editor?id=' + data["userID"];
        }

        if ($(e.target).attr('class') == 'far fa-trash-alt') {
            deleteEntry(data);
        }

        if ($(e.target).attr('class') == 'nc-icon nc-vector') {
            window.location.href = '/User/AccessProfile?id=' + data["userID"];
        }

        if ($(e.target).attr('class') == 'fab fa-bluetooth-b') {
            $("#ID").val(data["userID"]);
            getIPs();
        }

        if ($(e.target).attr('class') == 'fas fa-id-badge') {
            assignLicense(data);
        }

        if ($(e.target).attr('class') == 'fas fa-unlock-alt') {
            unlockUser(data);
        }
    });

    $.validator.addMethod('validIP', function (value) {

        var split = value.split('.');
        if (split.length != 4)
            return false;

        for (var i = 0; i < split.length; i++) {
            var s = split[i];
            if (s.length == 0 || isNaN(s) || s < 0 || s > 255)
                return false;
        }
        return true;
    }, $("#m4013").val());

    $("#ipaddress").rules("add", { validIP: $(this).val() });

    $('#licensingModal').on('shown.bs.modal', function () {
        $('#datatableLicensing').DataTable().columns.adjust().draw();
        LoaderHide();
    })

});

function newEntry() {
    window.location.href = '/User/Editor';
}

function unlockUser(data) {

    $.ajax({
        type: 'POST',
        url: '/User/UnlockUser',
        dataType: 'json',
        data: data,
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

function deleteUser(data) {

    $.ajax({
        type: 'POST',
        url: '/User/DeleteUser',
        dataType: 'json',
        data: data,
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

function getIPs() {

    $.ajax({
        type: 'GET',
        url: "/User/GetIPs",
        dataType: 'json',
        data: { userId: $("#ID").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {

            let table = $('#datatablesIP').DataTable();
            table.clear().draw();

            for (var i = 0; i < data.length; i++) {
                table.row.add({ "id": data[i]["id"], "ip": data[i]["ip"] });
            }
            table.draw();

            $('#connectivityModal').modal('show');
        },
        complete: function () {
            //LoaderHide();
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

function saveUserConnection() {

    $.ajax({
        type: 'POST',
        url: '/User/CreateUserConnection',
        dataType: 'json',
        data: { ip: '*', userId: $("#ID").val() },
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
                    onAfterClose: () => getIPs()
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

function createUserConnection() {

    var form = $("#frmConnectivity");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/User/CreateUserConnection',
        dataType: 'json',
        data: { ip: $("#ipaddress").val(), userId: $("#ID").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            if (data.isSuccess) {
                $("#ipaddress").val('');
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => getIPs()
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

function deleteUserConnection(id) {

    $.ajax({
        type: 'POST',
        url: '/User/DeleteUserConnection',
        dataType: 'json',
        data: { id: id },
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
                    onAfterClose: () => getIPs()
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
    $('#datatables').DataTable().ajax.reload()
}

function deleteEntry(data) {
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
            deleteUser(data);
        }
    })
}

function deleteEntryConnection(data) {
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
            deleteUserConnection(data);
        }
    })
}

function validateIP(value) {

    var split = value.split('.');
    if (split.length != 4)
        return false;

    for (var i = 0; i < split.length; i++) {
        var s = split[i];
        if (s.length == 0 || isNaN(s) || s < 0 || s > 255)
            return false;
    }

    return true;
}

function licensing() {

    $.ajax({
        type: 'GET',
        url: "/User/GetEnvironmentLicensing",
        dataType: 'json',
        data: {},
        beforeSend: function () {
        },
        success: function (data) {

            let table = $('#datatableLicensing').DataTable();
            table.clear().draw();

            for (var i = 0; i < data.length; i++) {
                table.row.add({
                    "type": data[i]["licenseType"],
                    "licenseType": data[i]["licenseType"],
                    "amount": data[i]["amount"],
                    "assignedLicenses": data[i]["assignedLicenses"]
                });
            }

            LoaderShow();
            $('#licensingModal').modal('show');
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

function assignLicense(data) {
    
    $("#ID").val(data["userID"]); 
    $("#Env").val(data["environmentID"]);
    $("#LicenseType").val(data["licenseType"]);

    $("#lmName").text(data["name"] + ' ' + data["lastname"]);
    $("#lmEmail").text(data["email"]);
    $("#lmLicenseName").text(data["licenseTypeName"]); 
    
    if (data["licenseType"] == null || data["licenseType"] == '') {
        getLicense(null);
    }
    else {
        $("#btnUpdate").hide();
        $("#dvAssignation").hide();
        $("#dvRemove").show();
        $('#licenseModal').modal('show');
    }    
}

function getLicense(opt) {

    $.ajax({
        type: 'GET',
        url: "/User/GetAvailableLicenses",
        dataType: 'json',
        data: { licenseEx: opt },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {

            if (data.length == 0) {

                $("#lmSelect").hide();
                $("#lmNoLicense").show();
                $("#btnUpdate").hide();
            }
            else {

                $("#lmSelect").show();
                $("#lmNoLicense").hide();
                $("#btnUpdate").show();

                document.getElementById('selectLicense').options.length = 0;
                select = document.getElementById('selectLicense');

                for (var i = 0; i < data.length; i++) {
                    var opt = document.createElement('option');

                    opt.value = data[i]["licenseType"];
                    opt.innerHTML = $("#EnumUserLicenseType_" + data[i]["licenseType"]).val();

                    if (data[i]["licenseType"] != null)
                        data[i]["licenseTypeName"] = $("#EnumUserLicenseType_" + data[i]["licenseType"]).val();

                    select.appendChild(opt);
                }
            }

            $("#dvAssignation").show();
            $("#dvRemove").hide();
            $('#licenseModal').modal('show');
        },
        complete: function () {
            //LoaderHide();
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

function selectLicense() {
    getLicense($("#LicenseType").val());
}

function removeLicense() {

    $.ajax({
        type: 'POST',
        url: "/User/RemoveLicense",
        dataType: 'json',
        data: { userId: $("#ID").val(), environmentId: $("#Env").val()},
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#licenseModal').modal('toggle');

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

function updateLicense() {

    let license = $('#selectLicense').val();

    $.ajax({
        type: 'POST',
        url: "/User/UpdateLicense",
        dataType: 'json',
        data: { userId: $("#ID").val(), environmentId: $("#Env").val(), licenseType: license },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#licenseModal').modal('toggle');

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