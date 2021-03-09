$(function () {
    kpis.getParticipants();
    kpis.AcBtnSerchParticipants();
    kpis.acDatePicker();
});
 
var kpis = {
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
    AcBtnSerchParticipants: function () {

        $('._btnSearch').click(function () {
            if ($('#datestart').val() == "") {
                Swal.fire(
                    ' ',
                    $.i18n._('Analytics2_001'),
                    'warning'
                )
            } else if ($('#dateend').val() == "") {
                Swal.fire(
                    ' ',
                    $.i18n._('Analytics2_001'),
                    'warning'
                )
            } else {
                if ($('#selectParticipantsKpis').val() != "") {
                    kpis.getKpisParticipants($('#selectParticipantsKpis').val(), $('#datestart').val(), $('#dateend').val() );
                } else {
                    Swal.fire(
                        ' ',
                        $.i18n._('Analytics2_008'),
                        'warning'
                    )
                    helper.highlightInput('#selectParticipantsKpis');
                }
            }
            
        });
    },
    getKpisParticipants: function (participants, startDate, endDate) {
        $.ajax({
            method: "GET",
            url: "/Analytics/GetKpisByParticipants?participantsIds=" + participants + '&startDate=' + startDate + '&endDate=' + endDate,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                kpis.processCreateChartParticipants(data);
            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });

    },
    processCreateChartParticipants: function (data) {
        let participants = data.kpis;
        let tablebody = $('._bodyTable');
        var charts = [];
        var foto = "";
        tablebody.empty();
        for (var i = 0, ien = participants.length; i < ien; i++) {
            let mchartA = null, mchartB = null, mchartC = null;
            if (participants[i].ownerPhoto == "" || participants[i].ownerPhoto == null) {
                foto = "/images/avatar/default-avatar.png";
            } else {
                foto = participants[i].ownerPhoto;
            }
            let participantID = participants[i].participantID;
            participantID = "'" + participantID + "'";
            tablebody.append(kpis.templeteRowTable(participants[i].serie, participants[i].participantName, foto, participantID));
        }
        
            for (var i = 0, ien = participants.length; i < ien; i++) {
                let mchartA = null, mchartB = null, mchartC = null;

                mchartA = kpis.drawChartA(participants[i].serie, 0, 0);
                charts.push(mchartA);
                mchartB = kpis.drawChartB(participants[i].serie,0,0);
                charts.push(mchartB);
                mchartC = kpis.drawChartC(participants[i].serie, 0,0);
                charts.push(mchartC);
               
        }
        for (var i = 0, ien = participants.length; i < ien; i++) {
            let mchartA = null, mchartB = null, mchartC = null;
            
            mchartA = kpis.drawChartA(participants[i].serie, participants[i].totalClosedInTimeA, participants[i].totalClosedA);
            charts.push(mchartA);
            mchartB = kpis.drawChartB(participants[i].serie, participants[i].totalDelayedB, participants[i].totalElementsActiveB);
            charts.push(mchartB);
            mchartC = kpis.drawChartC(participants[i].serie, participants[i].totalDelayedCustomD, participants[i].totalOnTimeCustomD);
            charts.push(mchartC);
            
        }
        

        
        


    },  
    templeteRowTable: function (Serie, ParticipantName, foto, participantID) { 
        //onClick = "getParticipantInfoModal(' +participantID +'); return false;"
        return '<tr>'+
            '<td>' +
            '<div class="row text-center"> <div class="col-md-12"> <img style="width: 98px; border-radius: 84px; margin-bottom: 6%; " src="' + foto + '"> </div> </div>' +
            ' <div class="ws">' + '<a href="#" onClick = "getParticipantInfoModal(' + participantID +'); return false;">' + ParticipantName + '</a>' + '</div>' +
                    '</td> '+
                    '<td class="text-center">'+ 
                        '<figure class="highcharts-figure"> ' +
            ' <div id="chartA' + Serie +'" style="width: 200px;height: 215px; margin-left: 22%;" class="chart-container" data-highcharts-chart="1" role="region" aria-label="Chart. Highcharts interactive chart." aria-hidden="false" style="overflow: hidden;"> </figure> ' +
                    '</td> ' +
                    '<td> ' + 
                        '<figure class="highcharts-figure"> ' +
            '<div id="chartB' + Serie +'" style="width: 200px;height: 215px; margin-left: 22%;" class="chart-container" data-highcharts-chart="3" role="region" aria-label="Chart. Highcharts interactive chart." aria-hidden="false" style="overflow: hidden;"> </figure> ' +
                    '</td> ' +
                    '<td> ' + 
                        '<figure class="highcharts-figure"> ' +
            '<div id="chartC' + Serie +'" style="width: 200px;height: 215px; margin-left: 22%;" class="chart-container" data-highcharts-chart="2" role="region" aria-label="Chart. Highcharts interactive chart." aria-hidden="false" style="overflow: hidden;"> </figure> ' +
                    '</td> ' +
                '</tr>';
    },

    drawChartC: function (Serie, totalDelayedCustomD, totalOnTimeCustomD) {
        let totalpercentage = 0;
        if (totalOnTimeCustomD == 0) {
            totalpercentage = 0;
        } else {
            let total = totalDelayedCustomD / totalOnTimeCustomD;
            totalpercentage = total * 100;
        }
        
        //console.log(totalDelayedCustomD);
        totalpercentage = Math.trunc(totalpercentage);
        //console.log('chartC' + Serie, totalpercentage, totalDelayedCustomD, totalOnTimeCustomD)
        let chartC = new  Highcharts.chart('chartC' + Serie, Highcharts.merge(gaugeOptions, {
                 yAxis: {
                     min: 0,
                     max:100,
                     title: {
                         text: ''
                     }
                 },

                 series: [{
                     name: $.i18n._('Analytics3_004'),
                     data: [totalpercentage],
                     dataLabels: {
                         format:
                             '<div style="text-align:center">' +
                             '<span style="font-size:25px">{y}</span><br/>' +
                             '<span style="font-size:12px;opacity:0.4">' + $.i18n._('Analytics3_006') + '</span>' +
                             '</div>'
                     },
                     tooltip: {
                         valueSuffix: ' revolutions/min'
                     }
                 }]

             }));
        //chartC.redraw();
        return chartC;
    }, 
    drawChartB: function (Serie, totalDelayedB, totalElementsActiveB) {
        let totalpercentage = 0;
        if (totalElementsActiveB == 0) {
            totalpercentage = 0;
        } else {
            let total = totalDelayedB / totalElementsActiveB;
            totalpercentage = total * 100; 
        }
        
        //console.log(totalDelayedB);
        totalpercentage = Math.trunc(totalpercentage);
        //console.log('chartB' + Serie, totalpercentage, totalDelayedB, totalElementsActiveB)
        let chartB = new Highcharts.chart('chartB' + Serie, Highcharts.merge(gaugeOptions, {
            yAxis: {
                min: 0,
                max: 100,
                title: {
                    text: ''
                }
            },

            credits: {
                enabled: false
            },

            series: [{
                name: $.i18n._('Analytics3_005'),
                data: [totalpercentage],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">' + $.i18n._('Analytics3_006')+'</span>' +
                        '</div>'
                },
                tooltip: {
                    valueSuffix: ' km/h'
                }
            }]

        }));
        //chartB.redraw();
        return chartB;
    },
    drawChartA: function (Serie, totalClosedInTimeA, totalClosedA) { 
        let totalpercentage = 0;
        if (totalClosedA == 0) {
            totalpercentage = 0;
        } else {
            let total = totalClosedInTimeA / totalClosedA;
            totalpercentage = total * 100;
        }
        
        //console.log(totalClosedInTimeA);
        totalpercentage = Math.trunc(totalpercentage);
        //console.log('chartA ' + Serie, totalpercentage, totalClosedInTimeA, totalClosedA)
        let chartA = new Highcharts.chart('chartA' + Serie, Highcharts.merge(gaugeOptions, {
            yAxis: {
                min: 0,
                max: 100,
                title: {
                    text: ''
                }
            },

            credits: {
                enabled: false
            },

            series: [{
                name: $.i18n._('Analytics3_003'),
                data: [totalpercentage],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">' + $.i18n._('Analytics3_006') +'</span>' +
                        '</div>'
                },
                tooltip: {
                    valueSuffix: ' km/h'
                }
            }]

        }));
        //chartA.redraw();
        return chartA;
    },
    getParticipants: function () {
        let selectParticipants = $('#selectParticipantsKpis'); 
        $.ajax({
            method: "GET",
            url: "/Analytics/GetParticipantByRoleSelectionList",
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                data = data.participants;
                for (var i = 0, ien = data.length; i < ien; i++) {
                      
                     let fullName = data[i]["value"];
                    selectParticipants.append('<option value="' + data[i]["key"] + '">' + fullName + '</option>'); 
                    fullName = null; 
                }
                selectParticipants.selectpicker('refresh'); 

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

var gaugeOptions = {
    chart: {
        type: 'solidgauge'
    },

    title: null,

    pane: {
        center: ['50%', '85%'],
        size: '100%',
        startAngle: -90,
        endAngle: 90,
        background: {
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
        }
    },

    exporting: {
        enabled: false
    },

    tooltip: {
        enabled: false
    },

    // the value axis
    yAxis: {
        stops: [
            [0.1, '#81c2ff'], // green
            [0.5, '#4788c3'], // yellow
            [0.9, '#205280'] // red
        ],
        lineWidth: 0,
        tickWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        title: {
            y: -70
        },
        labels: {
            y: 16
        }
    },

    plotOptions: {
        solidgauge: {
            dataLabels: {
                y: 5,
                borderWidth: 0,
                useHTML: true
            }
        },
        series: {
            animation: true
        }
    }
};