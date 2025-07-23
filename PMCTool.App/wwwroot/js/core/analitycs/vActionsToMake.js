$(document).ready(() => {
    atm.init(); 
});
let atm = {
    init: function () { 
        $(document).on('click', '.btn-report', atm.executeReport);

   
    },
    executeReport: function () {
        let portafolio = $('#selportafolio').val();
        if (portafolio) {
            atm.getCharts();
        } else {
               alert("Debenes elegir un portafolio")
        }
     
    },
    getCharts: function () {
        Highcharts.chart('container2', {
            chart: {
                type: 'pie',
                zooming: {
                    type: 'xy'
                },
                panning: {
                    enabled: true,
                    type: 'xy'
                },
                panKey: 'shift',
                backgroundColor: 'white'
            },
            title: {
                text: 'Estatus de proyecto'
            },
            tooltip: {
                valueSuffix: '%'
            },
            subtitle: {
                text:
                    'Source:<a href="https://www.mdpi.com/2072-6643/11/3/684/htm" target="_default">MDPI</a>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: [{
                        enabled: true,
                        distance: 20
                    }, {
                        enabled: true,
                        distance: -40,
                        format: '{point.percentage:.1f}%',
                        style: {
                            fontSize: '1.2em',
                            textOutline: 'none',
                            opacity: 0.7
                        },
                        filter: {
                            operator: '>',
                            property: 'percentage',
                            value: 10
                        }
                    }]
                }
            },
            series: [
                {
                    name: 'Percentage',
                    colorByPoint: true,
                    data: [
                        {
                            name: 'En tiempo',
                            y: 55.02
                        },
                        {
                            name: 'Atrasado',
                            sliced: true,
                            selected: true,
                            y: 26.71
                        },
                        {
                            name: 'Con impacto',
                            y: 1.09
                        },
                        {
                            name: 'Cerrados',
                            y: 15.5
                        },
                        {
                            name: 'En configuracion',
                            y: 1.68
                        }
                    ],
                    point: {
                        events: {
                            click: function (event) {
                                $('#exampleModal').modal('show')
                            }
                        }
                    }
                }
            ]
        });

        Highcharts.chart('container1', {
            chart: {
                type: 'pie',
                zooming: {
                    type: 'xy'
                },
                panning: {
                    enabled: true,
                    type: 'xy'
                },
                panKey: 'shift',
                backgroundColor: 'white'
            },
            title: {
                text: 'Portafolio: proyectos en programa'
            },
            tooltip: {
                valueSuffix: '%'
            },
            subtitle: {
                text:
                    'Source:<a href="https://www.mdpi.com/2072-6643/11/3/684/htm" target="_default">MDPI</a>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: [{
                        enabled: true,
                        distance: 20
                    }, {
                        enabled: true,
                        distance: -40,
                        format: '{point.percentage:.1f}%',
                        style: {
                            fontSize: '1.2em',
                            textOutline: 'none',
                            opacity: 0.7
                        },
                        filter: {
                            operator: '>',
                            property: 'percentage',
                            value: 10
                        }
                    }]
                }
            },
            series: [
                {
                    name: 'Percentage',
                    colorByPoint: true,
                    data: [
                        {
                            name: 'PROFECO',
                            y: 55.02,
                            t: '9fe43f30-feb7-4589-b167-2e55987615e4'
                        },
                        {
                            name: 'ASF',
                            sliced: true,
                            selected: true,
                            t: '9fe43f30-feb7-4589-b167-2e55987615e4'
                        },
                        {
                            name: 'BUAP',
                            y: 1.09,
                            t: '9fe43f30-feb7-4589-b167-2e55987615e4'
                        },
                        {
                            name: 'FOCIR',
                            y: 15.5,
                            t: '9fe43f30-feb7-4589-b167-2e55987615e4'
                        },
                        {
                            name: 'GUARDIA NACIONAL',
                            y: 1.68,
                            t: '9fe43f30-feb7-4589-b167-2e55987615e4'
                        },
                        {
                            name: 'INAI',
                            y: 1.68,
                            t: '9fe43f30-feb7-4589-b167-2e55987615e4'
                        },
                        {
                            name: 'IPAB',
                            y: 1.68,
                            t: '9fe43f30-feb7-4589-b167-2e55987615e4'
                        }
                    ],
                    point: {
                        events: {
                            click: function (event) {
                                console.log(this.name + " " + this.y + this.t);
                                console.log(event);
                                console.log(this.t);

                                $('#exampleModal').modal('show')
                            }
                        }
                    }
                }
            ]
        });
    }
}
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};
