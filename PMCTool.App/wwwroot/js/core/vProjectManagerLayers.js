$(document).ready(function () {

    setFormValidation('#frmMain');

    $(function () {
        $("#sortable").sortable();
        $("#sortable").disableSelection();
    });

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
            url: "/ProjectLayers/Get",
            data: { projectId: $("#ProjectID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide(); ProjectID
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["isActive"] === true) {
                        data[i]["isActive"] = $('#Yes').val();
                    }
                    else {
                        data[i]["isActive"] = "NO";
                    }
                }
                return data;
            }
        },
        columns: [
            { data: "row", visible: false },
            { data: "name" },
            { data: "description" },
            { data: "isActive" },
            {
                data: null,
                defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-warning edit" data-toggle="tooltip" title="' + $("#SubLayers").val() + '"><i class="fas fa-clone f18"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        //dom: 'Bfrtip',
        //buttons: [
        //    $.extend(true, {}, fileExportOptions, { extend: 'excelHtml5' }),
        //],
        bFilter: false,
        lengthChange: false,
        order: [[0, "asc"]],
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
            deleteEntry(data);
        }

        if ($(e.target).attr('class') === 'fas fa-clone f18') {
            location.href = '/ProjectManager/Layer?projectId=' + data.projectID + '&layerId=' + data.projectLayerID;
        }
    });

});

function cleanForm() {
    var validator = $("#frmMain").validate();
    validator.resetForm();

    $('#Name').val('');
    $('#Description').val('');
    $('#IsActive').prop('checked', true);
}

function fillForm(data) {

    $('#ProjectLayerID').val(data.projectLayerID);
    $('#ProjectID').val(data.projectID);
    $('#ParentID').val(data.parentID);
    $('#Row').val(data.row);
    $('#Cell').val(data.cell);
    $('#Name').val(data.name);
    $('#Description').val(data.description);

    if (data["isActive"] == $('#Yes').val()) {
        $('#IsActive').prop('checked', true);
    }
    else {
        $('#IsActive').prop('checked', false);
    }
}

function newEntry() {
    cleanForm();
    $("#btnUpdate").hide();
    $("#btnCreate").show();
    $('#editModal').modal('show');
}

function create(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/Create',
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

function update(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/Update',
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

function updateBatch(controller) {

    var items = [];

    var layerItems = $('#sortable li');
    for (var i = 0; i < layerItems.length; i++) {
        var pos = (i + 1);
        var id = layerItems[i].id;

        var item = { projectLayerID: id, projectID: $("#ProjectID").val(), row: pos };
        items.push(item);
    }

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateBatch',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), data: items},
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#sortModal').modal('toggle');

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

function deleteEntry(data) {
    Swal.fire({
        title: '',
        text: $("#AreYouSureDeleteLayers").val(),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            deleteRecord('ProjectLayers', data);
        }
    });
}

function reload() {
    $('#datatables').DataTable().ajax.reload();
}

function sort() {
    
    $.ajax({
        method: "GET",
        url: "/ProjectLayers/Get",
        data: { projectId: $("#ProjectID").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            $("#sortable").html('');
            for (var i = 0; i < data.length; i++) {
                let content = '<li id="' + data[i].projectLayerID + '" class="list-group-item-c cursor-pointer"><span class="iconify marginb3" data-icon="ic-baseline-drag-indicator" data-inline="false" style = "" ></span><label class="cursor-pointer">' + data[i].name + '</label></li>';
                $("#sortable").append(content);
            }

            $('#sortModal').modal('show');
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