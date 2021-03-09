
function setControlChangeEntry(projectId) {

    if ($('#DLG005_CC').length == 0) {
        setControlChangeEntryModal(projectId);
    }

    var validator = $("#DLG005_CC_frmChangeControl").validate();
    validator.resetForm();
}

function setControlChangeEntryModal(projectId) {

    let modal = '<div class="modal fade" id="DLG005_CC" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'
        + '<div class="modal-dialog" role="document">'
        + '<div class="modal-content">'
        + '<div class="col-md-12">'
        + '<div class="stacked-form pt-3 mb-3">'
        + '<div class="center">'
        + '<img class="cc-header pb-2" src="../images/cc.svg" asp-append-version="true">'
        + '<h4 class="card-title bold mt-3">' + $.i18n._('documentChanges') + '</h4>'
        + '</div>'
        + '<div class="card-body ">'
        + '<form id="DLG005_CC_frmChangeControl" method="post">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('responsibleAuthorizer') + '</label>'
        + '<select id="DLG005_CC_Authorizer" class="form-control" maxlength="1500" required>'
        + '</select>'
        + '</div>'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('reasonToChange') + ':</label>'
        + '<textarea id="DLG005_CC_Comments" class="form-control ccrazon" name="name" rows="5" cols="80" required></textarea>'
        + '</div>'
        + '</form>'
        + '</div>'
        + '<div class="center">'
        + '<button type="button" class="btn btn-info btn-fill" onClick="dismissChangeControl(); return false;" data-dismiss="modal">' + $.i18n._('cancel') + '</button>&nbsp;&nbsp;&nbsp;'
        + '<button type="button" class="btn btn-defautl" onClick="updateChangeControl(); return false;" >' + $.i18n._('continue') + '</button>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'

    $('.main-panel').append(modal);

    setFormValidation('#DLG005_CC_frmChangeControl');

    $.ajax({
        type: 'GET',
        url: '/Execution/GetParticipantByProject?id=' + projectId,
        dataType: 'json',
        data: projectId,
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            document.getElementById('DLG005_CC_Authorizer').options.length = 0;
            select = document.getElementById('DLG005_CC_Authorizer');

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


function setNotificationEntry(projectID, elementID, elementType) {

    if (projectID == null || projectID == '')
        return;

    if (elementID == null || elementID == '')
        return;

    if (elementType == null || elementType == '')
        return;

    if ($('#DLG003_NOTI').length == 0) {
        setNotificationEntryModal();
    }

    var validator = $("#DLG003_NOTI_frmNotification").validate();
    validator.resetForm();

    $('#DLG003_NOTI_ProjectID').val(projectID);
    $('#DLG003_NOTI_ElementID').val(elementID);
    $('#DLG003_NOTI_ElementType').val(elementType);
    $('#DLG003_NOTI_Subject').val('');
    $('#DLG003_NOTI_Message').val('');
    $('#DLG003_NOTI_Recipients').val(null).trigger('change');

    $.ajax({
        type: 'GET',
        url: '/Execution/GetParticipantByProject',
        dataType: 'json',
        data: { id: projectID },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            document.getElementById('DLG003_NOTI_Recipients').options.length = 0;
            select = document.getElementById('DLG003_NOTI_Recipients');

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');
                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];
                select.appendChild(opt);
            }

            $('#DLG003_NOTI').modal('show');
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

function setNotificationEntryModal() {

    let modal = '<div class="modal fade" id="DLG003_NOTI" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'
        + '<div class="modal-dialog modal-lg" role="document">'
        + '<div class="modal-content">'
        + '<div class="modal-header">'
        + '<h5 class="modal-title bold txt-blue" id="exampleModalLabel"><i class="nc-icon nc-bell-55"></i> ' + $.i18n._('newNotification') + '</h5>'
        + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
        + '<span aria-hidden="true">&times;</span>'
        + '</button>'
        + '</div>'
        + '<div class="modal-body">'
        + '<div class="card horizontal-form" style="border:none;">'
        + '<div class="card-body ">'
        + '<form id="DLG003_NOTI_frmNotification" method="post">'
        + '<input type = "hidden" id ="DLG003_NOTI_ProjectID" value="" required>'
        + '<input type = "hidden" id ="DLG003_NOTI_ElementID" value="" required>'
        + '<input type = "hidden" id ="DLG003_NOTI_ElementType" value="" required>'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('subject') + '</label><star class="star">*</star>'
        + '<input type="text" id="DLG003_NOTI_Subject" class="form-control" maxlength="250" required />'
        + '</div>'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('recipients') + '</label><star class="star">*</star>'
        + '<select id="DLG003_NOTI_Recipients" class="form-control" required multiple>'
        + '</select>'
        + '</div>'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('message') + '</label><star class="star">*</star>'
        + '<textarea class="form-control" id="DLG003_NOTI_Message" rows="5" maxlength="1500" required></textarea>'
        + '</div>'
        + '<div class="card-footer text-right">'
        + '<button type="button" class="btn btn-info btn-fill" data-dismiss="modal">' + $.i18n._('cancel') + '</button>&nbsp;&nbsp;'
        + '<button type="button" id="btnCreateActionPlan" onclick="saveNotification(); return false;" class="btn btn-default btn-fill">' + $.i18n._('send') + '</button>'
        + '</div>'
        + '</form>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'

    $('.main-panel').append(modal);

    setFormValidation('#DLG003_NOTI_frmNotification');

    $("#DLG003_NOTI_Recipients").select2({
        theme: "bootstrap4",
        language: "es"
    });
}

function saveNotification() {

    var form = $("#DLG003_NOTI_frmNotification");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/Notifications/CreateNotification',
        dataType: 'json',
        data: { projectId: $("#DLG003_NOTI_ProjectID").val(), type: $("#DLG003_NOTI_ElementType").val(), elementId: $("#DLG003_NOTI_ElementID").val(), subject: $("#DLG003_NOTI_Subject").val(), message: $("#DLG003_NOTI_Message").val(), recipients: $("#DLG003_NOTI_Recipients").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#DLG003_NOTI').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => { }
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


function getNotificationsBadge() {

    if ($('#DLG004_NOTI_Page').length == 0) {
        $('.main-panel').append('<input type = "hidden" id ="DLG004_NOTI_Page" value="1">');
    }

    if ($('#DLG004_NOTI_Badge').length == 0) {
        $('.main-panel').append('<input type = "hidden" id ="DLG004_NOTI_Badge" value="">');
    }

    $.ajax({
        type: 'GET',
        url: '/Notifications/GetNotificationBadge',
        dataType: 'json',
        success: function (data) {
            if (data.length > 0) {

                $('#DLG004_NOTI_Badge').val(JSON.stringify(data));
                $('#notificationsBadge').text(data.length);
                $('#notificationsBadge').addClass('notification')
            }
        },
        error: function (xhr, status, error) {
        }
    });
}

function setNotificationsBadge() {

    var value = $('#DLG004_NOTI_Badge').val();
    if (value != null && value != '') {
        value = JSON.parse(value);

        $.ajax({
            type: 'PUT',
            url: '/Notifications/UpdateBadgeNotification',
            dataType: 'json',
            data: { data: value },
            success: function () {
                
            },
            complete: function () {
                $('#DLG004_NOTI_Badge').val('');
            },
            error: function (xhr, status, error) {
            }
        });
    }
}

function getNotifications(reset) {

    let page = 1;
    let pageRows = 1;

    if ($('#DLG004_NOTI').length == 0) {
        setNotificationsModal();
    }

    if (reset == true) {
        $('#DLG004_NOTI_Page').val(1);
    }

    page = parseInt($('#DLG004_NOTI_Page').val());
    pageRows = (page * 10); 
    let screenWidth = screen.width;
    if ($(window).width() <= 990) {
        window.location = "/MyDashboard/Notifications"; 
    } else { 
        $.ajax({
        type: 'GET',
        url: '/Notifications/GetNotificationTotal',
        dataType: 'json',
        success: function (rows) {

            $.ajax({
                type: 'GET',
                url: '/Notifications/GetTopNNotification',
                dataType: 'json',
                data: { nPage: page, nNotification: 10 },
                beforeSend: function () {
                    LoaderShow();
                },
                success: function (data) {
                    if (data.length == 0) {
                        Swal.fire({
                            type: 'info',
                            title: '',
                            text: $.i18n._('emptyNotification'),
                            footer: '',
                            onClose: () => {
                                $('#DLG004_NOTI').modal('hide')
                            }
                        });
                    }
                    else {
                        $("#DLG004_NOTI_NotificationContainer").html('');
                        setNotificationsBadge();

                        let content = '';

                        for (var i = 0; i < data.length; i++) {

                            let notId = 'noti-' + i;
                            let img = '';
                            let link = '';
                            let element = '';
                            let participant = '';


                            if (data[i].senderPhoto == null || data[i].senderPhoto == '') {
                                img = '/images/avatar/default-avatar.png';
                            }
                            else {
                                img = data[i].senderPhoto;
                            }

                            if (!data[i].isSystem) {
                                participant = '<div class="mt-0 mb-1 bold"><a href="#" onclick="getParticipantInfoModal(' + "'" + data[i].sender + "'" + '); return false;" class="underline-link">' + data[i].senderName + '</a><span class="bag-area"> ' + data[i].companyName + '</span></div>'
                            }
                            else {
                                participant = '<div class="mt-0 mb-1 bold"><a href="#" class="underline-link">' + data[i].senderName + '</a><span class="bag-area"> ' + $.i18n._('pmctoolSystem')  + '</span></div>'
                            }

                            switch (data[i].source) {
                                case 1:
                                    link = '../Execution/Activity?projectId=' + data[i].projectID + '&activityId=' + data[i].sourceID
                                    element = $.i18n._('activity');
                                    break;
                                case 2:
                                    link = '../Execution/Milestone?projectId=' + data[i].projectID + '&milestoneId=' + data[i].sourceID
                                    element = $.i18n._('milestone');
                                    break;
                                case 3:
                                    link = '../Execution/Evidence?projectId=' + data[i].projectID + '&evidenceId=' + data[i].sourceID
                                    element = $.i18n._('evidence');
                                    break;
                                case 4:
                                    link = '../Execution/Incident?projectId=' + data[i].projectID + '&incidentId=' + data[i].sourceID
                                    element = $.i18n._('incident');
                                    break;
                                case 5:
                                    link = '../Execution/Risk?projectId=' + data[i].projectID + '&riskId=' + data[i].sourceID
                                    element = $.i18n._('risk');
                                    break;
                                case 6:
                                    link = '../Execution/AgreementDetail?projectId=' + data[i].projectID + '&meetingId=' + data[i].parentID + '&agreementId=' +data[i].sourceID
                                    element = $.i18n._('agreement');
                                    break;
                                case 7:
                                    link = '../Execution/Incident?projectId=' + data[i].projectID + '&incidentId=' + data[i].parentID
                                    element = $.i18n._('actionPlan');
                                    break;
                                case 8:
                                    link = '../Execution/Risk?projectId=' + data[i].projectID + '&riskId=' + data[i].parentID
                                    element = $.i18n._('mitigationPlan');
                                    break;
                                case 9:
                                    link = '../Execution/Risk?projectId=' + data[i].projectID + '&riskId=' + data[i].parentID
                                    element = $.i18n._('contingencyPlan');
                                    break;
                                case 10:
                                    link = '../Execution/Evidence?projectId=' + data[i].projectID + '&evidenceId=' + data[i].parentID
                                    element = $.i18n._('controlPoint');
                                    break;
                                case 11:
                                    link = '../Execution/Meeting?projectId=' + data[i].projectID + '&meetingId=' + data[i].sourceID
                                    element = $.i18n._('meeting');
                                    break;
                                default:
                            }

                        content = content
                            + '<div class="row" id =' + notId + ' >'
                            + '<div class="col-md-1 text-center">'
                            + '<img class="mr-3 mr-2" data-src="holder.js/64x64" alt="64x64" src="' + img + '" data-holder-rendered="true" style="width: 64px; height: 64px;border-radius: 100px;">'
                            + '</div>'
                            + '<div class="col-md-11 pl-4">'
                            + '<div class="media-body font8em color-black1">'
                            + '<div class="row" data-notificacion="2010">'
                            + '<div class="col-md-7">'

                            + participant
                            
                            + '</div>'
                            + '<div class="col-md-5 text-right">'
                            + '<div class="col-md-12 txt-blue pr-0">'
                            + '<span class="bag-date-comment"><i class="far fa-calendar-alt"></i> ' + data[i].sendDate + ' </span>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '<div class="col-md-12 lh-15px font8em">'
                            + '<div class="row">'
                            + '<div class="col-md-12   pl-0 mb-0">'
                            + '<div class="row">'
                            + '<div class="col-md-12">'
                            + '<div class="pr-1 pl-1 noti-in-left-atr">'
                            + '<strong> <i class="fas fa-copy"></i> ' + $.i18n._('project') + ':</strong> ' + data[i].projectName
                            + '</div>'
                            + '<div class="pr-1 pl-1 noti-in-left-enti">'
                            + '<strong><i class="fas fa-adjust"></i> ' + element + ':</strong> ' + data[i].sourceName
                            + '</div>'
                            + '</div>'

                                + '</div>'

                                + '</div>'
                                + '</div>'
                                + '<div class="row">'
                                + '<div class="col-md-12   pl-0 mb-0 pt-1 pb-1"> <strong>' + $.i18n._('from') + ':</strong> <span class="subjet-notificacion"><a href="mailto:' + data[i].senderEmail + '?subject=' + data[i].projectName + '"> ' + data[i].senderEmail + '</a><a></a></span><a> </a></div>'
                                + '<div class="col-md-12   pl-0 mb-0">  <strong>' + $.i18n._('title') + ':</strong> <span>' + data[i].subject + '</span></div > <br>'
                                + '</div>'
                                + '<div class="row">'
                                + data[i].message
                                + '</div>'
                                + '</div>'
                                + '<div class="row">'
                                + '<div class="col-md-12 text-right">'
                                + '<button type="button" class="btn-view btn-round btn-sm btn-small hideNotification" data-idnotification="2010" onclick="hideNotification(' + "'" + notId + "'," + "'" + data[i].notificationID + "'" + '); return false;" ><i class="fas fa-check-double"></i> ' + $.i18n._('viewed') + '</button> &nbsp;'
                                + '<a href="' + link + '" class="btn btn-round btn-sm btn-small" onclick="LoaderShow();" ><i class="fas fa-link"></i> ' + $.i18n._('go') + '</a>'

                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '<br/>';
                        }

                        if (pageRows < rows) {
                            content = content
                                + '<div class="row">'
                                + '<div class="col-md-12 text-center">'
                                + '<button type="button" class="btn btn-secondary col-md-12 " onclick="loadModification(); return false;" >' + $.i18n._('loadMore') + '</button>'
                                + '</div>'
                                + '</div>';
                        }

                        $("#DLG004_NOTI_NotificationContainer").append(content);
                        $('#DLG004_NOTI').modal('show');
                        $('#notificationsBadge').text('');
                        $('#notificationsBadge').removeClass('notification');
                    }
                    
                },
                complete: function () {
                    LoaderHide();
                },
                error: function (xhr, status, error) {
                }
            });

        },
        error: function (xhr, status, error) {
        }
    });

    }
}

function setNotificationsModal() {
    let modal = '<div class="modal fade bd-example-modal-lg" id="DLG004_NOTI" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">'
        + '<div class="modal-dialog modal-lg">'
        + '<div class="modal-content">'
        + '<div class="modal-header">'
        + '<h5 class="modal-title bold txt-blue" id="exampleModalLabel"><i class="nc-icon nc-bell-55"></i> ' + $.i18n._('notifications') + '</h5>'
        + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
        + '<span aria-hidden="true">&times;</span>'
        + '</button>'
        + '</div>'
        + '<div class="modal-body">'
        + '<div class="row">'
        + '<div class="col-md-12">'
        + '<div id="DLG004_NOTI_NotificationContainer" class="bd-comment">'


        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="modal-footer">'
        + '<div class="col-md-12 text-right">'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'

    $('.main-panel').append(modal);
}

function getNotificationLink(source, projectId, sourceId, parentId) {

    var link = '';

    switch (source) {
        case 1:
            link = '../Execution/Activity?projectId=' + projectId + '&activityId=' + sourceId
            break;
        case 2:
            link = '../Execution/Milestone?projectId=' + projectId + '&milestoneId=' + sourceId
            break;
        case 3:
            link = '../Execution/Evidence?projectId=' + projectId + '&evidenceId=' + sourceId
            break;
        case 4:
            link = '../Execution/Incident?projectId=' + projectId + '&incidentId=' + sourceId
            break;
        case 5:
            link = '../Execution/Risk?projectId=' + projectId + '&riskId=' + sourceId
            break;
        case 6:
            link = '../Execution/AgreementDetail?projectId=' + projectId + '&meetingId=' + parentId + '&agreementId=' + sourceId
            break;
        case 7:
            link = '../Execution/Incident?projectId=' + projectId + '&incidentId=' + parentId
            break;
        case 8:
            link = '../Execution/Risk?projectId=' + projectId + '&riskId=' + parentId
            break;
        case 9:
            link = '../Execution/Risk?projectId=' + projectId + '&riskId=' + parentId
            break;
        case 10:
            link = '../Execution/Evidence?projectId=' + projectId + '&evidenceId=' + parentId
            break;
        case 11:
            link = '../Execution/Meeting?projectId=' + projectId + '&meetingId=' + parentId
            break;
        default:
    }

    return link;
}

function loadModification() {
    let page = parseInt($('#DLG004_NOTI_Page').val());
    page++;
    $('#DLG004_NOTI_Page').val(page);
    getNotifications(false);
}

function hideNotification(element, id) {
    var spaceElement = $('#' + element + " + br");
    spaceElement.remove();

    var removeElement = $('#' + element);
    removeElement.remove();
    
    removeElement.hide('slow', function () { removeElement.remove(); });      

    $.ajax({
        type: 'PUT',
        url: '/Notifications/UpdateDisplayNotification',
        dataType: 'json',
        data: { notificationId: id },
        success: function (data) {
        },
        error: function (xhr, status, error) {
        }
    });
}

function markNotificationViewed(id, modal, datatable) {
    $.ajax({
        type: 'PUT',
        url: '/Notifications/UpdateDisplayNotification',
        dataType: 'json',
        data: { notificationId: id },
        success: function (data) {

            if (modal != '')
                $('#' + modal).modal('toggle');

            if (data.isSuccess && datatable != null)
                $('#' + datatable).DataTable().ajax.reload();

            else {
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                });
            } 
        },
        error: function (xhr, status, error) {
        }
    });
}

function getParticipantInfoModal(id) {

    if (id != 'null' && id != '') {

        if ($('#DLG001_PMI').length == 0) {
            setParticipantInfoModal();
        }

        $.ajax({
            type: 'GET',
            url: '/Participants/GetByID',
            dataType: 'json',
            data: { id: id },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.participantUser.image == null || data.participantUser.image == '') {
                    $('#DLG001_PMI_Image').attr("src", '../images/avatar/default-avatar.png');
                }
                else {
                    $('#DLG001_PMI_Image').attr("src", data.participantUser.image);
                }

                $('#DLG001_PMI_Name').text(isNull(data.name, '') + ' ' + isNull(data.lastname, '') + ' ' + isNull(data.surname, ''));
                $('#DLG001_PMI_Email').text(isNull(data.email, ''));
                $('#DLG001_PMI_Company').val(isNull(data.company, ''));
                $('#DLG001_PMI_CompanyArea').val(isNull(data.area, ''));
                $('#DLG001_PMI_Function').val(isNull(data.function, ''));
                $('#DLG001_PMI_Address').val(isNull(data.address.street, '') + ' ' + isNull(data.address.extNum, '') + ' ' + isNull(data.address.intNum, '') + ' ' + isNull(data.address.district, '') + ' ' + isNull(data.address.zipCode, ''));
                $('#DLG001_PMI_Country').val(isNull(data.address.country, ''));
                $('#DLG001_PMI_State').val(isNull(data.address.state, ''));
                $('#DLG001_PMI_City').val(isNull(data.address.city, ''));
                $('#DLG001_PMI_Phone').val(isNull(data.contact.value, ''));
                $('#DLG001_PMI').modal('show');
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
}

function setParticipantInfoModal() {

    let modal = '<div class="modal fade" id="DLG001_PMI" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'
        + '<div class="modal-dialog" role="document">'
        + '<div class="modal-content">'
        + '<div class="modal-body">'

        + '<div class="row">'
        + '<div class="col-md-12">'
        + '<div class="card card-user">'
        + '<div class="card-header no-padding">'
        + '<div class="card-image">'
        + '<img src="../images/full-screen-image-4.png" alt="...">'
        + '</div>'
        + '</div>'
        + '<div class="card-body ">'
        + '<div class="author">'
        + '<a href="#">'
        + '<img id="DLG001_PMI_Image" class="avatar border-gray" src="../images/avatar/default-avatar.png" alt="...">'
        + '<h5 id="DLG001_PMI_Name" class="card-title"> </h5>'
        + '</a>'
        + '<p id="DLG001_PMI_Email" class="card-description"> </p>'
        + '</div>'
        + '<div class="row">'
        + '<div class="col-md-12">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('company') + '</label>'
        + '<input id="DLG001_PMI_Company" type="text" class="form-control" disabled>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="row">'
        + '<div class="col-md-6">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('area') + '</label>'
        + '<input id="DLG001_PMI_CompanyArea" type="text" class="form-control" disabled>'
        + '</div>'
        + '</div>'
        + '<div class="col-md-6">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('function') + '</label>'
        + '<input id="DLG001_PMI_Function" type="text" class="form-control" disabled>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="row">'
        + '<div class="col-md-12">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('address') + '</label>'
        + '<textarea id="DLG001_PMI_Address"  class="form-control" disabled/>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="row">'
        + '<div class="col-md-4">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('country') + '</label>'
        + '<input id="DLG001_PMI_Country" type="text" class="form-control" disabled>'
        + '</div>'
        + '</div>'
        + '<div class="col-md-4">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('state') + '</label>'
        + '<input id="DLG001_PMI_State" type="text" class="form-control" disabled>'
        + '</div>'
        + '</div>'
        + '<div class="col-md-4">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('city') + '</label>'
        + '<input id="DLG001_PMI_City" type="text" class="form-control" disabled>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="row">'
        + '<div class="col-md-12">'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('phone') + '</label>'
        + '<input id="DLG001_PMI_Phone" type="text" class="form-control" disabled>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<div class="clearfix"></div>'
        + '<div class="card-footer text-right"><button type="button" class="btn btn-default btn-fill" data-dismiss="modal">Cerrar</button></div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</div>'

        + '<div class="modal-footer"></div>'
        + '</div>'
        + '</div>'
        + '</div>';

    $('.main-panel').append(modal);
}


function setAnnotationEntry(projectID, elementID, elementType) {
    
    if (projectID == null || projectID == '')
        return;

    if (elementID == null || elementID == '')
        return;

    if (elementType == null || elementType == '')
        return;

    if ($('#DLG002_AEI').length == 0) {
        setAnnotationEntryModal();
    }

    var validator = $("#DLG002_AEI_frmAnnotation").validate();
    validator.resetForm();

    $('#DLG002_AEI_ProjectID').val(projectID);
    $('#DLG002_AEI_ElementID').val(elementID);
    $('#DLG002_AEI_ElementType').val(elementType);
    $('#DLG002_AEI_Comment').val('');
    $('#DLG002_AEI').modal('show');
}

function setAnnotationEntryModal() {

    let modal = '<div class="modal fade" id="DLG002_AEI" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'
        + '<div class="modal-dialog modal-lg" role="document">'
        + '<div class="modal-content">'
        + '<div class="modal-body">'

        + '<div class="card horizontal-form" style="border:none;">'
        + '<div class="card-header ">'
        + '<h5 class="modal-title bold txt-blue"><i class="fas fa-book-open"></i> ' + $.i18n._('comment') + '</h5>'
        + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
        + '<span aria-hidden="true">&times;</span>'
        + '</button>'
        + '</div>'
        + '<div class="card-body ">'
        + '<form id="DLG002_AEI_frmAnnotation" method="post">'
        + '<input type = "hidden" id ="DLG002_AEI_ProjectID" value="" required>'
        + '<input type = "hidden" id ="DLG002_AEI_ElementID" value="" required>'
        + '<input type = "hidden" id ="DLG002_AEI_ElementType" value="" required>'
        + '<div class="form-group">'
        + '<label>' + $.i18n._('comment') + '</label><star class="star">*</star>'
        + '<textarea id="DLG002_AEI_Comment" class="form-control" maxlength="1500" required />'
        + '</div>'
        + '<div class="card-footer text-right">'
        + '<button type="button" class="btn btn-info btn-fill" data-dismiss="modal">' + $.i18n._('cancel') + '</button>&nbsp;&nbsp;'
        + '<button type="button" id="DLG002_AEI_CreateAnnotation" onclick="saveAnnotation(); return false;" class="btn btn-default btn-fill">' + $.i18n._('create') + '</button>'
        + '</div>'
        + '</form>'
        + '</div>'
        + '</div>'

        + '</div>' //modal-body
        + '<div class="modal-footer"></div>'
        + '</div>' //modal-content
        + '</div>' //modal-dialog
        + '</div>'; //modal

    $('.main-panel').append(modal);

    setFormValidation('#DLG002_AEI_frmAnnotation');
}

function saveAnnotation() {

    var form = $("#DLG002_AEI_frmAnnotation");
    form.validate();

    if (!form.valid())
        return;

    $.ajax({
        type: 'POST',
        url: '/ProjectAnnotations/CreateAnnotation',
        dataType: 'json',
        data: { projectId: $("#DLG002_AEI_ProjectID").val(), type: $("#DLG002_AEI_ElementType").val(), elementId: $("#DLG002_AEI_ElementID").val(), annotation: $("#DLG002_AEI_Comment").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                $('#DLG002_AEI').modal('toggle');

                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => getNAnnotations($("#DLG002_AEI_ProjectID").val(), $("#DLG002_AEI_ElementID").val(), $("#DLG002_AEI_ElementType").val(), 5)
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

function getNAnnotations(projectID, elementID, elementType, nAnnotations) {

    if (projectID == null || projectID == '')
        return;

    if (elementID == null || elementID == '')
        return;

    if (elementType == null || elementType == '')
        return;
    
    if ($('#AnnotationHolder').length > 0) {
        $.ajax({
            type: 'GET',
            url: '/ProjectAnnotations/GetTopNAnnotations',
            dataType: 'json',
            data: { projectId: projectID, type: elementType, elementId: elementID, nAnnotations: nAnnotations },
            beforeSend: function () {
                //LoaderShow();
            },
            success: function (data) {
                if (data != null && data.length > 0) {


                    if ($('#LastAnnotationHolder').length > 0)
                        $('#LastAnnotationHolder').html(data[0].annotation);

                    $("#AnnotationHolder").html('');

                    for (var i = 0; i < nAnnotations; i++) {
                        ;
                        if (data[i] != null) {

                            var img = '';
                            if (data[i].participantPhoto == null || data[i].participantPhoto == '') {
                                img = '/images/avatar/default-avatar.png';
                            }
                            else {
                                img = data[i].participantPhoto;
                            }

                            var cd = data[i].createdOn.replace("T", " ").substring(0, 16);

                            var content = '<li class="media p-1">' +
                                '<img class="mr-3" data-src="holder.js/64x64" alt="64x64" src="' + img + '" data-holder-rendered="true" style="width: 64px; height: 64px;border-radius: 100px;"/>' +
                                '<div class="media-body font8em color-black1">' +
                                '<div class="row">' +
                                '<div class="col-md-8">' +
                                '<div class="mt-0 mb-1 bold"><a href="#" class="underline-link" onclick="getParticipantInfoModal(' + "'" + data[i].participantID + "'" + '); return false;" >' + data[i].participantName + '</a>  <span class="bag-area"> ' + data[i].companyName + '</span></div>' +
                                '</div>' +
                                '<div class="col-md-4 text-right">' +
                                '<div class="col-md-12 txt-blue">' +
                                '<span class="bag-date-comment"><i class="far fa-calendar-alt"></i> ' + cd + ' </span>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="col-md-12">' +
                                data[i].annotation +
                                '</div>' +
                                '</div>' +
                                '</li>';

                            $("#AnnotationHolder").append(content);
                        }
                    };

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

        $.ajax({
            type: 'GET',
            url: '/ProjectAnnotations/GetCountAnnotations',
            dataType: 'json',
            data: { projectId: projectID, elementId: elementID },
            beforeSend: function () {
            },
            success: function (data) {
                if (data == 0) 
                    $('#seeMoreAnnotations').hide();
                else 
                    $('#seeMoreAnnotations').show();
                $('#BadgeAnnotation').text(data);
            },
            complete: function () {
            },
            error: function (xhr, status, error) {
            }
        });
    }
}

function getAnnotations(projectID, elementID, elementType) {

    if (projectID == null || projectID == '')
        return;

    if (elementID == null || elementID == '')
        return;

    if (elementType == null || elementType == '')
        return;

    if ($('#DLG003_AEI').length == 0) {
        setAnnotationListModal();
    }

    $.ajax({
        type: 'GET',
        url: '/ProjectAnnotations/GetAnnotations',
        dataType: 'json',
        data: { projectId: projectID, type: elementType, elementId: elementID },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data != null && data.length > 0) {

                $("#DLG003_AEI_Holder").html('');
                $("#DLG003_AEI_Holder").append('<ul>');

                for (var i = 0; i < data.length; i++) {
                    if (data[i] != null) {

                        var img = '';
                        if (data[i].participantPhoto == null || data[i].participantPhoto == '') {
                            img = '~/images/avatar/default-avatar.png';
                        }
                        else {
                            img = data[i].participantPhoto;
                        }

                        var cd = data[i].createdOn.replace("T", " ").substring(0, 16);

                        var content = '<li class="media p-1">' +
                            '<img class="mr-3" data-src="holder.js/64x64" alt="64x64" src="' + img + '" data-holder-rendered="true" style="width: 64px; height: 64px;border-radius: 100px;"/>' +
                            '<div class="media-body font8em color-black1">' +
                            '<div class="row">' +
                            '<div class="col-md-8">' +
                            '<div class="mt-0 mb-1 bold"><a href="#" class="underline-link" onclick="getParticipantInfoModal(' + "'" + data[i].participantID + "'" + '); return false;" >' + data[i].participantName + '</a>  <span class="bag-area"> ' + data[i].companyName + '</span></div>' +
                            '</div>' +
                            '<div class="col-md-4 text-right">' +
                            '<div class="col-md-12 txt-blue">' +
                            '<span class="bag-date-comment"><i class="far fa-calendar-alt"></i> ' + cd + ' </span>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="col-md-12">' +
                            data[i].annotation +
                            '</div>' +
                            '</div>' +
                            '</li>';

                        $("#DLG003_AEI_Holder").append(content);
                    }
                };

                $("#DLG003_AEI_Holder").append('</ul>');

            }

            $('#DLG003_AEI').modal('show');
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

function setAnnotationListModal() {
    let modal = '<div class="modal fade" id="DLG003_AEI" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'
        + '<div class="modal-dialog modal-lg" role="document">'
        + '<div class="modal-content">'
        + '<div class="modal-body">'

        + '<div class="card horizontal-form" style="border:none;">'
        + '<div class="card-header ">'
        + '<h5 class="modal-title bold txt-blue"><i class="fas fa-book-open"></i> ' + $.i18n._('comments') + '</h5>'
        + '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'
        + '<span aria-hidden="true">&times;</span>'
        + '</button>'
        + '</div>'
        + '<div class="card-body" id="DLG003_AEI_Holder">'

        + '<div class="card-footer text-right">'
        + '<button type="button" class="btn btn-default btn-fill" data-dismiss="modal">' + $.i18n._('close') + '</button>'
        + '</div>'
        + '</div>'
        + '</div>'

        + '</div>' //modal-body
        + '<div class="modal-footer"></div>'
        + '</div>' //modal-content
        + '</div>' //modal-dialog
        + '</div>'; //modal

    $('.main-panel').append(modal);
}

function isNull(value, replace) {

    if (value == null) {
        value = replace;
    }

    return value;
}

function getStatusClassName(status) {
    let className = '';

    if (status == 1) {
        className = 'st-entiempo';
    }

    if (status == 2) {
        className = 'st-atrasado';
    }

    if (status == 3) {
        className = 'st-cimpacto';
    }

    if (status == 4) {
        className = 'st-cerrado';
    }

    if (status == 5) {
        className = 'st-cancelado';
    }

    return className;
}

function setStatusClassName(obj, status) {
    let className = ['st-entiempo', 'st-atrasado', 'st-cimpacto', 'st-cerrado', 'st-cancelado'];
    let $obj = $('#' + obj);

    $.each(className, function (i, v) {
        $obj.removeClass(v);
    });

    if (status == 1) {
        $obj.addClass('st-entiempo');
    }

    if (status == 2) {
        $obj.addClass('st-atrasado');
    }

    if (status == 3) {
        $obj.addClass('st-cimpacto');
    }

    if (status == 4) {
        $obj.addClass('st-cerrado');
    }

    if (status == 5) {
        $obj.addClass('st-cancelado');
    }
}

function getElementTypeName(element) {
    var name = '';
    var elem = parseInt(element);

    switch (elem) {
        case 1:
            name = $.i18n._('activity');
            break;
        case 2:
            name = $.i18n._('milestone');
            break;
        case 3:
            name = $.i18n._('evidence');
            break;
        case 4:
            name = $.i18n._('incident');
            break;
        case 5:
            name = $.i18n._('risk');
            break;
        case 6:
            name = $.i18n._('agreement');
            break;
        case 7:
            name = $.i18n._('actionPlan');
            break;
        case 8:
            name = $.i18n._('mitigationPlan');
            break;
        case 9:
            name = $.i18n._('contingencyPlan');
            break;
        case 10:
            name = $.i18n._('controlPoint');
            break;
        case 11:
            name = $.i18n._('meeting');
            break;
        case 99:
            name = $.i18n._('other');
            break;
        default:
    }

    return name;
}

function getElementStatusName(status) {
    var st = parseInt(status);
    return $.i18n._('elementStatusName_' + st);
}

function HideAndShow(hide, show) {
    $('#' + hide).fadeOut('slow', function () {
        $('#' + show).fadeIn('slow');
    });
}

function HideElement(element) {
    $('#' + element).hide();
}

function LoaderShow() {
    $("#loader").attr("hidden", false);
}

function LoaderHide() {
    $("#loader").attr("hidden", true);
}

function setAsActive() {
    var element = $("#" + Cookies.get('pmctool-option'));
    element.addClass("active");
    element.parent().parent().addClass("show");
}

function setFormValidation(id) {
    $(id).validate({
        highlight: function (element) {
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            $(element).closest('.form-check').removeClass('has-success').addClass('has-error');
        },
        success: function (element) {
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(element).closest('.form-check').removeClass('has-error').addClass('has-success');
        },
        errorPlacement: function (error, element) {
            $(element).closest('.form-group').append(error).addClass('has-error');
        },
    });
}

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat);
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function hourFormatter(time) {
    time = time.toFixed(2);

    var hourPortion = time.toString().split(".")[0];
    var minPortion = time.toString().split(".")[1];
    var minPortionUsed = (parseInt(time.toString().split(".")[1]) * 0.6).toFixed(2);
    minPortionUsed = Math.round(minPortionUsed);
    //minPortionUsed = minPortionUsed.split(".")[0];

    var longitud = minPortionUsed.toString().length;
    if (longitud == 1 && minPortion > 17) {
        minPortionUsed = minPortionUsed * 10;
    }
    if (minPortionUsed < 10) {
        minPortionUsed = '0' + minPortionUsed.toString();
    }
    var minu = isNaN(minPortionUsed);
    if (minu == true) {
        minPortionUsed = '00';
    }
    return ('0' + hourPortion).slice(-2) + ':' + minPortionUsed + ':00';
}

function timeStringToFloat(time) {
    var hoursMinutes = time.split(/[.:]/);
    var hours = parseInt(hoursMinutes[0], 10);
    var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    return hours + minutes / 60;
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

$().ready(function () {
    setAsActive();
    $sidebar = $('.sidebar');
    $sidebar_img_container = $sidebar.find('.sidebar-background');

    $full_page = $('.full-page');

    $sidebar_responsive = $('body > .navbar-collapse');

    window_width = $(window).width();

    // Init Datetimepicker

    if ($("#datetimepicker").length != 0) {
        $('.datetimepicker').datetimepicker({
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
            }
        });

        $('.datepicker').datetimepicker({
            format: 'MM/DD/YYYY',
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
            }
        });

        $('.timepicker').datetimepicker({
            //          format: 'H:mm',    // use this format if you want the 24hours timepicker
            format: 'h:mm A', //use this format if you want the 12hours timpiecker with AM/PM toggle
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
            }
        });

    };
    fixed_plugin_open = $('.sidebar .sidebar-wrapper .nav li.active a p').html();

    if (window_width > 767 && fixed_plugin_open == 'Dashboard') {
        if ($('.fixed-plugin .dropdown').hasClass('show-dropdown')) {
            $('.fixed-plugin .dropdown').addClass('show');
        }

    }

    $('.fixed-plugin a').click(function (event) {
        // Alex if we click on switch, stop propagation of the event, so the dropdown will not be hide, otherwise we set the  section active
        if ($(this).hasClass('switch-trigger')) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else if (window.event) {
                window.event.cancelBubble = true;
            }
        }
    });

    $('.fixed-plugin .background-color span').click(function () {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');

        var new_color = $(this).data('color');

        if ($sidebar.length != 0) {
            $sidebar.attr('data-color', new_color);
        }

        if ($full_page.length != 0) {
            $full_page.attr('filter-color', new_color);
        }

        if ($sidebar_responsive.length != 0) {
            $sidebar_responsive.attr('data-color', new_color);
        }
    });

    $('.fixed-plugin .img-holder').click(function () {
        $full_page_background = $('.full-page-background');

        $(this).parent('li').siblings().removeClass('active');
        $(this).parent('li').addClass('active');


        var new_image = $(this).find("img").attr('src');

        if ($sidebar_img_container.length != 0 && $('.switch-sidebar-image input:checked').length != 0) {
            $sidebar_img_container.fadeOut('fast', function () {
                $sidebar_img_container.css('background-image', 'url("' + new_image + '")');
                $sidebar_img_container.fadeIn('fast');
            });
        }

        if ($full_page_background.length != 0 && $('.switch-sidebar-image input:checked').length != 0) {
            var new_image_full_page = $('.fixed-plugin li.active .img-holder').find('img').data('src');

            $full_page_background.fadeOut('fast', function () {
                $full_page_background.css('background-image', 'url("' + new_image_full_page + '")');
                $full_page_background.fadeIn('fast');
            });
        }

        if ($('.switch-sidebar-image input:checked').length == 0) {
            var new_image = $('.fixed-plugin li.active .img-holder').find("img").attr('src');
            var new_image_full_page = $('.fixed-plugin li.active .img-holder').find('img').data('src');

            $sidebar_img_container.css('background-image', 'url("' + new_image + '")');
            $full_page_background.css('background-image', 'url("' + new_image_full_page + '")');
        }

        if ($sidebar_responsive.length != 0) {
            $sidebar_responsive.css('background-image', 'url("' + new_image + '")');
        }
    });

    $('.switch-image input').on("switchChange.bootstrapSwitch", function () {

        $full_page_background = $('.full-page-background');

        $input = $(this);

        if ($input.is(':checked')) {
            if ($sidebar_img_container.length != 0) {
                $sidebar_img_container.fadeIn('fast');
                $sidebar.attr('data-image', '#');
            }

            if ($full_page_background.length != 0) {
                $full_page_background.fadeIn('fast');
                $full_page.attr('data-image', '#');
            }

            background_image = true;
        } else {
            if ($sidebar_img_container.length != 0) {
                $sidebar.removeAttr('data-image');
                $sidebar_img_container.fadeOut('fast');
            }

            if ($full_page_background.length != 0) {
                $full_page.removeAttr('data-image', '#');
                $full_page_background.fadeOut('fast');
            }

            background_image = false;
        }
    });

    $('.switch-mini input').on("switchChange.bootstrapSwitch", function () {
        $body = $('body');

        $input = $(this);

        if (lbd.misc.sidebar_mini_active == true) {
            $('body').removeClass('sidebar-mini');
            lbd.misc.sidebar_mini_active = false;

            if (isWindows) {
                $('.sidebar .sidebar-wrapper').perfectScrollbar();
            }

        } else {

            $('.sidebar .collapse').collapse('hide').on('hidden.bs.collapse', function () {
                $(this).css('height', 'auto');
            });

            if (isWindows) {
                $('.sidebar .sidebar-wrapper').perfectScrollbar('destroy');
            }

            setTimeout(function () {
                $('body').addClass('sidebar-mini');

                $('.sidebar .collapse').css('height', 'auto');
                lbd.misc.sidebar_mini_active = true;
            }, 300);
        }

        // we simulate the window Resize so the charts will get updated in realtime.
        var simulateWindowResize = setInterval(function () {
            window.dispatchEvent(new Event('resize'));
        }, 180);

        // we stop the simulation of Window Resize after the animations are completed
        setTimeout(function () {
            clearInterval(simulateWindowResize);
        }, 1000);

    });

    $('.switch-nav input').on("switchChange.bootstrapSwitch", function () {
        $nav = $('nav.navbar').first();

        $nav.toggleClass("navbar-fixed");

        // if($nav.hasClass('navbar-fixed')){
        //     $nav.removeClass('navbar-fixed').prependTo('.main-panel');
        // } else {
        //     $nav.prependTo('.wrapper').addClass('navbar-fixed');
        // }

    });

    $.validator.addMethod(
        "regex",
        function (value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        $("#Err4016").val()
    );

    getNotificationsBadge();
    $("input:text").focus(function () { $(this).select(); });
    
});

type = ['primary', 'info', 'success', 'warning', 'danger'];

demo = {
    initPickColor: function () {
        $('.pick-class-label').click(function () {
            var new_class = $(this).attr('new-class');
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if (display_div.length) {
                var display_buttons = display_div.find('.btn');
                display_buttons.removeClass(old_class);
                display_buttons.addClass(new_class);
                display_div.attr('data-class', new_class);
            }
        });
    },

    checkFullPageBackgroundImage: function () {
        $page = $('.full-page');
        image_src = $page.data('image');

        if (image_src !== undefined) {
            image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
            $page.append(image_container);
        }
    },

    initLBDWizard: function () {
        // Code for the Validator
        var $validator = $('#wizardForm').validate({
            rules: {
                email: {
                    required: true,
                    email: true,
                    minlength: 5
                },
                first_name: {
                    required: false,
                    minlength: 5
                },
                last_name: {
                    required: false,
                    minlength: 5
                },
                website: {
                    required: true,
                    minlength: 5,
                    url: true
                },
                framework: {
                    required: false,
                    minlength: 4
                },
                cities: {
                    required: true
                },
                price: {
                    number: true
                }
            },
            highlight: function (element) {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            },
            success: function (element) {
                $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            },

            // errorPlacement: function(error, element) {
            //     $(element).parent('div').addClass('has-danger');
            //  }
        });

        // Wizard Initialization
        $('.card-wizard').bootstrapWizard({
            'tabClass': 'nav nav-pills',
            'nextSelector': '.btn-next',
            'previousSelector': '.btn-previous',

            onNext: function (tab, navigation, index) {
                var $valid = $('#wizardForm').valid();
                if (!$valid) {
                    $validator.focusInvalid();
                    return false;
                }
            },

            onInit: function (tab, navigation, index) {
                //check number of tabs and fill the entire row
                var $total = navigation.find('li').length;
                var $wizard = navigation.closest('.card-wizard');

                $first_li = navigation.find('li:first-child a').html();
                $moving_div = $('<div class="moving-tab">' + $first_li + '</div>');
                $('.card-wizard .wizard-navigation').append($moving_div);

                refreshAnimation($wizard, index);

                $('.moving-tab').css('transition', 'transform 0s');
            },

            onTabClick: function (tab, navigation, index) {
                var $valid = $('#wizardForm').valid();

                if (!$valid) {
                    return false;
                } else {
                    return true;
                }
            },

            onTabShow: function (tab, navigation, index) {
                var $total = navigation.find('li').length;
                var $current = index + 1;

                var $wizard = navigation.closest('.card-wizard');

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $($wizard).find('.btn-next').hide();
                    $($wizard).find('.btn-finish').show();
                } else {
                    $($wizard).find('.btn-next').show();
                    $($wizard).find('.btn-finish').hide();
                }

                button_text = navigation.find('li:nth-child(' + $current + ') a').html();

                setTimeout(function () {
                    $('.moving-tab').text(button_text);
                }, 150);

                var checkbox = $('.footer-checkbox');

                if (!index == 0) {
                    $(checkbox).css({
                        'opacity': '0',
                        'visibility': 'hidden',
                        'position': 'absolute'
                    });
                } else {
                    $(checkbox).css({
                        'opacity': '1',
                        'visibility': 'visible'
                    });
                }

                refreshAnimation($wizard, index);
            }
        });


        // Prepare the preview for profile picture
        $("#wizard-picture").change(function () {
            readURL(this);
        });

        $('[data-toggle="wizard-radio"]').click(function () {
            wizard = $(this).closest('.card-wizard');
            wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
            $(this).addClass('active');
            $(wizard).find('[type="radio"]').removeAttr('checked');
            $(this).find('[type="radio"]').attr('checked', 'true');
        });

        $('[data-toggle="wizard-checkbox"]').click(function () {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).find('[type="checkbox"]').removeAttr('checked');
            } else {
                $(this).addClass('active');
                $(this).find('[type="checkbox"]').attr('checked', 'true');
            }
        });

        $('.set-full-height').css('height', 'auto');

        //Function to show image before upload

        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
                }
                reader.readAsDataURL(input.files[0]);
            }
        }

        $(window).resize(function () {
            $('.card-wizard').each(function () {
                $wizard = $(this);

                index = $wizard.bootstrapWizard('currentIndex');
                refreshAnimation($wizard, index);

                $('.moving-tab').css({
                    'transition': 'transform 0s'
                });
            });
        });

        function refreshAnimation($wizard, index) {
            $total = $wizard.find('.nav li').length;
            $li_width = 100 / $total;

            total_steps = $wizard.find('.nav li').length;
            move_distance = $wizard.width() / total_steps;
            index_temp = index;
            vertical_level = 0;

            mobile_device = $(document).width() < 600 && $total > 3;

            if (mobile_device) {
                move_distance = $wizard.width() / 2;
                index_temp = index % 2;
                $li_width = 50;
            }

            $wizard.find('.nav li').css('width', $li_width + '%');

            step_width = move_distance;
            move_distance = move_distance * index_temp;

            $current = index + 1;

            if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
                move_distance -= 8;
            } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
                move_distance += 8;
            }

            if (mobile_device) {
                vertical_level = parseInt(index / 2);
                vertical_level = vertical_level * 38;
            }

            $wizard.find('.moving-tab').css('width', step_width);
            $('.moving-tab').css({
                'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
                'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

            });
        }
    },

    initSliders: function () {
        // Sliders for demo purpose in refine cards section
        var slider = document.getElementById('sliderRegular');

        noUiSlider.create(slider, {
            start: 40,
            connect: [true, false],
            range: {
                min: 0,
                max: 100
            }
        });

        var slider2 = document.getElementById('sliderDouble');

        noUiSlider.create(slider2, {
            start: [20, 60],
            connect: true,
            range: {
                min: 0,
                max: 100
            }
        });
    },

    initCharts: function () {

        /*  **************** 24 Hours Performance - single line ******************** */

        var dataPerformance = {
            labels: ['6pm', '9pm', '11pm', '2am', '4am', '8am', '2pm', '5pm', '8pm', '11pm', '4am'],
            series: [
                [1, 6, 8, 7, 4, 7, 8, 12, 16, 17, 14, 13]
            ]
        };

        var optionsPerformance = {
            showPoint: false,
            lineSmooth: true,
            height: "260px",
            axisX: {
                showGrid: false,
                showLabel: true
            },
            axisY: {
                offset: 40,
            },
            low: 0,
            high: 16
        };

        Chartist.Line('#chartPerformance', dataPerformance, optionsPerformance);



        /*  **************** NASDAQ: AAPL - single line with points ******************** */

        var dataStock = {
            labels: ['\'07', '\'08', '\'09', '\'10', '\'11', '\'12', '\'13', '\'14', '\'15'],
            series: [
                [22.20, 34.90, 42.28, 51.93, 62.21, 80.23, 62.21, 82.12, 102.50, 107.23]
            ]
        };

        var optionsStock = {
            lineSmooth: false,
            height: "260px",
            axisY: {
                offset: 40,
                labelInterpolationFnc: function (value) {
                    return '$' + value;
                }

            },
            low: 10,
            high: 110,
            classNames: {
                point: 'ct-point ct-green',
                line: 'ct-line ct-green'
            }
        };

        Chartist.Line('#chartStock', dataStock, optionsStock);



        /*  **************** Users Behaviour - Multiple Lines ******************** */


        var dataSales = {
            labels: ['\'06', '\'07', '\'08', '\'09', '\'10', '\'11', '\'12', '\'13', '\'14', '\'15'],
            series: [
                [287, 385, 490, 554, 586, 698, 695, 752, 788, 846, 944],
                [67, 152, 143, 287, 335, 435, 437, 539, 542, 544, 647],
                [23, 113, 67, 190, 239, 307, 308, 439, 410, 410, 509]
            ]
        };

        var optionsSales = {
            lineSmooth: false,
            axisY: {
                offset: 40
            },
            low: 0,
            high: 1000
        };


        Chartist.Line('#chartBehaviour', dataSales, optionsSales);



        /*  **************** Public Preferences - Pie Chart ******************** */

        var dataPreferences = {
            series: [
                [25, 30, 20, 25]
            ]
        };

        var optionsPreferences = {
            donut: true,
            donutWidth: 40,
            startAngle: 0,
            total: 100,
            showLabel: false,
            axisX: {
                showGrid: false,
                offset: 0
            },
            height: 245
        };

        Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);

        Chartist.Pie('#chartPreferences', {
            labels: ['62%', '32%', '6%'],
            series: [62, 32, 6]
        });


        /*  **************** Views  - barchart ******************** */

        var dataViews = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            series: [
                [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895]
            ]
        };

        var optionsViews = {
            seriesBarDistance: 10,
            classNames: {
                bar: 'ct-bar ct-azure'
            },
            axisX: {
                showGrid: false
            }
        };

        var responsiveOptionsViews = [
            ['screen and (max-width: 640px)', {
                seriesBarDistance: 5,
                axisX: {
                    labelInterpolationFnc: function (value) {
                        return value[0];
                    }
                }
            }]
        ];

        Chartist.Bar('#chartViews', dataViews, optionsViews, responsiveOptionsViews);



        var data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            series: [
                [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
                [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
            ]
        };

        var options = {
            seriesBarDistance: 10,
            axisX: {
                showGrid: false
            },
            height: "245px"
        };

        var responsiveOptions = [
            ['screen and (max-width: 640px)', {
                seriesBarDistance: 5,
                axisX: {
                    labelInterpolationFnc: function (value) {
                        return value[0];
                    }
                }
            }]
        ];

        Chartist.Bar('#chartActivity', data, options, responsiveOptions);

    },

    initDocumentationCharts: function () {
        /* ----------==========     Daily Sales Chart initialization For Documentation    ==========---------- */

        dataDailySalesChart = {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            series: [
                [12, 17, 7, 17, 23, 18, 38]
            ]
        };

        optionsDailySalesChart = {
            lineSmooth: Chartist.Interpolation.cardinal({
                tension: 0
            }),
            low: 0,
            high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
            chartPadding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
        }

        var dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);

        // lbd.startAnimationForLineChart(dailySalesChart);
    },

    initVectorMap: function () {
        var mapData = {
            "AU": 760,
            "BR": 550,
            "CA": 120,
            "DE": 1300,
            "FR": 540,
            "GB": 690,
            "GE": 200,
            "IN": 200,
            "RO": 600,
            "RU": 300,
            "US": 2920,
        };

        $('#worldMap').vectorMap({
            map: 'world_mill_en',
            backgroundColor: "transparent",
            zoomOnScroll: false,
            regionStyle: {
                initial: {
                    fill: '#e4e4e4',
                    "fill-opacity": 0.9,
                    stroke: 'none',
                    "stroke-width": 0,
                    "stroke-opacity": 0
                }
            },

            series: {
                regions: [{
                    values: mapData,
                    scale: ["#AAAAAA", "#444444"],
                    normalizeFunction: 'polynomial'
                }]
            },
        });
    },

    initFullCalendar: function () {
        $calendar = $('#fullCalendar');

        today = new Date();
        y = today.getFullYear();
        m = today.getMonth();
        d = today.getDate();

        $calendar.fullCalendar({
            header: {
                left: 'title',
                center: 'month,agendaWeek,agendaDay',
                right: 'prev,next,today'
            },
            defaultDate: today,
            selectable: true,
            selectHelper: true,
            // titleFormat: {
            //     month: 'MMMM YYYY', // September 2015
            //     week: "MMMM D YYYY", // September 2015
            //     day: 'D MMM, YYYY'  // Tuesday, Sep 8, 2015
            // },
            views: {
                // week:{ titleFormat: "DD MMMM YYYY" },
                month: {
                    titleFormat: 'MMMM YYYY'
                }, // September 2015
                week: {
                    titleFormat: "MMMM D YYYY"
                }, // September 2015
                day: {
                    titleFormat: 'D MMM, YYYY'
                } // Tuesday, Sep 8, 2015
            },
            select: function (start, end) {

                // on select we show the Sweet Alert modal with an input
                swal({
                    title: 'Create an Event',
                    html: '<br><input class="form-control" placeholder="Event Title" id="input-field">',
                    showCancelButton: true,
                    closeOnConfirm: true
                }, function () {

                    var eventData;
                    event_title = $('#input-field').val();

                    if (event_title) {
                        eventData = {
                            title: event_title,
                            start: start,
                            end: end
                        };
                        $calendar.fullCalendar('renderEvent', eventData, true); // stick? = true
                    }

                    $calendar.fullCalendar('unselect');

                });
            },
            editable: true,
            eventLimit: true, // allow "more" link when too many events


            // color classes: [ event-blue | event-azure | event-green | event-orange | event-red ]
            events: [{
                title: 'All Day Event',
                start: new Date(y, m, 1)
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d - 4, 6, 0),
                allDay: false,
                className: 'event-blue'
            },
            {
                id: 999,
                title: 'Repeating Event',
                start: new Date(y, m, d + 3, 6, 0),
                allDay: false,
                className: 'event-blue'
            },
            {
                title: 'Meeting',
                start: new Date(y, m, d - 1, 10, 30),
                allDay: false,
                className: 'event-green'
            },
            {
                title: 'Lunch',
                start: new Date(y, m, d + 7, 12, 0),
                end: new Date(y, m, d + 7, 14, 0),
                allDay: false,
                className: 'event-red'
            },
            {
                title: 'LBD Launch',
                start: new Date(y, m, d - 2, 12, 0),
                allDay: true,
                className: 'event-azure'
            },
            {
                title: 'Birthday Party',
                start: new Date(y, m, d + 1, 19, 0),
                end: new Date(y, m, d + 1, 22, 30),
                allDay: false,
            },
            {
                title: 'Click for Creative Tim',
                start: new Date(y, m, 21),
                end: new Date(y, m, 22),
                url: 'http://www.creative-tim.com/',
                className: 'event-orange'
            },
            {
                title: 'Click for Google',
                start: new Date(y, m, 23),
                end: new Date(y, m, 23),
                url: 'http://www.creative-tim.com/',
                className: 'event-orange'
            }
            ]
        });
    },

    initDashboardPageCharts: function () {

        var dataPreferences = {
            series: [
                [25, 30, 20, 25]
            ]
        };

        var optionsPreferences = {
            donut: true,
            donutWidth: 40,
            startAngle: 0,
            total: 100,
            showLabel: false,
            axisX: {
                showGrid: false
            }
        };

        Chartist.Pie('#chartEmail', dataPreferences, optionsPreferences);

        Chartist.Pie('#chartEmail', {
            labels: ['53%', '36%', '11%'],
            series: [53, 36, 11]
        });


        var dataSales = {
            labels: ['9:00AM', '12:00AM', '3:00PM', '6:00PM', '9:00PM', '12:00PM', '3:00AM', '6:00AM'],
            series: [
                [287, 385, 490, 492, 554, 586, 698, 695, 752, 788, 846, 944],
                [67, 152, 143, 240, 287, 335, 435, 437, 539, 542, 544, 647],
                [23, 113, 67, 108, 190, 239, 307, 308, 439, 410, 410, 509]
            ]
        };

        var optionsSales = {
            lineSmooth: false,
            low: 0,
            high: 800,
            showArea: true,
            height: "245px",
            axisX: {
                showGrid: false,
            },
            lineSmooth: Chartist.Interpolation.simple({
                divisor: 3
            }),
            showLine: false,
            showPoint: false,
            fullWidth: false
        };

        var responsiveSales = [
            ['screen and (max-width: 640px)', {
                axisX: {
                    labelInterpolationFnc: function (value) {
                        return value[0];
                    }
                }
            }]
        ];

        var chartHours = Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);

        // lbd.startAnimationForLineChart(chartHours);

        var data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            series: [
                [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
                [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695]
            ]
        };

        var options = {
            seriesBarDistance: 10,
            axisX: {
                showGrid: false
            },
            height: "245px"
        };

        var responsiveOptions = [
            ['screen and (max-width: 640px)', {
                seriesBarDistance: 5,
                axisX: {
                    labelInterpolationFnc: function (value) {
                        return value[0];
                    }
                }
            }]
        ];

        var chartActivity = Chartist.Bar('#chartActivity', data, options, responsiveOptions);
    },



    initSmallGoogleMaps: function () {

        // Regular Map
        var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
        var mapOptions = {
            zoom: 8,
            center: myLatlng,
            scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
        }

        var map = new google.maps.Map(document.getElementById("regularMap"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title: "Regular Map!"
        });

        marker.setMap(map);


        // Custom Skin & Settings Map
        var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
        var mapOptions = {
            zoom: 13,
            center: myLatlng,
            scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
            disableDefaultUI: true, // a way to quickly hide all controls
            zoomControl: true,
            styles: [{
                "featureType": "water",
                "stylers": [{
                    "saturation": 43
                }, {
                    "lightness": -11
                }, {
                    "hue": "#0088ff"
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{
                    "hue": "#ff0000"
                }, {
                    "saturation": -100
                }, {
                    "lightness": 99
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#808080"
                }, {
                    "lightness": 54
                }]
            }, {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ece2d9"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ccdca1"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#767676"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#ffffff"
                }]
            }, {
                "featureType": "poi",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "landscape.natural",
                "elementType": "geometry.fill",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#b8cb93"
                }]
            }, {
                "featureType": "poi.park",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.sports_complex",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.medical",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.business",
                "stylers": [{
                    "visibility": "simplified"
                }]
            }]

        }

        var map = new google.maps.Map(document.getElementById("customSkinMap"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title: "Custom Skin & Settings Map!"
        });

        marker.setMap(map);



        // Satellite Map
        var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
        var mapOptions = {
            zoom: 3,
            scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.SATELLITE
        }

        var map = new google.maps.Map(document.getElementById("satelliteMap"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title: "Satellite Map!"
        });

        marker.setMap(map);


    },

    initFullScreenGoogleMap: function () {
        var myLatlng = new google.maps.LatLng(40.748817, -73.985428);
        var mapOptions = {
            zoom: 13,
            center: myLatlng,
            scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
            styles: [{
                "featureType": "water",
                "stylers": [{
                    "saturation": 43
                }, {
                    "lightness": -11
                }, {
                    "hue": "#0088ff"
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{
                    "hue": "#ff0000"
                }, {
                    "saturation": -100
                }, {
                    "lightness": 99
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [{
                    "color": "#808080"
                }, {
                    "lightness": 54
                }]
            }, {
                "featureType": "landscape.man_made",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ece2d9"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#ccdca1"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#767676"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#ffffff"
                }]
            }, {
                "featureType": "poi",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "landscape.natural",
                "elementType": "geometry.fill",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#b8cb93"
                }]
            }, {
                "featureType": "poi.park",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.sports_complex",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.medical",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "poi.business",
                "stylers": [{
                    "visibility": "simplified"
                }]
            }]

        }
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            title: "Hello World!"
        });

        // To add the marker to the map, call setMap();
        marker.setMap(map);
    },

    showNotification: function (from, align) {
        color = Math.floor((Math.random() * 4) + 1);

        $.notify({
            icon: "nc-icon nc-app",
            message: "Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for every web developer."

        }, {
                type: type[color],
                timer: 8000,
                placement: {
                    from: from,
                    align: align
                }
            });
    },

    // Sweet Alerts
    showSwal: function (type) {
        if (type == 'basic') {
            swal("Here's a message!");

        } else if (type == 'title-and-text') {
            swal("Here's a message!", "It's pretty, isn't it?")

        } else if (type == 'success-message') {
            swal("Good job!", "You clicked the button!", "success")

        } else if (type == 'warning-message-and-confirmation') {
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this imaginary file!",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn btn-info btn-fill",
                confirmButtonText: "Yes, delete it!",
                cancelButtonClass: "btn btn-danger btn-fill",
                closeOnConfirm: false,
            }, function () {
                swal("Deleted!", "Your imaginary file has been deleted.", "success");
            });

        } else if (type == 'warning-message-and-cancel') {
            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this imaginary file!",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel plx!",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function (isConfirm) {
                if (isConfirm) {
                    swal("Deleted!", "Your imaginary file has been deleted.", "success");
                } else {
                    swal("Cancelled", "Your imaginary file is safe :)", "error");
                }
            });

        } else if (type == 'custom-html') {
            swal({
                title: 'HTML example',
                html: 'You can use <b>bold text</b>, ' +
                    '<a href="http://github.com">links</a> ' +
                    'and other HTML tags'
            });

        } else if (type == 'auto-close') {
            swal({
                title: "Auto close alert!",
                text: "I will close in 2 seconds.",
                timer: 2000,
                showConfirmButton: false
            });
        } else if (type == 'input-field') {
            swal({
                title: 'Input something',
                html: '<p><input id="input-field" class="form-control">',
                showCancelButton: true,
                closeOnConfirm: false,
                allowOutsideClick: false
            },
                function () {
                    swal({
                        html: 'You entered: <strong>' +
                            $('#input-field').val() +
                            '</strong>'
                    });
                })
        }
    }

}

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date();
    if (inputFormat !== undefined) {
        d = new Date(inputFormat);
    }
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function getProjectCalendarConfig(projectId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: "/Execution/GetProjectConfiguration?id=" + projectId,
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}

function getProjectCalendar(projectId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: "GET",
            url: "/Execution/GetProjectHolidaysCalendar?id=" + projectId,
            success: function (data) {
                resolve(data);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}

function loadDateTimePicker(projectId, dateTimePicker, multiple, date) {
    var nonWorkingDays = [];
    var holidays;
    var positioning;

    Promise.all([getProjectCalendarConfig(projectId), getProjectCalendar(projectId)]).then(values => {
        if (values[0])
            nonWorkingDays = getDisabledDaysWithCalendarType(values[0].calendarType);

        holidays = values[1].map((element) => {
            var date = element.date.split("T")[0];
            var splittedDate = date.split("-");
            return new Date(splittedDate[0], splittedDate[1] - 1, splittedDate[2]);
        });

        if (multiple)
            positioning = {
                horizontal: 'auto',
                vertical: 'top'
            };
        else
            positioning = {
                horizontal: 'auto',
                vertical: 'auto'
            }


        dateTimePicker.datetimepicker({
            format: 'YYYY-MM-DD',
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
            widgetPositioning: positioning,
            daysOfWeekDisabled: nonWorkingDays,
            disabledDates: holidays,
            date: date
        });
    });
}

function getDisabledDaysWithCalendarType(type) {
    //  MondayToFriday = 1,
    //  MondayToSaturday = 2,
    //  MondayToSunday = 3
    var days;
    switch (type) {
        case 1:
            days = [0, 6];
            break;
        case 2:
            days = [0];
            break;
        case 3:
            days = [];
            break;
        default:
            days = [];
    }

    return days;
}