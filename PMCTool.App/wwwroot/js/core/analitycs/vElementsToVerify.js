class elementsToVerify {
    constructor() {
        $.fn.selectpicker.defaults = {
            selectAllText: 'Seleccionar Todo',
            deselectAllText: 'Deseleccionar Todo'
        };
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
        this.indicators = {
            '1': 'st-entiempo',
            '2': 'st-atrasado',
            '3': 'st-cimpacto'
        }
        this.init();
    }
    /**
     * @description Inicializa los eventos y funciones que se ocupan
     */
    init() {
        $(document).on('click', '.btn-report',async (e) => {
            if ($('#selprojects').val() === null || $('#selprojects').val().length === 0) {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: $.i18n._("Analytics5_024"),
                    footer: ''
                });
                return;
            }
            if ($('#startDate').val() === '' || $('#endDate').val() === '') {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: $.i18n._("Analytics2_001"),
                    footer: ''
                });
                return;
            }
            LoaderShow();
            let data = {
                projectID: $('#selprojects').val(),
                startDate: $('#startDate').val(),
                endDate: $('#endDate').val()
            };
            let elements = await this.reqElementsProject(data);
            console.log(elements);
            this.constructTables(elements);
            LoaderHide();
        });
        this.initsDataTables('table-elements-in-progress');
        this.initsDataTables('table-elements-delayed');
        this.initsDataTables('table-elements-soon');
    }
    /**
     * @description Funcion que inicializa las tablas de datatables
     * @param {string} table Hace Referencia al nombre de la tabla que se va a inicializar
     */
    initsDataTables(table) {
        $(`.${table}`).DataTable({
            paging: true,
            searching: true,
            processing: true,
            responsive: true,
            order: [],
            columns: [
                {
                    data: 'elementType', render: (elementType) => {
                        return $.i18n._("E0" + elementType);
                    }
                },
                {
                    data: 'description', render: (description, data, { projectId, elementId, elementType }) => {
                        //console.log(projectId, elementId, elementType);
                        let url = '';
                        switch (elementType) {
                            case 1:
                                url = `/Execution/Activity?projectId=${projectId}&activityId=${elementId}`;
                                break;
                            case 2:
                                url = `/Execution/Milestone?projectId=${projectId}&milestoneId=${elementId}`;
                                break;
                            case 3:
                                url = `/Execution/Evidence?projectId=${projectId}&evidenceId=${elementId}`;
                                break;
                            case 4:
                                url = `/Execution/Incident?projectId=${projectId}&incidentId=${elementId}`;
                                break;
                            case 5:
                                url = `/Execution/Risk?projectId=${projectId}&riskId=${elementId}`;
                                break;
                        }
                        return `<a target="_blank" href="${window.baseUrl}${url}">${description}</a>`;
                    }
                },
                {
                    data: 'date', render: (date) => {
                        return date?.split('T')[0];
                    }
                },
                {
                    data: 'status', render: (status) => {
                        return `<span class="bold ${this.indicators[status]} font7em float-center">${$.i18n._("elementStatusName_" + status)}</span>`;
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
     * @description Manda un request para traer la informacion para el llenado de las tablas
     * @param {string,string,string} Parametros {projectID,startDate,endDate} Recibe los datos destructurados de data donde obtenemos el projectID y los rangos de fechas
     * @returns regresa la informacion para hacer el llenado de las tablas
     */
    async reqElementsProject({ projectID, startDate, endDate }) {
        let response = await fetch(`/ActionsToMake/GetProjectElementsCheck005?projectId=${projectID}&startDate=${startDate}&endDate=${endDate}`);
        let data = await response.json();
        return data;
    }
    /**
     * @description Funcion que hace que limpie las tablas y las reconstruyas
     * @param {string,string,sring} Parametros {indicatorTable1,indicatorTable2,indicatorTable3} estos paramentros recibes la informacion para reconstruir las tablas
     */
    constructTables({indicatorTable1,indicatorTable2,indicatorTable3 }) {
        $('.table-elements-in-progress').DataTable().clear().draw();
        $('.table-elements-in-progress').DataTable().columns.adjust().draw();
        $('.table-elements-in-progress').DataTable().rows.add(indicatorTable1).draw();

        $('.table-elements-delayed').DataTable().clear().draw();
        $('.table-elements-delayed').DataTable().columns.adjust().draw();
        $('.table-elements-delayed').DataTable().rows.add(indicatorTable2).draw();

        $('.table-elements-soon').DataTable().clear().draw();
        $('.table-elements-soon').DataTable().columns.adjust().draw();
        $('.table-elements-soon').DataTable().rows.add(indicatorTable3).draw();
        
    }
}
/**
 * @description Inicializa la clase cuando todo el DOM este cargado
 */
document.addEventListener("DOMContentLoaded", () => {
    new elementsToVerify();
});
