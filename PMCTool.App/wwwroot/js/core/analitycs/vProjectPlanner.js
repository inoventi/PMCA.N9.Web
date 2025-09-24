class projectDetail {
    constructor() {
        this.indicators = {
            '1': 'st-entiempo',
            '2': 'st-atrasado',
            '3': 'st-cimpacto',
            '4': 'st-cerrado',
            '5': 'st-cancelado',
        }
        $('.section').removeAttr('hidden');
        // Estado
        this.chartGantt = null;
        this.allProjects = [];         // todos los puntos (sin paginar)
        this.page = 1;
        this.pageSize = 10;
        this.minX = null;
        this.maxX = null;

        this.selectedProjectId = '00000000-0000-0000-0000-000000000000';

        this.init();
    }
    async init() {
        LoaderShow();
        // Eventos
        this.wirePaginationControls();
        this.bindReportButton();

        // Idioma Highcharts
        await this.setHighchartsLang();
        await this.getDataProjectsGantt();   // carga y pagina el gantt
        await this.getDataProjectsControl();
        await this.getDataProjectsControlTable();
        LoaderHide();
    }

    // ---------------- UI & Eventos ----------------
    bindReportButton() {
        $('.btn-report').on('click', async () => {
            this.selectedProjectId = $('#selprojects').val();
            if (!this.selectedProjectId || this.selectedProjectId === '00000000-0000-0000-0000-000000000000') {
                Swal.fire({ type: 'error', text: $.i18n._("Analytics5_024") });
                return;
            }

            LoaderShow();

            this.initDataTable();                // tabla inferior
            await this.getDataProjectsControl(); // pie
            await this.getDataProjectsGantt();   // carga y pagina el gantt
            await this.getDataProjectsControlTable();
            LoaderHide();
        });
    }

    wirePaginationControls() {
        const prev = document.querySelector('#gantt-prev');
        const next = document.querySelector('#gantt-next');
        const size = document.querySelector('#gantt-pagesize');

        if (!prev || !next || !size) return;

        prev.onclick = () => { this.page--; this.renderGanttPage(); };
        next.onclick = () => { this.page++; this.renderGanttPage(); };
        size.onchange = (e) => { this.pageSize = +e.target.value; this.page = 1; this.renderGanttPage(); };
    }

    setHighchartsLang() {
        Highcharts.setOptions({
            lang: {
                loading: $("#Loading").val() + '...',
                months: [
                    $("#January").val(), $("#February").val(), $("#March").val(), $("#April").val(),
                    $("#May").val(), $("#June").val(), $("#July").val(), $("#August").val(),
                    $("#September").val(), $("#October").val(), $("#November").val(), $("#December").val()
                ],
                weekdays: [
                    $("#Sunday").val(), $("#Monday").val(), $("#Tuesday").val(),
                    $("#Wednesday").val(), $("#Thursday").val(), $("#Friday").val(), $("#Saturday").val(),
                ],
                shortMonths: [
                    $("#January").val().substring(0, 3), $("#February").val().substring(0, 3),
                    $("#March").val().substring(0, 3), $("#April").val().substring(0, 3),
                    $("#May").val().substring(0, 3), $("#June").val().substring(0, 3),
                    $("#July").val().substring(0, 3), $("#August").val().substring(0, 3),
                    $("#September").val().substring(0, 3), $("#October").val().substring(0, 3),
                    $("#November").val().substring(0, 3), $("#December").val().substring(0, 3)
                ],
                exportButtonTitle: $("#Export").val(),
                printButtonTitle: $("#Import").val(),
                rangeSelectorFrom: $("#From").val(),
                rangeSelectorTo: $("#To").val(),
                rangeSelectorZoom: $("#Zoom").val(),
                viewFullscreen: $("#ViewFullScreen").val(),
                exitFullscreen: $("#ExitFullScreen").val(),
                downloadPNG: $("#DownloadImage").val() + ' PNG',
                downloadJPEG: $("#DownloadImage").val() + ' JPEG',
                downloadPDF: $("#DownloadImage").val() + ' PDF',
                downloadSVG: $("#DownloadImage").val() + ' SVG',
                printChart: $("#Print").val(),
                resetZoom: $("#Reload").val() + ' zoom',
                resetZoomTitle: $("#Reload").val() + ' zoom',
                thousandsSep: ",",
                decimalPoint: "."
            }
        });
    }

    // ---------------- Utilidades ----------------
    toUTC(iso) {
        if (!iso) return NaN;
        const [y, m, d] = iso.slice(0, 10).split('-').map(n => parseInt(n, 10));
        return Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)
            ? Date.UTC(y, m - 1, d)
            : NaN;
    }

    // ---------------- Data & Charts ----------------
    async getDataProjectsControl() {
        const request = await fetch(`/Project/projectChangesControl?projectId=${this.selectedProjectId}`);
        const data = await request.json();
       
        let series = data.map((x) => {
            return {
                name: x.projectName, y: x.total
            };
        });
        this.getProjectChangesControl(series);
    }
    async getProjectChangesControl(serie) {
        Highcharts.chart('container1', {
            chart: {
                type: 'pie',
                backgroundColor: 'white',
                zooming: { type: 'xy' },
                panning: { enabled: true, type: 'xy' },
                panKey: 'shift'
            },
            title: { text: null },
            subtitle: { text: null },
            tooltip: { valueSuffix: '' },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    borderColor: 'white',
                    borderWidth: 0,
                    slicedOffset: 10,
                    states: { hover: { enabled: true, halo: false, brightness: 0 } },
                    dataLabels: [
                        { enabled: true, distance: 20 },
                        { enabled: true, distance: -40, format: '{point.percentage:.1f}%', style: { fontSize: '1.2em', textOutline: 'none', opacity: 0.7 } }
                    ],
                    showInLegend: true
                }
            },
            series: [{
                states: { inactive: { enabled: false } },
                name: 'Cambios',
                colorByPoint: true,
                data: serie,
                point: {
                    events: {
                        mouseOver: function () { this.slice(true); },
                        mouseOut: function () { this.slice(false); }
                    }
                }
            }]
        });
    }
    async getDataProjectsGantt() {
        const request = await fetch(`/Project/projectsGantt?projectId=${this.selectedProjectId}`);
        const data = await request.json();

        // Normalizar
        this.allProjects = (data || []).map(p => {
            const start = this.toUTC(p.startDate);
            const end = this.toUTC(p.endDate);
            if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

            let fill = '', color = '';
            switch (+p.status) {
                case 1: fill = '#4CAF50'; color = '#62e066'; break;
                case 2: fill = '#ffc107'; color = '#ffdc08'; break;
                case 3: fill = '#dc3545'; color = '#FF4858'; break;
                default: fill = color = '#6c757d';
            }
            let name = p.projectName || '';
            if (name.length > 30) name = name.slice(0, 31) + '...';
            let progress = Math.floor(p.progress * 100) / 100;
            return {
                proyectID: p.projectId,
                name,
                start,
                end,
                completed: { amount: progress, fill },
                color
            };
        }).filter(Boolean);

        if (!this.allProjects.length) {
            if (this.chartGantt) { this.chartGantt.destroy(); this.chartGantt = null; }
            return;
        }

        // Extremos para eje X y navigator
        this.minX = Math.min(...this.allProjects.map(p => p.start));
        this.maxX = Math.max(...this.allProjects.map(p => p.end));

        // Primera render de la página
        this.renderGanttPage(true);
    }

    renderGanttPage(createIfNeeded = false) {
        const totalPages = Math.max(1, Math.ceil(this.allProjects.length / this.pageSize));
        this.page = Math.min(Math.max(this.page, 1), totalPages);

        const startIndex = (this.page - 1) * this.pageSize;
        const pageData = this.allProjects.slice(startIndex, startIndex + this.pageSize)
            .map((p, i) => ({ ...p, y: i }));

        const categories = pageData.map(p => p.name);
        const pageInfo = document.querySelector('#gantt-pageinfo');
        if (pageInfo) pageInfo.textContent = `${this.page}/${totalPages}`;

        if (!this.chartGantt && createIfNeeded) {
            this.chartGantt = Highcharts.ganttChart('proyectos', {
                title: { text: null },
                xAxis: [{
                    type: 'datetime',
                    min: this.minX,
                    max: this.maxX,
                    dateTimeLabelFormats: {
                        week: { list: [$("#Week").val() + '%W', $("#Week").val().substring(0, 1) + '%W'] }
                    }
                }],
                yAxis: { type: 'category', categories, uniqueNames: true },
                navigator: {
                    enabled: true,
                    liveRedraw: true,
                    series: { type: 'gantt', pointPlacement: 0.5, pointPadding: 0.25 }
                },
                scrollbar: { enabled: true },
                rangeSelector: {
                    enabled: true,
                    selected: 0,
                    buttons: [
                        { type: 'month', count: 1, text: '1' + $("#Month").val().toLowerCase().substring(0, 1) },
                        { type: 'month', count: 3, text: '3' + $("#Month").val().toLowerCase().substring(0, 1) },
                        { type: 'month', count: 6, text: '6' + $("#Month").val().toLowerCase().substring(0, 1) },
                        { type: 'ytd', text: $("#YTD").val() },
                        { type: 'year', count: 1, text: '1' + $("#Year").val().toLowerCase().substring(0, 1) },
                        { type: 'all', text: $("#All").val() }
                    ]
                },
                plotOptions: {
                    series: {
                        turboThreshold: 2500,
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: (e) => location.href = `${window.baseUrl}/Execution/Project?id=${e.point.proyectID}`
                            }
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        const startDateT = moment(this.point.start).add(1, "days").format("dddd, MMM DD, YYYY");
                        const endDateT = moment(this.point.end).add(1, "days").format("dddd, MMM DD, YYYY");
                        return `${this.series.name}<br><strong>${this.point.name}</strong><br>${$("#Start").val()}: ${startDateT}<br>${$("#End").val()}: ${endDateT}<br>`;
                    },
                    useHTML: true
                },
                series: [{ name: $.i18n?._('project') ?? 'Proyecto', data: pageData }]
            });
        } else if (this.chartGantt) {
            this.chartGantt.yAxis[0].update({ categories }, false);
            this.chartGantt.series[0].setData(pageData, true, false, false);
        }
    }
    async getDataProjectsControlTable() {
        const request = await fetch(`/Project/projectsControlTable?projectId=${this.selectedProjectId}`);
        const data = await request.json();
        this.initDataTable(data);
    }


    // Tabla (puedes adaptar columnas/datos)
    initDataTable(rows = []) {
        if ($.fn.DataTable.isDataTable('.table-projects')) {
            $('.table-projects').DataTable().clear().destroy();
        }

        $('.table-projects').DataTable({
            data: rows,
            destroy: true,
            deferRender: true,
            paging: true,
            searching: true,
            processing: true,
            responsive: true,
            autoWidth: false,
            order: [],
            columnDefs: [{
                targets: -1, className: 'dt-head-nowrap dt-body-nowrap', width: '120px'
            }],
            columns: [
                { data: 'portfolio', defaultContent: '' },
                { data: 'program', defaultContent: '' },
                { data: 'projectName', defaultContent: '' },
                { data: 'startDate', defaultContent: '', render: d => d ? d.split('T')[0] : '' },
                { data: 'endDate', defaultContent: '', render: d => d ? d.split('T')[0] : '' },
                { data: 'plannedProgress', defaultContent: '', render: d => d != null ? `${(d * 100).toFixed(2)}%` : '' },
                { data: 'progress', defaultContent: '', render: d => d != null ? `${(d * 100).toFixed(2)}%` : '' },
                { data: 'desviation', defaultContent: '', render: d => d != null ? `${d.toFixed(2)}` : '' }, // ← así viene en tu payload
                {
                    data: 'status', defaultContent: '',
                    render: (status) =>
                        `<span class="bold ${this.indicators[status]} font7em float-center">
             ${$.i18n._("elementStatusName_" + status)}
           </span>` }
            ],
            language: { url: "../json/" + Cookies.get('pmctool-lang-app') + ".json" },
            dom: 'Bfrtip',
            buttons: [{
                extend: 'excelHtml5',
                text: $.i18n._('Analytics5_023'),
                exportOptions: { columns: ':visible', modifier: { page: 'all', search: 'applied' } }
            }],
        });
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => new projectDetail());
