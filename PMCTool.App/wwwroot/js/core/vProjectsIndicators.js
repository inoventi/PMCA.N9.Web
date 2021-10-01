$(document).ready(function () {
    ProjectsIndicatorsController.initGraphic();
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
    }
}