$(document).ready(function () {

    setFormValidation('#frmMain');

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5],
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
            url: "/Portfolios/GetChildren",
            data: { id: $("#PortfolioID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    data[i]["type"] = $("#EnumProjectType_" + data[i]["type"]).val();

                    if (data[i]["percentage"] != null)
                        data[i]["percentage"] = data[i]["percentage"].toFixed(2);
                }
                return data;
            }
        },
        columns: [
            { data: "projectID", visible: false },
            { data: "code" },
            { data: "name" },
            {
                data: null,
                orderDataType: "dom-text-numeric",
                render: function (url, type, full) {
                    return '<input id="nOrder" onkeydown="return event.keyCode !== 69" type="number" min="0"  max="100"  value="' + full.order + '"/>';
                }
            },
            {
                data: null,
                orderDataType: "dom-text-numeric",
                render: function (url, type, full) {
                    if (full.status == 5) 
                        return '<input id="nWeighing" onkeydown="return event.keyCode !== 69" type="number" min="0"  max="100"  value="' + full.percentage + '"disabled/>';
                    else
                        return '<input id="nWeighing" onkeydown="return event.keyCode !== 69" type="number" min="0"  max="100"  value="' + full.percentage + '"/>';
                }
            },
            { data: "type" },
            {
                data: null, targets: 6,
                defaultContent: '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        dom: 'Brtip',
        buttons: [
            //$.extend(true, {}, fileExportOptions, { extend: 'excelHtml5' }),
        ],
        order: [[3, "asc"]],
        responsive: false,
        columnDefs: [
            { responsivePriority: 1, targets: 0 },
            { responsivePriority: 10001, targets: 4 },
            { responsivePriority: 2, targets: -2 }
        ],
        scrollX: true
    });

    $('#datatables tbody').on('click', 'a', function (e) { 
        var table = $('#datatables').DataTable();
        var row = $(this).parents('tr');
        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            if ($(row).hasClass('child')) {
                table.row($(row).prev('tr')).remove().draw();
            } else {
                table
                    .row($(this).parents('tr'))
                    .remove()
                    .draw();
            }
        }
        
    });

    $('#datatables tbody').on('change', 'input', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();

        if ($(e.target).attr('id') == 'nOrder') {
            var nOrder = table.cell(tr, 3).nodes().to$().find('input').val();

            if (nOrder == '') {
                table.cell(tr, 3).nodes().to$().find('input').val(data.order);
            }

            if (nOrder < 0 || nOrder > 100) {
                table.cell(tr, 3).nodes().to$().find('input').val(data.order);
            }
        }

        if ($(e.target).attr('id') == 'nWeighing') {
            var nWeighing = table.cell(tr, 4).nodes().to$().find('input').val();

            if (nWeighing == '') {
                table.cell(tr, 4).nodes().to$().find('input').val(data.order);
            }

            if (nWeighing < 0 || nWeighing > 100) {
                table.cell(tr, 4).nodes().to$().find('input').val(data.percentage);
            }
        }
    });

    $('#datatables tbody').on('focus', 'input', function (e) {
        $(this).select();
    });

    $("#TypeID").change(function () {
        let type = $(this).val();
        document.getElementById("ChildID").options.length = 0;
        getAvailableChildren(type);
    });

    getAvailableChildren($("#TypeID").val());

    $('#btnCreate').click(function () {
        addRow($("#ChildID").val(), $("#TypeID").val())
    });
});

function getAvailableChildren(type) {
    $.ajax({
        type: 'GET',
        url: "/Portfolios/GetAvaliableChildren",
        dataType: 'json',
        data: { type: type },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            document.getElementById('ChildID').options.length = 0;
            select = document.getElementById('ChildID');

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
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

function getOrder() {
    var table = $('#datatables').DataTable();
    var nextOrder = 0;
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {

        var index = this.index();
        var nOrder = table.cell(index, 3).nodes().to$().find('input').val();

        if (nOrder > nextOrder)
            nextOrder = nOrder;

    });
    return parseInt(nextOrder) + parseInt(1);
}

function projectExist(projectID) {
    var table = $('#datatables').DataTable();
    var exist = false;
    table.rows().every(function () {
        if (this.data().projectID == projectID) {
            exist = true;
        }
    });
    return exist;
}

function addRow(projectId, type) {

    if (projectExist(projectId)) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $("#RecordExist").val(),
            footer: ''
        });
        return false;
    }

    if (type == 1) {
        getProject(projectId)
    } 

    if(type == 2) {
        getProgram(projectId)
    }
   
}

function getProject(projectId) {

    var nextOrder = getOrder();

    $.ajax({
        type: 'GET',
        url: '/Projects/GetById',
        dataType: 'json',
        data: { id: projectId},
        beforeSend: function () {
            LoaderShow();

        },
        success: function (data) {
            $('#datatables').DataTable().row.add({
                "projectID": data.projectID,
                "code": data.code,
                "name": data.name,
                "order": nextOrder,
                "percentage": parseFloat(0).toFixed(2),
                "type": $("#EnumProjectType_" + data.type).val(),
                "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
            }).draw();
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

function getProgram(projectId) {
    var nextOrder = getOrder();

    $.ajax({
        type: 'GET',
        url: '/Programs/GetById',
        dataType: 'json',
        data: { id: projectId },
        beforeSend: function () {
            LoaderShow();

        },
        success: function (data) {
            $('#datatables').DataTable().row.add({
                "projectID": data.programID,
                "code": data.code,
                "name": data.name,
                "order": nextOrder,
                "percentage": parseFloat(0).toFixed(2),
                "type": $("#EnumProjectType_2").val(),
                "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
            }).draw();
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

function createEntry() {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/Portfolios/CreateConnection',
        dataType: 'json',
        data: { id: $("#ChildID").val(), parent: $("#PortfolioID").val(), order: $("#OrderID").val(), percentage: $("#Weighing").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                getAvailableChildren($("#TypeID").val());
                reload();
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

function updateEntry() {

    var items = [];
    var table = $('#datatables').DataTable();
    var total = 0;
    var weighingCero = false;


    table.rows().every(function (rowIdx, tableLoop, rowLoop) {

        var data = this.data();
        var index = this.index();
        var nOrder = table.cell(index, 3).nodes().to$().find('input').val();
        var nWeighing = table.cell(index, 4).nodes().to$().find('input').val();
        if (nWeighing == 0)
            weighingCero = true;

        total = total + parseFloat(nWeighing);

        var item = { projectID: data.projectID, order: nOrder, percentage: nWeighing, parentID: $("#PortfolioID").val() };
        items.push(item);
    });

    //if (items.length == 0) {
    //    return false;
    //}

    if (weighingCero) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $("#WeighingZero").val(),
            footer: ''
        });
        return false;
    }

    if (items.length > 0 && total != 100) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $("#Equal100").val(),
            footer: ''
        });

        return false;
    }

    $.ajax({
        type: 'PUT',
        url: '/Dashboards/UpdateConnection',
        dataType: 'json',
        data: { id: $("#PortfolioID").val(), data: items },
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
                    onAfterClose: () => {
                        getAvailableChildren($("#TypeID").val());
                        reload();
                    }
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

function deleteConnection(id) {

    $.ajax({
        type: 'DELETE',
        url: '/Dashboards/DeleteConnection',
        dataType: 'json',
        data: { id: id },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                getAvailableChildren();
                reload();
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

function deleteEntry(id) {
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
            deleteConnection(id);
        }
    });
}

function cancel() {
    LoaderShow();
    location.href = '/Portfolios'
}