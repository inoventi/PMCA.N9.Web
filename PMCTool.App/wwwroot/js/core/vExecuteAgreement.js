
var deletedParticipants = [];
var deletedTopics = [];
var deletedAgreements = [];
var deletedNotes = [];
var operation = 0;
var gtr;

$(document).ready(function () {

    setFormValidation('#frmMain');
    setFormValidation('#frmAgreement');

    loadDateTimePicker($("#ProjectID").val(), $('.datepicker'), true, $("#MeetingDate").val())

    $('.timepicker').datetimepicker({
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
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i].attended == true) {
                        data[i].attended = '<input type="checkbox" id="attended" checked>';
                    }
                    else {
                        data[i].attended = '<input type="checkbox" id="attended">';
                    }
                }

                return data;
            }
        },
        columns: [
            { data: "projectMeetingParticipantID", visible: false },
            { data: "projectMeetingID", visible: false },
            { data: "participantID", visible: false },
            { data: "name" },
            { data: "email" },
            { data: "attended" },
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
            { data: "elementName" },
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

    var tableAgreement = $('#datatableAgreement').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetMeetingAgreements",
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

                    if (data[i]["status"] != null)
                        data[i]["statusName"] = '<span class="bold ' + getStatusClassName(data[i].status) + ' ws">' + $("#EnumProjectElementStatus_" + data[i]["status"]).val() + '</span>';

                }

                return data;
            }
        },
        columns: [
            { data: "projectMeetingAgreementID", visible: false },
            { data: "projectMeetingID", visible: false },
            { data: "elementID", visible: false },
            { data: "elementType", visible: false },
            { data: "responsible", visible: false },
            { data: "status", visible: false },
            { data: "description" },
            {
                data: "plannedEndDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            { data: "responsibleName" },
            { data: "statusName" },
            { data: "comments" },
            {
                data: null,
                render: function (url, type, full) {
                    if ($('#ProjectEditable').val() == 'True')
                        return '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>'
                    else
                        return '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Edit").val() + '"><i class="fa fa-edit"></i></a>'
                }
            },
            { data: "operation", visible: false },
            { data: "elementDescription", visible: false },
            
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

    var datatableNote = $('#datatableNote').DataTable({
        ajax: {
            method: "GET",
            url: "/Execution/GetMeetingNotes",
            data: { projectId: $("#ProjectID").val(), meetingId: $("#ProjectMeetingID").val() },
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
            { data: "projectMeetingNoteID", visible: false },
            { data: "projectMeetingID", visible: false },
            { data: "consecutive" },
            { data: "note" },
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

    $('#datatableAgreement tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = tableAgreement.row(tr).data();
        gtr = tr;

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            if (data.projectMeetingAgreementID != '00000000-0000-0000-0000-000000000000') {
                deletedAgreements.push(data.projectMeetingAgreementID);
            }

            tableAgreement.row($(this).parents('tr')).remove().draw();
        }

        if ($(e.target).attr('class') === 'fa fa-edit') {
            if (data.projectMeetingAgreementID == '00000000-0000-0000-0000-000000000000') {
                operation = 1;
            }
            else {
                operation = 0;
            }

            $("#btnAgreementUpdate").show();
            $("#btnAgreementCreate").hide();
            $("#dvStatus").show();
            fillAgreementForm(data);

        }
    });

    $('#datatableNote tbody').on('click', 'a', function (e) {
        var count = 1;
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = datatableNote.row(tr).data();

        if ($(e.target).attr('class') === 'far fa-trash-alt') {
            if (data.projectMeetingNoteID != '00000000-0000-0000-0000-000000000000') {
                deletedNotes.push(data.projectMeetingNoteID);
            }

            datatableNote.row($(this).parents('tr')).remove().draw();

            
            datatableNote.rows().every(function (rowIdx, tableLoop, rowLoop) {
                var tdata = this.data();
                var index = this.index();

                tdata.consecutive = count;
                datatableNote.row(rowIdx).data(tdata).draw();
                count++;
            });
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
        getElements(selection, 'Topics');
    });

    $("#agreementElementType").change(function () {
        var selection = $(this).val();

        document.getElementById('agreementElementName').options.length = 0;
        if (selection == 99) {
            $('#agreementElementName').prop('readonly', true);
            $('#agreementElementDescriptionRequired').show();
            $('#agreementElementNameRequired').hide();

            $("#agreementElementDescription").prop('required', true);
            $("#agreementElementName").prop('required', false);
        }
        else {
            $('#agreementElementName').prop('readonly', false);
            $('#agreementElementNameRequired').show();
            $('#agreementElementDescriptionRequired').hide();

            $("#agreementElementDescription").prop('required', false);
            $("#agreementElementName").prop('required', true);
        }

        $('#ElementTypeA').val(selection);
        getElements(selection, 'agreementElementName');
    });

    $('#ElementType').val(1);
    $('#ElementTypeA').val(1);

    $('#topictInd').hide();
    $('#agreementElementDescriptionRequired').hide();

    getElements(1, 'Topics');
    getElements(1, 'agreementElementName');

    if ($('#ChangeControl').val() == 'True') {
        setControlChangeEntry($("#ProjectID").val());
    }
});

function getElements(type, obj) {

    $.ajax({
        type: 'GET',
        url: '/Execution/GetElementSelectionList',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), type: type },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {

            document.getElementById(obj).options.length = 0;
            select = document.getElementById(obj);

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
        data: { id: participant },
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

            if (exists)
                return;

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

    if ($('#IsNew').val().toLowerCase() == 'true')
        disabled = 'disabled';

    var table = $('#datatableParticipant').DataTable();

    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var tdata = this.data();
        var index = this.index();

        if (tdata.email == email)
            exists = true;
    });

    if (exists)
        return;

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

function newEntryAgreement() {
    $('#agreement-modal-title').text($('#New').val() + ' ' + $('#Agreement').val());

    $("#dvStatus").hide(); 
    $("#btnAgreementUpdate").hide();
    $("#btnAgreementCreate").show(); 
    cleanAgreementForm();
}

function cleanAgreementForm() {
    var validator = $("#frmAgreement").validate();
    validator.resetForm();

    $('#projectMeetingAgreementID').val('');
    $('#ElementID').val('');
    $('#agreementDescription').val('');
    $('#agreementResponsible').val('');
    $('#agreementPlannedEndDate').val('');

    $('#agreementElementName').val('');
    $('#agreementElementDescription').val('');
    $('#WithImpact').prop('checked', false);
    $('#agreementComment').val('');

    $('#ChangeControlEndDate').val('');
    $('#ChangeControlResponsible').val('');
    $('#ChangeControlManual').val('false');

    $('#agreementElementType').val('1');
    $.when(getElements(1, 'agreementElementName')).done(function () {
        $('#editAgreementModal').modal('show');
    });

}

function fillAgreementForm(data) {
    $('#agreement-modal-title').text($('#Edit').val() + ' ' + $('#Agreement').val());

    var array = data.plannedEndDate.split("T");

    $('#ProjectMeetingAgreementID').val(data.projectMeetingAgreementID);
    $('#ElementID').val(data.elementID);
    $('#ElementTypeA').val(data.elementType);
    $('#agreementDescription').val(data.description);

    $('#agreementResponsible').val(data.responsible);
    $('#ChangeControlResponsible').val(data.responsible);

    $('#agreementPlannedEndDate').val(array[0]);
    $('#ChangeControlEndDate').val(array[0]);

    $('#agreementElementDescription').val(data.elementDescription);
    $('#agreementComment').val(data.comments);

    $('#StatusIndicator').text($(data.statusName).text());
    setStatusClassName('StatusIndicator', data.status);

    if (data.withImpact == true) {
        $('#WithImpact').prop('checked', true);
    }
    else {
        $('#WithImpact').prop('checked', false);
    }

    $('#agreementElementType').val(data.elementType);
    $.when(getElements(data.elementType, 'agreementElementName')).done(function () {
        $('#editAgreementModal').modal('show');
    });

}

function addAgreement() {

    var form = $("#frmAgreement");
    form.validate();

    if (!form.valid())
        return;

    var exists = false;
    var elementId = $('#agreementElementName').val();
    var elementType = parseInt($('#agreementElementType').val());
    var table = $('#datatableAgreement').DataTable();

    //table.rows().every(function (rowIdx, tableLoop, rowLoop) {
    //    var tdata = this.data();
    //    var index = this.index();

    //    if (elementType != 99 && tdata.elementID == elementId)
    //        exists = true;
    //});

    //if (exists)
    //    return;

    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var plannedEndDate = new Date($('#agreementPlannedEndDate').val()+' 00:00:00')
    var status = 1;
    if (now.getTime() > plannedEndDate.getTime()) {
        status = 2
    }
    else 
        status = 1
    
    table.row.add({
        "projectMeetingAgreementID": '00000000-0000-0000-0000-000000000000',
        "projectMeetingID": '00000000-0000-0000-0000-000000000000',
        "elementID": $('#agreementElementName').val(),
        "elementType": $('#agreementElementType').val(),
        "responsible": $('#agreementResponsible').val(),
        "status": status,
        "description": $('#agreementDescription').val(),
        "plannedEndDate": $('#agreementPlannedEndDate').val() + 'T00:00:00',
        "responsibleName": $("#agreementResponsible option:selected").text(),
        "statusName": '<span class="bold ' + getStatusClassName(status) + ' ws">' + $("#EnumProjectElementStatus_" + status).val() + '</span>',
        "comments": $('#agreementComment').val(),
        "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '" > <i class="far fa-trash-alt"></i></a >',
        "operation": '1',
        "elementDescription": $('#agreementElementDescription').val()
    }).draw();

    $('#editAgreementModal').modal('toggle');
}

function updateAgreement() {

    var ccEndDate = $('#ChangeControlEndDate').val();
    var ccResponsible = $('#ChangeControlResponsible').val();
    var endDate = $('#agreementPlannedEndDate').val();
    var responsible = $('#agreementResponsible').val();

    var tr = gtr;
    var table = $('#datatableAgreement').DataTable();

    if ($('#ChangeControl').val() == 'True' && ccEndDate != '' && ccResponsible != '' &&
        (ccEndDate != endDate || ccResponsible != responsible) &&
        table.row(tr).data().operation == 0) {
        $('#ChangeControlComments').val('');
        $('#ChangeControlAuthorizer').val('');
        $('#DLG005_CC_Comments').val('');
        $('#DLG005_CC_Authorizer').val('');
        $('#editAgreementModal').modal('toggle');
        $('#DLG005_CC').modal('show');
    }
    else {
        updAgreement();
    }
}

function dismissChangeControl() {
    updAgreement();
}

function updateChangeControl() {

    var form = $("#DLG005_CC_frmChangeControl");
    form.validate();

    if (!form.valid())
        return;

    $('#ChangeControlComments').val($('#DLG005_CC_Comments').val());
    $('#ChangeControlAuthorizer').val($('#DLG005_CC_Authorizer').val());
    $('#ChangeControlManual').val('true');
    $('#DLG005_CC').modal('toggle');
    updAgreement();
}

function updAgreement() {

    var form = $("#frmAgreement");
    form.validate();

    if (!form.valid() || ($('select[name=agreementElementType] option').filter(':selected').val() != 99 && $('#agreementElementName').val() == null))
        return;

    var tr = gtr;
    var table = $('#datatableAgreement').DataTable();

    var now = new Date()
    var plannedEndDate = new Date($('#agreementPlannedEndDate').val())
    var status = 1;

    if (now.getTime() > plannedEndDate.getTime()) {
        status = 2
    }
    if ($('#WithImpact').is(':checked')){
        status = 3
    }
    else
        status = 1

    table.row(tr).data({
        "projectMeetingAgreementID": $('#ProjectMeetingAgreementID').val(),
        "projectMeetingID": $('#ProjectMeetingID').val(),
        "elementID": $('#agreementElementName').val(),
        "elementType": $('#agreementElementType').val(),
        "responsible": $('#agreementResponsible').val(),
        "status": status,
        "description": $('#agreementDescription').val(),
        "plannedEndDate": $('#agreementPlannedEndDate').val() + 'T00:00:00',
        "responsibleName": $("#agreementResponsible option:selected").text(),
        "statusName": '<span class="bold ' + getStatusClassName(status) + ' ws">' + $("#EnumProjectElementStatus_" + status).val() + '</span>',
        "comments": $('#agreementComment').val(),
        "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '" > <i class="far fa-trash-alt"></i></a >',
        "operation": operation,
        "elementDescription": $('#agreementElementDescription').val(),
        "changeControlAuthorizer": $('#ChangeControlAuthorizer').val(),
        "changeControlComments": $('#ChangeControlComments').val(),
        "changeControlManualInput": $('#ChangeControlManual').val(),
    }).draw();

    if ($('#editAgreementModal').hasClass('show'))
        $('#editAgreementModal').modal('toggle');

    if ($('#DLG005_CC').length == 0) {
        if ($('#DLG005_CC').hasClass('show'))
            $('#DLG005_CC').modal('toggle');
    }
}

function newEntryNote() {
    $('#newEntryNote').val('');
    $('#editCommentModal').modal('show');
}

function addNote() {

    var note = $('#newEntryNote').val();

    if (note == null || note == '') {
        Swal.fire({
            type: 'warning',
            title: '',
            text: $('#m4024').val(),
            footer: '',
        });
        return;
    }

    var table = $('#datatableNote').DataTable();
    var count = parseInt(table.data().count());
    count++;

    table.row.add({
        "projectMeetingNoteID": '00000000-0000-0000-0000-000000000000',
        "projectMeetingID": '00000000-0000-0000-0000-000000000000',
        "consecutive": count,
        "note": note,
        "null": '<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '" > <i class="far fa-trash-alt"></i></a >',
        "operation": '1'
    }).draw();

    $('#editCommentModal').modal('toggle');
}

function update(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    var participants = [];
    var topics = [];
    var agreements = [];
    var notes = [];

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

    var tableAgreement = $('#datatableAgreement').DataTable();
    tableAgreement.rows().every(function (rowIdx, tableLoop, rowLoop) {

        var data = this.data();
        var index = this.index();

        var item = {
            ProjectMeetingAgreementID: data.projectMeetingAgreementID,
            ProjectMeetingID: data.projectMeetingID,
            ElementID: data.elementID,
            ElementType: data.elementType,
            ElementDescription: data.elementDescription,
            Description: data.description,
            PlannedEndDate: data.plannedEndDate,
            Responsible: data.responsible,
            Status: data.status,
            Comments: data.comments,
            operation: data.operation,
            ChangeControlAuthorizer: data.changeControlAuthorizer,
            ChangeControlComments: data.changeControlComments,
            ChangeControlManualInput: data.changeControlManualInput,
        };
        agreements.push(item);
    });

    var datatableNote = $('#datatableNote').DataTable();
    datatableNote.rows().every(function (rowIdx, tableLoop, rowLoop) {

        var data = this.data();
        var index = this.index();

        var item = {
            ProjectMeetingNoteID: data.projectMeetingNoteID,
            ProjectMeetingID: data.projectMeetingID,
            Consecutive: data.consecutive,
            Note: data.note,
            operation: data.operation
        };
        notes.push(item);
    });

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/UpdateAgreement',
        dataType: 'json',
        data: { meeting: meeting, participants: participants, topics: topics, agreements: agreements, notes: notes, removedParticipants: deletedParticipants, removedTopics: deletedTopics, deletedAgreements: deletedAgreements, deletedNotes: deletedNotes },
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
                        LoaderShow();
                        location.href = '/Execution/Meetings?id=' + $("#ProjectID").val();
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

