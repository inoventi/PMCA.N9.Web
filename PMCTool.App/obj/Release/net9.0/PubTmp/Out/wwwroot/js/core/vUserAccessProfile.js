$(document).ready(function () {

    setFormValidation('#frmMain');

    var fileExportOptions = {
        exportOptions: {
            columns: [3, 4, 5, 6],
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
            url: "/User/GetUserProfile",
            dataType: 'json',
            data: { id: $("#UserID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["selected"] == 1) {
                        data[i]["selected"] = "<a class='btn btn-link btn-info like'><i class='far fa-check-square'></i></a>";
                    }
                    else {
                        data[i]["selected"] = "<a class='btn btn-link btn-info like'><i class='far fa-square'></i></a>";
                    }

                    if (data[i]["isActive"] == true) {
                        data[i]["isActive"] = $('#Active').val();
                    }
                    else {
                        data[i]["isActive"] = $('#Inactive').val();
                    }
                }
                return data;
            },
        },
        columns: [
            { data: "profileID", visible: false },
            { data: "userID", visible: false },
            { data: "selected" },
            { data: "code" },
            { data: "name" },
            { data: "isActive" },
            { data: "description" },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        //dom: 'Bfrtip',
        //buttons: [
        //    $.extend(true, {}, fileExportOptions, { extend: 'excelHtml5' }),
        //    $.extend(true, {}, fileExportOptions, { extend: 'pdfHtml5' })
        //],
        order: [[3, "asc"]],
        responsive: true,
        scrollX: true
    });

    $('#datatables tbody').on('click', 'a', function (e) {

        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child'))
            tr = $(tr).prev();

        var data = table.row(tr).data();
        if ($(e.target).attr('class') == 'far fa-check-square') {
            $(e.target).removeClass("far fa-check-square");
            $(e.target).addClass("far fa-square");
            DeleteUserProfile(data["profileID"], $("#UserID").val());
        }
        else {
            if ($(e.target).attr('class') == 'far fa-square') {
                $(e.target).removeClass("far fa-square");
                $(e.target).addClass("far fa-check-square");
                CreateUserProfile(data["profileID"], $("#UserID").val());
            }
        }

    });
});

function reload() {
    $('#datatables').DataTable().ajax.reload()
}

function CreateUserProfile(profile, userId) {
    $.ajax({
        type: 'POST',
        url: '/User/CreateUserProfile',
        dataType: 'json',
        data: { profileId: profile, userId: userId },
        beforeSend: function () {
        },
        success: function (data) {
            if (!data.isSuccess) {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    })
}

function DeleteUserProfile(profile, userId) {
    $.ajax({
        type: 'POST',
        url: '/User/DeleteUserProfile',
        dataType: 'json',
        data: { profileId: profile, userId: userId },
        beforeSend: function () {
        },
        success: function (data) {
            if (!data.isSuccess) {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    })
}