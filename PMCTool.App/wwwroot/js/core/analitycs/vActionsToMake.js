class atm {
    constructor() {
        //let formatter = new Intl.NumberFormat('en-US', {
        //    style: 'currency',
        //    currency: 'USD',

        //    // These options are needed to round to whole numbers if that's what you want.
        //    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        //    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
        //});
        $.fn.selectpicker.defaults = {
            selectAllText: 'Seleccionar Todo',
            deselectAllText: 'Deseleccionar Todo'
        };
        //Config Charts
        this.coloresEstatusProject = {
            'En tiempo': '#4CAF50',           // Verde
            'Atrasado': '#e6c702',            // Amarillo
            'Con impacto': '#dc3545',         // Rojo
            'Cerrado': '#d0d0d0',             // Gris claro
            'Cancelado': '#545454',                 // Gris oscuro
            'En configuracion': '#F1F5F9'     // Gris mas clarito
        };
        this.init();
    }
    /**
     * @description Inicializa eventos o funciones.
     */
    init() {
        $(document).on('click', '.btn-report', this.executeReport.bind(this));
        $('#selportafolio').on('changed.bs.select', this.getPrograms.bind(this));
    }
    /**
     * @description Trae los programas que pertenece al portafolio y manda llamar la funcion que reconstruye el selector de programas
     */
    async getPrograms() {
        let idPortfolio = $('#selportafolio').val();
        try {
            const response = await fetch(`/ActionsToMake/GetPrograms?idPortfolio=${idPortfolio}`);
            const data = await response.json();
            this.construcSelectPrograms(data);
        } catch (e) {
            console.error("ERROR:", e);
        }

    }
    /**
     * @description Reconstruccion del selector de programas
     * @param {Object} programs Referencia a la lista que regrese para la contruccion del selector de programas
     */
    construcSelectPrograms(programs) {
        $('#selprograma').empty();
        $('#selprograma').append('<option value="">Selecciona un programa</option>');
        programs.forEach(program => {
            $('#selprograma').append(`<option value="${program.key}">${program.value}</option>`);
        });
        $('#selprograma').selectpicker('refresh'); // Refresca el selectpicker para mostrar los nuevos datos
    }
    /**
     * @description Valida opcion seleccionada y manda llamar la funcion que construye los pie
     */
    async executeReport() {
        //Tendra que ser una funcion async para esperar la respuesta de la api
        let portafolio = $('#selportafolio').val();
        if (portafolio) {
            // await this.reqDataCharts(); ejemplo donde this.getCharts(param); mandaremos el parametro de la data ya estructurada para la construcion de los Pie
            this.getCharts();
        } else {
            alert("Debenes elegir un portafolio");
        }
    }
    /**
     * @description Contruye las graficas de los pie
     * @param { Object } seriesSP Referencia a la data ya estructurada para construir la grafica pie de estatus de proyecto
     * @param { Object } seriesPP Referencia a la data ya estructurada para construir la grafica pue de proyectos en programa
     */
    getCharts(seriesSP,seriesPP) {
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
                    borderColor: 'white',
                    borderWidth: 0,
                    slicedOffset: 10, // separación más visible
                    states: {
                        hover: {
                            enabled: true,
                            halo: false,
                            brightness: 0,
                        }
                    },
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
                    states: {
                        inactive: {
                            enabled: false // Esto es lo que realmente previene el opacado
                        }
                    },
                    name: 'Percentage',
                    colorByPoint: true,
                    data: [
                        {
                            name: 'En tiempo',
                            y: 55.02,
                            color: this.coloresEstatusProject['En tiempo']
                        },
                        {
                            name: 'Atrasado',
                            y: 26.71,
                            color: this.coloresEstatusProject['Atrasado'],
                        },
                        {
                            name: 'Con impacto',
                            y: 1.09,
                            color: this.coloresEstatusProject['Con impacto'],
                        },
                        {
                            name: 'Cerrado',
                            y: 15.5,
                            color: this.coloresEstatusProject['Cerrado'],
                        },
                        {
                            name: 'Cancelado',
                            y: 15.5,
                            color: this.coloresEstatusProject['Cancelado'],
                        },
                        {
                            name: 'En configuracion',
                            y: 8.68,
                            color: this.coloresEstatusProject['En configuracion'],
                        }
                    ],
                    point: {
                        events: {
                            mouseOver: function () {
                                this.slice(true); // separa al pasar el mouse
                            },
                            mouseOut: function () {
                                this.slice(false); // regresa cuando se quita el mouse
                            },
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
                    borderColor: null, //Quitamos color negro en los bordes
                    borderWidth: 0, //Aseguramos que no se pinte el borde
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
/**
 * @description Inicializa la clase cuando ya todo el DOM este cargado
 */
document.addEventListener("DOMContentLoaded", () => {
    new atm();
});

