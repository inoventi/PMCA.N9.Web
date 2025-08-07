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
        this.init();
    }
    init() {
        $(document).on('click', '.btn-report',async (e) => {
            if ($('#selprojects').val() === null || $('#selprojects').val().length === 0) {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: 'Debe seleccionar al menos un proyecto',
                    footer: ''
                });
                return;
            }
            if ($('#startDate').val() === '' || $('#endDate').val() === '') {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: 'Debe seleccionar un rango de fechas',
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
    }
    async reqElementsProject({ projectID, startDate, endDate }) {
        let response = await fetch(`/ActionsToMake/GetProjectElementsCheck005?projectId=${projectID}&startDate=${startDate}&endDate=${endDate}`);
        let data = await response.json();
        return data;
    }
    constructTables({indicatorTable1,indicatorTable2,indicatorTable3 }) {
        $('#table-body-elements-in-progress').empty();
        $('#table-body-elements-delayed').empty();
        $('#table-body-elements-soon').empty();
        let indicators = {
            '1': 'st-entiempo',
            '2': 'st-atrasado',
            '3': 'st-cimpacto'
        }
        indicatorTable1.forEach(({ elementType, description, date, status }) => {
            $('#table-body-elements-in-progress').append(`<tr>
                                                            <td class="text-left">${$.i18n._("E0" + elementType) }</td>
                                                            <td class="text-left">${description}</td>
                                                            <td class="text-left">${date?.split('T')[0]}</td>
                                                            <td class="text-left"><span class="bold ${indicators[status]} font7em float-center">${$.i18n._("elementStatusName_" + status)}</span></td>
                                                        </tr>`);
        });

        indicatorTable2.forEach(({ elementType, description, date, status }) => {
            $('#table-body-elements-delayed').append(`<tr>
                                                            <td class="text-left">${$.i18n._("E0" + elementType)}</td>
                                                            <td class="text-left">${description}</td>
                                                            <td class="text-left">${date?.split('T')[0]}</td>
                                                            <td class="text-left"><span class="bold ${indicators[status]} font7em float-center">${$.i18n._("elementStatusName_" + status)}</span></td>
                                                        </tr>`);
        });

        indicatorTable3.forEach(({ elementType, description, date, status }) => {
            $('#table-body-elements-soon').append(`<tr>
                                                        <td class="text-left">${$.i18n._("E0" + elementType)}</td>
                                                        <td class="text-left">${description}</td>
                                                        <td class="text-left">${date?.split('T')[0]}</td>
                                                        <td class="text-left"><span class="bold ${indicators[status]} font7em float-center">${$.i18n._("elementStatusName_" + status)}</span></td>
                                                    </tr>`);
        });
        
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new elementsToVerify();
});
