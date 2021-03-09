function refresh() {
    var projectID = $("#selectProjects").val();
    var project = [];
    project = getProject(projectID);
    $("#projectName").html('');
    $("#projectName").append(project.name);
    $("#currencyName").html('');
    $("#currencyName").append(project.currencyName);
    getProjectActivityCosts(projectID);
    getProjectCosts(projectID);
    drawChartCosts();
    getProjectCostsByDay(project); 
}

function getProjectCostsByDay(project) {
    var startDate;
    var endDate;
    today = formatDate(new Date());
    if (project.startDate != null) {
        startDate = project.startDate.substr(0, 10);
    }
    else {
        startDate = today;
    }
    if (project.endDate != null && project.endDate < today) {
        endDate = project.endDate.substr(0, 10);
    }
    else {
        endDate = today;
    }
    //console.log(project.projectID + '--' + startDate + '--' + endDate);
    $.ajax({
        type: 'GET',
        url: '/Costs/GetProjectCostsByDay',
        dataType: 'json',
        data: { projectId: project.projectID, startDate: startDate, endDate: endDate },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            var categories = [];
            var plannedCost = [];
            var realCost = [];
            for (var i = 0; i < data.length; i++) {
                categories.push(data[i].date.substr(0, 10));
                plannedCost.push(data[i].plannedCost );
                realCost.push(data[i].realCost);
            }
            chartCosts.destroy();
            //if (!typeof chartProgress) { chartProgress.destroy(); }
            drawChartCosts(categories, plannedCost, realCost);
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

function getProjectCosts(projectID) {
    $("#tProjectPlannedCostsActivities").html('');
    $("#tProjectRealCostsActivities").html('');
    $("#tProjectPlannedCostsEvidences").html('');
    $("#tProjectRealCostsEvidences").html('');
    $("#tProjectPlannedCostsTotal").html('');
    $("#tProjectRealCostsTotal").html('');
    $.ajax({
        type: 'GET',
        url: '/Costs/GetDataProjectCosts',
        dataType: 'json',
        data: { projectId: projectID },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            //var obj = '{"costsActivities":14000,"costsEvidences":10000,"costsTotal":24000}';
            //var data = jQuery.parseJSON(obj);
            //console.log(data);
            $("#tProjectRealCostsActivities").append(currencyFormat(data[0].activitiesRealCost));
            $("#tProjectPlannedCostsActivities").append(currencyFormat(data[0].activitiesPlannedCost));
            $("#tProjectRealCostsEvidences").append(currencyFormat(data[0].evidencesRealCost));
            $("#tProjectPlannedCostsEvidences").append(currencyFormat(data[0].evidencesPlannedCost));
            $("#tProjectRealCostsTotal").append(currencyFormat(data[0].totalRealCost));
            $("#tProjectPlannedCostsTotal").append(currencyFormat(data[0].totalPlannedCost));
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

function getProjectActivityCosts(projectID) {
    $("#tProjectActivityCosts").html('');
    $.ajax({
        type: 'GET',
        url: '/Costs/GetDataProjectActivityCosts',
        dataType: 'json',
        data: { projectId: projectID},
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            //var obj = '[{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","description":"Estapa de desarrollo","responsible":"Daniel Padilla","plannedCost":26789,"realCost":10255},{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","description":"Estapa de desarrollo","responsible":"Abraham Carlin","plannedCost":26789,"realCost":10255},{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Establecer los modulos a desarrollar","responsible":"Abraham Carlin","plannedCost":26789,"realCost":10255},{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Tarea de Dani","responsible":"Abraham Carlin","plannedCost":26789,"realCost":10255},{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Pruebas integrales","responsible":"Abraham Carlin","plannedCost":26789,"realCost":10255}]';
            //var data = jQuery.parseJSON(obj);
            //console.log(data);
            for (var i = 0; i < data.length; i++) {
                var markup = '<tr>'
                    + '<td><a target="_blank" href=' + getLinkElementType(1, projectID, data[i].id) + '>' + data[i].text + '</a></td>'
                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                    + '<td>' + currencyFormat(data[i].cost) + '</td>'
                    + '<td>' + currencyFormat(data[i].realCost) + '</td>'
                    + '<td><button class="btn btn-round btn-sm" onClick="getActivityCostsDetail(' + "'" + data[i].id + "','" + projectID + "','" + data[i].text + "','" + currencyFormat(data[i].cost) + "','" + currencyFormat(data[i].realCost) + "'" + ' );">' + $.i18n._('detail') + '</button></td>'
                    + '</tr>';
                   
                $("#tProjectActivityCosts").append(markup);
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
function  cleanModal() {
    $("#activityName").empty();
    $("#plannedCost").empty();
    $("#realCost").empty();
}

function getActivityCostsDetail(activityID, projectID, activityName, plannedCost, realcost) {
    cleanModal();
    $("#activityName").append(activityName);
    $("#plannedCost").append(plannedCost);
    $("#realCost").append(realcost);
    
    $("#tProjectActivityEvidences").html('');
    $("#tProjectActivityParticipants").html('');
    $.ajax({
        type: 'GET',
        url: "/Costs/GetDataProjectActivityCostsDetail",
        dataType: 'json',
        data: { projectId: projectID, activityId: activityID },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            var participants = data.participants;
            var evidences = data.evidences;
            //console.log(data);
            var totalPlannedEvidenceCost = 0;
            var totalRealEvidenceCost = 0;
            if (evidences.length > 0) {
                for (var i = 0; i < evidences.length; i++) {
                    totalPlannedEvidenceCost = totalPlannedEvidenceCost + evidences[i].plannedCost;
                    totalRealEvidenceCost = totalRealEvidenceCost + evidences[i].realCost;
                    var markup = '<tr>'
                        + '<td><a target="_blank" href=' + getLinkElementType(3, projectID, evidences[i].projectEvidenceID) + '>' + evidences[i].description + '</a></td>'
                        + '<td><span class="bold ' + getStatusClassName(evidences[i].status) + ' pb-1 ws">' + getElementStatusName(evidences[i].status) + '</span></td>'
                        + '<td>' + currencyFormat(evidences[i].plannedCost) + '</td>'
                        + '<td>' + currencyFormat(evidences[i].realCost) + '</td>'
                        + '</tr>';
                    $("#tProjectActivityEvidences").append(markup);
                }
            } else {
                var markup = '<tr>'
                    + '<td colspan="4">' + $.i18n._('noRecordsFound') + '</td>'
                    + '</tr>';
                $("#tProjectActivityEvidences").append(markup);
            }
            var markupTotal = '<tr>'
                + '<td colspan="2" class="text-right"> <strong>Total:</strong></td>'
                + '<td><strong>' + currencyFormat(totalPlannedEvidenceCost) + '</strong></td>'
                + '<td><strong>' + currencyFormat(totalRealEvidenceCost) + '</strong></td>'
                + '</tr>';
            $("#tProjectActivityEvidences").append(markupTotal);

            var totalPlannedParticipantCost = 0;
            var totalRealParticipantCost = 0;
            if (participants != '') {
                for (var i = 0; i < participants.length; i++) {
                    totalPlannedParticipantCost = totalPlannedParticipantCost + participants[i].plannedCost;
                    totalRealParticipantCost = totalRealParticipantCost + participants[i].realCost;
                    var markupP = '<tr>'
                        + '<td>' + participants[i].participantName + '</td>'
                        + '<td>' + currencyFormat(participants[i].plannedCost) + '</td>'
                        + '<td>' + currencyFormat(participants[i].realCost) + '</td>'
                        + '</tr>';
                    $("#tProjectActivityParticipants").append(markupP);
                }
            } else {
                var markupP = '<tr>'
                    + '<td colspan="3">' + $.i18n._('noRecordsFound') +  '</td>'
                    + '</tr>';
                $("#tProjectActivityParticipants").append(markupP);
            }
            var markupTotalP = '<tr>'
                + '<td class="text-right"> <strong>Total:</strong></td>'
                + '<td><strong>' + currencyFormat(totalPlannedParticipantCost) + '</strong></td>'
                + '<td><strong>' + currencyFormat(totalRealParticipantCost) + '</strong></td>'
                + '</tr>';
            $("#tProjectActivityParticipants").append(markupTotalP);

            $('#costsModal').modal('show');
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

function getProject(projectId) {
    var result = [];
    $.ajax({
        method: "GET",
        url: "/Costs/GetDataProject?projectId=" + projectId,
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return result;
}

function drawChartCosts(categories, plannedCost, realCost){
    chartCosts = new Highcharts.chart('costos', {

        title: {
            text: ''
        },
        chart: { type: 'line', zoomType: 'x y' },
        subtitle: {
            text: ''
        },
        xAxis: { categories: categories },

        yAxis: {
            title: {
                text: $.i18n._('cost')
            }
        },
        tooltip: {
            formatter: function () {
                return '$' + this.y.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },

        //plotOptions: {
        //    series: {
        //        label: {
        //            connectorAllowed: false
        //        },
        //        pointStart: 2010
        //    }
        //},

        series: [{
            name: $.i18n._('plannedCost'),
            data: plannedCost,
            color: '#447DF7'
        }, {
                name: $.i18n._('realCost'),
                data: realCost,
            color: '#FF0000'
        }],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 800
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
}


function getLinkElementType(type, proyectID, elementID) {
    let urlElement = "";
    switch (type) {
        case 1: //Activity
            urlElement = "/Execution/Activity?projectId=" + proyectID + "&activityId=" + elementID;
            break;
        case 2: //Milestone
            urlElement = "/Execution/Milestone?projectId=" + proyectID + "&milestoneId=" + elementID;
            break;
        case 3: //Evidence
            urlElement = "/Execution/Evidence?projectId=" + proyectID + "&evidenceId=" + elementID;
            break;
        case 4: //Inciden
            urlElement = "/Execution/Incident?projectId=" + proyectID + "&incidentId=" + elementID;
            break;
        case 5: //Risk
            urlElement = "/Execution/Risk?projectId=" + proyectID + "&riskId=" + elementID;
            break;
        case 6: //Agreement
            urlElement = "/Execution/Agreements?id=" + proyectID;
            break;
        default:
            urlElement = "/Costs/Projects";
            break
    }
    return urlElement;
}
function currencyFormat(num) {
    return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}
//Formatear fecha
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    return [year, month, day].join('-');
}