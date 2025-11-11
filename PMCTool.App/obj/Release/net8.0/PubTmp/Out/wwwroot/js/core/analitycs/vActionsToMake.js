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
        this.coloresEstatusProjectNumber = {
            'On time': '#4CAF50',           // Verde
            'Delayed': '#e6c702',            // Amarillo
            'WithImpact': '#dc3545',         // Rojo
            'Closed': '#d0d0d0',             // Gris claro
            'Cancel': '#545454',                 // Gris oscuro
            'Onsettings': '#F1F5F9'     // Gris mas clarito
        }
        //this.status = {
        //    'Onsettings': 'Onsettings',
        //    'Delayed': 'Delayed',
        //    'Closed': 'Closed',
        //    'OnTime': 'OnTime',
        //    'WithImpact': 'WithImpact',
        //    'Cancel': 'Cancel'
        //}
        this.init();
    }
    /**
     * @description Inicializa eventos o funciones.
     */
    init() {
        $(document).on('click', '.btn-report', this.executeReport.bind(this));
        $('#selportafolio').on('changed.bs.select', this.getPrograms.bind(this));
        $(document).on('click', '.btn-report-close', this.closeReport.bind(this));
        $(document).on('click', '.event-detail', this.eventDetailProgram.bind(this));
        this.initDataTableProject();
    }
    /**
     * @description Inicializa la tabla de proyectos con datatable
     */
    initDataTableProject() {
        $('.table-projects').DataTable({
            paging: true,
            searching: true,
            processing: true,
            responsive: true,
            order: [],
            columns: [
                { data: 'code' },
                { data: 'name' },
                {
                    data: 'stage', render: (data) => {
                        return $.i18n._(`${data}`);
                    }
                },
                { data: 'phase' },
                { data: 'projectManagerName' },
                { data: 'leaderName' },
                {
                    data: 'startDate',
                    defaultContent: '',       // si viene null o la propiedad no existe
                    render: (data) => {
                        return data?.split('T')[0];
                    }
                },
                {
                    data: 'endDate',
                    defaultContent: '',       // si viene null o la propiedad no existe
                    render: (data) => {
                        return data?.split('T')[0];
                    }
                },
                {
                    data: 'status', render: (data) => {
                        let color = this.coloresEstatusProjectNumber[$.i18n._("elementStatusName_" + data)];
                        return `<div style="width: 100%; background:${color}; font-weight: 500;">${$.i18n._(`elementStatusName_${data}`)}</div>`;
                    }
                },
                {
                    data: 'plannedProgress', render: (data) => {
                        return `${data}%`;
                    }
                },
                {
                    data: 'progress', render: (data) => {
                        return `${data}%`;
                    }
                }
            ],
            language: {
                url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
            },
            dom: 'Bfrtip',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: $.i18n._(`Analytics5_023`),
                    exportOptions: {
                        modifier: {
                            page: 'all',       // exporta todas las páginas
                            search: 'applied'  // respeta el filtro activo (opcional)
                        },
                        columns: ':visible'   // sólo columnas visibles (opcional)
                    }
                }
            ],
        });
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
        $('#selprograma').append(`<option value="">${$.i18n._('Analytics5_002') }</option>`);
        programs.forEach(program => {
            $('#selprograma').append(`<option value="${program.key}">${program.value}</option>`);
        });
        $('#selprograma').selectpicker('refresh'); // Refresca el selectpicker para mostrar los nuevos datos
    }
    async closeReport() {
        window.location.reload();
    }
    /**
     * @description Valida opcion seleccionada, manda un await para traer la data estructurada de las graficas y manda llamar la funcion que construye los pie / Manda traer la info para el detalle de la tabla
     * Destructura el response del req para la construccion de la grafica
     */
    async executeReport() {
       
        let headers = `<tr style="background: #c1c1c1;">
                                                    <th>${ $.i18n._("Analytics5_004") }</th>
                                                    <th>TOTAL</th>
                                                </tr>`;
        let table = "";
        let chart1 = "visible";
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
                const objectLength = Object.keys(graphicProjectsInProgram).length;
               
                if (objectLength > 26) {
                    let tablecontainet = $(".pp1");
                    tablecontainet.empty();
                    let row = "";
                    Object.keys(graphicProjectsInProgram).forEach(key => {
                        row = row + `<tr">
                                                    <td><a href='#' class='event-detail' data-idprogram='${graphicProjectsInProgram[key].t}'>${graphicProjectsInProgram[key].name}</a></td>
                                                    <td><a href='#' class='event-detail' data-idprogram='${graphicProjectsInProgram[key].t}'>${graphicProjectsInProgram[key].y}</a></td>
                                                </tr>`;

                    });
                    tablecontainet.append("<center><table class='table' style='width: 50%;'>" + headers + row + "</table></center>");
                    chart1 = "hidden";
                    
                } else {
                    chart1 = "visible";
                }
                this.getCharts(graphicStatusProjects, graphicProjectsInProgram, chart1);
                LoaderHide();
            }
            
        } else {
            Swal.fire({
                type: 'error',
                title: '',
                text: $.i18n._("Analytics5_003"),
                footer: ''
            });
        }
    }
    /**
     * @description Manda traer los proyectos del programa y construir el modal con la tabla
     * @param {string} e Se refiere donde vamos a obtener el elemento para obtener el id del programa y pasarlo a funcion que  trae los proyectos del programa
     */
    async eventDetailProgram(e) {
        LoaderShow();
        let data = await this.reqDataProjectsByProgram(e.target.dataset.idprogram);
        let headers = `<tr style="background: #c1c1c1;">
                                                    <th>${$.i18n._("Analytics5_004")}</th>
                                                    <th>${$.i18n._("Analytics5_005")}</th>
                                                </tr>`;
        this.construcTableDetailGraphic(headers, data);
        LoaderHide();
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
    construcTableProjects(data) {
        $('.table-projects').DataTable().clear().draw();
        $('.table-projects').DataTable().columns.adjust().draw();
        $('.table-projects').DataTable().rows.add(data).draw();
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
    getCharts(seriesSP, seriesPP, chart1) {
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
                text: $.i18n._("Analytics5_009")
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
                    name: $.i18n._("Analytics5_008"),
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
                                //this.name = self.status[this.name];
                                let data = await self.reqDataProjectsByStatus(this.t, this.name);
                                let headers = `<tr style="background: #c1c1c1;">
                                                    <th>${$.i18n._("Analytics5_004") }</th>
                                                    <th>${$.i18n._("Analytics5_005") }</th>
                                                    <th>${$.i18n._("Analytics5_006") }</th>
                                                </tr>`;
                                self.construcTableDetailGraphic(headers, data);
                                LoaderHide();
                            }
                        }
                    }
                }
            ]
        });

        if (chart1 == "visible") {
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
                    text: $.i18n._("Analytics5_007")
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
                        name: $.i18n._("Analytics5_008"),
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
                                                    <th>${$.i18n._("Analytics5_004") }</th>
                                                    <th>${$.i18n._("Analytics5_005") }</th>
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

