$(function () {
    aparticipant.getParticipants();
    //aparticipant.getCompanies();
    //aparticipant.fillChartA();
    aparticipant.fillChartB();
    aparticipant.acSearchParticipant();
});

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
function getUnique(arr, comp) {

    const unique = arr
        .map(e => e[comp])

        // store the keys of the unique objects
        .map((e, i, final) => final.indexOf(e) === i && i)

        // eliminate the dead keys & store unique objects
        .filter(e => arr[e]).map(e => arr[e]);

    return unique;
}
var aparticipant = {
    xx: function (data) {
        var p = {
            info: [],
            projectsClean: [],
            p: [],
            participants: [],
            participantsClean: [],
            dataClean: []
        };

        for (var i = 0; i < data['data'].length; i++) {
            p.info.push({
                'projectName': data['data'][i]["projectName"],
                'ProjectID': data['data'][i]["projectID"],
                'participantName': data['data'][i]["participantName"],
                'participantID': data['data'][i]["participantID"],
                'total': parseInt(data['data'][i]["total"])


            });
            p.participants.push({ 'ParticipantName': data['data'][i]["participantName"], 'participantID': data['data'][i]["participantID"] });

        }

        //agregamos indices al onjeto principal
        for (var i = 0; i < p.info.length; i++) {

            for (var j = 0; j < p.participantsClean.length; j++) {
                if (p.projects[i]["participantID"] == p.participantsClean[j]["participantID"]) {
                    p.dataClean.push({
                        'index': p.participantsClean[j]["posicion"],
                        'projectName': p.info[i]["projectName"],
                        'ProjectID': p.info[i]["ProjectID"],
                        'participantName': p.info[i]["participantName"],
                        'participantID': p.info[i]["participantID"],
                        'total': parseInt(p.info[i]["total"])


                    });
                }

            }
        }


        p.participantsClean = aparticipant.assignParticipants(getUnique(p.participants, 'participantID'));

        console.log('p.info', p.info);
        p.projectsClean = aparticipant.deleteDuplicatesX(p.info);
        console.log('dataSource.projectsClean', p.projectsClean);
        console.log(' p.dataClean', p.dataClean);

        p.d = aparticipant.dd(p);
        console.log('dataSource.p', p.d);



    },
    fillChartDataA: function (data) {
        console.log(data);
        var dataSource = {
            //participants: [],
            participantNames: [],
            participants: [],
            projects: [],
            projectsClean: [],
            chartData: [],
            xparticipant: [],
            participantsClean: [],
            dataClean: [],
            d: []
        };

        for (var i = 0; i < data['data'].length; i++) {

            dataSource.projects.push({
                'projectName': data['data'][i]["projectName"],
                'ProjectID': data['data'][i]["projectID"],
                'participantName': data['data'][i]["participantName"],
                'participantID': data['data'][i]["participantID"],
                'total': parseInt(data['data'][i]["total"])


            });
            dataSource.participants.push({ 'ParticipantName': data['data'][i]["participantName"], 'participantID': data['data'][i]["participantID"] });
            // dataSource.projectsNames.push({ 'name': data['data'][i]["projectName"] });   
        }
        dataSource.projectsClean = aparticipant.deleteDuplicatesX(dataSource.projects);

        dataSource.participantsClean = aparticipant.assignParticipants(getUnique(dataSource.participants, 'participantID'));

        //Acomodamos arreglo de participantes
        for (var x = 0, ien = data['data'].length; x < ien; x++) {

            dataSource.xparticipant.push({
                'participantName': data['data'][x]["participantName"],
                'participantID': data['data'][x]["participantID"],
                'projectID': data['data'][x]["projectID"],
                'projectName': data['data'][x]["projectName"],
                'total': parseInt(data['data'][x]["total"])
            });
        }


        //agregamos indices al onjeto principal
        for (var i = 0; i < dataSource.projects.length; i++) {

            for (var j = 0; j < dataSource.participantsClean.length; j++) {
                if (dataSource.projects[i]["participantID"] == dataSource.participantsClean[j]["participantID"]) {
                    dataSource.dataClean.push({
                        'index': dataSource.participantsClean[j]["posicion"],
                        'projectName': dataSource.projects[i]["projectName"],
                        'ProjectID': dataSource.projects[i]["ProjectID"],
                        'participantName': dataSource.projects[i]["participantName"],
                        'participantID': dataSource.projects[i]["participantID"],
                        'total': parseInt(dataSource.projects[i]["total"])


                    });
                }

            }
        }



        /// Acomodmos la informacion para la grafica
        //for (var i = 0; i < dataSource.dataClean.length; i++) {
        for (var j = 0; j < dataSource.participantsClean.length; j++) {
            for (var x = 0; x < dataSource.dataClean.length; x++) {
                if (dataSource.participantsClean[j]['participantID'] == dataSource.dataClean[x]['participantID']) {

                }
            }
        }

        //}

        dataSource.p = aparticipant.dd(dataSource);
        console.log('dataSource.projectsClean', dataSource.projectsClean);
        console.log('dataSource.p', dataSource.p);


        for (var x = 0; x < dataSource.projectsClean.length; x++) { //proyectos
            let dx = new Array();
            for (var i = 0; i < dataSource.p.length; i++) { //participantes
                let indicadores = dataSource.p[i].indicadores.data;
                for (j = 0; j < indicadores.length; j++) {

                    if (dataSource.projects[x].ProjectID == indicadores[j].projectID) {
                        dx.insert(indicadores[j].indice, indicadores[j].total);
                    }


                }


            }
            dataSource.chartData.push({ 'name': String(dataSource.projects[x]["projectName"]), 'data': dx });

        }

        console.log('dataSource.chartData', dataSource.chartData);

        //for (var i = 0; i < dataSource.p.length; i++) {

        //    let indicadores = dataSource.p[i].indicadores.data;
        //    for (var j = 0; j < indicadores.length; j++) {
        //        console.log('indicadores ' + dataSource.p[i].participanteName, indicadores[j])

        //    }
        //}

        //for (var i = 0; i < dataSource.projects.length; i++) {
        //    let dx = new Array();
        //    for (var j = 0; j < dataSource.xparticipant.length; j++) {
        //        if (dataSource.projects[i]["ProjectID"] == dataSource.xparticipant[j]["ProjectID"]) {
        //            dx.insert(dataSource.xparticipant[j]["index"], dataSource.xparticipant[j]["Total"]);
        //        }
        //    }
        //    dataSource.chartData.push({ 'name': String(dataSource.projects[i]["name"]), 'data': dx });

        //}



        aparticipant.chartAsignacionParticipantes(dataSource);


    },
    assignParticipants: function (arr) {
        let p = {
            participants: []
        };

        for (var i = 0; i < arr.length; i++) {
            p.participants.push({ 'posicion': i, 'participantName': arr[i]["ParticipantName"], 'participantID': arr[i]["participantID"] });
        }
        return p.participants;

    },
    dd: function (data) {

        let general = {
            participants: []
        };
        console.log('ddd', data.projectsClean);
        console.log('xx', data.participantsClean);
        for (var j = 0; j < data.participantsClean.length; j++) {
            let dx = {
                data: []
            };
            for (var i = 1; i < data.projectsClean.length; i++) {
                if (data.participantsClean[j]['participantID'] == data.dataClean[i]['participantID']) {
                    dx.data.push({
                        'indice': data.participantsClean[j]["posicion"],
                        'projectID': data.dataClean[i]["ProjectID"],
                        'projectName': data.dataClean[i]["projectName"],
                        'total': data.dataClean[i]["total"],
                    });
                }
                else {
                    dx.data.push({
                        'indice': data.participantsClean[j]["posicion"],
                        'projectID': data.dataClean[i]["ProjectID"],
                        'projectName': data.dataClean[i]["projectName"],
                        'total': 0,
                    });
                }
            }
            general.participants.push({
                'participanteName': data.participantsClean[j]["participantName"],
                'participantID': data.participantsClean[j]["participantID"],
                'indicadores': dx,
            });


        }
        console.log(general.participants);

        return general.participants;

    },
    deleteDuplicatesX: function (duplicados) {
        let proyect = {
            projects: []
        };
        let contador = 0;
        for (var i = 0; i < duplicados.length; i++) {
            if (contador == 0) {
                proyect.projects.push({ 'projectName': duplicados[i]["projectName"], 'ProjectID': duplicados[i]["ProjectID"] });

            }

            for (var j = 0; j < proyect.projects.length; j++) {
                if (proyect.projects[j]['ProjectID'] == duplicados[i]["ProjectID"]) {

                } else {
                    proyect.projects.push({ 'projectName': duplicados[i]["projectName"], 'ProjectID': duplicados[i]["ProjectID"] });
                    break;
                }
            }
            contador = contador + 1;



        }
        delete proyect.projects[0];
        return proyect.projects;

    },
    deleteDuplicates: function (duplicados) {
        let proyect = {
            projects: []
        };
        let arrayProjects = Array();
        let contador = 0;
        for (var i = 0; i < duplicados.length; i++) {
            if (contador == 0) {
                proyect.projects.push({ 'projectName': duplicados[i]["projectName"], 'ProjectID': duplicados[i]["ProjectID"] });

            }
            for (var j = 0; j < proyect.projects.length; j++) {
                if (proyect.projects[j]['ProjectID'] == duplicados[i]["ProjectID"]) {
                } else {
                    proyect.projects.push({ 'projectName': duplicados[i]["projectName"], 'ProjectID': duplicados[i]["ProjectID"] });
                }
            }
            contador = contador + 1;

        }
        return proyect.projects;


    },
    acSearchParticipant: function () {
        let btnSearch = $('._btnSearch');

        btnSearch.click(function () {
            let participantsIDS = $('#selectParticipants').val();
            $.ajax({
                method: "GET",
                url: "/Analytics/getParticipantsProjectsIndicatorsbySelection?&participantsIDS=" + participantsIDS,
                beforeSend: function () {
                    LoaderShow();
                },
                success: function (data) {
                    aparticipant.fillChartDataA(data);
                    //aparticipant.xx(data);


                },
                complete: function () {
                    LoaderHide();

                },
                error: function (xhr, status, error) {
                    LoaderHide();
                }
            });
        });
    },
    fillChartB: function () {
        let elements = ['Actividades', 'Incidentes', 'Hitos', 'Riesgos', 'Evidencias', 'Acuerdos'];
        let dataChart = '[{"index":"1","ParticipantID":"1a","ParticipantName":"jj Carlin Diaz","Element":"Actividades","ElementId":1,"Total":11},{"index":"1","ParticipantID":"1a","ParticipantName":"jj Carlin Diaz","Element":"Incidentes","ElementId":2,"Total":2},{"index":"1","ParticipantID":"1a","ParticipantName":"jj Carlin Diaz","Element":"Hitos","ElementId":3,"Total":5},{"index":"1","ParticipantID":"1a","ParticipantName":"jj Carlin Diaz","Element":"Riesgos","ElementId":4,"Total":15},{"index":"1","ParticipantID":"1a","ParticipantName":"jj Carlin Diaz","Element":"Evidencias","ElementId":5,"Total":3},{"index":"1","ParticipantID":"1a","ParticipantName":"jj Carlin Diaz","Element":"Acuerdos","ElementId":6,"Total":9},{"index":"2","ParticipantID":"2a","ParticipantName":"Daniel Padilla","Element":"Actividades","ElementId":1,"Total":8},{"index":"2","ParticipantID":"2a","ParticipantName":"Daniel Padilla","Element":"Incidentes","ElementId":2,"Total":78},{"index":"2","ParticipantID":"2a","ParticipantName":"Daniel Padilla","Element":"Hitos","ElementId":3,"Total":13},{"index":"2","ParticipantID":"2a","ParticipantName":"Daniel Padilla","Element":"Riesgos","ElementId":4,"Total":6},{"index":"2","ParticipantID":"2a","ParticipantName":"Daniel Padilla","Element":"Evidencias","ElementId":5,"Total":4},{"index":"2","ParticipantID":"2a","ParticipantName":"Daniel Padilla","Element":"Acuerdos","ElementId":6,"Total":11}]';
        let chartData = jQuery.parseJSON(dataChart);
        var dataSource = {
            chartData: [],
            participants: [],
        };
        for (var j = 0; j < chartData.length; j++) {
            dataSource.participants.push({
                'index': chartData[j]['index'],
                'ParticipantID': chartData[j]['ParticipantID'],
                'ParticipantName': chartData[j]['ParticipantName'],
                'Element': chartData[j]['Element'],
                'ElementId': chartData[j]['ElementId'],
                'Total': chartData[j]['Total']
            });
        }



        for (var i = 0; i < elements.length; i++) {
            let dx = new Array();
            for (var j = 0; j < dataSource.participants.length; j++) {
                if (elements[i] == dataSource.participants[j]["Element"]) {
                    dx.insert(dataSource.participants[j]["index"], dataSource.participants[j]["Total"]);
                }
            }
            dataSource.chartData.push({ 'name': String(elements[i]), 'data': dx });
        }

        //gestionamos participantes
        let participantsChart = new Array();
        for (var i = 0; i < dataSource.participants.length; i++) {
            console.log(participantsChart[dataSource.participants[i]["index"]] !== null);
            if (typeof participantsChart[dataSource.participants[i]["index"]] !== 'undefined' && participantsChart[dataSource.participants[i]["index"]] !== null) {
                participantsChart.insert(dataSource.participants[i]["index"], dataSource.participants[i]["ParticipantName"]);
            }
        }


        console.log(dataSource);
        console.log(participantsChart);

    },
    chartAsignacionParticipantes: function (dataChart) {
        let categories = Array();
        for (var j = 0; j < dataChart.participantsClean.length; j++) {
            categories.push(dataChart.participantsClean[j].participantName);
        }
        console.log('categories', categories)

        var chartAsignacionParticipante = new Highcharts.chart('AsignacionesPendientes', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Asignaciones pendientes de finalizar',
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
                categories: categories,//Particpantes,
                title: {
                    text: "Participantes"
                },
                labels: {
                    style: {
                        cursor: 'pointer'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Asignaciones pendiente',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' millions'
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
        console.log('dataChart.p', dataChart.p)

        //for (var i = 0; i < dataChart.p.length; i++) {

        //    let indicadores = dataChart.p[i].indicadores.data;
        //    for (var j = 0; j < indicadores.length; j++) {
        //        console.log('indicadores ' + dataChart.p[i].participanteName, indicadores[j])

        //    } 
        //} 


        for (var i = 0; i < dataChart.chartData.length; i++) {
            chartAsignacionParticipante.addSeries({
                name: String(dataChart.chartData[i].name),
                data: dataChart.chartData[i].data
            }, false);
        }
        chartAsignacionParticipante.redraw();

    },
    chartAsignacionParticipantes2: function (dataChart) {
        let categories = Array();
        for (var j = 0; j < dataChart.participantNames.length; j++) {
            categories.push(dataChart.participantNames[j].ParticipantName);
        }

        var chartAsignacionParticipante = new Highcharts.chart('AsignacionesPendientes', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Asignaciones pendientes de finalizar',
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
                categories: categories,
                title: {
                    text: "Participantes"
                },
                labels: {
                    style: {
                        cursor: 'pointer'
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Asignaciones pendiente',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                valueSuffix: ' millions'
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

        for (var i = 0; i < dataChart.chartData.length; i++) {
            chartAsignacionParticipante.addSeries({
                name: String(dataChart.chartData[i].name),
                data: dataChart.chartData[i].data
            }, false);
        }
        chartAsignacionParticipante.redraw();

    },
    fillChartA: function () {
        let urljson = "http://casamesura.com/data.php";
        let data = '[{"index":"1","ParticipantID":"83e7fb12-e8d8-4f1f-9db9-fde32719b02a","ParticipantName":"a","ProjectID":"p1","ProjectName":"Instagran","Total":"7"},{"index":"2","ParticipantID":"83e7fb12-e8d8-4f1f-9db9-fde32719b02b","ParticipantName":"b","ProjectID":"p2","ProjectName":"facebook","Total":"5"}]';
        let dataForParticipant = '[{"index":"1","ParticipantID":"83e7fb12-e8d8-4f1f-9db9-fde32719b02a","ParticipantName":"a","ProjectID":"p1","ProjectName":"Instagran","Total":"2"},{"index":"2","ParticipantID":"83e7fb12-e8d8-4f1f-9db9-fde32719b02a","ParticipantName":"a","ProjectID":"p2","ProjectName":"facebook","Total":"3"},{"index":"3","ParticipantID":"83e7fb12-e8d8-4f1f-9db9-fde32719b02b","ParticipantName":"b","ProjectID":"p1","ProjectName":"Instagran","Total":"10"},{"index":"4","ParticipantID":"83e7fb12-e8d8-4f1f-9db9-fde32719b02b","ParticipantName":"b","ProjectID":"p2","ProjectName":"facebook","Total":"8"}]';
        var obj = jQuery.parseJSON(data);
        var objParticipant = jQuery.parseJSON(dataForParticipant);
        let participants = new Array();
        var dataSource = {
            //participants: [],
            participantNames: [],
            projectsNames: [],
            projects: [],
            chartData: [],
            xparticipant: []
        };


        for (var n = 0, ien = obj.length; n < ien; n++) {
            //console.log(obj[i]["index"]);
            //participants.push(obj[n]["ParticipantName"]);
            // dataSource.participants.push({ 'orden': obj[n]["index"], 'ParticipantID': obj[n]["ParticipantID"], 'ParticipantName': obj[n]["ParticipantName"] });
            dataSource.participantNames.push({ 'ParticipantName': obj[n]["ParticipantName"] });
            dataSource.projects.push({ 'name': obj[n]["ProjectName"], 'ProjectID': obj[n]["ProjectID"] });
            dataSource.projectsNames.push({ 'name': obj[n]["ProjectName"] });
        }

        //Acomodamos arreglo de participantes
        for (var x = 0, ien = objParticipant.length; x < ien; x++) {

            dataSource.xparticipant.push({
                'index': objParticipant[x]["index"], 'name': objParticipant[x]["ParticipantName"], 'ParticipantID': objParticipant[x]["ParticipantID"]
                , 'ProjectID': objParticipant[x]["ProjectID"], 'ProjectName': objParticipant[x]["ProjectName"], 'Total': parseInt(objParticipant[x]["Total"])
            });
        }


        for (var i = 0; i < dataSource.projects.length; i++) {
            let dx = new Array();
            for (var j = 0; j < dataSource.xparticipant.length; j++) {
                if (dataSource.projects[i]["ProjectID"] == dataSource.xparticipant[j]["ProjectID"]) {
                    dx.insert(dataSource.xparticipant[j]["index"], dataSource.xparticipant[j]["Total"]);
                }
            }
            dataSource.chartData.push({ 'name': String(dataSource.projects[i]["name"]), 'data': dx });

        }
        aparticipant.chartAsignacionParticipantes(dataSource);






    },
    onChangeCompanys: function () {
        $('#vSelectEmpresasb').change(function () {
            let companyID = $(this).val();
            let selectAreas = $('#selectAreas');
            selectAreas.empty();

            $.ajax({
                method: "GET",
                url: "/Analytics/GetParticipantCompanysAreasByRoleSelectionList?&companyid=" + companyID,
                beforeSend: function () {
                    LoaderShow();
                },
                success: function (data) {

                    for (var i = 0, ien = data.length; i < ien; i++) {
                        selectAreas.append('<option value="' + data[i]["key"] + '">' + data[i]["value"] + '</option>');
                    }
                    selectAreas.selectpicker('refresh');

                },
                complete: function () {
                    LoaderHide();

                },
                error: function (xhr, status, error) {
                    LoaderHide();
                }
            });
        });
    },
    getCompanies: function () {
        let selectEmpresas = $('#vSelectEmpresas');
        let selectEmpresasB = $('#vSelectEmpresasb');
        selectEmpresas.empty();
        selectEmpresasB.empty();
        $.ajax({
            method: "GET",
            url: "/Analytics/GetParticipantCompanysByRoleSelectionList",
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {

                for (var i = 0, ien = data.length; i < ien; i++) {
                    selectEmpresas.append('<option value="' + data[i]["key"] + '">' + data[i]["value"] + '</option>');
                    selectEmpresasB.append('<option value="' + data[i]["key"] + '">' + data[i]["value"] + '</option>');
                }
                selectEmpresasB.selectpicker('refresh');
                selectEmpresas.selectpicker('refresh');

            },
            complete: function () {
                LoaderHide();

            },
            error: function (xhr, status, error) {
                LoaderHide();
            }
        });
        aparticipant.onChangeCompanys();
    },
    getParticipants: function () {
        let selectParticipants = $('#selectParticipants');
        $.ajax({
            method: "GET",
            url: "/Analytics/GetParticipantByRoleSelectionList",
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    ;
                    //if (data[i]["isActive"] == true) {
                    let fullName = data[i]["value"];
                    selectParticipants.append('<option value="' + data[i]["key"] + '">' + fullName + '</option>');
                    fullName = null;
                    //} 
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
    },
    btnOnClickParticipants: function () {
        let btnParticipants = $('.btn-participants');


    }
}







$('.highcharts-axis-labels text, .highcharts-axis-labels span').click(function () {
    var participante = this.textContent;
    $('#ModalAsignacionesPendientes').modal('show');
    $('#Participante').html(participante);
});
Highcharts.chart('AsignacionElementos', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'AsignaciÃ³n de elementos',
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
        categories: ['Manuel Cardenas', 'Daniel Padilla', 'Abraham', 'Diana', 'Jonathan']//Particpantes
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Total de elementos'
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
    series: [{
        name: 'Actividades',
        data: [5, 3, 4, 7, 2]
    }, {
        name: 'Incidentes',
        data: [2, 2, 3, 2, 1]
    }, {
        name: 'Hitos',
        data: [3, 4, 4, 2, 5]
    }, {
        name: 'Riesgos',
        data: [3, 4, 4, 2, 5]
    }, {
        name: 'Evidencias',
        data: [3, 4, 4, 2, 5]
    }, {
        name: 'Acuerdos',
        data: [3, 4, 4, 2, 5]
    }]
});

function getPointCategoryName(point, dimension) {
    var series = point.series,
        isY = dimension === 'y',
        axis = series[isY ? 'yAxis' : 'xAxis'];
    return axis.categories[point[isY ? 'y' : 'x']];
}
Highcharts.chart('container', {

    chart: {
        type: 'heatmap',
        marginTop: 40,
        marginBottom: 80,
        plotBorderWidth: 1
    },


    title: {
        text: 'Horas Planeadas',
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
        categories: ['Manuel Cardenas', 'Daniel Padilla', 'Abraham', 'Diana', 'Jonathan']//Particpantes
    },

    yAxis: {
        categories: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'],
        title: null,
        reversed: true
    },

    accessibility: {
        point: {
            descriptionFormatter: function (point) {
                var ix = point.index + 1,
                    xName = getPointCategoryName(point, 'x'),
                    yName = getPointCategoryName(point, 'y'),
                    val = point.value;
                return ix + '. ' + xName + ' sales ' + yName + ', ' + val + '.';
            }
        }
    },

    colorAxis: {
        min: 0,
        minColor: '#FFFFFF',
        maxColor: Highcharts.getOptions().colors[0]
    },

    legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 25,
        symbolHeight: 280
    },

    tooltip: {
        formatter: function () {
            return '<b>' + getPointCategoryName(this.point, 'x') + ': ' +
                this.point.value + '</b> horas el  <br><b>' + getPointCategoryName(this.point, 'y') + '</b>';
        }
    },

    series: [{
        name: 'Horas',
        borderWidth: 1,
        data: [[0, 0, 10], [0, 1, 19], [0, 2, 8], [0, 3, 24], [0, 4, 67], [0, 5, 0], [0, 6, 0], [1, 0, 92], [1, 1, 58], [1, 2, 78], [1, 3, 117], [1, 4, 48], [1, 5, 0], [1, 6, 0], [2, 0, 35], [2, 1, 15], [2, 2, 123], [2, 3, 64], [2, 4, 52], [2, 5, 0], [2, 6, 0], [3, 0, 72], [3, 1, 132], [3, 2, 114], [3, 3, 19], [3, 4, 16], [3, 5, 0], [3, 6, 0], [4, 0, 38], [4, 1, 5], [4, 2, 8], [4, 3, 117], [4, 4, 115], [4, 5, 0], [4, 6, 0]],
        dataLabels: {
            enabled: true,
            color: '#000000'
        }
    }],

    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                yAxis: {
                    labels: {
                        formatter: function () {
                            return this.value.charAt(0);
                        }
                    }
                }
            }
        }]
    }
});
Highcharts.chart('HorasAsignadas', {
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
        data: [{
            id: 'Manuel Cardenas',
            name: 'Manuel Cardenas',
            color: "#4caf502b"
        }, {
            id: 'Diana',
            name: "Diana",
            color: '#D5DBDB'
        }, {
            id: 'Daniel Padilla',
            name: 'Daniel Padilla',
            color: "#F6DDCC"
        }, {
            id: 'Abraham',
            name: 'Abraham',
            color: '#F2D7D5'
        }, {
            name: 'Proyecto 1',
            parent: 'Manuel Cardenas',
            value: 5
        }, {
            name: 'Proyecto 2',
            parent: 'Manuel Cardenas',
            value: 3
        }, {
            name: 'Proyecto 3',
            parent: 'Manuel Cardenas',
            value: 4
        }, {
            name: 'Proyecto 1',
            parent: 'Daniel Padilla',
            value: 4
        }, {
            name: 'Proyecto 2',
            parent: 'Daniel Padilla',
            value: 10
        }, {
            name: 'Proyecto 3',
            parent: 'Daniel Padilla',
            value: 1
        }, {
            name: 'Proyecto 1',
            parent: 'Abraham',
            value: 1
        }, {
            name: 'Proyecto 2',
            parent: 'Abraham',
            value: 3
        }, {
            name: 'Proyecto 3',
            parent: 'Abraham',
            value: 3
        }, {
            name: 'Proyecto 1',
            parent: 'Diana',
            value: 2,
        }]
    }],
    title: {
        text: 'Horas Asignadas por proyecto',
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
                    console.log(event);
                    $('#ModalActividadesHorasPlaneadas').modal('show');
                    $('#Proyecto').html(event.point.parent + ': ' + event.point.name);
                }
            }
        }
    }
});
Highcharts.chart('PlaneadasvsReales', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Horas planeadas vs reales',
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
        categories: ['Manuel Cardenas', 'Daniel Padilla', 'Abraham', 'Diana', 'Jonathan']//Particpantes
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
        shared: true
    },
    plotOptions: {
        series: {
            events: {
                click: function (event) {
                    console.log(event.point.category);
                    $('#ModalHorasPlaneadasReales').modal('show');
                    $('#ParticipanteHorasPlaneadasReales').html(event.point.category);
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
        data: [150, 73, 20, 20, 20],
        pointPadding: 0.3,
        pointPlacement: -0.2
    }, {
        name: 'Reales',
        color: '#ff2a07',
        data: [140, 90, 40, 20, 20],
        pointPadding: 0.4,
        pointPlacement: -0.2
    }]
});