$(document).ready(function () {

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetMeetings",
            data: { projectID: $("#ProjectID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    let hours = data[i].duration.split(":")[0];
                    let minutes = data[i].duration.split(":")[1];
                    if (hours.length < 2)
                        hours = "0" + hours;
                    data[i].duration = hours + ":" + minutes;
                }
                return data;
            }
        },
        columns: [
            { data: "objective" },
            { data: "place" },
            { data: "meetingDate" },
            { data: "duration" },
            { data: "meetingTime" },
            {
                data: null,
                render: function (url, type, full) {
                    if ($('#ProjectEditable').val() == 'False') {
                        if (full.hasAgreements)
                            return '<div class="text-right"><a class="btn btn-link edit" data-toggle="tooltip" title="' + $("#Agreements").val() + '"><i class="fas fa-file-signature"></i></a>&nbsp<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a></div>';

                        else
                            return '<div class="text-right"><a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a></div>';
                    }
                    else {
                        if (full.hasAgreements == true)
                            return '<div class="text-right"><a class="btn btn-link edit" data-toggle="tooltip" title="' + $("#Agreements").val() + '"><i class="fas fa-file-signature"></i></a>&nbsp<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a></div>';
                        else
                            return '<div class="text-right"><a class="btn btn-link btn-success" data-toggle="tooltip" title="' + $("#SendMeetingInvitation").val() + '"><i class="fas fa-paper-plane"></i></a>&nbsp<a class="btn btn-link edit" data-toggle="tooltip" title="' + $("#Agreements").val() + '"><i class="fas fa-file-signature"></i></a>&nbsp<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a></div>';
                    }
                    
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        order: [[0, "asc"]],
        responsive: true,
        scrollX: true,
        searching: false
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();

        if ($(e.target).attr('class') === 'fas fa-file-signature') {
            LoaderShow();
            location.href = '/Execution/Agreement?projectId=' + data.projectID + '&meetingId=' + data.projectMeetingID;
        }

        if ($(e.target).attr('class') === 'fa fa-edit') {
            LoaderShow();
            location.href = '/Execution/Meeting?projectId=' + data.projectID + '&meetingId=' + data.projectMeetingID;
        }

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            deleteEntry(data);
        }

        if ($(e.target).attr('class') === 'fas fa-paper-plane') {
            meetingInvite(data);
        }
    });


    elementStatusCount();
});

function newEntry() {
    LoaderShow();
    location.href = '/Execution/Meeting?projectId=' + $("#ProjectID").val();
}

function deleteRecord(controller, data) {
    $.ajax({
        type: 'DELETE',
        url: '/' + controller + '/DeleteMeeting',
        dataType: 'json',
        data: { projectId: data.projectID, meetingId: data.projectMeetingID},
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
    elementStatusCount();
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
            deleteRecord('Execution', data);
        }
    });
}

function meetingInvite(data) {
    Swal.fire({
        title: '',
        text: $("#DoYouWantToSendMeetingInvitation").val(),
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            createMeetingInvite(data);
        }
    });
}

function createMeetingInvite(data) {

    var meeting = {
        ProjectMeetingID: data.projectMeetingID,
        ProjectID: data.projectID,
    };

    $.ajax({
        type: 'POST',
        url: '/Execution/CreateMeetingInvite',
        dataType: 'json',
        data: { meeting: meeting },
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
                    onAfterClose: function () {
                        
                    }
                });
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
    });
}

function elementStatusCount() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetElementIndicators',
        dataType: 'json',
        data: { projectId: $('#ProjectID').val(), type: 6 },
        beforeSend: function () {
        },
        success: function (data) {
            if (data != null) {

                var st = 1;

                $('#withImpact').text(' ' + data.projectElementIndicator.withImpact);
                $('#onTime').text(' ' + data.projectElementIndicator.onTime);
                $('#delayed').text(' ' + data.projectElementIndicator.delayed);
                $('#closed').text(' ' + data.projectElementIndicator.closed);

                if (data.projectElementIndicator.withImpact == 0 &&
                    data.projectElementIndicator.onTime == 0 &&
                    data.projectElementIndicator.delayed == 0 &&
                    data.projectElementIndicator.closed > 0) {
                    st = 4;
                }

                if (data.projectElementIndicator.delayed > 0) {
                    st = 2;
                }

                if (data.projectElementIndicator.withImpact > 0) {
                    st = 3;
                }

                setStatusClassName('groupStatus', st);
                $('#groupStatus').text(getElementStatusName(st));
            }
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
    });
}
