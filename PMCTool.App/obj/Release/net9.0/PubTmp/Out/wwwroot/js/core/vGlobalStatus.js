let vGlobalStatus = {
    addEventBtnSearch() {
        $('#btnSearch').click(function () {
            vGlobalStatus.loadData();
        });


    },
    loadData() {
        let entidades = $('#Entidad').val();
        let direccionGral = $('#DireccionGral').val();
        let tipoProyecto = $('#TipoProyecto').val();
        let etapa = $('#Etapa').val();
        let inversion = $('#Inversion').val();
        let anuncio = $('#Anuncio').val();
        const divElement = $('._tableglobalstatus');
        vGlobalStatus.getDataResult(entidades.join(), direccionGral.join(), tipoProyecto.join(), etapa.join(), inversion.join(), anuncio.join());


    },
    getDataResult(entidades, direccionGral, tipoProyecto, etapa, inversion, anuncio) {
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
        $('#Anuncio').prop('disabled', true);
        $('#Anuncio').selectpicker('refresh');
        let enti = entidades;
        const divElement = $('._tableglobalstatus');
        let data = {
            states: entidades,
            generalDirection: direccionGral,
            projectType: tipoProyecto,
            stage: etapa,
            investment: inversion,
            advertisement: anuncio,
        };
        LoaderShow();
        $.post('/GlobalStatus/GetDataGlobalStatus', data, function (dataResult) {
            divElement.empty();
            divElement.html(dataResult);
            LoaderHide();
            $('#btnSearch').hide();
            $('#btnClose').show();
            $('#btnDetalle').show();
            $('#btnDetalleClose').hide();


        }).fail(function (e) {
            console.log("ERROR: ", e);
        });

    },
    addEventBtnClose() {
        $('#btnClose').click(function () {
            $('#btnSearch').show();
            $('#btnClose').hide();
            $('#btnDetalle').hide();
            $('#Entidad').selectpicker('val', 'Entidad Federativa');
            $('#DireccionGral').selectpicker('val', 'Direccion General');
            $('#TipoProyecto').selectpicker('val', 'Tipo de proyecto');
            $('#Etapa').selectpicker('val', 'Etapa');
            $('#Inversion').selectpicker('val', 'Inversion');
            $('#Anuncio').selectpicker('val', 'Anuncio');
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
            $('#Anuncio').prop('disabled', false);
            $('#Anuncio').selectpicker('refresh');
            $('._tableglobalstatus').empty();

        });
    },
    addEventBtnDetalle() {
        $("#btnDetalle").click(function () {
            vGlobalStatus.loadDataGlobalStatusDetail();
        });

        
    },
    addEventBtnDetalleClose() {
        $("#btnDetalleClose").click(function () {
            vGlobalStatus.loadData();
        });
    },
    loadDataGlobalStatusDetail() {
        let entidades = $('#Entidad').val();
        let direccionGral = $('#DireccionGral').val();
        let tipoProyecto = $('#TipoProyecto').val();
        let etapa = $('#Etapa').val();
        let inversion = $('#Inversion').val();
        let anuncio = $('#Anuncio').val();
        const divElement = $('._tableglobalstatus');
        vGlobalStatus.getDataResultDetail(entidades.join(), direccionGral.join(), tipoProyecto.join(), etapa.join(), inversion.join(), anuncio.join());
    },
    getDataResultDetail(entidades, direccionGral, tipoProyecto, etapa, inversion, anuncio) {
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
        $('#Anuncio').prop('disabled', true);
        $('#Anuncio').selectpicker('refresh');
       
        const divElement = $('._tableglobalstatus');
        let data = {
            states: entidades,
            generalDirection: direccionGral,
            projectType: tipoProyecto,
            stage: etapa,
            investment: inversion,
            advertisement: anuncio,
        };
        LoaderShow();
        $.post('/GlobalStatus/GetDataGlobalStatusDetail', data, function (dataResult) {
            divElement.empty();
            divElement.html(dataResult);
            LoaderHide();
            $('#btnSearch').hide();
            $('#btnClose').hide();
            $('#btnDetalle').hide();
            $('#btnDetalleClose').show();


        });

    },
    initHome() {
        $('#btnClose').hide();
        $('#btnDetalle').hide();
        $('#btnDetalleClose').hide();
        vGlobalStatus.addEventBtnSearch();
        vGlobalStatus.addEventBtnClose();
        vGlobalStatus.addEventBtnDetalle();
        vGlobalStatus.addEventBtnDetalleClose();
    },
    iniDataTable() {
        $(document).ready(function () {
            var table =  $('#tableGlobalStatus').DataTable({
                "pagingType": false,
                "lengthMenu":false,
                responsive: true,
                language: {
                    search: false,
                    searchPlaceholder:false,
                }

            });
        });
    }
    ,
    iniDataTableDetail() {
        $('#tableGlobalStatusDetail').DataTable({
        "pagingType": "full_numbers",
        "lengthMenu": [
            [10, 25, 50, -1],
            [10, 25, 50, "All"]
        ],
        responsive: true,
        language: {
            search: "_INPUT_",
            searchPlaceholder: "Buscar registros",
        }

    });
    }
}

vGlobalStatus.initHome();

$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};