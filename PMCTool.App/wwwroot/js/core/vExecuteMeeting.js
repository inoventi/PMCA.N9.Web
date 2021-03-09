
var deletedParticipants = [];
var deletedTopics = [];
var deletedAgreements = [];
var deletedNotes = [];

$(document).ready(function () {

    setFormValidation('#frmMain');

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true, $("#MeetingDate").val())

    $('#MeetingTime').datetimepicker({
        format: 'H:mm',
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
        locale: Cookies.get('pmctool-lang-app').substring(0, 2),
    });
    var dateNow = new Date();
    $('#Duration').datetimepicker({
        format: 'H:mm',
        useCurrent: false,
        showClose: false,
        defaultDate: moment(dateNow).hours(0).minutes(0),
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
        locale: Cookies.get('pmctool-lang-app').substring(0, 2),
    });

    $('#MeetingDuration').mask('##0.00', { reverse: true });

    var tableParticipant = $('#datatableParticipant').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetMeetingParticipants",
            data: { projectId: $("#ProjectID").val(), meetingId: $("#ProjectMeetingID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                //for (var i = 0, ien = data.length; i < ien; i++) {
                //    if (data[i].attended == true) {
                //        data[i].attended = '<input type="checkbox" id="attended" checked>';
                //    }
                //    else {
                //        data[i].attended = '<input type="checkbox" id="attended">';
                //    }
                //}

                return data;
            }
        },
        columns: [
            { data: "projectMeetingParticipantID", visible: false },
            { data: "projectMeetingID", visible: false },
            { data: "participantID", visible: false },
            { data: "name" },
            { data: "email" },
            //{ data: "attended" },
            {
                data: null,
                render: function (url, type, full) {
                    if ($('#ProjectEditable').val() == 'True')
                        return '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
                    else
                        return ''
                }
            },
            { data: "operation", visible: false },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        bLengthChange: false,
        bFilter: false,
        pageLength: 50,
        order: [[4, "asc"]],
        responsive: true,
        scrollX: true,
        searching: false
    });

    var tableTopics = $('#datatableTopic').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetMeetingTopics",
            data: { projectId: $("#ProjectID").val(), meetingId: $("#ProjectMeetingID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    var type = data[i].elementType;
                    data[i].elementName = getElementTypeName(type);
                }

                return data;
            }
        },
        columns: [
            { data: "projectMeetingTopicID", visible: false },
            { data: "projectMeetingID", visible: false },
            { data: "elementID", visible: false },
            { data: "elementType", visible: false },
            { data: "elementName"},
            { data: "topic" },
            { data: "description" },
            {
                data: null,
                render: function (url, type, full) {
                    if ($('#ProjectEditable').val() == 'True')
                        return '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
                    else
                        return ''
                }
            },
            { data: "operation", visible: false },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        bLengthChange: false,
        bFilter: false,
        pageLength: 50,
        order: [[4, "asc"]],
        responsive: true,
        scrollX: true,
        searching: false
    });

    $('#datatableParticipant tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = tableParticipant.row(tr).data();

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            if (data.projectMeetingParticipantID != '00000000-0000-0000-0000-000000000000') {
                deletedParticipants.push(data.projectMeetingParticipantID);
            }

            tableParticipant.row($(this).parents('tr')).remove().draw();
        }
    });

    $('#datatableTopic tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = tableTopics.row(tr).data();

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            if (data.projectMeetingTopicID != '00000000-0000-0000-0000-000000000000') {
                deletedTopics.push(data.projectMeetingTopicID);
            }

            tableTopics.row($(this).parents('tr')).remove().draw();
        }
    });

    $("input[type='radio']").change(function () {
        var selection = $(this).val();

        document.getElementById('Topics').options.length = 0;

        if (selection == 99) {
            $('#topicGpo').hide();
            $('#topictInd').show();
        }
        else {
            $('#topicGpo').show();
            $('#topictInd').hide();
        }

        $('#ElementType').val(selection);
        getElements(selection);
    });

    $('#ElementType').val(1);

    $('#topictInd').hide();

    getElements(1);
});

function getElements(type) {

    $.ajax({
        type: 'GET',
        url: '/Execution/GetElementSelectionList',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), type: type },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {

            document.getElementById('Topics').options.length = 0;
            select = document.getElementById('Topics');

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
            }
        },
        complete: function () {
            //LoaderHide();
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

function addParticipant() {

    var participant = $('#Participants').val();
    if (participant == null || participant == '') {
        Swal.fire({
            type: 'warning',
            title: '',
            text: $('#m4020').val(),
            footer: '',
        });
        return;
    }
        
    $.ajax({
        type: 'GET',
        url: '/Execution/GetParticipant',
        dataType: 'json',
        data: { id: participant},
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {

            var disabled = '';
            var exists = false;

            if ($('#IsNew').val().toLowerCase() == 'true')
                disabled = 'disabled';

            var table = $('#datatableParticipant').DataTable();

            table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                var tdata = this.data();
                var index = this.index();

                if (tdata.email == data.email)
                    exists = true;
            });

            if (exists) {
                Swal.fire({
                    type: 'warning',
                    title: '',
                    text: $('#m4026').val(),
                    footer: '',
                });
                return;
            }
                
            table.row.add({
                "projectMeetingParticipantID": '00000000-0000-0000-0000-000000000000',
                "projectMeetingID": '00000000-0000-0000-0000-000000000000',
                "participantID": data.participantID,
                "name": data.name + ' ' + data.lastname + ' ' + data.surname,
                "email": data.email,
                "attended": '<input type="checkbox" id="attended" ' + disabled + '>',
                "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '" > <i class="far fa-trash-alt"></i></a >',
                "operation": '1'
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

function addGuest() {

    var name = $('#NoRegName').val();
    var email = $('#NoRegEmail').val();
    var disabled = '';
    var exists = false;

    if (name == null || name == '' || email == null || email == '') {
        Swal.fire({
            type: 'warning',
            title: '',
            text: $('#m4021').val(),
            footer: '',
        });
        return;
    }
    if (!validateEmail(email)) {
        Swal.fire({
            type: 'warning',
            title: '',
            text: $('#InvalidEmail').val(),
            footer: '',
        });
        return;
    }

    if ($('#IsNew').val().toLowerCase() == 'true')
        disabled = 'disabled';

    var table = $('#datatableParticipant').DataTable();

    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var tdata = this.data();
        var index = this.index();

        if (tdata.email == email)
            exists = true;
    });

    if (exists) {
        Swal.fire({
            type: 'warning',
            title: '',
            text: $('#m4027').val(),
            footer: '',
        });
        return;
    }

    table.row.add({
        "projectMeetingParticipantID": '00000000-0000-0000-0000-000000000000',
        "projectMeetingID": '00000000-0000-0000-0000-000000000000',
        "participantID": '00000000-0000-0000-0000-000000000000',
        "name": name,
        "email": email,
        "attended": '<input type="checkbox" id="attended" ' + disabled + '>',
        "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '" > <i class="far fa-trash-alt"></i></a >',
        "operation": '1'
    }).draw();

    $('#NoRegName').val('');
    $('#NoRegEmail').val('');
}

function addTopic() {

    var topic;
    var elementId = $('#Topics').val();
    var elementType = parseInt($('#ElementType').val());
    var elementName = getElementTypeName(elementType);
    var description = $('#TopicDescription').val();
    var exists = false;

    if (elementType == 99) {
        topic = $("#Topic").val();
    }
    else {
        topic = $("#Topics option:selected").text()
    }

    if (topic == null || topic == '') {
        Swal.fire({
            type: 'warning',
            title: '',
            text: $('#m4022').val(),
            footer: '',
        });
        return;
    }

    var table = $('#datatableTopic').DataTable();

    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var tdata = this.data();
        var index = this.index();

        if (elementType != 99 && tdata.elementID == elementId)
            exists = true;
    });

    if (exists)
        return;

    table.row.add({
        "projectMeetingTopicID": '00000000-0000-0000-0000-000000000000',
        "projectMeetingID": '00000000-0000-0000-0000-000000000000',
        "elementID": elementId,
        "elementType": elementType,
        "elementName": elementName,
        "topic": topic,
        "description": description,
        "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '" > <i class="far fa-trash-alt"></i></a >',
        "operation": '1'
    }).draw();

    $('#TopicDescription').val('');
    $('#Topic').val('');
}

function create(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    var participants = [];
    var topics = [];
    var meeting = {
        projectMeetingID: $('#ProjectMeetingID').val(),
        projectID: $('#ProjectID').val(),
        objective: $('#Objective').val(),
        place: $('#Place').val(),
        meetingDate: $('#ProjectMeetingDate').val(),
        meetingTime: $('#MeetingTime').val(),
        duration: $('#Duration').val()
    };

    var tableParticipant = $('#datatableParticipant').DataTable();
    tableParticipant.rows().every(function (rowIdx, tableLoop, rowLoop) {

        var data = this.data();
        var index = this.index();

        var attended = false;
        if (tableParticipant.cell(index, 5).nodes().to$().find('input').prop('checked')) {
            attended = true;
        }

        var item = {
            projectMeetingParticipantID: data.projectMeetingParticipantID,
            projectMeetingID: data.projectMeetingID,
            participantID: data.participantID,
            name: data.name,
            email: data.email,
            attended: attended,
            operation: data.operation
        };
        participants.push(item);
    });

    var datatableTopic = $('#datatableTopic').DataTable();
    datatableTopic.rows().every(function (rowIdx, tableLoop, rowLoop) {

        var data = this.data();
        var index = this.index();

        var item = {
            projectMeetingTopicID: data.projectMeetingTopicID,
            projectMeetingID: data.projectMeetingID,
            elementID: data.elementID,
            elementType: data.elementType,
            topic: data.topic,
            description: data.description,
            operation: data.operation
        };
        topics.push(item);
    });

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/CreateMeeting',
        dataType: 'json',
        data: { meeting: meeting, participants: participants, topics: topics},
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $("#ProjectMeetingID").val(data.valueString);
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: function () {
                        meetingInvite();
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

function update(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    var participants = [];
    var topics = [];
    var meeting = {
        projectMeetingID: $('#ProjectMeetingID').val(),
        projectID: $('#ProjectID').val(),
        objective: $('#Objective').val(),
        place: $('#Place').val(),
        meetingDate: $('#ProjectMeetingDate').val(),
        meetingTime: $('#MeetingTime').val(),
        duration: $('#Duration').val()
    };

    var tableParticipant = $('#datatableParticipant').DataTable();
    tableParticipant.rows().every(function (rowIdx, tableLoop, rowLoop) {

        var data = this.data();
        var index = this.index();

        var attended = false;
        if (tableParticipant.cell(index, 5).nodes().to$().find('input').prop('checked')) {
            attended = true;
        }

        var item = {
            projectMeetingParticipantID: data.projectMeetingParticipantID,
            projectMeetingID: data.projectMeetingID,
            participantID: data.participantID,
            name: data.name,
            email: data.email,
            attended: attended,
            operation: data.operation
        };
        participants.push(item);
    });

    var datatableTopic = $('#datatableTopic').DataTable();
    datatableTopic.rows().every(function (rowIdx, tableLoop, rowLoop) {

        var data = this.data();
        var index = this.index();

        var item = {
            projectMeetingTopicID: data.projectMeetingTopicID,
            projectMeetingID: data.projectMeetingID,
            elementID: data.elementID,
            elementType: data.elementType,
            topic: data.topic,
            description: data.description,
            operation: data.operation
        };
        topics.push(item);
    });

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateMeeting',
        dataType: 'json',
        data: { meeting: meeting, participants: participants, topics: topics, removedParticipants: deletedParticipants, removedTopics: deletedTopics },
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
                        meetingInvite();
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

function cancel() {
    LoaderShow();
    location.href = '/Execution/meetings?id=' + $('#ProjectID').val();
}

function meetingInvite() {

    $.ajax({
        type: 'GET',
        url: '/Execution/GetMeetingAgreementsCount',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), meetingId: $("#ProjectMeetingID").val() },
        beforeSend: function () {
        },
        success: function (data) {
            if (data == 0) {
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
                        createMeetingInvite();
                    }
                    else {
                        cancel();
                    }
                });
            }
            else {
                cancel();
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

function createMeetingInvite() {

    var meeting = {
        ProjectMeetingID: $("#ProjectMeetingID").val(),
        ProjectID: $("#ProjectID").val(),
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
                        cancel();
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
function validateEmail($email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailReg.test($email);
}