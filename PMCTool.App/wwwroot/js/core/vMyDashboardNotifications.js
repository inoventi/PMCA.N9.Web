var pageNumber = 1;
var pageSize = 20;

$(document).ready(function () {
    $("#btnLoadMore").hide();

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/MyDashboard/GetNotifications",
            data: { participantId: $("#ParticipantID").val(), pageNumber: pageNumber, pageSize: pageSize },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {

                if (data.length > 0 && data.length >= 20) {
                    $("#btnLoadMore").show();
                }   

                for (var i = 0, ien = data.length; i < ien; i++) {
                }
                return data;
            }
        },
        columns: [
            {
                data: "senderName", bSortable: false,
                render: function (url, type, full) {

                    if (!full.isSystem) {
                        return '<a href="#" onclick="getParticipantInfoModal(' + "'" + full.sender + "'" + '); return false;" class="underline-link">' + full.senderName + '</a>';
                    }
                    else {
                        return '<a href="#" onclick="return false;" class="underline-link">' + full.senderName + '</a>';
                    }
                }
            },
            { data: "subject", bSortable: false  },
            { data: "projectName", bSortable: false  },
            {
                data: "source", bSortable: false,
                render: function (data, type, row, meta) {
                    return getElementTypeName(data);
                }
            },
            {
                data: "createdOn", bSortable: false,
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: null, bSortable: false,
                render: function (url, type, full) {
                    
                    return '<div class="ws">' +
                        '<a href="#" onclick="getHistoricalNotification(' + "'" + full.notificationID + "'" + '); return false;" class="btn btn-round btn-sm btn-small">' + $.i18n._('see') + '</a> ' +
                        '<a href="' + getNotificationLink(full.source, full.projectID, full.sourceID, full.parentID) + '" class="btn btn-round btn-sm btn-small"><i class="fas fa-link"></i>' + $.i18n._('go') +'</a>' +
                        '</div>';      
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        fnRowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {

            if (aData.viewedOn == null) {
                $(nRow).addClass('no-visto');
            }

            $('td:eq(0)', nRow).addClass('text-left');
            $('td:eq(1)', nRow).addClass('text-left');
            $('td:eq(2)', nRow).addClass('text-left');

            return nRow;
        },
        pageLength: 50,
        dom: 'Bfrtip',
        buttons: [],
        responsive: true,
        scrollX: true,
        bFilter: false,
        bPaginate: false,
        ordering: false,
        info: false,
    });
});

function getHistoricalNotifications() {

    pageNumber++;

    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetNotifications',
        dataType: 'json',
        data: { participantId: $("#ParticipantID").val(), pageNumber: pageNumber, pageSize: pageSize },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            if (data.length < pageSize) {
                $("#btnLoadMore").hide();
            }

            var table = $('#datatables').DataTable();

            for (var i = 0; i < data.length; i++) {

                table.row.add(data[i]).draw();
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

function getHistoricalNotification(id) {
    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetNotification',
        dataType: 'json',
        data: { id: id },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            if (data.senderPhoto != null && data.senderPhoto != '') {
                $("#notificationModal_image").attr("src", data.senderPhoto);
            }
            else {
                $("#notificationModal_image").attr("src", '~/images/avatar/default-avatar.png');
            }

            $('#notificationModal_participant').html('');
            if (!data.isSystem) {
                $('#notificationModal_participant').html('<div class="mt-0 mb-1 bold"><a href="#" onclick="getParticipantInfoModal(' + "'" + data.sender + "'" + '); return false;" class="underline-link">' + data.senderName + '</a><span class="bag-area"> ' + data.companyName + '</span></div>');
            }
            else {
                $('#notificationModal_participant').html('<div class="mt-0 mb-1 bold"><a href="#" class="underline-link">' + data.senderName + '</a><span class="bag-area"> ' + $.i18n._('pmctoolSystem') + '</span></div>');
            }

            $('#notificationModal_date').html('<i class="far fa-calendar-alt"></i> ' + data.sendDate);
            $('#notificationModal_project').text(data.projectName);
            $('#notificationModal_element').text(getElementTypeName(data.source));
            $('#notificationModal_source').text(data.sourceName);
            $('#notificationModal_from').text(data.senderEmail);
            $("#notificationModal_from").attr("href", "mailto:" + data.senderEmail);
            $('#notificationModal_title').text(data.subject);
            $('#notificationModal_message').text(data.message);
            $("#notificationModal_go").attr("href", getNotificationLink(data.source, data.projectID, data.sourceID, data.parentID));
            $("#notificationModal_viewed").attr("href", "javascript:markNotificationViewed('" + data.notificationID + "','notificationModal', 'datatables')");

            if (data.viewedOn != null)
                $("#notificationModal_viewed").hide();
            

            $('#notificationModal').modal('show');
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