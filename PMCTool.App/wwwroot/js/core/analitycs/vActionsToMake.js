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
     * @description Valida opcion seleccionada, manda un await para traer la data estructurada de las graficas y manda llamar la funcion que construye los pie / Manda traer la info para el detalle de la tabla
     * Destructura el response del req para la construccion de la grafica
     */
    async executeReport() {
        let portafolio = $('#selportafolio').val();
        let programa = $('#selprograma').val();
        if (portafolio) {
            if (programa) {
                LoaderShow();
                $('.charts').attr('hidden', 'true');
                $('#table').removeAttr('hidden');
                let data = await this.reqDataTableProjects(programa);
                this.construcTableProjects(data);
                LoaderHide();
                
            } else {
                LoaderShow();
                $('#table').attr('hidden', 'true');
                $('.charts').removeAttr('hidden');
                let { graphicProjectsInProgram, graphicStatusProjects } = await this.reqDataCharts(portafolio);
                this.getCharts(graphicStatusProjects, graphicProjectsInProgram);
                LoaderHide();
            }
            
        } else {
            alert("Debenes elegir un portafolio");
        }
    }
    /**
     * @description Mandda una peticion para traer la data del detalle de la tabla
     * @param {string} program Hace referencia al id del programa.
     * @returns Retorna los rows para construir el detalle de la tabla
     */
    async reqDataTableProjects(program) {
        let response = await fetch(`/ActionsToMake/ProjectsTableDetail?programa=${program}`);
        let data = await response.json();
        return data;
    }
    /**
     * @description Funcion donde limpia la tabla y la reconstruye.
     * @param {string} rows Hace refencia a un paramatro string donde viene incrustado el html ya de los rows para pintarlos en la tabla
     */
    construcTableProjects(rows) {
        $('.body-table-projects').empty();
        $('.body-table-projects').append(rows);
    }
    /** 
     * @description Manda una peticion para traer la data estructurada para la construccion de las graficas pie
     * @param {string} portfolio Referencia al id del portafolio
     * @returns Regresa la data con los dos objectos para las dos graficas
     */
    async reqDataCharts(portfolio) {
        let response = await fetch(`/ActionsToMake/Graphics?idPortfolio=${portfolio}`);
        let data = await response.json();
        return data;
    }
    /**
     * @description Contruye las graficas de los pie
     * @param { Object } seriesSP Referencia a la data ya estructurada para construir la grafica pie de estatus de proyecto
     * @param { Object } seriesPP Referencia a la data ya estructurada para construir la grafica pue de proyectos en programa
     */
    getCharts(seriesSP, seriesPP) {
        let self = this; // guarda el contexto de la clase
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
                    ''
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
                            click: async function (event) {
                                LoaderShow();
                                let data = await self.reqDataProjectsByStatus(this.t, this.name);
                                let headers = `<tr style="background: #c1c1c1;">
                                                    <th>PROGRAMA</th>
                                                    <th>NOMBRE DE PROYECTO</th>
                                                    <th>ESTATUS</th>
                                                </tr>`;
                                self.construcTableDetailGraphic(headers, data);
                                LoaderHide();
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
                    ''
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
                            click: async function (event) {
                                LoaderShow();
                                let data = await self.reqDataProjectsByProgram(this.t);
                                let headers = `<tr style="background: #c1c1c1;">
                                                    <th>PROGRAMA</th>
                                                    <th>NOMBRE DE PROYECTO</th>
                                                </tr>`;
                                self.construcTableDetailGraphic(headers, data);
                                LoaderHide();
                            }
                        }
                    }
                }
            ]
        });
    }
    /**
     * @description Request que hace al endpoint para traer el detalle de los proyectos por estatus
     * @param {string} portfolio Hace referencia al id del portafolio
     * @param {string} status Hace referencia al nombre del estado
     * @returns Retorna los rows ya estructurados para la tabla
     */
    async reqDataProjectsByStatus(portfolio, status) {
        let response = await fetch(`/ActionsToMake/DetailProjectsByStatus?portfolio=${portfolio}&status=${status}`);
        let data = await response.json();
        return data;
    }
    /**
     * @description Request que hace al endpoint para traer el detalle de los proyectos que se encuentran en el programa
     * @param {string} program Hace referencia al id del programa
     * @returns retorna los rows ya estructurados para la tabla
     */
    async reqDataProjectsByProgram(program) {
        let response = await fetch(`/ActionsToMake/DetailProjectsByProgram?idProgram=${program}`);
        let data = await response.json();
        return data;
    }
    /**
     * @description Contruccion de la tabla detalle de las graficas Reutilizable
     * @param {string} headers Hace referencia a la cabecera de la tabla con las columnas
     * @param {string} rows Hace referencias a los renglones de la tabla
     */
    construcTableDetailGraphic(headers,rows) {
        $('.header-table-graphic').empty();
        $('.header-table-graphic').append(headers);
        $('.body-table-graphic').empty();
        $('.body-table-graphic').append(rows);
        $('#exampleModal').modal('show');

    }
}
/**
 * @description Inicializa la clase cuando ya todo el DOM este cargado
 */
document.addEventListener("DOMContentLoaded", () => {
    new atm();
});

