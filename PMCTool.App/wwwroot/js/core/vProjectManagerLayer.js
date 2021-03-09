$(document).ready(function () {

    setFormValidation('#frmMain');
    setFormValidation('#frmMainModal');

    $('#btnSave').hide();

    $(function () {
        $("#sortable").sortable();
        $("#sortable").disableSelection();
    });

    reload();
});

function cleanForm() {
    var validator = $("#frmMainModal").validate();
    validator.resetForm();

    $('#LayerNameModal').val('');
    $('#LayerDescriptionModal').val('');
}

function fillForm(data) {

    $('#ProjectLayerID').val(data.projectLayerID);
    $('#ProjectID').val(data.projectID);
    $('#ParentID').val(data.parentID);
    $('#Row').val(data.row);
    $('#Cell').val(data.cell);
    $('#Name').val(data.name);
    $('#Description').val(data.description);

    if (data["isActive"].indexOf('far fa-check-square') > -1) {
        $('#IsActive').prop('checked', true);
    }
    else {
        $('#IsActive').prop('checked', false);
    }
}

function updateEntry(layerId) {
    cleanForm();

    var item = document.getElementById(layerId);
    
    $('#LayerID').val(layerId);
    $('#LayerNameModal').val(item.dataset.name);
    $('#LayerDescriptionModal').val(item.dataset.description);
    $('#LayerRow').val(item.dataset.row);
    $('#LayerCell').val(item.dataset.cell);
    $('#editModal').modal('show');

}

function create(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    var item = {
        projectID: $('#ProjectID').val(),
        parentID: $('#ProjectLayerID').val(),
        name: $('#LayerName').val(),
        description: $('#LayerDescription').val(),
        isActive:true
    };

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/Create',
        dataType: 'json',
        data: { data: item },
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

function update(controller) {

    var form = $("#frmMainModal");
    form.validate();

    if (!form.valid())
        return;

    var item = {
        ProjectLayerID: $('#LayerID').val(),
        projectID: $('#ProjectID').val(),
        name: $('#LayerNameModal').val(),
        description: $('#LayerDescriptionModal').val(),
        parentID: $('#ProjectLayerID').val(),
        isActive: true,
        row: $('#LayerRow').val(),
        cell: $('#LayerCell').val(),
    };

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/Update',
        dataType: 'json',
        data: { data: item },
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
        data: { projectId: $("#ProjectID").val(), data: items },
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

function deleteRecord(controller, projectId, layerId) {

    var data = {
        ProjectLayerID: layerId,
        projectID: projectId
    };

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

function deleteEntry(projectId, layerId) {
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
            deleteRecord('ProjectLayers', projectId, layerId);
        }
    });
}

function reload() {
    $('#LayerName').val('');
    $('#LayerDescription').val('');

    $.ajax({
        method: "GET",
        url: "/ProjectLayers/Get",
        data: { projectId: $("#ProjectID").val(), parentId: $('#ProjectLayerID').val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            $("#sortable").html('');

            if (data.length > 0) {
                $('#btnSave').show();
            }
            else {
                $('#btnSave').hide();
            }

            for (var i = 0; i < data.length; i++) {

                let content = '<li id=' + data[i].projectLayerID + ' data-name="' + data[i].name + '" data-description="' + data[i].description + '" data-row="' + data[i].row + '" data-cell="' + data[i].cell + '" class="list-group-item-c cursor-pointer">'
                    + '<span class="iconify marginb3" data-icon="ic-baseline-drag-indicator" data-inline="false"></span>'
                    + '<label for="" class="cursor-pointer">' + data[i].name + '</label>'
                    + '<div class="btn-group ml-auto float-r">'
                    + '<button onclick="updateEntry(' + "'" + data[i].projectLayerID + "'" + ');" class="btn btn-sm btn-info"><i class="fa fa-edit"></i></button>'
                    + '<button onclick="deleteEntry(' + "'" + data[i].projectID + "'," + "'" + data[i].projectLayerID + "'" + '); return false;" class="btn btn-sm btn-info"><i class="far fa-trash-alt"></i></button>'
                    + '</div>'
                    + '</li>';

                $("#sortable").append(content);
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