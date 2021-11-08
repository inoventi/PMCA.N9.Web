let vAccumulatedInvestment = {
    btnReportPDF: () => {
        $('#export').click(function () {
            LoaderShow();
            let entidades = $('#Entidad').val();
            let direccionGral = $('#DireccionGral').val();
            let tipoProyecto = $('#TipoProyecto').val();
            let etapa = $('#Etapa').val();
            let inversion = $('#Inversion').val();
            let year = $('#Year').val();
            let data = {
                "states": "'" + entidades.join() + "'",
                "generalDirection": "'" + direccionGral.join() + "'",
                "projectType": "'" + tipoProyecto.join() + "'",
                "stage": "'" + etapa.join() + "'",
                "investment": "'" + inversion.join() + "'",
                "year": "'" + year + "'"
            };
            jQuery.ajaxSettings.traditional = true;
            $.ajax({
                url: "/AccumulatedInvestment/printReportAccumulatedInvestment",
                type: "POST",
                data: data,
                cache: false,
                error: function (xhr, status, error) {
                    console.log(error);
                },
                success: function (data) {
                    LoaderHide();
                    jQuery.ajaxSettings.traditional = false;
                    if (data != null) {
                        var a = document.createElement("a");
                        a.href = src = 'data:application/pdf;base64,' + encodeURI(data.FileContents);
                        a.download = "Inversión_Acumulada.pdf";
                        a.click();
                    }
                }
            });


        });
    },
    addEventBtnSearch() {
        $('#btnSearch').click(function () {
            vAccumulatedInvestment.loadData();
        });


    },
    OnFailure() {
        Swal.fire({
            type: 'error',
            title: '',
            text: 'Seleccione un año',
            footer: ''
        });
    },
    loadData() {
        let entidades = $('#Entidad').val();
        let direccionGral = $('#DireccionGral').val();
        let tipoProyecto = $('#TipoProyecto').val();
        let etapa = $('#Etapa').val();
        let inversion = $('#Inversion').val();
        let year = $('#Year').val();
        if ($('#Year').val() == "" || $('#Year').val() == null){
            vAccumulatedInvestment.OnFailure();
        } else {
            vAccumulatedInvestment.getDataResult(entidades.join(), direccionGral.join(), tipoProyecto.join(), etapa.join(), inversion.join(), year);
        }
        
    },
    getDataDrawChart(data) {
        $.post('/AccumulatedInvestment/GetDataDrawChart', data, function (dataResult) {
            var categories = [];
            var investmentExpected = [];
            var investmentReal = [];

            for (var i = 0; i < dataResult.length; i++) {
                categories.push((dataResult[i].monthID).toString());
                investmentExpected.push(parseFloat((dataResult[i].plannedInvestment).toFixed(2)));
                investmentReal.push(parseFloat((dataResult[i].realInvestment).toFixed(2)));
            }
            categories[0] = "Enero";
            categories[1] = "Febrero";
            categories[2] = "Marzo";
            categories[3] = "Abril";
            categories[4] = "Mayo";
            categories[5] = "Junio";
            categories[6] = "Julio";
            categories[7] = "Agosto";
            categories[8] = "Septiembre";
            categories[9] = "Octubre";
            categories[10] = "Noviembre";
            categories[11] = "Diciembre";
            vAccumulatedInvestment.drawChart(categories, investmentExpected, investmentReal);
            LoaderHide();
        }).fail(function (e) {
            console.log("ERROR: ", e);
        });
    },
    drawChart(categories, investmentExpected, investmentReal) {
        chart = new Highcharts.chart('inversion', {
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            title: {
                text: 'Secuencia de inicio de inversión'
            },
            subtitle: {
                text: 'Inversión Instantanea Acumulada Mensual (Miles De Mdp)'
            },
            xAxis: {
                categories: categories
            },
            yAxis: {
                title: {
                    text: 'Inversión acumulada'
                },
                min: 0,

            },
            tooltip: {
                formatter: function () {
                    return '$' + this.y.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                        format: '${point.y:,.2f}',
                        allowOverlap: true
                    }
                }
            },
            series: [{
                name: 'Planeado',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: '#B38E5D',
                    radius: 5
                },
                point: {
                    events: {
                        click: event => vAccumulatedInvestment.getDataResultDetail(event)
                    }
                },
                data: investmentExpected
            }, {
                name: 'Real',
                color: '#235b4e',
                lineWidth: 1,
                marker: {
                    fillColor: '#B38E5D',
                    radius: 5
                },
                point: {
                    events: {
                        click: event => vAccumulatedInvestment.getDataResultDetail(event)
                    }
                },
                    data: investmentReal
            }],
            navigation: {
                buttonOptions: {
                    enabled: true
                }
            }
        });
    },
    getDataResult(entidades, direccionGral, tipoProyecto, etapa, inversion, year) {
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
        $('#Year').prop('disabled', true);
        $('#Year').selectpicker('refresh');
        let enti = entidades;
        const divElement = $('#accumulated_investment_container_div');
        let data = {
            states: entidades,
            generalDirection: direccionGral,
            projectType: tipoProyecto,
            stage: etapa,
            investment: inversion,
            year: year,
        };
        LoaderShow();
        $.post('/AccumulatedInvestment/GetDataAccumulatedInvestment', data, function (dataResult) {
            divElement.empty();
            divElement.html(dataResult);
            vAccumulatedInvestment.getDataDrawChart(data);
            //LoaderHide();
            $('#btnSearch').hide();
            $('#btnClose').show();

        }).fail(function (e) {
            console.log("ERROR: ", e);
            Swal.fire({
                type: 'error',
                title: '',
                text: e,
                footer: ''
            });
        });

    },
    addEventBtnClose() {
        $('#btnClose').click(function () {
            $('#btnSearch').show();
            $('#btnClose').hide();
            $('#Entidad').selectpicker('val', 'Entidad Federativa');
            $('#DireccionGral').selectpicker('val', 'Direccion General');
            $('#TipoProyecto').selectpicker('val', 'Tipo de proyecto');
            $('#Etapa').selectpicker('val', 'Etapa');
            $('#Inversion').selectpicker('val', 'Inversion');
            $('#Year').selectpicker('val', 'Año');
            $('.selectpicker').selectpicker('deselectAll');

            $('#Entidad').prop('disabled', false);
            $('#Entidad').selectpicker('refresh');
            $('#DireccionGral').prop('disabled', false);
            $('#DireccionGral').selectpicker('refresh');
            $('#TipoProyecto').prop('disabled', false);
            $('#TipoProyecto').selectpicker('refresh');
            $('#Etapa').prop('disabled', false);
            $('#Etapa').selectpicker('refresh');
            $('#Inversion').prop('disabled', false);
            $('#Inversion').selectpicker('refresh');
            $('#Year').prop('disabled', false);
            $('#Year').selectpicker('refresh');
            $('#accumulated_investment_container_div').empty();

        });
    },
    getDataResultDetail(event) {
        const point = event.point;
        const xValue = point.x,
            serieName = point.series.name;
        let entidades = $('#Entidad').val();
        let direccionGral = $('#DireccionGral').val();
        let tipoProyecto = $('#TipoProyecto').val();
        let etapa = $('#Etapa').val();
        let inversion = $('#Inversion').val();
        let year = $('#Year').val();
        let data = {
            states: entidades.join(),
            generalDirection: direccionGral.join(),
            projectType: tipoProyecto.join(),
            stage: etapa.join(),
            investment: inversion.join(),
            year: year,
            montID: xValue + 1,
            type: serieName,
        };

        LoaderShow();
        $.post('/AccumulatedInvestment/GetDataAccumulatedInvestmentDetail', data, function (dataResult) {
            LoaderHide();
            vAccumulatedInvestment.renderBubble(event, dataResult);
        }).fail(function (e) {
            console.log("ERROR: ", e);
            Swal.fire({
                type: 'error',
                title: '',
                text: e,
                footer: ''
            });
        });

    },
    renderBubble(event, data) {
        const bubble = document.getElementById("accumulated_investment_bubble");
        bubble.style.display = 'block';
        const width = bubble.clientWidth, height = bubble.clientHeight;
        bubble.style.transform = 'translate(' + ((event.chartX - width / 2) + 03) + 'px, ' + ((event.chartY - height) - 483) + 'px)';
        $('#accumulated_investment_bubble_table').html(data);
    },
    closeBubble() {
        const bubble = document.getElementById("accumulated_investment_bubble");
        if (!bubble) return;
        bubble.style.display = 'none';
    },
    initHome() {
        $('#btnClose').hide();
        vAccumulatedInvestment.addEventBtnSearch();
        vAccumulatedInvestment.addEventBtnClose();
        vAccumulatedInvestment.btnReportPDF();
    }
}

vAccumulatedInvestment.initHome();

$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};

//function renderBubble(event, data) {
//    console.log(event);
//    const bubble = document.getElementById("accumulated_investment_bubble");
//    bubble.style.display = 'block';
//    const width = bubble.clientWidth, height = bubble.clientHeight;
//    bubble.style.transform = 'translate(' + ((event.chartX - width / 2) + 03) + 'px, ' + ((event.chartY - height) - 483) + 'px)';
//    $('#accumulated_investment_bubble_table').html(data);
//}

function closeBubble() {
    const bubble = document.getElementById("accumulated_investment_bubble");
    if (!bubble) return;
    bubble.style.display = 'none';
}