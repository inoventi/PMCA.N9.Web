
$(document).ready(function () {
    setStatusClassName('StatusIndicator', $('#AgreementStatus').val());
    getParticipant();
    getNAnnotations($('#ProjectID').val(), $('#ProjectMeetingAgreementID').val(), 6, 5);
    getAgreement();
});

function getParticipant() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetParticipant',
        dataType: 'json',
        data: { id: $("#ParticipantID").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            if (data != null) {

                $("#ResponsibleName").html(data.name + " " + data.lastname + " " + data.surname);
                $("#EscalationName").html(data.escalation);
                $("#EscalationName").attr("onclick", "getParticipantInfoModal(" + "'" + data.escalationID + "'" + ")");

                $("#ResponsiblePhone").html(data.contact.value);
                $("#ResponsiblePhone").attr("href", "tel:" + data.contact.value)

                $("#ResponsibleEmail").html(data.email);
                $("#ResponsibleEmail").attr("href", "mailto:" + data.email)
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

function getAgreement() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetMeetingAgreement',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), meetingId: $("#ProjectMeetingID").val(), agreementId: $("#ProjectMeetingAgreementID").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            if (data != null) {

                $("#t_type").html(getElementTypeName(data.elementType));

                if (data.elementDescription.length > 0) {
                    $("#t_description").html(data.elementDescription);
                }
                else {
                    $("#t_description").html(data.elementName);
                }
                
                $("#t_responsible").html('<a href="#" class="none" onclick="getParticipantInfoModal(' + "'" + data.responsible + "'" + '); return false;">' + data.responsibleName + '</a>');
                $("#t_status").html('<span class="bold ' + getStatusClassName(data.status) + ' ws">' + $("#EnumProjectElementStatus_" + data.status).val() + '</span>');
                $("#t_comments").html(data.comments);
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