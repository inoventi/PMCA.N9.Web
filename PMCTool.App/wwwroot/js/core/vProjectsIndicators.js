$(document).ready(function () {
    //ProjectsIndicatorsController.initGraphic();
    ProjectsIndicatorsController.initPetition();
})

const ProjectsIndicatorsController = {
    initGraphic: () => {
        Highcharts.chart('inversion', {
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            title: {
                text: 'Carretera: Nuevo Casas Grandes – Puerto Palomas'
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: ['Enero 2021', 'Febrero 2021', 'Marzo 2021', 'Abril 2021', 'Mayo 2021', 'Junio 2021', 'Julio 2021', 'Agosto 2021', 'Septiembre 2021', 'Octubre 2021', 'Noviembre 2021', 'Diciembre 2021', 'Enero 2022', 'Febrero 2022', 'Marzo 2022']
            },
            yAxis: {
                title: {
                    text: ''
                },
                min: 0,

            },
            tooltip: {
                formatter: function () {
                    return this.y.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:,.2f}',
                        allowOverlap: true
                    }
                }
            },
            series: [{
                name: 'AC(Costo Real)',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: 'red',
                    radius: 5
                },
                data: [2.6, 3.5, 4.7, 6.7, 8, 9.5, 11.5]
            }, {
                name: 'PC(Costo Proyectado)',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: 'red',
                    radius: 5
                },
                dashStyle: 'dash',
                data: [null, null, null, null, null, null, 11.5, 12.5, 13.9, 14.5, 15.5, 16.5, 17.5, 18.5, 19.5]
            }, {
                name: 'AV(Valor Real)',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: 'gray',
                    radius: 5
                },
                data: [1, 2, 2.8, 3.2, 4.2, 4.7, 5.5]
            }, {
                name: 'PRC(Valor Proyectado)',
                color: '#235b4e',
                lineWidth: 1,
                marker: {
                    fillColor: '#B38E5D',
                    radius: 5
                },
                dashStyle: 'dash',
                data: [null, null, null, null, null, null, 5.7, 6.9, 7.5, 8, 11, 12, 12.5, 13, 14]
            }, {
                name: 'PV(Valor planeado)',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: '#92d050',
                    radius: 5
                },
                data: [1.5, 2.5, 3.5, 4.5, 5.3, 6.7, 7.9, 9.5, 11, 12, 13, 14]
            }],
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            }
        });
    },
    initPetition: () => {
        $('#btnReport').click(() => {
            LoaderShow();
            let states = $("#Entidad").val();
            let generalDirection = $('#DireccionGral').val();
            let projectType = $('#TipoProyecto').val();
            let stage = $('#Etapa').val();
            let investment = $('#Inversion').val();
            let advertisement = $('#Anuncio').val();
            let data = {
                states: states.join(),
                generalDirection: generalDirection.join(),
                projectType: projectType.join(),
                stage: stage.join(),
                investment: investment.join(),
                advertisement: advertisement.join(),
            };
            $.post('/ProjectIndicators/GetDataProjectIndicators', data, function (data) {
                data == '' ? ProjectsIndicatorsController.initCustomReaction(2) : ProjectsIndicatorsController.initAcomodateData(data);
                LoaderHide();
            }).fail(function (e) {
                console.log("ERROR: ", e);
            });
        });
    },
    initAcomodateData: (data) => {
        //CICLO PARA APLICAR FORMULAS Y CONSTRUIR LA TABLA
        for (let a = 0; a < data.length; a++) {
            //ID DEL PROYECTO
            let projectID = data[a].projectID;
            //NOMBRE DEL PROYECTO
            let projectName = data[a].name;
            //FORMULA PARA SACAR CPI = EV/AC
            let cpi = data[a].ev / data[a].ac;
            cpi = cpi.toFixed(2);
            cpi > 1.00 ? (cpi = '<td class="text-center indicadores-success">' + cpi + '</td>') : '';
            cpi > 0.80 && cpi < 1.00 ? (cpi = '<td class="text-center indicadores-warning">' + cpi + '</td>') : '';
            cpi < 0.80 ? (cpi = '<td class="text-center indicadores-danger">' + cpi + '</td>') : '';
            //FORMULA PARA SACAR SPI = PV/AC
            let spi = data[a].pv / data[a].ac;
            spi = spi.toFixed(2); 
            spi > 1.00 ? (spi = '<td class="text-center indicadores-success">' + spi + '</td>') : '';
            spi > 0.80 && spi < 1.00 ? (spi = '<td class="text-center indicadores-warning">' + spi + '</td>') : '';
            spi < 0.80 ? (spi = '<td class="text-center indicadores-danger">' + spi + '</td>') : '';
            //VIENE DEL CEO EL VALOR DE BAC
            let bac = Math.random() * (30 - 0);
            bac = bac.toFixed(2);
            //SE OCUPA SACAR LA DE LA FORMULA DE TENDENCIA PARA SACAR EL TOTAL DE PRESUPUESTO PROYECTADO
            let eac = Math.random() * (30 - 0);
            eac = eac.toFixed(2); 
            //VALOR DE VAC = DIFERENCIA ENTRE EAC Y BAC
            let vac;
            if (eac > bac) {
                vac = eac - bac;
                vac = vac.toFixed(2);
            } else if (eac < bac) {
                vac = bac - eac;
                vac = vac.toFixed(2);
            } else {
                vac = 0;
            }
            let endDate = data[a].endDate;

            endDate != null ? endDate = endDate.split('T')[0] : endDate= '';
            //PARA SACAR LA FECHA PROYECTADA SE OBTIENE DE LA FORMALA DE TENDENCIA HASTA QUE EV SE ACERQUE A BAC(PRESUPUESTO TOTAL PLANEADO(CEO))
            let endDataProjected = '2021-10-06';
            $('#tBodyProjectIndicators').append('<tr>'
                + '<td class= "text-center">' + projectID + '</td>'
                + '<td><a href="/ProjectIndicators/Indicator">' + projectName + '</a></td>'
                + cpi
                + spi
                + '<td class="text-center">' + bac + '</td>'
                + '<td class="text-center">' + eac + '</td>'
                + '<td class="text-center">' + vac + '</td>'
                + '<td class="text-center">' + endDate + '</td>'
                + '<td class="text-center">' + endDataProjected + '</td>'
                +'</tr>');

        }
        if (data.length > 0) {
            ProjectsIndicatorsController.initCustomReaction(1);
        } else {
            ProjectsIndicatorsController.initCustomReaction(2);
        }
    },
    initCustomReaction: (e) => {
        switch (e) {
            case 1:
                $('#divTableProjectIndicators').removeAttr('hidden');
                $('#TableProjectIndicators').removeAttr('hidden');
                ProjectsIndicatorsController.ResetSelects();
                break;
            case 2:
                $('#divTableProjectIndicators').removeAttr('hidden');
                $('#divTableProjectIndicators').append('<center>No se encontraron registros.</center>');
                ProjectsIndicatorsController.ResetSelects();
                break;
        }
        $('#btnClose').click(() => {
            window.location.href = window.location.href;
        })
    },
    ResetSelects: () => {
        $('#btnReport').hide();
        $('#btnClose').removeAttr('hidden');
        //$('#btnPDF').removeAttr('hidden');
        $('#Entidad').prop('disabled', true);
        $('#Entidad').selectpicker('refresh');
        $('#DireccionGral').prop('disabled', true);
        $('#DireccionGral').selectpicker('refresh');
        $('#TipoProyecto').prop('disabled', true);
        $('#TipoProyecto').selectpicker('refresh');
        $('#Etapa').prop('disabled', true);
        $('#Etapa').selectpicker('refresh');
        $('#Inversion').prop('disabled', true);
        $('#Inversion').selectpicker('refresh');
        $('#Anuncio').prop('disabled', true);
        $('#Anuncio').selectpicker('refresh');
    },
}
function pad(n, width, z) { z = z || '0'; n = n + ''; return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n; }