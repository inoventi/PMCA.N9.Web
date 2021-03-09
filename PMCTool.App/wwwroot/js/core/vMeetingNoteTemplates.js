$(document).ready(function () {

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
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
            url: "/MeetingNoteTemplates/Get",
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["isActive"] === true) {
                        data[i]["isActive"] = $('#Active').val();
                    }
                    else {
                        data[i]["isActive"] = $('#Inactive').val();
                    }
                }
                return data;
            }
        },
        columns: [
            { data: "meetingNoteTemplateID", visible: false },
            { data: "code" },
            { data: "name" },
            { data: "description" },
            { data: "isActive" },
            {
                data: null,
                defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        dom: 'Bfrtip',
        buttons: [

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

        if ($(e.target).attr('class') === 'fa fa-edit') {
            location.href = '/MeetingNoteTemplates/Editor?id=' + data.meetingNoteTemplateID;
        }

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteEntry(data);
        }
    });

});

function newEntry() {
    location.href = '/MeetingNoteTemplates/Editor';
}

function deleteRecord(controller, data) {
    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/delete',
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
    });
}

function reload() {
    $('#datatables').DataTable().ajax.reload();
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
            deleteRecord('MeetingNoteTemplates', data);
        }
    });
}