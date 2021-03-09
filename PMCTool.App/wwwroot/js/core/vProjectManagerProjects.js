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
            url: "/ProjectManager/Get",
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                }
                return data;
            }
        },
        columns: [
            { data: "projectID", visible: false },
            { data: "code" },
            { data: "name" },
            { data: "companyName" },
            {
                data: "phase",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectPhase_" + data).val();

                    return data;
                }
            },
            { data: "sponsorName" },
            { data: "leaderName" },
            { data: "projectManagerName" },
            { data: "factSheetName" },
            { data: "parentName" },
            {
                data: "managementType",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectManagementType_" + data).val();

                    return data;
                }
            },
            {
                data: "changeManagement",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectChangeManagement_" + data).val();

                    return data;
                }
            },
            {
                data: "weighingManagement",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectWeighingManagement_" + data).val();

                    return data;
                }
            },
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
                data: null, targets: 13,
                render: function (url, type, full) {
                    var result = '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-warning edit" data-toggle="tooltip" title="' + $("#Layers").val() + '"><i class="fas fa-clone f18"></i></a>&nbsp;<a class="btn btn-link btn-info" data-toggle="tooltip" title="' + $("#Participant").val() + '"><i class="fas fa-address-card"></i></a>';

                    if (full.phase == 3 && full.status == 5) {
                        result = result + '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Archive").val() + '"><i class="fas fa-ban"></i></a>&nbsp;';
                    }
                    
                    return result;
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

        if ($(e.target).attr('class') === 'fa fa-edit') {
            location.href = '/ProjectManager/ProjectEditor?id=' + data.projectID;
        }

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteEntry(data);
        }

        if ($(e.target).attr('class') === 'fas fa-address-card') {
            location.href = '/ProjectManager/ProjectParticipants?id=' + data.projectID;
        }

        if ($(e.target).attr('class') === 'fas fa-clone f18') {
            location.href = '/ProjectManager/Layers?id=' + data.projectID;
        }

        if ($(e.target).attr('class') === 'fas fa-ban') {
            archiveEntry(data.projectID);
        }
    });

});

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
            deleteRecord('ProjectManager', data);
        }
    });
}

function archiveEntry(id) {
    Swal.fire({
        title: '',
        text: $("#AreYouSureArchive").val(),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            archiveRecord(id);
        }
    });
}

function archiveRecord(id) {
    $.ajax({
        type: 'PATCH',
        url: '/Execution/ArchiveProject',
        dataType: 'json',
        data: { idProject: id },
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