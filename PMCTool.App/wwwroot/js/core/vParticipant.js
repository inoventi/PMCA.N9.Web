

$(document).ready(function () {
    $("#bulkLink").attr("href", "../templates/Participants_" + Cookies.get('pmctool-lang-app').substring(0, 2) + ".xlsx");

    setFormValidation('#frmMain');

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 8, 10, 12, 13, 15, 16, 17, 18, 19],
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
            url: "/Participants/Get",
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["costType"] != null)
                        data[i]["costType"] = $("#EnumCostType_" + data[i]["costType"]).val();
                }
                return data;
            },
        },
        columns: [
            { data: "participantID", visible: false },
            { data: "code" },
            { data: "name", type: 'unicode-string' },
            { data: "lastname", type: 'unicode-string' },
            { data: "surname", type: 'unicode-string' },
            {
                data: "isActive", render: function (url, type, full) {
                    var result = "";
                    if (full.isActive == true) {
                        result = $('#Active').val();
                    }
                    else {
                        result = $('#Inactive').val();
                    }
                    return result;
                }
            },
            { data: "email" },
            { data: "areaID", visible: false },
            { data: "area" },
            { data: "functionID", visible: false },
            { data: "function" },
            { data: "escalationID", visible: false },
            { data: "escalation" },
            { data: "costType" },
            { data: "currencyID", visible: false },
            { data: "currency" },
            { data: "participantUser.userName" },
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
                data: null, targets: 21,
                defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;<a class="btn btn-link btn-success " data-toggle="tooltip" title="' + $("#User").val() + '"><i class="far fa-user-circle"></i></a>'
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
        order: [[2, "asc"], [3, "asc"], [4, "asc"]],
        responsive: true,
        scrollX: true
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();

        var data2 = {
            'participantID': data.participantID,
            'code': data.code,
            'name': data.name,
            'lastname': data.lastname,
            'surname': data.surname,
            'isActive': data.isActive,
            'email': data.email,
            'areaID': data.areaID,
            'functionID': data.functionID,
            'escalationID': data.escalationID,
            'companyID': data.companyID,
            'areaID': data.areaID,
            'costType': data.costType,
            'cost': data.cost.toFixed(2),
            'currencyID': data.currencyID,
            'address.street': data.address.street,
            'address.extNum': data.address.extNum,
            'address.intNum': data.address.intNum,
            'address.district': data.address.district,
            'address.countryID': data.address.countryID,
            'address.stateID': data.address.stateID,
            'address.cityID': data.address.cityID,
            'address.zipCode': data.address.zipCode,
            'contact.value': data.contact.value
        }

        if ($(e.target).attr('class') == 'fa fa-edit') {
            var baseUrl = window.location.origin + '/participants/Editor';
            var queryString = $.param(data2);
            window.location = baseUrl + '?' + queryString;
        }
        if ($(e.target).attr('class') == 'far fa-trash-alt') {
            deleteEntry(data);
        }
        if ($(e.target).attr('class') == 'far fa-user-circle') {
            assignUser(data);
        }

    });

    $("#fileuploader").uploadFile({
        url: '/participants/MasiveUploadFile',
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

    var actualUserID = "";
});

function showBulK() {
    $('#eventsmessage').text('');
    $('#bulkModal').modal('show');
}

function newEntry() {
    window.location = window.location.origin + '/participants/New';
}

function deleteCompany(data) {
    $.ajax({
        type: 'POST',
        url: '/Participants/Delete',
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

function reload() {
    $('#assignUser').modal('hide');
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
            deleteCompany(data);
        }
    })
}

function assignUser(data) {
    var participantUser = getUser(data.participantID);

    $('#assignUser').modal('show');

    if (participantUser.userID == '00000000-0000-0000-0000-000000000000') {
        $("#btnUpdate").hide();
        $("#btnCreate").show();
        fillUserForm(data.participantID, null);
    }
    else {
        $("#btnUpdate").show();
        $("#btnCreate").hide();
        fillUserForm(data.participantID, participantUser.userID);
    }
}

function getUser(id) {
    var remote = $.ajax({
        type: "GET",
        url: '/ParticipantUsers/GetById?participantId=' + id,
        async: false
    }).responseText;

    LoaderHide();
    return JSON.parse(remote);
}

function getUsersAvailable(userID) {
    var url = userID !== null ? '/ParticipantUsers/GetAvailable?UserID=' + userID : '/ParticipantUsers/GetAvailable';
    var remote = $.ajax({
        type: "GET",
        url: url,
        async: false
    }).responseText;


    select = document.getElementById('UserID');
    for (i = select.options.length - 1; i >= 0; i--) {
        select.remove(i);
    }
    var data = JSON.parse(remote);
    var userFound = false;
    for (var i = 0; i < data.length; i++) {
        var opt = document.createElement('option');
        opt.value = data[i]["key"];
        opt.innerHTML = data[i]["value"];
        select.appendChild(opt);

        if (data[i]["key"] == userID)
            userFound = true;
    }

    if (userFound)
        select.value = userID;
    else
        select.selectedIndex = 0;
}

function fillUserForm(participantID, userID) {
    getUsersAvailable(userID);
    $('#ParticipantID').val(participantID);
}

function updateParticipantUser() {
    formData = new FormData();
    formData.append("UserID", $("#UserID").val());
    formData.append("ParticipantID", $("#ParticipantID").val());

    $.ajax({
        type: 'POST',
        url: '/ParticipantUsers/UpdateUser',
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

function downloadCatalog() {
    $.ajax({
        type: 'GET',
        url: '/Participants/DownloadCatalog',
        dataType: 'json',
        data: {},
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                var path = '/Participants/DownloadFile?filePath=' + data.valueString;
                $(location).attr('href', path);
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
    })
}

