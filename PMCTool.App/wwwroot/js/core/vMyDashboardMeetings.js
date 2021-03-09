var pageNumber = 1;
var pageSize = 100;
var fromDate = new Date(Date.now());
fromDate.setDate(fromDate.getDate() - 1);
fromDate = fromDate.toISOString().substring(0, 10);

$(document).ready(function () {
    
    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/MyDashboard/GetMeetings",
            data: { participantId: $("#ParticipantID").val(), fromDate: fromDate,  pageNumber: pageNumber, pageSize: pageSize },
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
            { data: "projectName" },
            { data: "meetingDate" },
            { data: "meetingTime" },
            { data: "duration" },
            { data: "place" },
            { data: "objective" },
            {
                data: null, bSortable: false,
                render: function (url, type, full) {
                    return '<a href="#" onclick="getMeeting(' + "'" + full.projectID + "','" + full.projectMeetingID + "'" + '); return false;" class="btn btn-round btn-sm btn-small">' + $.i18n._('detail') + '</a>';
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

            $('td:eq(0)', nRow).addClass('text-left');
            $('td:eq(1)', nRow).addClass('text-left');
            $('td:eq(2)', nRow).addClass('text-center');
            $('td:eq(3)', nRow).addClass('text-center');
            $('td:eq(4)', nRow).addClass('text-left');
            $('td:eq(5)', nRow).addClass('text-left');
            $('td:eq(6)', nRow).addClass('text-center');

            return nRow;
        },
        pageLength: 20,
        buttons: [],
        responsive: true,
        scrollX: true,
        bFilter: false,
        bPaginate: true,
        bLengthChange: false,
        ordering: false,
        info: false,
    });

});

function getMeeting(projectId, meetingId ) {
    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetMeeting',
        dataType: 'json',
        data: { projectId: projectId, meetingId: meetingId },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            var array = data.date.split("T");
            $('#meetingModal_topics').html('');

            $('#meetingModal_project').text(data.projectName);
            $('#meetingModal_meeting').text(data.objective);
            $('#meetingModal_place').text(data.place);
            $('#meetingModal_date').text(array[0]);
            $('#meetingModal_time').text(array[1].substr(0, 5));
            $('#meetingModal_duration').text(data.duration);

            for (var i = 0; i < data.projectMeetingTopic.length; i++) {
                $('#meetingModal_topics').append('<li class="list-group-item">' + getElementTypeName(data.projectMeetingTopic[i].elementType) + ' - ' + data.projectMeetingTopic[i].topic + '</li>');
            }

            $('#meetingModal').modal('show');
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