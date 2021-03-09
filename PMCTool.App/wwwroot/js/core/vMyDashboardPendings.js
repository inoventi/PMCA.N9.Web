var onTime = true;
var delayed = true;
var withImpact = true;

$(document).ready(function () {
    setFormValidation('#frmMain');

    $('#Progress').mask('##0.00', { reverse: true });
    $("#boxActivities").hide();
    $("#boxMilestones").hide();
    $("#boxEvidences").hide();
    $("#boxControlPoints").hide();
    $("#boxAgreements").hide();
    $("#boxPlanMitigation").hide();
    $("#boxPlanContingency").hide();
    $("#boxIncidents").hide();
    $("#boxRisks").hide();
    $("#boxActionPlan").hide();
    $("#dvProgressCheck").hide();

    $("#Project_Name").html($("#ProjectName").val());

    $('#ckOnTime').on('click', function () {
        if ($("#ckOnTime").is(':checked')) {
            onTime = true;
        } else {
            onTime = false;
        }
        getRefresh();
    });

    $('#ckDelayed').on('click', function () {
        if ($("#ckDelayed").is(':checked')) {
            delayed = true;
        } else {
            delayed = false;
        }
        getRefresh();
    });

    $('#ckWithImpact').on('click', function () {
        if ($("#ckWithImpact").is(':checked')) {
            withImpact = true;
        } else {
            withImpact = false;
        }
        getRefresh();
    });

    $('#ckActivities').on('click', function () {
        getActivities();
    });

    $('#ckEvidences').on('click', function () {
        getEvidences();
    });

    $('#ckMilestones').on('click', function () {
        getMilestones();
    });

    $('#ckControlPoints').on('click', function () {
        getControlPoints();
    });

    $('#ckAgreements').on('click', function () {
        getAgreements();
    });

    $('#ckIncidents').on('click', function () {
        getIncidents();
    });

    $('#ckRisks').on('click', function () {
        getRisks();
    });

    $('#ckMitigation').on('click', function () {
        getMitigation();
    });

    $('#ckContingency').on('click', function () {
        getContingency();
    });

    $('#ckActionPlan').on('click', function () {
        getActionPlan();
    });
});

function refresh(id, text) {
    $("#ProjectID").val(id);
    $("#ProjectName").val(text);
    $("#Project_Name").html(text);
    getRefresh();
}

function getRefresh() {
    getActivities();
    getEvidences();
    getMilestones();
    getControlPoints();
    getAgreements();
    getIncidents();
    getRisks();
    getMitigation();
    getContingency();
}

function getSummary() {
    $.ajax({
        type: 'GET',
        url: '/MyDashboard/GetPendingSummary',
        dataType: 'json',
        data: { },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            $("#onTime").html(data.summary.onTime);
            $("#delayed").html(data.summary.delayed);
            $("#withImpact").html(data.summary.withImpact);
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

function getActivities() {
    $('#tActivities').html('');

    if ($("#ckActivities").is(':checked')) {
        $('#boxActivities').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingActivities',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].startDate.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + data[i].endDate.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + (data[i].progress * 100).toFixed(2) + '%</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comment + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 1,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + "" + '\',' + data[i].progressEditable + ', null); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';
                         
                        $("#tActivities").append(markup);
                    }
                }
                else {
                    $("#tActivities").append('<tr><td colspan="7" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxActivities').hide();
    }
}

function getMilestones() {
    $('#tMilestones').html('');

    if ($("#ckMilestones").is(':checked')) {
        $('#boxMilestones').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingMilestones',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].date.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + (data[i].progress * 100).toFixed(2) + '%</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comment + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 2,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + "" + '\', true, null); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>'

                        $("#tMilestones").append(markup);
                    }
                }
                else {
                    $("#tMilestones").append('<tr><td colspan="6" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxMilestones').hide();
    }
}

function getEvidences() {
    $('#tEvidences').html('');

    if ($("#ckEvidences").is(':checked')) {
        $('#boxEvidences').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingEvidences',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].activityName + '</td>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].plannedEndDate.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + (data[i].progress * 100).toFixed(2) + '%</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comment + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 3,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + "" + '\',' + data[i].progressEditable + ', null); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';

                        $("#tEvidences").append(markup);
                    }
                }
                else {
                    $("#tEvidences").append('<tr><td colspan="7" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxEvidences').hide();
    }
}

function getControlPoints() {
    $('#tControlPoints').html('');

    if ($("#ckControlPoints").is(':checked')) {
        $('#boxControlPoints').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingControlPoints',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td>' + data[i].evidenceName + '</td>'
                            + '<td class="text-center">' + data[i].plannedEndDate.substr(0, 10) + '</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comments + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 10,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + data[i].comments + '\', true, \'' + data[i].projectEvidenceID + '\'); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';

                        $("#tControlPoints").append(markup);
                    }
                }
                else {
                    $("#tControlPoints").append('<tr><td colspan="6" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxControlPoints').hide();
    }
}

function getAgreements() {
    $('#tAgreements').html('');

    if ($("#ckAgreements").is(':checked')) {
        $('#boxAgreements').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingAgreements',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].objective + '</td>'
                            + '<td>' + data[i].elementDescription + '</td>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].plannedEndDate.substr(0, 10) + '</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 6,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + "" + '\', true, \'' + data[i].projectMeetingID + '\'); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';

                        $("#tAgreements").append(markup);
                    }
                }
                else {
                    $("#tAgreements").append('<tr><td colspan="6" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxAgreements').hide();
    }
}

function getIncidents() {
    $('#tIncidents').html('');

    if ($("#ckIncidents").is(':checked')) {
        $('#boxIncidents').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingIncidents',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].cratedOn.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + data[i].plannedEndDate.substr(0, 10) + '</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comment + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 4,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + "" + '\',' + data[i].progressEditable + ', null); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';

                        $("#tIncidents").append(markup);
                    }
                }
                else {
                    $("#tIncidents").append('<tr><td colspan="6" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxIncidents').hide();
    }
}

function getRisks() {
    $('#tRisks').html('');

    if ($("#ckRisks").is(':checked')) {
        $('#boxRisks').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingRisks',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].cratedOn.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + data[i].plannedEndDate.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + $("#EnumProjectRiskProbability_" + data[i].probability).val() + '</td>'
                            + '<td class="text-center">' + $("#EnumProjectRiskImpact_" + data[i].impact).val() + '</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comment + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 5,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + "" + '\',' + data[i].progressEditable + ', null); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';

                        $("#tRisks").append(markup);
                    }
                }
                else {
                    $("#tRisks").append('<tr><td colspan="8" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxRisks').hide();
    }
}

function getMitigation() {
    $('#tMitigation').html('');

    if ($("#ckMitigation").is(':checked')) {
        $('#boxPlanMitigation').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingMitigations',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].realStartDate.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + data[i].plannedEndDate.substr(0, 10) + '</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comments + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 8,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + data[i].comments + '\', true, \'' + data[i].projectRiskID + '\'); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';

                        $("#tMitigation").append(markup);
                    }
                }
                else {
                    $("#tMitigation").append('<tr><td colspan="6" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxPlanMitigation').hide();
    }
}

function getContingency() {
    $('#tContingency').html('');

    if ($("#ckContingency").is(':checked')) {
        $('#boxPlanContingency').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingContingencies',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].realStartDate.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + data[i].plannedEndDate.substr(0, 10) + '</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comments + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 9,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + data[i].comments + '\', true, \'' + data[i].projectRiskID + '\'); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';

                        $("#tContingency").append(markup);
                    }
                }
                else {
                    $("#tContingency").append('<tr><td colspan="6" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxPlanContingency').hide();
    }
}

function getActionPlan() {
    $('#tActionPlan').html('');

    if ($("#ckActionPlan").is(':checked')) {
        $('#boxActionPlan').show();
        $.ajax({
            type: 'GET',
            url: '/MyDashboard/GetPendingActionPlans',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), onTime: onTime, delayed: delayed, withImpact: withImpact },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var markup = '<tr>'
                            + '<td>' + data[i].description + '</td>'
                            + '<td class="text-center">' + data[i].realStartDate.substr(0, 10) + '</td>'
                            + '<td class="text-center">' + data[i].plannedEndDate.substr(0, 10) + '</td>'
                            + '<td class="text-center"><span class="bold ' + getStatusClassName(data[i].status) + ' ws pb-1">' + getElementStatusName(data[i].status) + '</span></td>'
                            + '<td>' + data[i].comments + '</td>'
                            + '<td><a rel="tooltip" title="' + $("#Edit").val() + '" class="btn btn-link btn-warning table-action edit" href="#" onclick="editElement(\'' + data[i].id + '\', 7,\'' + data[i].description + '\',' + data[i].status + ',' + data[i].progress + ',\'' + data[i].comments + '\', true, \'' + data[i].projectIncidentID + '\'); return false;"><i class="fa fa-edit"></i></a>'
                            + '</tr>';

                        $("#tActionPlan").append(markup);
                    }
                }
                else {
                    $("#tActionPlan").append('<tr><td colspan="6" class="text-center">' + $.i18n._('noRecordsFound') + '</td></tr>');
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
    else {
        $('#boxActionPlan').hide();
    }
}

function reload() {

    var type = parseInt($('#ElementType').val());
    getSummary();

    switch (type) {
        case 1:
            getActivities();
            break;
        case 2:
            getMilestones();
            break;
        case 3:
            getEvidences();
            getActivities();
            break;
        case 4:
            getIncidents();
            break;
        case 5:
            getRisks();
            break;
        case 6:
            getAgreements();
            break;
        case 7:
            getActionPlan();
            getIncidents();
            getEvidences();
            getActivities();
            break;
        case 8:
            getMitigation();
            getRisks();
            break;
        case 9:
            getContingency();
            getRisks();
            break;
        case 10:
            getControlPoints();
            getEvidences();
            getActivities();
            break;
        default:
            break;
    }

}

function editElement(id, type, title, status, progress, comments, pedit, parent) {

    $('#element_type_name').text(getElementTypeName(type));
    $('#element_name').text(title);
    $('#element_project').text($("#ProjectName").val());
    $('#ElementID').val(id);
    $('#ElementType').val(type);
    $('#ParentID').val(parent);
    $('#Progress').val(parseFloat(progress * 100).toFixed(2));
    $('#Status').val(status);
    $('#Comments').val(comments);

    $('#StatusIndicator').text(getElementStatusName(status));
    setStatusClassName('StatusIndicator', status);

    if (type == 2) {
        $("#dvProgressCheck").show();
        $('#Progress').hide();
        if (progress == 1)
            $('#RealProgress').prop('checked', true);
        else
            $('#RealProgress').prop('checked', false);
    }
    else {
        $('#RealProgress').prop('checked', false);
        $("#dvProgressCheck").hide();
        $('#Progress').show();
    }

    if (!pedit) {
        $('#dvStatusCheck').hide();
        $('#Progress').prop('readonly', true);
    }
    else {
        $('#dvStatusCheck').show();
        $('#Progress').prop('readonly', false);
    }

    if (status == 3) {
        $('#WithImpact').prop('checked', true);
    }
    else {
        $('#WithImpact').prop('checked', false);
    }

    $('#editModal').modal('show');
    $("body").css({ 'padding-right': '0px' });
}

function updateElement() {
    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    if ($('#RealProgress').prop('checked')) {
        $('#Progress').val(100);
    }

    $.ajax({
        type: 'PUT',
        url: '/MyDashboard/UpdatePendingElement',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                if ($('#editModal').hasClass('show'))
                    $('#editModal').modal('toggle');
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onClose: () => reload()
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