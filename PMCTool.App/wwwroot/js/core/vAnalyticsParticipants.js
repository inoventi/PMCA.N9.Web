$(function () {
    Diccionario.selects();
    vAnalytics.getParticipants();
    vAnalytics.acProyectsParticipants();
    vAnalytics.acSearchParticipant();
    vAnalytics.acBtnplannedvsrreals();
    vAnalytics.acBtnplannedvsrrealsr();
    vAnalytics.acBtnSearchHoursParticipant();
    vAnalytics.acDatePicker();
 });
var Diccionario = {
    selects: function () {
        $('#selectParticipants').removeData('title');
        $('#singleparticipants').removeData('title');
        $('#projectsParticipants').removeData('title');
        $('#selectParticipants').attr('data-title', $.i18n._("Analytics2_027"));
        $('#singleparticipants').attr('data-title', $.i18n._("Analytics2_026"));
        $('#projectsParticipants').attr('data-title', $.i18n._("Analytics2_025"));
    }
}
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
function OcultarModal(b) {
    var id = $(b).data('id');
     $('#' + id).remove();
}
function mostrarModal(a) {
    var id = $(a).data('id');
    var nombre = $(a).data('name');
     $.ajax({
        type: 'GET',
        url: '/Analytics/GetElementsAssignedByParticipant',
        dataType: 'json',
        data: { participantid: $(a).data('idparticipant') },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
             $('#' + id + 'P').remove();
            var elementosAsignados = data;
            var renglonesTabla = "";
            var arregloProyecto = [];
            var tablaPorProyecto = [];
            for (a = 0; a < elementosAsignados.length; a++) {
                arregloProyecto = elementosAsignados[a].projectID;
                if (a != 0) {
                    if (arregloProyecto != elementosAsignados[a - 1].projectID) {
                        var proyectouno = elementosAsignados[a];
                        for (d = 0; d < elementosAsignados.length; d++) {
                            if (elementosAsignados[d].projectID == proyectouno.projectID) {
                                var elemento = "";
                                var estado = "";
                                switch (elementosAsignados[d].elementType) {
                                    case 1:
                                        elementType = '<td><a href="/Execution/Activity?projectId=' + elementosAsignados[d].projectID + '&activityId=' + elementosAsignados[d].elementID + '">' + $.i18n._("activity") + '</a></td>'
                                        break;
                                    case 2:
                                        elementType = '<td><a href="/Execution/Milestone?projectId=' + elementosAsignados[d].projectID + '&milestoneId=' + elementosAsignados[d].elementID + '">' + $.i18n._("milestone") + '</a></td>'
                                        break;
                                    case 3:
                                        elementType = '<td><a href="/Execution/Evidence?projectId=' + elementosAsignados[d].projectID + '&evidenceId=' + elementosAsignados[d].elementID + '">' + $.i18n._("evidence") + '</a></td>'
                                        break;
                                    case 4:
                                        elementType = '<td><a href="/Execution/Incident?projectId=' + elementosAsignados[d].projectID + '&incidentId=' + elementosAsignados[d].elementID + '">' + $.i18n._("incident") + '</a></td>'
                                        break;
                                    case 5:
                                        elementType = '<td><a href="/Execution/Risk?projectId=' + elementosAsignados[d].projectID + '&riskId=' + elementosAsignados[d].elementID + '">' + $.i18n._("risk") + '</a></td>'
                                        break;
                                    case 6:
                                        elementType = '<td><a href="/Execution/Agreements?id=' + elementosAsignados[d].projectID + '">' + $.i18n._("agreement") + '</a></td>'
                                        break;

                                }
                                switch (elementosAsignados[d].status) {
                                    case 1:
                                        estado = '<td><span class="bold st-entiempo pb-1  ws">' + $.i18n._("elementStatusName_1") + '</span></td >';
                                        break;
                                    case 2:
                                        estado = '<td><span class="bold st-atrasado pb-1  ws">' + $.i18n._("elementStatusName_2") + '</span></td >';
                                        break;
                                    case 3:
                                        estado = '<td><span class="bold st-cimpacto pb-1  ws">' + $.i18n._("elementStatusName_3") + '</span></td >';
                                        break;
                                    case 4:
                                        estado = '<td><span class="bold st-cerrado pb-1  ws">' + $.i18n._("elementStatusName_4") + '</span></td >';
                                        break;
                                    case 5:
                                        estado = '<td><span class="bold st-cancelado pb-1  ws">' + $.i18n._("elementStatusName_5") + '</span></td >';
                                        break;
                                }
                                var fecha = elementosAsignados[d].endDate;
                                fecha = fecha.split('T')[0];
                                var comentario = elementosAsignados[d].comment;
                                if (comentario == null) {
                                    comentario = "Sin comentario";
                                }
                                var avance = elementosAsignados[d].progress;
                                avance = avance * 100; 
                                //NO SE MOSTRARAN LOS ELEMENTOS QUE TENGAN COMO ESTADO CERRADO O CANCELADO
                                if (elementosAsignados[d].status == 4) {
                                    //NO IMPRIMER LOS ELEMENTOS CERRADOS
                                } else if (elementosAsignados[d].status == 5) {
                                    //NO IMPRIME LOS ELEMENTOS CANCELADOS
                                } else {
                                    renglonesTabla = renglonesTabla + '<tr>' + elementType + '<td>' + elementosAsignados[d].elementDescription + '</td><td>' + comentario + '</td><td>' + avance + '%</td><td>' + fecha + '</td>' + estado + '</tr>';
                                 }
                                
                                
                            }
                        }
                        tablaPorProyecto.push('<div class="col-md-12 mt-3">'
                            + '<div class="row marco-tablas mb-3" >'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + elementosAsignados[a].projectName + '</h6>'
                            + '<div class="row">'
                            + '<div class="col-md-12 data-tables">'
                            + '<div class="card-body table-striped table-no-bordered table-hover dataTable dtr-inline table-full-width">'
                            + '<div class="toolbar">'
                            + '</div>'
                            + '<div class="fresh-datatables">'
                            + '<table id="datatables" class="table table-striped table-no-bordered table-hover" cellspacing="0" width="100%" style="width:100%">'
                            + '<thead>'
                            + '<tr>'
                            + '<th> ' + $.i18n._('Analytics2_015') + '</th>'
                            + '<th> ' + $.i18n._("description") + '</th>'
                            + '<th> ' + $.i18n._("comment") + '</th>'
                            + '<th> ' + $.i18n._("progress") + ' </th>'
                            + '<th> ' + $.i18n._("plannedEndDate") + '</th>'
                            + '<th> ' + $.i18n._("status") + '</th>'
                            + '</tr>'
                            + '</thead>'
                            + '<tbody>'
                            + renglonesTabla
                            + '</tbody>'
                            + '</table>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>');
                        renglonesTabla = "";
                    }
                } else {
                    var proyectouno = elementosAsignados[a];
                    for (c = 0; c < elementosAsignados.length; c++) {
                        if (elementosAsignados[c].projectID == proyectouno.projectID) {
                            var elemento = "";
                            var estado = "";
                            switch (elementosAsignados[c].elementType) {
                                case 1:
                                    elementType = '<td><a href="/Execution/Activity?projectId=' + elementosAsignados[c].projectID + '&activityId=' + elementosAsignados[c].elementID + '">  ' + $.i18n._("activity") + ' </a></td>'
                                    break;
                                case 2:
                                    elementType = '<td><a href="/Execution/Milestone?projectId=' + elementosAsignados[c].projectID + '&milestoneId=' + elementosAsignados[c].elementID + '"> ' + $.i18n._("milestone") + ' </a></td>'
                                    break;
                                case 3:
                                    elementType = '<td><a href="/Execution/Evidence?projectId=' + elementosAsignados[c].projectID + '&evidenceId=' + elementosAsignados[c].elementID + '"> ' + $.i18n._("evidence") + ' </a></td>'
                                    break;
                                case 4:
                                    elementType = '<td><a href="/Execution/Incident?projectId=' + elementosAsignados[c].projectID + '&incidentId=' + elementosAsignados[c].elementID + '"> ' + $.i18n._("incident") + ' </a></td>'
                                    break;
                                case 5:
                                    elementType = '<td><a href="/Execution/Risk?projectId=' + elementosAsignados[c].projectID + '&riskId=' + elementosAsignados[c].elementID + '"> ' + $.i18n._("risk") + ' </a></td>'
                                    break;
                                case 6:
                                    elementType = '<td><a href="/Execution/Agreements?id=' + elementosAsignados[c].projectID + '"> ' + $.i18n._("agreement") + ' </a></td>'
                                    break;

                            }
                            switch (elementosAsignados[c].status) {
                                case 1:
                                    estado = '<td><span class="bold st-entiempo pb-1  ws">' + $.i18n._("elementStatusName_1") + '</span></td >';
                                    break;
                                case 2:
                                    estado = '<td><span class="bold st-atrasado pb-1  ws">' + $.i18n._("elementStatusName_2") + '</span></td >';
                                    break;
                                case 3:
                                    estado = '<td><span class="bold st-cimpacto pb-1  ws">' + $.i18n._("elementStatusName_3") + '</span></td >';
                                    break;
                                case 4:
                                    estado = '<td><span class="bold st-cerrado pb-1  ws">' + $.i18n._("elementStatusName_4") + '</span></td >';
                                    break;
                                case 5:
                                    estado = '<td><span class="bold st-cancelado pb-1  ws">' + $.i18n._("elementStatusName_5") + '</span></td >';
                                    break;
                            }
                            var fecha = elementosAsignados[c].endDate;
                            fecha = fecha.split('T')[0];
                             var comentario = elementosAsignados[c].comment;
                            if (comentario == null) {
                                comentario = "Sin comentario";
                            }
                            var avance = elementosAsignados[c].progress;
                            avance = avance * 100;
                            //NO SE MOSTRARAN LOS ELEMENTOS QUE TENGAN COMO ESTADO CERRADO O CANCELADO
                            if (elementosAsignados[c].status == 4) {
                                //NO IMPRIMER LOS ELEMENTOS CERRADOS
                            } else if (elementosAsignados[c].status == 5) {
                                //NO IMPRIME LOS ELEMENTOS CANCELADOS
                            } else {
                                renglonesTabla = renglonesTabla + '<tr>' + elementType + '<td>' + elementosAsignados[c].elementDescription + '</td><td>' + comentario + '</td><td>' + avance + '%</td><td>' + fecha + '</td>' + estado + '</tr>';
                            }
                        }
                    }
                    tablaPorProyecto.push('<div class="col-md-12 mt-3">'
                        + '<div class="row marco-tablas mb-3" >'
                        + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + elementosAsignados[a].projectName + '</h6>'
                        + '<div class="row">'
                        + '<div class="col-md-12 data-tables">'
                        + '<div class="card-body table-striped table-no-bordered table-hover dataTable dtr-inline table-full-width">'
                        + '<div class="toolbar">'
                        + '</div>'
                        + '<div class="fresh-datatables">'
                        + '<table id="datatables" class="table table-striped table-no-bordered table-hover" cellspacing="0" width="100%" style="width:100%">'
                        + '<thead>'
                        + '<tr>'
                        + '<th> ' + $.i18n._('Analytics2_015') + '</th>'
                        + '<th> ' + $.i18n._("description") + '</th>'
                        + '<th> ' + $.i18n._("comment") +'</th>'
                        + '<th> ' + $.i18n._("progress") +' </th>'
                        + '<th> ' + $.i18n._("plannedEndDate") +'</th>'
                        + '<th> ' + $.i18n._("status") +'</th>'
                        + '</tr>'
                        + '</thead>'
                        + '<tbody>'
                        + renglonesTabla
                        + '</tbody>'
                        + '</table>'
                        + '</div>'
                        + '</div>'
                        + '</div>'
                        + '</div>'
                        + '</div>'
                        + '</div>');
                    renglonesTabla = "";
                }
                
                
            }
            
            
            $('#tablaParticipante').append('<div class="modal-body"  id="' + id +'P" >'
                + '<div class="row text-center marco-tablas justify-content-center">'
                + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12 encabezado" >' + nombre +'</h6>'
                + '<div id="' + id +'" class="col-md-11">'
                + '</div>'
                + '<button class="btn btn-default btn-wd mt-1" data-id="' + id + 'P" onclick="OcultarModal(this);">' + $.i18n._('Analytics2_014') +'</button>'
                + '</div>'
                + '</div>');
             $('#' + id).append(tablaPorProyecto);
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            LoaderHide();

        }
    })
    
}
var modal = {
    pendientesFinalizar: function () {
        $('#ModalAsignacionesPendientes').modal('show');
        $('#Participante').html($.i18n._('Analytics2_012'));
    }
}
var ArrayParticipants = {}
var vAnalytics = {
    acDatePicker: function () { 
        $('.datepicker').datetimepicker({
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
        });
    },
    acBtnSearchHoursParticipant: function () {  
         $('#formAvailability').validate({
                rules: {
                    singleparticipants: {
                        required: true
                    },
                    projectsParticipants: {
                        required: true
                    },
                    adatestart: {
                        required:true
                    },
                    adateend: {
                        required: true
                    } 
                },
            errorPlacement: function (error, element) { 
                $("button").find("[data-id='singleparticipants']").css("border", "solid red 1px");
                    $('#singleparticipants').css("border", "solid red 1px");
                    $('#projectsParticipants').css("border", "solid red 1px");
                    $('#adatestart').css("border", "solid red 1px");
                    $('#adateend').css("border", "solid red 1px");
                    return true;

                },
                submitHandler: function (form) {
                    let data = {
                        participantId: $('#singleparticipants').val(),
                        projectsIds: $('#projectsParticipants').val(),
                        dateStart: $('#adatestart').val(),
                        dateEnd: $('#adateend').val() 
                    };
                    if (new Date($('#adatestart').val()) > new Date($('#adateend').val())) { 
                        Swal.fire(
                            ' ',
                            $.i18n._('Analytics2_007'),
                            'warning'
                        )
                        helper.highlightInput('#adateend'); 
                        return false;
                    }
                    vAnalytics.executeReportAvailability(data);
                    return false; 
                }
         });
        
    },
    executeReportAvailability: function (data) {
         formData = new FormData();
        formData.append("participantId", $("#singleparticipants").val());
        formData.append("projectsIds", $("#projectsParticipants").val());
        formData.append("dateStart", $("#adatestart").val());
        formData.append("dateEnd", $("#adateend").val());

        $.ajax({
            type: 'POST',
            url: '/Analytics/GetReportAvailability',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                
                vAnalytics.proccessReportAvailability(data);
                vAnalytics.createDataHoursPlanned(data);
            },
            complete: function () {
                LoaderHide();
            },
            error: function (xhr, status, error) {
                LoaderHide();
                 
            }
        })
    },
    proccessReportAvailability: function (jsondata) {
        let projects = jsondata.projects;
        let data = jsondata.data;
        let element = $('._boxinfo');
        element.empty();
         
        for (var i = 0; i < projects.length; i++) {
             element.append('<div class="col-md-12"> <h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue-2 col-12">' + projects[i].projectName +'</h6>  </div>')
            let count = 0;
            let totalrows = data.length;
            let xhtml = "";
            let totalproject = 0; 
            for (var j = 0; j < data.length; j++) {
                if (projects[i].projectID == data[j].projectID) {
                    let plannedHours = helper.convertDecimaltoHours(data[j].plannedHours);
                    if (count == 0) {
                        xhtml = '<div class="col-md-12"><table id="datatables" class="table table-striped table-no-bordered table-hover" cellspacing="0" width="100%" style="width:100%"><thead> <tr> <th>WBS</th> <th>' + $.i18n._('Actividad') + '</th> <th>' + $.i18n._('plannedHours') +'</th> </tr> </thead> <tbody>';

                        xhtml = xhtml + '<tr><td>' + data[j].wbs + '</td><td>' + data[j].elementDescripcion + '</td><td>' + plannedHours + '</td></tr>';
                        totalproject = totalproject + data[j].plannedHours;
                    } else {
                        xhtml = xhtml + '<tr><td>' + data[j].wbs + '</td><td>' + data[j].elementDescripcion + '</td><td>' + plannedHours + '</td></tr>';
                        totalproject = totalproject + data[j].plannedHours;
                    }

                    //if (totalrows == j) {
                    //    element.append(vAnalytics.addClosetableprojects());
                    //}
                    count = 10;
                     
                }
               
               
            }
            
            xhtml = xhtml + '<tr> <td class="text-right" colspan="2" style = "font-weight: 600" > Total:</td> <td>' + helper.convertDecimaltoHours(totalproject)+'</td> </tr>'+ '</tbody> </table></div>';
            element.append(xhtml);
        }

    },
    createDataHoursPlanned: function (request) {
        let data = request.chart;
        var categories = [];
        var series = [];
        var limit = [];

        for (var i = 0; i < data.length; i++) {
            categories.push(data[i].date.substring(0, 10));
            series.push((((data[i].plannedHours * 1000) * 60) * 60));
            limit.push(28800000);
        }

         
        vAnalytics.drawChart(categories, series, limit);

    },
    drawChart: function(categories, plannedHours, limit) {
        var chart = new Highcharts.chart('aesperado', {
            colors: ['#5BC6F7', '#F50909', '#1587BB', '#940909', '#ccc', '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
            chart: { type: 'line', zoomType: 'x y' }, title: { text: '' }, subtitle: { text: '' },
            xAxis: { categories: categories },
            yAxis: {
                title: { text: $.i18n._('manHours') },
                labels: {
                    formatter: function () {
                        var hours = (((this.value / 1000) / 60) / 60).toFixed(2);
                        var hourPortion = hours.toString().split(".")[0];
                        var minPortion = hours.toString().split(".")[1];
                        var minPortionUsed = (parseInt(hours.toString().split(".")[1]) * 0.6).toFixed(0);
                        if (minPortionUsed < 10) {
                            minPortionUsed = '0' + minPortionUsed.toString();
                        }
                        if (hourPortion.length < 2)
                            hourPortion = "0" + hourPortion;
                        return hourPortion + ':' + minPortionUsed + ':00';
                    }
                }
            },
            tooltip: {
                formatter: function () {
                    var hora = this.y;
                    var hourPortion = hora.toString().split(".")[0];
                    var minPortion = hora.toString().split(".")[1];
                    var minPortionUsed = (parseInt(hora.toString().split(".")[1]) * 0.6).toFixed(2);
                    var longitud = minPortionUsed.length;
                    if (longitud == 1) {
                        minPortionUsed = minPortionUsed * 10;
                    }
                    if (minPortionUsed < 10) {
                        minPortionUsed = '0' + minPortionUsed.toString();
                    }
                    var minu = isNaN(minPortionUsed);
                    if (minu == true) {
                        minPortionUsed = '00';
                    }
                    if (hourPortion.length < 2)
                        hourPortion = "0" + hourPortion;
                    return 'Horas: ' + hourPortion + ':' + minPortionUsed + ':00';
                    //return 'Horas: ' + Highcharts.dateFormat('%H:%M:%S', this.y);
                }
            },
            tooltip: {
                formatter: function () {
                    var hours = (((this.y / 1000) / 60) / 60).toFixed(2);
                    var hourPortion = hours.toString().split(".")[0];
                    var minPortion = hours.toString().split(".")[1];
                    var minPortionUsed = (parseInt(hours.toString().split(".")[1]) * 0.6).toFixed(0);
                    if (minPortionUsed < 10) {
                        minPortionUsed = '0' + minPortionUsed.toString();
                    }
                    if (hourPortion.length < 2)
                        hourPortion = "0" + hourPortion;
                    return 'Horas: ' + hourPortion + ':' + minPortionUsed + ':00';
                    //return 'Horas: ' + Highcharts.dateFormat('%H:%M:%S', this.y);
                }
            },
            plotOptions: {
                series: {
                    animation: {
                        duration: 1500
                    },
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                if (event.point.colorIndex == 0) {
                                    let participantID = $('#singleparticipants').val();
                                    for (var i = 0, ien = ArrayParticipants.length; i < ien; i++) {
                                        let idparticipant = ArrayParticipants[i].key;
                                        if (idparticipant == participantID) {
                                            var NameParticipant = ArrayParticipants[i].value;
                                        }
                                    }
                                    formData = new FormData();
                                    formData.append("participantId", $('#singleparticipants').val());
                                    formData.append("projectsIds", $('#projectsParticipants').val());
                                    formData.append("dateStart", event.point.category);
                                    formData.append("dateEnd", event.point.category);
                                    $.ajax({
                                        type: 'POST',
                                        url: '/Analytics/GetReportAvailabilityByDayAndByParticipant',
                                        dataType: 'json',
                                        data: formData,
                                        processData: false,
                                        contentType: false,
                                        beforeSend: function () {
                                            LoaderShow();
                                        },
                                        success: function (data) {
                                            $('#ModalReporteDisponibilidad').modal('show');
                                            $('#RDisponibilidadParticipante').empty();
                                            $('#tReporteDisponibilidad').empty();
                                            $('#RDisponibilidadParticipante').append(NameParticipant);
                                            var orderByProject = data.projects;
                                            var HourTotalPlaned = 0;
                                            for (var b = 0, ien = orderByProject.length; b < ien; b++) {
                                                HourTotalPlaned = HourTotalPlaned + orderByProject[b].plannedHours;
                                                $('#tReporteDisponibilidad').append('<tr><td>' + orderByProject[b].projectName + '</td><td>' + orderByProject[b].elementDescripcion + '</td><td>' + helper.convertDecimaltoHours(orderByProject[b].plannedHours) + '</td></tr>');
                                            }
                                            $('#tReporteDisponibilidad').append('<tr> <td class="text-right" colspan="2" style="font-weight: 600"> Total:</td> <td>' + helper.convertDecimaltoHours(HourTotalPlaned) + '</td> </tr>');
                                        },
                                        complete: function () {
                                            LoaderHide();
                                        },
                                        error: function (xhr, status, error) {
                                            LoaderHide();

                                        }
                                    });
                                }

                            }
                        }
                    }
                }
            }
            , series: [{ name: $.i18n._('plannedHours'), data: plannedHours }, { name: $.i18n._('Limit'), data: limit }]
        });
},
    formatDate: function (date) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0! 
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        } if (mm < 10) {
            mm = '0' + mm
        }
        return today =yyyy+'-'+mm+'-' + dd;

    },
    addClosetableprojects: function () {
        return ' </tbody> </table> </div > </div> ';
    },
    addRowTableproject: function (date,wbs,descipcion,total) {
        return '<tr><td> ' + date + '</td><td>' + wbs + '</td><td>' + descipcion + '</td><td>' + total +'</td></tr>';
    },
    getHeadTableproject: function (idx) {
        return '<div class="col-md-12"> <div class="row marco-tablas" > <table id="datatables" class="table table-striped table-no-bordered table-hover" cellspacing="0" width="100%" style="width:100%"><thead> <tr>  <th>' + $.i18n._('Analytics2_018') + '</th> <th>WBS</th> <th>' + $.i18n._('Actividad') + '</th> <th>' + $.i18n._('plannedHours') +'</th> </tr> </thead> <tbody></tbody> </table> </div > </div>';
    },
    getHtmlProject: function (projectName) {
        return '<div class="col-md-12"> <div class="row text-center" > <h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue-2 col-12">' + projectName+'</h6> </div > </div >';
    },
    acProyectsParticipants: function () {
        let singleparticipants = $('#singleparticipants');
        let projectsParticipants = $('#projectsParticipants');
        singleparticipants.change(function () { 
            let participantsIDS = $('#singleparticipants').val();
            if (participantsIDS != "") {
                vAnalytics.getProyectsParticipants(participantsIDS, projectsParticipants);
            } else {
                $('#singleparticipants').css("border", "solid red 1px");

            }



        });

    },
    getProyectsParticipants: function (participantsIDS, projectsParticipants) {
        projectsParticipants.empty();
        $.ajax({
            method: "GET",
            url: "/Analytics/GetProyectsParticipants?&participantId=" + participantsIDS,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                data = data.projects;
                for (var i = 0, ien = data.length; i < ien; i++) { 
                    let fullName = data[i]["value"];
                    projectsParticipants.append('<option value="' + data[i]["key"] + '">' + fullName + '</option>');
                     fullName = null; 
                }
                projectsParticipants.selectpicker('refresh');
 
            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });

    },
    acBtnplannedvsrrealsr: function () {
        let btn = $('.btnplannedvsrrealsr');
        btn.click(function () {
            $('#vpr').validate({
                rules: {
                    datestartr: {
                        required: true
                    },
                    dateendr: {
                        required: true
                    }
                },
                errorPlacement: function (error, element) {
                    $('#datestartr').css("border", "solid red 1px");
                    $('#dateendr').css("border", "solid red 1px");
                    return true;

                },
                submitHandler: function (form) {
                    let participantsIDS = $('#selectParticipants').val();
                    if (participantsIDS != "") {
                        let datestart = $('#datestartr').val();
                        let dateend = $('#dateendr').val();
                        if (new Date(datestart) > new Date(dateend)) { 
                            Swal.fire(
                                ' ',
                                $.i18n._('Analytics2_007'),
                                'question'
                            )
                            helper.highlightInput('#datestartr');
                            return false;
                        }
                        vAnalytics.executeChartE(participantsIDS, datestart, dateend);
                    } else {
                        Swal.fire(
                            ' ',
                            $.i18n._('Analytics2_008'),
                            'warning'
                        )
                        helper.highlightInput('#selectParticipants');
                       // $('#selectParticipants').css("border", "solid red 1px");
                        $('html, body').animate({
                            scrollTop: $("#selectParticipants").offset().top
                        }, 10);
                    }

                    return false; 
                }
            });
        });
    },
    executeChartE: function (participantsIDS, datestart, dateend) {

        $.ajax({
            method: "GET",
            url: "/Analytics/GetTotalHoursReal_ByParticipantSelection?&participantsIDS=" + participantsIDS + '&dateStart=' + datestart + '&dateEnd=' + dateend,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                vAnalytics.processDataChartE(data);
            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });
    },
    acBtnplannedvsrreals: function () {
        let btn = $('.btnplannedvsrreals');


        btn.click(function () {
            $('#vp').validate({
                rules: {
                    datestart: {
                        required: true
                    },
                    dateend: {
                        required: true
                    }
                },
                errorPlacement: function (error, element) {
                    $('#datestart').css("border", "solid red 1px");
                    $('#dateend').css("border", "solid red 1px");
                    return true;

                },
                submitHandler: function (form) {
                    let participantsIDS = $('#selectParticipants').val();
                    if (participantsIDS != "") {
                        let datestart = $('#datestart').val();
                        let dateend = $('#dateend').val(); 
                        if (new Date(datestart) > new Date(dateend)) {
                            Swal.fire(
                                ' ',
                                $.i18n._('Analytics2_007'),
                                'question'
                            )
                            helper.highlightInput('#datestart');
                            return false;
                        }
                        vAnalytics.executeChartD(participantsIDS, datestart, dateend);
                    } else { 
                        Swal.fire(
                            ' ',
                            $.i18n._('Analytics2_008'),
                            'warning'
                        )
                        helper.highlightInput('#selectParticipants');
                        $('html, body').animate({
                            scrollTop: $("#selectParticipants").offset().top
                        }, 10);
                    }

                    return false;  
                }
            });
        });
    },
    executeChartD: function (participantsIDS, datestart, dateend) {
        $.ajax({
            method: "GET",
            url: "/Analytics/GetAssignedHoursvsRealsPerParticipants?&participantsIDS=" + participantsIDS + '&dateStart=' + datestart + '&dateEnd=' + dateend,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                vAnalytics.processDataChartD(data);
            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });
    },
    processDataChartE: function (data) {
        let respuesta = data;
         let element = $('._tbodyr')
        element.empty();
        //Llenamos la data 
        for (var i = 0; i < respuesta.length; i++) {
            element.append('<tr> <td class= "columnaAsignacionPendiente" > <strong>' + respuesta[i]['participantName'] + '</strong></td ><td>' + helper.convertDecimaltoHours(respuesta[i]['totalHours']) + '</td><td><button class="btn btn-round btn-sm" data-participantname="' + respuesta[i]['participantName'] + '" data-dateendr="' + $("#dateendr").val() + '" data-datestartr="' + $("#datestartr").val() + '" data-participantid="' + respuesta[i]['participantID'] + '" onclick="vAnalytics.GetDatailHoursReals(this)">' + $.i18n._('Analytics2_011') +'</button></td></tr > ');
        
        }

 
    },
    GetDatailHoursReals: function (e) {
        formData = new FormData();
        formData.append("participantId", $(e).data('participantid'));
        formData.append("dateStart", $(e).data('datestartr'));
        formData.append("dateEnd", $(e).data('dateendr'));
         let participantName = $(e).data('participantname');
        //aqui
        $.ajax({
            type: 'POST',
            url: "/Analytics/GetDetailsHoursRealsByParticipant",
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                $('._hparticipant').empty().html(participantName);
                
                let table = $('#tabladetallehoras');
                table.empty();
                var elements = data.data;
                var arregloProyectos = [];
                var renglonesTabla = [];
                var tablaPorProyectos = [];
                for (var a = 0; a < elements.length; a++) {
                    arregloProyectos = elements[a].projectName;
                    if (a != 0) {
                        if (arregloProyectos != elements[a - 1].projectName) {
                            var proyectouno = elements[a];
                            for (var b = 0; b < elements.length; b++) {
                                if (elements[b].projectName == proyectouno.projectName) {
                                    var comentario = elements[b].elementComment;
                                    var horasreales = helper.convertDecimaltoHours(elements[b].totalHours);
                                    var fecha = elements[b].elementDate.substr(0, 10);
                                    renglonesTabla = renglonesTabla + '<tr><td>' + elements[b].elementDescripcion + '</td><td>' + fecha + '</td><td>' + comentario + '</td><td>' + horasreales + '</td></tr>';
                                }
                            }
                            tablaPorProyectos.push('<div class="col-md-12 mt-3">'
                                + '<div class="row marco-tablas mb-3">'
                                + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + elements[a].projectName + '</h6>'
                                + '<div class="col-md-12">'
                                + '<div class="row">'
                                + '<div class="col-md-12 data-tables">'
                                + '<div class="card-body table-striped table-no-bordered table-hover dataTable dtr-inline table-full-width">'
                                + '<div class="toolbar">'
                                + '</div>'
                                + '<div class="fresh-datatables">'
                                + '<table id="datatables" class="table table-striped table-no-bordered table-hover" cellspacing="0" width="100%" style="width:100%">'
                                + '<thead>'
                                + '<tr>'
                                + '<th> ' + $.i18n._('Analytics2_022') +' </th>'
                                + '<th> ' + $.i18n._('Analytics2_028') +' </th>'
                                + '<th> ' + $.i18n._('comment') +' </th>'
                                + '<th> ' + $.i18n._('Analytics2_029') +' </th>'
                                + '</tr>'
                                + '</thead>'
                                + '<tbody>'
                                + renglonesTabla
                                + '</tbody>'
                                + '</table>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>'
                                + '</div>');
                            renglonesTabla = "";
                        }
                    } else {
                        var proyectouno = elements[a];
                        for (c = 0; c < elements.length; c++) {
                            if (elements[c].projectName == proyectouno.projectName) {
                                var comentario = elements[c].elementComment;
                                var horasreales = helper.convertDecimaltoHours(elements[c].totalHours);
                                var fecha = elements[c].elementDate.substr(0, 10);
                                renglonesTabla = renglonesTabla + '<tr><td>' + elements[c].elementDescripcion + '</td><td>' + fecha + '</td><td>' + comentario + '</td><td>' + horasreales + '</td></tr>';
                            }
                        }
                        tablaPorProyectos.push('<div class="col-md-12 mt-3">'
                            + '<div class="row marco-tablas mb-3">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + elements[a].projectName + '</h6>'
                            + '<div class="col-md-12">'
                            + '<div class="row">'
                            + '<div class="col-md-12 data-tables">'
                            + '<div class="card-body table-striped table-no-bordered table-hover dataTable dtr-inline table-full-width">'
                            + '<div class="toolbar">'
                            + '</div>'
                            + '<div class="fresh-datatables">'
                            + '<table id="datatables" class="table table-striped table-no-bordered table-hover" cellspacing="0" width="100%" style="width:100%">'
                            + '<thead>'
                            + '<tr>'
                            + '<th> ' + $.i18n._('Analytics2_022') + ' </th>'
                            + '<th> ' + $.i18n._('Analytics2_028') + ' </th>'
                            + '<th> ' + $.i18n._('comment') + ' </th>'
                            + '<th> ' + $.i18n._('Analytics2_029') + ' </th>'
                            + '</tr>'
                            + '</thead>'
                            + '<tbody>'
                            + renglonesTabla
                            + '</tbody>'
                            + '</table>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>'
                            + '</div>');
                        renglonesTabla = "";
                    }
                }
                $('#tabladetallehoras').append(tablaPorProyectos);
                $('#ModalHorasReales').modal('show');
               
            },
            complete: function () {
                LoaderHide();
            },
            error: function (xhr, status, error) {
                LoaderHide();

            }
        })
         
    },
    getTrHtmlTableHoursReals: function (elementDescripcion, elementDate, elementComment, totalHours) {
        return '<tr><td class="columnaAsignacionPendiente" >' + elementDescripcion + '</td><td class="columnaAsignacionPendiente">' + elementDate + '</td><td class="columnaAsignacionPendiente">' + elementComment + '</td><td class="columnaAsignacionPendiente"><center>' + totalHours +'</center></td></tr>';
        //return '<tr><td class="columnaAsignacionPendiente" >' + elementDescripcion + '</td><td class="columnaAsignacionPendiente">' + elementDate + '</td><td class="columnaAsignacionPendiente">' + elementComment + '</td><td class="columnaAsignacionPendiente">' + totalHours+'</td></tr>';
    },
    processDataChartD: function (data) {
        let respuesta = data.data;
        let participantes = data.participants;
        // participantes
        let hparticipants = []; 
        for (var i = 0; i < participantes.length; i++) {
            hparticipants.push(participantes[i]["participantName"]);

        }
        let hreales = [];
        let hplaneadas = [];
        //chart data 
        for (var i = 0; i < respuesta.length; i++) {
            if (respuesta[i]["type"] == 2) {
                //planeadas
                hreales.push(respuesta[i]["total"]);
            } else {
                // reales
                hplaneadas.push(respuesta[i]["total"]);
            } 
        }
        vAnalytics.chartDIni(hparticipants, hreales, hplaneadas, participantes);
    },
    chartDIni: function (hparticipants, hreales, hplaneadas, participantes) {
        Highcharts.chart('PlaneadasvsRealesx', {
            chart: {
                type: 'column'
            },
            title: {
                text: $.i18n._('Analytics2_006'),
                style: {
                    color: '#205280',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }
            },
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            xAxis: {
                categories: hparticipants //Particpantes
            },
            yAxis: [{
                min: 0,
                title: {
                    text: 'Horas'
                }
            }, {
                    title: {
                        text: null
                },
                opposite: true
            }],
            legend: {
                shadow: false
            },
            tooltip: {
                formatter: function () {
                    var hours = helper.convertDecimaltoHours(this.y);
                    return $.i18n._('hours') + ':' + hours;
                }
            },
            plotOptions: {
                series: {
                    events: {
                        click: function (event) {
                            let nombre = event.point.category;
                            let idparticipante = "";
                            for (var a = 0; a < participantes.length; a++) {
                                if (nombre == participantes[a].participantName) {
                                    idparticipante = participantes[a].participantID;
                                }
                            }
                            let fechaInicio = $('#datestart').val();
                            let fechaFin = $('#dateend').val();
                            $.ajax({
                                method: "GET",
                                url: "/Analytics/GetDetailHoursPlannedvsReal_ByParticipant",
                                dataType: 'json',
                                data: { participantID: idparticipante, startDate: fechaInicio, endDate: fechaFin },
                                beforeSend: function () {
                                    LoaderShow();
                                },
                                success: function (data) {
                                    $('#realesvsplaneadas').empty();
                                    $('#ModalHorasPlaneadasReales').modal('show');
                                    $('#ParticipanteHorasPlaneadasReales').html(event.point.category);
                                    var HoursPlannedvsReal = data.data;
                                    var TotalHoursPlanned = 0;
                                    var TotalHoursReal = 0;
                                    for (var a = 0; a < HoursPlannedvsReal.length; a++) {
                                        TotalHoursPlanned = TotalHoursPlanned + HoursPlannedvsReal[a].plannedHours;
                                        TotalHoursReal = TotalHoursReal + HoursPlannedvsReal[a].realHours;
                                        var hoursP = helper.convertDecimaltoHours(HoursPlannedvsReal[a].plannedHours);
                                        var hoursR = helper.convertDecimaltoHours(HoursPlannedvsReal[a].realHours);
                                        $('#realesvsplaneadas').append('<tr>'
                                            + '<td class= "ColumnaActividadesHorasPlaneadas">' + HoursPlannedvsReal[a].elementDescription +'</td>'
                                            + '<td class="ColumnaActividadesHorasPlaneadas">' + hoursP +'</td>'
                                            + '<td class="ColumnaActividadesHorasPlaneadas">' + hoursR +'</td>'
                                            + '</tr>');
                                    }
                                    
                                    $('#realesvsplaneadas').append('<tr>'
                                        + '<td class= "ColumnaActividadesHorasPlaneadas" style = "font-weight: 600"> Total</td>'
                                        + '<td class="ColumnaActividadesHorasPlaneadas" style="font-weight: 600">' + helper.convertDecimaltoHours(TotalHoursPlanned) + '</td>'
                                        + '<td class="ColumnaActividadesHorasPlaneadas" style="font-weight: 600">' + helper.convertDecimaltoHours(TotalHoursReal) + '</td>'
                                        + '</tr>');
                                   
                                },
                                complete: function () {
                                    LoaderHide();

                                },
                                error: function (xhr, status, error) {
                                    LoaderHide();
                                }
                            });
                        }
                    }
                },
                column: {
                    grouping: false,
                    shadow: false,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'Planeadas',
                color: '#447cf6',
                data: hplaneadas,
                pointPadding: 0.3,
                pointPlacement: -0.2
            }, {
                name: 'Reales',
                color: '#ff2a07',
                data: hreales,
                pointPadding: 0.4,
                pointPlacement: -0.2
            }]
        });
    },
    executeChartC: function (participantsIDS) {
        $.ajax({
            method: "GET",
            url: "/Analytics/GetParticipantsAssingedPerProject?&participantsIDS=" + participantsIDS,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                vAnalytics.processDataChartC(data);
            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });
    },
    processDataChartC: function (data) {
        var analitycs = {
            data: [],
            participants: []
        };
        analitycs.data = vAnalytics.fillDataChartC(data);
        analitycs.participants = vAnalytics.fillParticipantsChartC(data);
         vAnalytics.chartCIni(analitycs); 
    },
    fillDataChartC: function (data) { 
         let arData = data['data'];
        let respuesta = { data: [] };
        for (var i = 0; i < arData.length; i++) {
            respuesta.data.push({
                'projectID': arData[i]["projectID"],
                'projectName': arData[i]["projectName"],
                'total': arData[i]["plannedHours"], 
                'participantID': arData[i]["participantID"],
                'participantName': arData[i]["participantName"]
            });
        }
        return respuesta.data;
    },
    fillParticipantsChartC: function (data) { 
        let arData = data['participants'];
        let respuesta = { data: [] };
        for (var i = 0; i < arData.length; i++) {
            respuesta.data.push({
                'serie': String(i),
                'participantID': String(arData[i]["participantID"]),
                'participantName': String(arData[i]["participantName"]),
                'color': vAnalytics.getColorsProject(i)
            });
        }
        return respuesta.data;
    },
    chartCIni: function (data) {
         let tt = [];
        for (var i = 0; i < data.participants.length; i++) {
             tt.push({
                id: String(data.participants[i].participantID),
                name: String(data.participants[i].participantName),
                color: data.participants[i].color
            });
        }

        for (var i = 0; i < data.data.length; i++) {
            tt.push({
                id: String(data.data[i].projectID),
                name: String(data.data[i].projectName),
                parent: String(data.data[i].participantID),
                participant: String(data.data[i].participantName),
                value: parseInt(data.data[i].total)
            });
        }

        let chartC = Highcharts.chart('HorasAsignadas', {
            series: [{
                type: "treemap",
                layoutAlgorithm: 'stripes',
                alternateStartingDirection: true,
                levels: [{
                    level: 1,
                    layoutAlgorithm: 'sliceAndDice',
                    dataLabels: {
                        enabled: true,
                        align: 'left',
                        verticalAlign: 'top',
                        style: {
                            fontSize: '15px',
                            fontWeight: 'bold'
                        }
                    }
                }],
                navigation: {
                    buttonOptions: {
                        enabled: false
                    }
                },
                data: tt
            }],
            title: {
                text: $.i18n._('Analytics2_005'),
                style: {
                    color: '#205280',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }
            },
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            plotOptions: {
                series: {
                    events: {
                        click: function (event) {
                            var idparticipant = event.point.parent;
                            var projectid = event.point.id;
                            var participante = event.point.participant;
                            var project = event.point.name;
                            $.ajax({
                                method: "GET",
                                url: "/Analytics/GetParticipantActivitiesHoursPlanned_ByProject?participantID=" + idparticipant + "&projectID=" + projectid,
                                beforeSend: function () {
                                    LoaderShow();
                                },
                                success: function (data) {
                                    var datos = data.data;
                                    $('#ModalActividadesHorasPlaneadas').modal('show');
                                    $('#Proyecto').html(participante + ' :  ' + project);
                                    $('#detalle_actividades').empty();
                                    var horasTotalPlaneadas = 0;
                                    var minutosTotalPlaneadas = 0;
                                    for (var de = 0; de < datos.length; de++) {
                                        var horas = helper.convertDecimaltoHours(datos[de].plannedHours);
                                        horasTotalPlaneadas = horasTotalPlaneadas + datos[de].plannedHours;
                                         $('#detalle_actividades').append('<tr>'
                                            + '<td class= "ColumnaActividadesHorasPlaneadas">' + datos[de].text + '</td>'
                                             + '<td class="ColumnaActividadesHorasPlaneadas">' + horas +'</td>'
                                            + ' </tr>');
                                    }
                                    //Dar el formato de horas totales planeadas 
                                   
                                    
                                    $('#detalle_actividades').append('<tr>'
                                        + '<td class= "ColumnaActividadesHorasPlaneadas" style = "font-weight: 600"> Total</td>'
                                        + '<td class="ColumnaActividadesHorasPlaneadas" style="font-weight: 600">' + helper.convertDecimaltoHours(horasTotalPlaneadas) + '</td>'
                                        + '</tr>');
                                },
                                complete: function () {
                                    LoaderHide();

                                },
                                error: function (xhr, status, error) {
                                    LoaderHide();
                                }
                            });
                        }
                    }
                }
            }
        });

        chartC.redraw();


    },
    getColorsProject: function (op) {
        let color = "";
        switch (op) {
            case 0:
                color = "#FEF9E7";
                break;
            case 1:
                color = "#D1F2EB";
                break;
            case 2:
                color = "#AED6F1";
                break;
            case 3:
                color = "#F2D1EA";
                break;
            case 4:
                color = "#A3E4D7";
                break;
            case 5:
                color = "#FCF3CF";
                break;
            case 6:
                color = "#D5DBDB";
                break;
            case 7:
                color = "#73C6B6";
                break;
            case 8:
                color = "#566573";
                break;
            case 9:
                color = "#F8C471";
                break;
            case 10:
                color = "#FADBD8";
                break;
            case 11:
                color = "#5DADE2";
                break;
            case 12:
                color = "#45B39D";
                break;
            case 13:
                color = "#F8C471";
                break;
            case 14:
                color = "#D2B4DE";
                break;
            case 15:
                color = "#ABEBC6";
                break;
        }
        return color;
    },
    executeChartA: function (participantsIDS) {
        $.ajax({
            method: "GET",
            url: "/Analytics/getParticipantsProjectsIndicatorsbySelection?&participantsIDS=" + participantsIDS,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) { 
                vAnalytics.processDataChartA(data);
            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });
    },
    executeChartB: function (participantsIDS) {
        $.ajax({
            method: "GET",
            url: "/Analytics/getParticipantsPendingAssignments?&participantsIDS=" + participantsIDS,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                 var participantes = data.participants;
                $('#tPendientesFinalizar').empty();
                for (var a = 0; a < participantes.length; a++) {
                    $('#tPendientesFinalizar').append('<tr>'
                        + '<td class= "columnaAsignacionPendiente">' + participantes[a].participantName + '</td >'
                        + '<td class="columnaAsignacionPendiente">'
                        + '<button class="btn btn-default btn-wd mt-1" data-idparticipant="' + participantes[a].participantID + '" data-id="' + participantes[a].participantID + '" data-name="' + participantes[a].participantName + '" onclick="mostrarModal(this);">'+$.i18n._('Analytics2_011')+'</button>'
                        + '</td>'
                        + '</tr >');
                }
                
                vAnalytics.processDataChartB(data);
            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });
    },
    processDataChartB: function (data) {
        var analitycs = {
            elements: [],
            data: [],
            participants: [],
            chartB: [],
            categories: []
        };
         analitycs.data = vAnalytics.fillDataChartB(data);
        analitycs.elements = vAnalytics.fillElementsChartB(data);
        analitycs.participants = vAnalytics.fillParticipantsChartB(data);
        analitycs.categories = vAnalytics.fillParticipantsChartCategories(data);
         /// Acomodmos la informacion para la grafica 
        for (var j = 0; j < analitycs.elements.length; j++) {
            let dx = new Array();
            for (var x = 0; x < analitycs.data.length; x++) {
                if (analitycs.elements[j]['type'] == $.i18n._(analitycs.data[x]['type'])) {
                    dx.insert(analitycs.data[x]['order'], analitycs.data[x]['total']);
                }
            }
            analitycs.chartB.push({ 'name': String(analitycs.elements[j]['type']), 'data': dx });

        }
        vAnalytics.chartBIni(analitycs);


    },
    chartBIni: function (data) {
        let AsignacionElementos = Highcharts.chart('AsignacionElementos', {
            chart: {
                type: 'column'
            },
            title: {
                text: $.i18n._('Analytics2_004'),
                style: {
                    color: '#205280',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }
            },
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            xAxis: {
                categories: data.categories//Particpantes
            },
            yAxis: {
                min: 0,
                title: {
                    text: $.i18n._('Home_005')
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
                shared: true
            },
            plotOptions: {
                column: {
                    stacking: 'percent'
                }
            },
            series: []
        });

        for (var i = 0; i < data.chartB.length; i++) {
            AsignacionElementos.addSeries({
                name: String(data.chartB[i].name),
                data: data.chartB[i].data
            }, false);
        }
        AsignacionElementos.redraw();

    },
    fillParticipantsChartCategories: function (data) {
        let arData = data['participants'];
        let respuesta = Array();;
        for (var i = 0; i < arData.length; i++) {
            respuesta.push(arData[i]["participantName"]);
            
        }
        return respuesta;
    },
    fillParticipantsChartB: function (data) {
        let arData = data['participants'];
        let respuesta = { data: [] };
        for (var i = 0; i < arData.length; i++) {
            respuesta.data.push({
                'order': arData[i]["order"],
                'participantID': arData[i]["participantID"],
                'participantName': arData[i]["participantName"]
            });
        }
        return respuesta.data;
    },
    fillElementsChartB: function (data) { 
        let arData = data['elements'];
        let respuesta = { data: [] };
        for (var i = 0; i < arData.length; i++) {
            respuesta.data.push({
                'type': $.i18n._(arData[i]["type"])
            });
        }
        return respuesta.data;
    },
    fillDataChartB: function (data) {
        let arData = data['data'];
        let respuesta = { data: [] };
        for (var i = 0; i < arData.length; i++) {
            respuesta.data.push({
                'order': arData[i]["order"],
                'participantID': arData[i]["participantID"],
                'participantName': arData[i]["participantName"],
                'type': arData[i]["type"],
                'total': arData[i]["total"]
            });
        }
        return respuesta.data;
    },
    chartAIni: function (analitycs) {

        var chartAsignacionParticipante = new Highcharts.chart('AsignacionesPendientes', {
            chart: {
                type: 'bar'
            },
            title: {
                text: $.i18n._('Analytics2_016'),
                style: {
                    color: '#205280',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }
            },
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            },
            xAxis: {
                categories: analitycs.categories,//Particpantes,
                title: {
                    text: $.i18n._('Analytics2_012')
                },
                labels: {
                    style: {
                        cursor: 'pointer'
                    },
                    formatter: function () {
                        return '<a href="javascript: modal.pendientesFinalizar();">'+ this.value +'</a>';
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: $.i18n._('Analytics2_013'),
                    align: 'middle'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: $.i18n._('elements') 
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: []
        });
        for (var i = 0; i < analitycs.chartA.length; i++) {
            chartAsignacionParticipante.addSeries({
                name: String(analitycs.chartA[i].name),
                data: analitycs.chartA[i].data,
            }, false);
        }
        chartAsignacionParticipante.redraw();
        $('.highcharts-axis-labels text, .highcharts-axis-labels span').click(function () {
            modal.pendientesFinalizar();
        });
    },
    processDataChartA: function (data) {
        var analitycs = {
            projects: [],
            participants: [],
            chartA: [],
            categories: [],
            projectsData:[]
        };  

        analitycs.projects = vAnalytics.fillProjectsChartA(data); 
        analitycs.projectsData = vAnalytics.fillProjectsDataChartA(data); 
        analitycs.participants = vAnalytics.fillParticipantsChartA(data);
        analitycs.categories = vAnalytics.fillCategories(data);
        /// Acomodmos la informacion para la grafica 
        for (var i = 0; i < analitycs.projects.length; i++) {
            let ax = Array();
            for (var x = 0; x < analitycs.projectsData.length; x++) {
                if (analitycs.projects[i]['projectID'] == analitycs.projectsData[x]['projectID']) {
                    ax.insert(analitycs.projectsData[x]['posicion'], analitycs.projectsData[x]['total']); 
                }
            }
            analitycs.chartA.push({ 'name': analitycs.projects[i]['projectName'], 'data': ax });
        }     
         vAnalytics.chartAIni(analitycs);
    },
    fillCategories: function (data) {
        let arData = data['categories'];
        let respuesta = Array();
        for (var i = 0; i < arData.length; i++) {
            respuesta.push(arData[i]["participantName"]);

        }
        return respuesta;
    },
    filterParticipantChartA: function (data) {
        let respuesta = { onlyParticipants: [] };
        var count = 0;
        for (var i = 0; i < data.length; i++) {
            if (count == 0) {
                respuesta.onlyParticipants.push({ 'participantID': data[i]['participantID'], 'participantName': data[i]['participantName'] });

            }

            count = 10;
            for (var j = 0; j < respuesta.onlyParticipants.length; j++) {

                if (data[i]['participantID'] == respuesta.onlyParticipants[j]['participantID']) {
                } else {
                    respuesta.onlyParticipants.push({ 'participantID': data[i]['participantID'], 'participantName': data[i]['participantName'] });
                    break;


                }

            }

        }

    },
    fillParticipantsChartA: function (data) { 

        let arData = data['categories'];
        let respuesta = { participants: [] };
        for (var i = 0; i < arData.length; i++) {
            respuesta.participants.push({
                'posicion': arData[i]["serie"],
                'projectID': arData[i]["projectID"],
                'participantID': arData[i]["participantID"],
                'projectName': arData[i]["projectName"],
                'participantName': arData[i]["participantName"],
                'total': arData[i]["total"]
            });
        } 
        return respuesta.participants;

    },
    fillProjectsDataChartA: function (data) {
        let arData = data['elements'];
        let respuesta = { projects: [] };
        for (var i = 0; i < arData.length; i++) {
            respuesta.projects.push({
                'posicion': arData[i]["serie"],
                'projectID': arData[i]["projectID"],
                'participantID': arData[i]["participantID"],
                'projectName': arData[i]["projectName"],
                'participantName': arData[i]["participantName"],
                'total': arData[i]["total"]
            });
        }
        return respuesta.projects;
    },
    fillProjectsChartA: function (data) {
        let arData = data['projects'];
        let respuesta = { projects: [] };
        for (var i = 0; i < arData.length; i++) {
            respuesta.projects.push({
                'projectID': arData[i]["projectID"],
                'projectName': arData[i]["projectName"]
            });
        }
        return respuesta.projects;
    },
    acSearchParticipant: function () {
        let btnSearch = $('._btnSearch');

        btnSearch.click(function () {
            let participantsIDS = $('#selectParticipants').val();
            if (participantsIDS.length < 6) {
                if (participantsIDS != "") {
                    vAnalytics.executeChartA(participantsIDS);
                    vAnalytics.executeChartB(participantsIDS);
                    vAnalytics.executeChartC(participantsIDS);
                } else {

                    $('html, body').animate({
                        scrollTop: $("#selectParticipants").offset().top
                    }, 10);
                    Swal.fire({
                        type: 'info',
                        title: '',
                        text: $.i18n._('Analytics2_020'),
                        footer: '',
                    });
                }  
                   
                } else {
                Swal.fire({
                    type: 'info',
                    title: '',
                    text: $.i18n._('Analytics2_019'),
                    footer: '',
                });    
                } 
        });
    },
    getParticipants: function () {
        let selectParticipants = $('#selectParticipants');
        let singleparticipants = $('#singleparticipants');
        $.ajax({
            method: "GET",
            url: "/Analytics/GetParticipantByRoleSelectionList",
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                data = data.participants;
                for (var i = 0, ien = data.length; i < ien; i++) {
                    ;
                    //if (data[i]["isActive"] == true) {
                    let fullName = data[i]["value"];
                    selectParticipants.append('<option value="' + data[i]["key"] + '">' + fullName + '</option>');
                    singleparticipants.append('<option value="' + data[i]["key"] + '">' + fullName + '</option>');
                    fullName = null;
                    //} 
                }
                selectParticipants.selectpicker('refresh');
                singleparticipants.selectpicker('refresh');
                ArrayParticipants = data;
            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });
    }
};
function removeElement(array, elem) {
    var index = array.indexOf(elem);
    if (index > -1) {
        array.splice(index, 1);
    }
}
