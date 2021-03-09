var chart;
$(document).ready(function () {
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

    getProjectFactsheet();
    getProjectProgressHistory();
    getProjectPendings();
    getQualityTracingProject();
});

function refresh() {
    if ((new Date($("#StartDate").val()) > new Date($("#EndDate").val())) || ($("#StartDate").val() == '') || ($("#EndDate").val() == '')) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#m4025').val(),
            footer: '',
        });
        return false;
    }
     getProjectElementsCheck();
}
function refreshCC() {
    if ((new Date($("#StartDateCC").val()) > new Date($("#EndDateCC").val())) || ($("#StartDateCC").val() == '') || ($("#EndDateCC").val() == '')) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#m4025').val(),
            footer: '',
        });
        return false;
    }
    getControlChanges();
}
function refreshAH() {
    if ((new Date($("#StartDateRP").val()) > new Date($("#EndDateRP").val())) || ($("#StartDateRP").val() == '') || ($("#EndDateRP").val() == '')) {
        Swal.fire({
            type: 'error',
            title: '',
            text: $('#m4025').val(),
            footer: '',
        });
        return false;
    }
    constructReporteHoraProyecto();
}

function getProjectWorkHours() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetProjectHours',
        dataType: 'json',
        data: { projectId: $("#idProject").val(), fromDate: $("#ProjectAcquiredValueStartDate").val(), toDate: $("#ProjectAcquiredValueEndDate").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            //var obj = '[{"date":"2020-03-01","plannedHours":0,"realHours":0},{"date":"2020-03-02","plannedHours":12.8,"realHours":9.33},{"date":"2020-03-03","plannedHours":25.6,"realHours":17.33},{"date":"2020-03-04","plannedHours":38.4,"realHours":17.33},{"date":"2020-03-05","plannedHours":51.2,"realHours":25.33},{"date":"2020-03-06","plannedHours":60,"realHours":25.33},{"date":"2020-03-07","plannedHours":60,"realHours":25.33}]';
            //var data = jQuery.parseJSON(obj);
            //console.log(data);
            var categories = [];
            var plannedHours = [];
            var realHours = [];

            for (var i = 0; i < data.length; i++) {
                categories.push(data[i].date.substr(0, 10));
                plannedHours.push((((data[i].plannedHours * 1000) * 60) * 60));
                realHours.push((((data[i].realHours * 1000) * 60) * 60));
            }

            chartProgress.destroy();
            //if (!typeof chartProgress) { chartProgress.destroy(); }
            drawChartHours(categories, plannedHours, realHours);
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
//HORAS
function drawChartHours(categories, plannedHours, realHours) {
    chartHours = new Highcharts.chart('hours', {
        colors: ['#5BC6F7', '#F50909', '#1587BB', '#940909', '#ccc', '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
        chart: { type: 'line', zoomType: 'x y' }, title: { text: $.i18n._('hours') }, subtitle: { text: '' },
        xAxis: { categories: categories },
        yAxis: {
            title: { text: $.i18n._('hours') },
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
                return $.i18n._('hours') + ':' + hourPortion + ':' + minPortionUsed + ':00';
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
                return $.i18n._('hours') + ':' + hourPortion + ':' + minPortionUsed + ':00';
                //return 'Horas: ' + Highcharts.dateFormat('%H:%M:%S', this.y);
            }
        },
        //plotOptions: {
        //    series: {
        //        animation: {
        //            duration: 1500
        //        },
        //        cursor: 'pointer',
        //        point: {
        //            events: {
        //                click: function () {
        //                    if (this.series.legendItem.textStr == $.i18n._('plannedHours')) {
        //                        getWorkloadDetail(this.category);
        //                    }
        //                }
        //            }
        //        }
        //    }
        //}
         series: [{ name: $.i18n._('plannedHours'), data: plannedHours }, { name: $.i18n._('realHours'), data: realHours }]
    });
}
function getControlChanges() {
    $("#tProjectControlChange").html('');
    $.ajax({
        type: 'GET',
        url: '/Analytics/GetDataControlChanges',
        dataType: 'json',
        data: { projectId: $("#idProject").val(), startDate: $("#StartDateCC").val(), endDate: $("#EndDateCC").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            //var obj = '[{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Estapa de desarrollo","Date":"2020-03-20 00:00:00.000","Status":2,"ElementType":1,"IndicatorTable":2},{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Establecer los módulos a desarrollar para el sistema y sus funcionalidades","Date":"2020-03-20 00:00:00.000","Status":2,"ElementType":3,"IndicatorTable":1},{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Establecer los modulos a desarrollar","Date":"2020-03-20 00:00:00.000","Status":1,"ElementType":1,"IndicatorTable":1},{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Tarea de Dani","Date":"2020-03-24 00:00:00.000","Status":1,"ElementType":1,"IndicatorTable":1},{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Pruebas integrales","Date":"2020-03-25 00:00:00.000","Status":2,"ElementType":1,"IndicatorTable":1}]';
            //var data = jQuery.parseJSON(obj);
            //console.log(data);
            for (var i = 0; i < data.length; i++) {
                if (data[i].comments == null) { data[i].comments = ''}
                var markup = '<tr>'
                    + '<td>' + getElementTypeName(data[i].elementType)
                    + '<td><a target="_blank" href=' + getLinkElementType(data[i].elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                    + '<td>' + data[i].change.replace(";", "<br>") + '</td>'
                    + '<td>' + data[i].comments + '</td>'
                    + '<td>' + data[i].createdByName + '</td>'
                    + '<td>' + data[i].createdOn.substr(0, 10) + '</td>'
                    + '</tr>';
                $("#tProjectControlChange").append(markup);
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

function getProjectElementsCheck() {
    $("#tProjectElementsCheck1").html('');
    $("#tProjectElementsCheck2").html('');
    $("#tProjectElementsCheck3").html('');
    $.ajax({
        type: 'GET',
        url: '/Analytics/GetDataProjectElementsCheck',
        dataType: 'json',
        data: { projectId: $("#idProject").val(), startDate: $("#StartDate").val(), endDate: $("#EndDate").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            //var obj = '[{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Estapa de desarrollo","Date":"2020-03-20 00:00:00.000","Status":2,"ElementType":1,"IndicatorTable":2},{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Establecer los módulos a desarrollar para el sistema y sus funcionalidades","Date":"2020-03-20 00:00:00.000","Status":2,"ElementType":3,"IndicatorTable":1},{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Establecer los modulos a desarrollar","Date":"2020-03-20 00:00:00.000","Status":1,"ElementType":1,"IndicatorTable":1},{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Tarea de Dani","Date":"2020-03-24 00:00:00.000","Status":1,"ElementType":1,"IndicatorTable":1},{"ElementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","Description":"Pruebas integrales","Date":"2020-03-25 00:00:00.000","Status":2,"ElementType":1,"IndicatorTable":1}]';
            //var data = jQuery.parseJSON(obj);
            console.log(data);
            for (var i = 0; i < data.length; i++) {
                if (data[i].indicatorTable == 1) {
                    var markup = '<tr>'
                        + '<td>' + getElementTypeName(data[i].elementType)
                        + '<td><a target="_blank" href=' + getLinkElementType(data[i].elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                        + '<td>' + data[i].date.substr(0, 10) + '</td>'
                        + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                        + '</tr>';

                    $("#tProjectElementsCheck1").append(markup);
                } else if (data[i].indicatorTable == 2) {
                    var markup2 = '<tr>'
                        + '<td>' + getElementTypeName(data[i].elementType)
                        + '<td><a target="_blank" href=' + getLinkElementType(data[i].elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                        + '<td>' + data[i].date.substr(0, 10) + '</td>'
                        + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                        + '</tr>';

                    $("#tProjectElementsCheck2").append(markup2);
                }
                else if (data[i].indicatorTable == 3) {
                    var markup3 = '<tr>'
                        + '<td>' + getElementTypeName(data[i].elementType)
                        + '<td><a target="_blank" href=' + getLinkElementType(data[i].elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                        + '<td>' + data[i].date.substr(0, 10) + '</td>'
                        + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                        + '</tr>';

                    $("#tProjectElementsCheck3").append(markup3);
                }
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

function getProjectFactsheet() {
    $("#factsheetHolder").html('');
    $.ajax({
        type: 'GET',
        url: '/Execution/GetFactsheet',
        dataType: 'json',
        data: { projectId: $("#idProject").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            var html = '';
            html = '<div class="card-body table-full-width table-responsive scroll-ficha scroll-slim">';
            if (data == '') {
                html = html + '<div class="row pt-2" style="border-bottom: solid 1px #e3e3e3">'
                    + '<div class="col-md-12">' + $.i18n._('noRecordsFound') + '</div>'
                    + '</div>';
                //console.log('vacio');
            }
            for (var i = 0; i < data.length; i++) {
                html = html + '<div class="row pt-2" style="border-bottom: solid 1px #e3e3e3">'
                    + '<div class="col-md-3" style="background-color: #f1f1f1"><b>' + data[i].factSheetDetailName + '</b></div>'
                    + '<div class="col-md-9">' + data[i].factSheetDetailValue + '</div>'
                    + '</div>';
            }
            html = html + '<div class="row">'
                + '<div class="col-md-12 text-center pt-3" ></div >'
                + '</div>'
                + '</div>';
            $("#factsheetHolder").html(html);
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

function getProjectPendings() {
    $("#pendings").html('');
    $.ajax({
        type: 'GET',
        url: '/Analytics/GetDataProjectPendings',
        dataType: 'json',
        data: { projectId: $("#idProject").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            //var obj = '[{"ProjectID":"9824178A-E3B3-45A9-A5DC-48A33D609391","ElementID":"140C06D5-BFAC-414D-BD4F-39591506F39E","ElementName":" Evidencia: Inicio del contrato","EndDate":"2020-03-16 00:00:00.000","Status":2,"ElementType":3},{"ProjectID":"9824178A-E3B3-45A9-A5DC-48A33D609391","ElementID":"FE137C06-69DD-40A9-9B3B-BCA8838C1692","ElementName":"Act. Inicio del contrato","EndDate":"2020-03-17 00:00:00.000","Status":2,"ElementType":1},{"ProjectID":"9824178A-E3B3-45A9-A5DC-48A33D609391","ElementID":"56A5916C-9809-4971-B93F-C76FCA5EDAAA","ElementName":"Ejecución del proyecto","EndDate":"2020-03-18 00:00:00.000","Status":3,"ElementType":1},{"ProjectID":"9824178A-E3B3-45A9-A5DC-48A33D609391","ElementID":"04CBA0AE-2329-4BCA-BF6B-ECBC99403312","ElementName":"Riesgo 1","EndDate":"2020-03-20 00:00:00.000","Status":1,"ElementType":5}]';
            //var data = jQuery.parseJSON(obj);
            //console.log(data);
            var html = '';
            html = '<ul class="timeline">';
            if (data == '') {
                html = html + '<li>'
                    + '<p>' + $.i18n._('noRecordsFound') + '</p>'
                    + '</li>';
                //console.log('vacio');
            }
            for (var i = 0; i < data.length; i++) {
                var enDate = data[i].endDate;
                var enCDate = new Date(enDate);
                html = html + '<li>'
                    + '<a target="_blank" href=' + getLinkElementType(data[i].elementType, data[i].projectID, data[i].elementID) + '>' + formatDate(enCDate) + '</a>'
                    + '<span class="bold ' + getStatusClassName(data[i].status) + ' font7em float-right">' + getElementStatusName(data[i].status) + '</span>'
                    + '<p>' + data[i].elementName + '</p>'
                    + '</li>';
            }
            
            $("#pendings").html(html);
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
            urlElement = "/Analytics/Projects";
            break
    }
    return urlElement;
}

//AVANCE
function drawChart(categories, progressExpected, progressReal) {
    chartProgress = new Highcharts.chart('aesperado', {
        title: {
            text: $.i18n._('progress')
        },
        chart: { type: 'line', zoomType: 'x y' },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: categories,
            crosshair: true,
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            animation: {
                duration: 1500
            },
        },
        series: [{
            name: $.i18n._('progressExpected'),
            data: progressExpected
        }, {
            name: $.i18n._('progressReal'),
            data: progressReal,
            color: "#FF0000"
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
function getProjectProgressHistory(x) {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetProjectProgressHistory',
        dataType: 'json',
        data: { projectId: $("#idProject").val(), fromDate: $("#ProjectAcquiredValueStartDate").val(), toDate: $("#ProjectAcquiredValueEndDate").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            var categories = [];
            var progressExpected = [];
            var progressReal = [];

            for (var i = 0; i < data.length; i++) {
                categories.push(data[i].date.substr(0, 10));
                progressExpected.push(parseFloat((data[i].plannedProgress * 100).toFixed(2)));
                progressReal.push(parseFloat((data[i].progress * 100).toFixed(2)));
            }
            //console.log(typeof chartHours);
            if (typeof chartHours == 'object') {chartHours.destroy();}
            drawChart(categories, progressExpected, progressReal);
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

function getQualityTracingProject() {
    $.ajax({
        type: 'GET',
        url: '/Analytics/GetDataQualityTracingProject',
        dataType: 'json',
        data: { projectId: $("#idProject").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            var dataElementParticipant = data;
            var arrayElements = [];
            var objetoElement = Object.keys(data[0]);
            var contador = 0;
            if (dataElementParticipant[0].totalElementosA != 0) {
                for (var a = 0; a < objetoElement.length; a++) {
                    var campo = objetoElement[a];
                    if (campo == "activity" || campo == "milestone" || campo == "evidence" || campo == "incident" || campo == "risk" || campo == "agreement") {
                        contador = contador + 1;
                        arrayElements.push(
                            {
                                y: parseInt(dataElementParticipant[0][campo]),
                                elementType: contador
                            }
                        );
                    }
                }
                qualityTracingProject(arrayElements);
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

function qualityTracingProject(series) {
    chartQuality = new Highcharts.chart('chartCseguimiento', {

        chart: {
            polar: true,
            type: 'line'
        },
        title: {
            text: '',
            style: {
                color: '#205280',
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },
        pane: {
            size: '90%'
        },

        xAxis: {
            categories: [
                $.i18n._('activity'),
                $.i18n._('milestone'),
                $.i18n._('evidence'),
                $.i18n._('incident'),
                $.i18n._('risk'),
                $.i18n._('agreement')
            ],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },
        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },
        plotOptions: {
            series: {
                cursor: 'pointer',
                events: {
                    click: function (event) {
                        //console.log(event.point.elementType);
                        getQualityTracingProjectDetail(event.point.elementType)
                    }
                }
            }
        },
        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}"><b>{point.y:,.0f}%</b><br/>'
        },
        legend: {
            align: 'center',
            verticalAlign: 'middle',
            layout: 'vertical'
        },
        series: [{
            showInLegend: false,
            data: series,
            pointPlacement: 'on'
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: false
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    pane: {
                        size: '100%'
                    }
                }
            }]
        }

    });
}

function getQualityTracingProjectDetail(elementType) {
    console.log(elementType);
    $.ajax({
        type: 'GET',
        url: '/Analytics/GetDataQualityTracingProjectDetail',
        dataType: 'json',
        data: { projectId: $("#idProject").val(), elementType: elementType },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            $("#rules").html('');
            //var obj = '[{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","description":"Estapa de desarrollo","endDate":"2020-03-20 00:00:00.000","progress":12.4,"status":2,"indicatorRule":1},{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","description":"Establecer los módulos y sus funcionalidades","endDate":"2020-03-20 00:00:00.000","progress":80,"status":2,"indicatorRule":1},{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","description":"Establecer los modulos a desarrollar","endDate":"2020-03-20 00:00:00.000","progress":50,"status":3,"indicatorRule":1},{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","description":"Tarea de Dani","endDate":"2020-03-20 00:00:00.000","progress":45,"status":1,"indicatorRule":1},{"elementID":"8EFA9F10-2256-4B3E-B1C0-95C232C60928","description":"Pruebas integrales","endDate":"2020-03-20 00:00:00.000","progress":33,"status":2,"indicatorRule":1}]';
            //var data = jQuery.parseJSON(obj);
            console.log(data);
            var markupH = '';
            var markupP = '';
            var markupH = '<div class="col-md-12"><table class="table table-hover table-striped">' + '<thead>' + '<tr>'
                + '<th>' + $.i18n._('description') + '</th>' + '<th>' + $.i18n._('plannedEndDate') + '</th>' + '<th>' + $.i18n._('progressReal') + '</th>' + '<th>' + $.i18n._('status') + '</th>' + '</tr>' + '</thead' + '<tbody>';
            var markupP = '</tbody>' + '</table></div>';
                switch (elementType) {
                    case 1:
                        var rule1 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_018') + '</h6>'
                            + '</div>';
                        var markupB = '';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].indicatorRule == 1) {
                                var markupB = markupB + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                                    + '<td>' + data[i].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[i].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR = rule1 + markupH + markupB + markupP;
                        var rule2 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_019') + '</h6>'
                            + '</div>';
                        var markupB1 = '';
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].indicatorRule == 2) {
                                var markupB1 = markupB1 + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[j].elementID) + '>' + data[j].description + '</a></td>'
                                    + '<td>' + data[j].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[j].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[j].status) + ' pb-1 ws">' + getElementStatusName(data[j].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR1 = rule2 + markupH + markupB1 + markupP;
                        var rule3 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_020') + '</h6>'
                            + '</div>';
                        var markupB2 = '';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].indicatorRule == 3) {
                                var markupB2 = markupB2 + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                                    + '<td>' + data[i].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[i].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR2 =rule3 + markupH + markupB2 + markupP;
                        var markupT = markupR + markupR1 + markupR2;
                        $("#rules").append(markupT);
                    break
                    case 2:
                        var rule1 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_021') + '</h6>'
                            + '</div>';
                        var markupB = '';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].indicatorRule == 1) {
                                var markupB = markupB + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                                    + '<td>' + data[i].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[i].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR = rule1 + markupH + markupB + markupP;
                        var rule2 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_022') + '</h6>'
                            + '</div>';
                        var markupB1 = '';
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].indicatorRule == 2) {
                                var markupB1 = markupB1 + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[j].elementID) + '>' + data[j].description + '</a></td>'
                                    + '<td>' + data[j].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[j].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[j].status) + ' pb-1 ws">' + getElementStatusName(data[j].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR1 = rule2 + markupH + markupB1 + markupP;
                        var markupT = markupR + markupR1;
                        $("#rules").append(markupT);
                    break
                    case 3:
                        var rule1 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_023') + '</h6>'
                            + '</div>';
                        var markupB = '';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].indicatorRule == 1) {
                                var markupB = markupB + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                                    + '<td>' + data[i].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[i].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR = rule1 + markupH + markupB + markupP;
                        var rule2 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_024') + '</h6>'
                            + '</div>';
                        var markupB1 = '';
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].indicatorRule == 2) {
                                var markupB1 = markupB1 + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[j].elementID) + '>' + data[j].description + '</a></td>'
                                    + '<td>' + data[j].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[j].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[j].status) + ' pb-1 ws">' + getElementStatusName(data[j].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR1 = rule2 + markupH + markupB1 + markupP;
                        var rule3 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_025') + '</h6>'
                            + '</div>';
                        var markupB2 = '';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].indicatorRule == 3) {
                                var markupB2 = markupB2 + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                                    + '<td>' + data[i].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[i].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR2 = rule3 + markupH + markupB2 + markupP;
                        var markupT = markupR + markupR1 + markupR2;
                        $("#rules").append(markupT);
                        break
                    case 4:
                        var rule1 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_026') + '</h6>'
                            + '</div>';
                        var markupB = '';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].indicatorRule == 1) {
                                var markupB = markupB + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                                    + '<td>' + data[i].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[i].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR = rule1 + markupH + markupB + markupP;
                        var rule2 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_027') + '</h6>'
                            + '</div>';
                        var markupB1 = '';
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].indicatorRule == 2) {
                                var markupB1 = markupB1 + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[j].elementID) + '>' + data[j].description + '</a></td>'
                                    + '<td>' + data[j].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[j].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[j].status) + ' pb-1 ws">' + getElementStatusName(data[j].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR1 = rule2 + markupH + markupB1 + markupP;
                        var markupT = markupR + markupR1;
                        $("#rules").append(markupT);
                        break
                    case 5:
                        var rule1 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_028') + '</h6>'
                            + '</div>';
                        var markupB = '';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].indicatorRule == 1) {
                                var markupB = markupB + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                                    + '<td>' + data[i].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[i].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR = rule1 + markupH + markupB + markupP;
                        var rule2 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_029') + '</h6>'
                            + '</div>';
                        var markupB1 = '';
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].indicatorRule == 2) {
                                var markupB1 = markupB1 + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[j].elementID) + '>' + data[j].description + '</a></td>'
                                    + '<td>' + data[j].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[j].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[j].status) + ' pb-1 ws">' + getElementStatusName(data[j].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR1 = rule2 + markupH + markupB1 + markupP;
                        var markupT = markupR + markupR1;
                        $("#rules").append(markupT);
                        break
                    case 6:
                        var rule1 = '<div class="col-md-12">'
                            + '<h6 class="tx-normal tx-rubik tx-color-03 lh-2 mg-b-0 bold st-in-blue col-12">' + $.i18n._('Analytics1_030') + '</h6>'
                            + '</div>';
                        var markupB = '';
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].indicatorRule == 1) {
                                var markupB = markupB + '<tr>'
                                    + '<td><a target="_blank" href=' + getLinkElementType(elementType, $("#idProject").val(), data[i].elementID) + '>' + data[i].description + '</a></td>'
                                    + '<td>' + data[i].endDate.substr(0, 10) + '</td>'
                                    + '<td class="text-center">' + parseFloat((data[i].progress * 100).toFixed(2)) + '</td>'
                                    + '<td><span class="bold ' + getStatusClassName(data[i].status) + ' pb-1 ws">' + getElementStatusName(data[i].status) + '</span></td>'
                                    + '</tr>';
                            }
                        }
                        var markupR = rule1 + markupH + markupB + markupP;
                        $("#rules").append(markupR);
                        break
                }
            $('#_titleElement').text(getElementTypeName(elementType));
            $('#qualityModal').modal('show');
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
function constructReporteHoraProyecto() {
    //console.log($("#idProject").val());
    //console.log($("#StartDateRP").val());
    //console.log($("#EndDateRP").val());
    $.ajax({
        type: 'GET',
        url: '/Analytics/GetProjectAssignedHours',
        dataType: 'json',
        data: { projectId: $("#idProject").val(), startDate: $("#StartDateRP").val(), endDate: $("#EndDateRP").val() },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (DataReport) {
            $('#tProjectHours').empty();
            var data = DataReport.AssignedHours;
            var dataParticipants = DataReport.participants;
            //console.log(dataParticipants);
            //console.log(data);
            var ActivityProject = [];
            var TotalHoursPlanned = 0;
            var TotalHoursReal = 0;
            var HtmlParticipants = [];
            var TextParticipants = "";
            for (var i = 0; i < data.length; i++) {
                //horas planeadas
                var horaPlaneada = helper.convertDecimaltoHours(data[i].plannedHours);
                TotalHoursPlanned = TotalHoursPlanned + data[i].plannedHours;
                var horaReales = helper.convertDecimaltoHours(data[i].realHours);
                TotalHoursReal = TotalHoursReal + data[i].realHours;
                //Fecha Inicio
                var fechaInicio = data[i].startDate;
                fechaInicio = fechaInicio.split('T')[0];
                //Fecha Fin
                var fechaFin = data[i].endDate;
                fechaFin = fechaFin.split('T')[0];
                //Se agrega otro ciclo haciendo un ciclo anidado para obtener los participantes de cada actividad
                for (var a = 0; a < dataParticipants.length; a++) {
                    if (data[i].projectTaskID == dataParticipants[a].projectTaskID) {
                        let participantID = dataParticipants[a].participantID;
                        participantID = "'" + participantID + "'";
                        HtmlParticipants.push('<a href="#" onClick = "getParticipantInfoModal(' + participantID + '); return false;">' + dataParticipants[a].name + ' ' + dataParticipants[a].lastname + ' ' + dataParticipants[a].surname + '</a><br/>');
                    }
                }
                for (var u = 0; u < HtmlParticipants.length; u++) {
                    TextParticipants = TextParticipants + HtmlParticipants[u];
                }
                //console.log(TextParticipants);
                if (TextParticipants == "") {
                    TextParticipants =  $.i18n._('Analytics1_031') + ' <br/>'
                }
                //console.log(TextParticipants);
                ActivityProject.push('<tr>'
                    + '<td>' + data[i].activityName + '</td>'
                    + '<td>' + horaPlaneada + '</td>'
                    + '<td>' + horaReales + '</td>'
                    + '<td>' + fechaInicio + '</td>'
                    + '<td>' + fechaFin + '</td>'
                    + '<td>'
                    + TextParticipants
                    + '</td>'
                    + '</tr >');
                //Borramos la variable donde junta los participantes del arreglo de participantes creado por actividad.
                TextParticipants = "";
                //Borramos el contenido del arreglo para que vuelva a llenar los participantes que pertenecen a la siguiente actividad.
                HtmlParticipants = [];
            }
            for (var e = 0; e < ActivityProject.length; e++) {
                $('#tProjectHours').append(ActivityProject[e]);
            }
            var total = '<tr>'
                + '<td class="text-right" >'
                + '<strong>Total:</strong>'
                + '</td>'
                + '<td>'
                + '<strong>' + helper.convertDecimaltoHours(TotalHoursPlanned.toFixed(2)) + '</strong>'
                + '</td>'
                + '<td>'
                + '<strong>' + helper.convertDecimaltoHours(TotalHoursReal.toFixed(2)) + '</strong>'
                + '</td>'
                + '<td></td>'
                + '<td></td>'
                + '<td></td>'
                + '</tr >';
            $('#tProjectHours').append(total);
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