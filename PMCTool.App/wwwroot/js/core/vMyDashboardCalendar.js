$(function () {   
    today = new Date();
    y = today.getFullYear();
    m = today.getMonth() + 1;
    d = today.getDate();
    cCalendar.loadData(m, y);
    cCalendar.onLoadActions();
   
});
var dataCalendar = [];
var cCalendar = {
    getDetailElement: function (elementID, elementType) {
        $.each(dataCalendar, function (k, v) {
            var CurDate = dataCalendar[k].startDate;
            var CDate = new Date(CurDate);
            if (elementID == dataCalendar[k].elementID && elementType == dataCalendar[k].elementType) {
                cCalendar.cleanModal();
                cCalendar.openModalDetailsElement(dataCalendar[k]);
            }
        });

    },
    openModalDetailsElement: function (data) {
        
        var projectNameStatus = '<span class="txt-blue">' + data.projectName + '  <span class="bold '
            + getStatusClassName(data.projectStatus) + '">' + getElementStatusName(data.projectStatus) + '</span></span>';
        var elementName = ' '+ data.title + '  <span class="bold ' + getStatusClassName(data.elementStatus) + '">'
            + getElementStatusName(data.elementStatus) + '</span>';
        var elementType = getElementTypeName(data.elementType) + ':';
        $("#project").append(projectNameStatus);
        $("#elementName").append(elementName);
        $("#comment").append(data.comment);
        $("#elementType").append(elementType);
        $("#btn_element").attr('href', cCalendar.getLinkElementType(data.elementType, data.idp, data.elementID));  
        $('#modalElementDetail').modal('show');
    },
    cleanModal: function () {
        $("#project").empty();
        $("#elementName").empty();
        $("#comment").empty();
        $("#elementType").empty();
        $("#btn_element").attr('href','#');
    },
    getColorElement: function (elementType) {
        let className = '';
        switch (elementType) {
            case 1: //Activity
                className = '';
                break;
            case 2: //Milestone
                className = 'element-2';
                break;
            case 3: //Evidence
                className = 'element-19';
                break;
            case 10: //EvidenceControlPoint
                className = 'element-1';
                break;
            case 4: //Inciden
                className = 'element-3';
                break;
            case 7: //ActionPlan
                className = 'element-4';
                break;
            case 5: //Risk
                className = 'element-7';
                break;
            case 8: //RiskMitigation
                className = 'element-8';
                break;
            case 9: //Riskcontingency
                className = 'element-9';
                break;
            case 6: //Agreement
                className = 'element-18';
                break;
        } 
        return className;
    },
    getLinkElementType: function (type, proyectID, elementID) {
        let urlElement = "";
        switch (type) {
            case 1: //Activity
                urlElement = "/Execution/Activity?projectId=" + proyectID + "&activityId=" + elementID;
                break;
            case 2: //Milestone
                urlElement = "/Execution/Milestone?projectId=" + proyectID + "&milestoneId=" + elementID;               
                break;
            case 3: //Evidence
            case 10: //EvidenceControlPoint
                urlElement = "/Execution/Evidence?projectId=" + proyectID + "&evidenceId=" + elementID;
                break;
            case 4: //Inciden
            case 7: //AccionPlan
                urlElement = "/Execution/Incident?projectId=" + proyectID + "&incidentId=" + elementID;
                break;
            case 5: //Risk
            case 8: //RiskMitigation
            case 9: //Riskcontingency
                urlElement = "/Execution/Risk?projectId=" + proyectID + "&riskId=" + elementID;
                break;
            case 6: //Agreement
                urlElement = "/Execution/Agreements?id=" + elementID;
                break;
            default:
                urlElement = "/MyDashboard/Calendar";
                break
        }
        return urlElement;
    },
    loadData: function (month, year) {
        dataCalendar = [];
        $.ajax({
            type: "GET",
            url: '/MyDashboard/getDataCalendar?&month=' + month + '&year=' + year,           
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                //console.log(data);
                $.each(data, function (k, v) {                   
                    var CurDate = data[k].startDate;
                    var CDate = new Date(CurDate);
                    var enDate = data[k].endDate;
                    var enCDate = new Date(enDate);
                    var days = enCDate - CDate;
                    var daysNum = days / (1000 * 60 * 60 * 24);
                    if (data[k].elementType == 7 || data[k].elementType == 8 || data[k].elementType == 9) {
                        if (daysNum >= 1) {
                            var endDate = enCDate.setDate(enCDate.getDate() + 1);
                            var enCDate = new Date(endDate);
                            //console.log(enCDate);
                        }
                        
                    }
                   
                    var color = cCalendar.getColorElement( data[k].elementType);
                    dataCalendar.push({
                        idp: data[k].projectID,
                        title: data[k].elementName,
                        start: cCalendar.formatDate(CDate),
                        end: cCalendar.formatDate(enCDate),
                        projectName: data[k].projectName,
                        elementID: data[k].elementID,
                        elementType: data[k].elementType,
                        elementStatus: data[k].elementStatus,
                        projectStatus: data[k].projectStatus,
                        comment: data[k].comments,
                        className: color
                    });

                   
                });

            },
            complete: function () {                
                LoaderHide();
                cCalendar.init();
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

    },
    init: function () {       
        today = new Date();
        y = today.getFullYear();
        m = today.getMonth() + 1;
        d = today.getDate();

        $calendar = $('#fullCalendar');
        $calendar.fullCalendar({
            plugins: ['list'],
            locale: 'es',
            header: {
                left: 'title',
                right: 'prev,next',
                center: ''
            },
            defaultDate: today,
            selectable: true,
            selectHelper: true,
            views: {
                month: {
                    titleFormat: 'MMMM YYYY'
                },
                week: {
                    titleFormat: "MMMM D YYYY"
                },
                day: {
                    titleFormat: 'D MMM, YYYY'
                }
            },
            eventClick: function (event, jsEvent, view) {
                //AJAX INFO EVENT
                //console.log(event);
                cCalendar.getDetailElement(event.elementID, event.elementType);
            },
            editable: false,
            eventLimit: true,
            events: dataCalendar
        });
        //$('#fullCalendar').fullCalendar('removeEvents');
        //$('#fullCalendar').fullCalendar('addEventSource', dataCalendar);
        //$('#fullCalendar').fullCalendar('refetchEvents');
        
        
       
           
    },
    onLoadActions: function () {
        $('body').on('click', 'button.fc-prev-button', function () {    
            var moment = $('#fullCalendar').fullCalendar('getDate');
            moment.locale('es-us');
            let year = moment.format('YYYY');
            let month = moment.format('MM'); 
            //cCalendar.loadData(month, year);          

        });

        $('body').on('click', 'button.fc-next-button', function () {
            var moment = $('#fullCalendar').fullCalendar('getDate');
            moment.locale('es-us');
            let year = moment.format('YYYY');
            let month = moment.format('MM');
           // cCalendar.loadData(month, year);

        });
    },
    formatDate: function (date) {
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

}


