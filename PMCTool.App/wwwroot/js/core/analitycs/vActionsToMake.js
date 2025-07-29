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
            'OnTime': '#4CAF50',           // Verde
            'Delayed': '#e6c702',            // Amarillo
            'WithImpact': '#dc3545',         // Rojo
            'Closed': '#d0d0d0',             // Gris claro
            'Cancel': '#545454',                 // Gris oscuro
            'Onsettings': '#F1F5F9'     // Gris mas clarito
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
     * @description Valida opcion seleccionada, manda un await para traer la data estructurada de las graficas y manda llamar la funcion que construye los pie
     * Destructura el response del req para la construccion de la grafica
     */
    async executeReport() {
        let portafolio = $('#selportafolio').val();
        if (portafolio) {
            let { graphicProjectsInProgram, graphicStatusProjects } = await this.reqDataCharts(portafolio);
            this.getCharts(graphicStatusProjects,graphicProjectsInProgram );
        } else {
            alert("Debenes elegir un portafolio");
        }
    }
    /** 
     * @description Manda una peticion para traer la data estructurada para la construccion de las graficas pie
     * @param {string} portfolio Referencia al id del portafolio
     * @returns Regresa la data con los dos objectos para las dos graficas
     */
    async reqDataCharts(portfolio) {
        let response = await fetch('/ActionsToMake/Graphics?idPortfolio=' + portfolio);
        let data = await response.json();
        return data;
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
                valueSuffix: ''
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
                    name: 'Projects',
                    colorByPoint: true,
                    data: seriesSP,
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
                valueSuffix: ''
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
                    name: 'Projects',
                    colorByPoint: true,
                    data: seriesPP,
                    point: {
                        events: {
                            mouseOver: function () {
                                this.slice(true); // separa al pasar el mouse
                            },
                            mouseOut: function () {
                                this.slice(false); // regresa cuando se quita el mouse
                            },
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

