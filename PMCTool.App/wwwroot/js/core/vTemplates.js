$(document).ready(function () {
    setFormValidation('#frmMain');

    $('#StartDate').datetimepicker({
        format: 'YYYY-MM-DD',
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        },
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'top'
        },
        locale: Cookies.get('pmctool-lang-app').substring(0, 2),
    });

    /*$('.datepicker').datetimepicker({
        format: 'YYYY-MM-DD',
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        },
        widgetPositioning: {
            horizontal: 'auto',
            vertical: 'top'
        },
        locale: Cookies.get('pmctool-lang-app').substring(0, 2),
    });*/

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7, 8, 9],
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
            url: "/Templates/Get",
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
                    data[i]["startDate"] = convertDate(new Date(data[i]["startDate"]));
                }
                return data;
            }
        },
        columns: [
            { data: "templateID", visible: false },
            { data: "code" },
            { data: "name" },
            { data: "description" },
            { data: "isActive" },
            { data: "startDate" },
            {
                data: "createdOn",
                render: function (data, type, row, meta) {
                    if (data !== null) {
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
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0] + ' ' + array[1].substr(0, 5);
                    }
                    return data;
                }
            },
            { data: "updatedByName" },
            {
                data: "templateID",
                targets: 10,
                // defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;<a class="btn btn-link btn-info" data-toggle="tooltip" title="' + $("#Gantt").val() + '" href="/Templates/Gantt/' + data[i]["templateID"] + '" ><i class="fab fa-bluetooth-b"></i></a>'

                render: function (data, type, row, meta) {
                    return '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;<a class="btn btn-link btn-info" data-toggle="tooltip" title="' + $("#Gantt").val() + '" href="/Templates/Gantt/' + data + '" ><i class="fas fa-poll-h"></i></a>';
                }
            }
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
        cleanForm();
        fillForm(data);

        if ($(e.target).attr('class') === 'fa fa-edit') {
            $("#btnUpdate").show();
            $("#btnCreate").hide();
            $('#editModal').modal('show');
        }
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteEntry();
        }
    });

    
});

function setDays(end, start) {
    var date2 = new Date(end);
    var date1 = new Date(start);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function cleanForm() {
    $('#TemplateID').val('');
    $('#Code').val('');
    $('#Name').val('');
    $('#Description').val('');
    $('#IsActive').prop('checked', false);
    $('#StartDate').val('');

    var validator = $("#frmMain").validate();
    validator.resetForm();
}

function fillForm(data) {
    $('#TemplateID').val(data["templateID"]);
    $('#Code').val(data["code"]);
    $('#Name').val(data["name"]);
    $('#Description').val(data["description"]);

    if (data["isActive"] == $('#Active').val()) {
        $('#IsActive').prop('checked', true);
    }
    else {
        $('#IsActive').prop('checked', false);
    }
    $('#StartDate').val(data["startDate"]);
}

function newEntry() {
    cleanForm();
    $("#btnUpdate").hide();
    $("#btnCreate").show();
    $('#IsActive').prop('checked', true);
    $('#editModal').modal('show');
}

function createRecord(controller) {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/create',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModal').modal('toggle');

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

function updateRecord(controller) {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/update',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#editModal').modal('toggle');

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

function deleteRecord(controller) {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/delete',
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

function deleteEntry() {
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
            deleteRecord('Templates');
        }
    });
}