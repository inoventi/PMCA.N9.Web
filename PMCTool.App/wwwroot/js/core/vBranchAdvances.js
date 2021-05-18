let vBranchs = {
    addEventMunicipios() {
        $('#Estate').on('change', function (e) {
            console.log(this.value);
            vBranchs.getMunicipios(this.value);
        }); 
    },
    addEventBtnExportPDF() {
        $('#bntReportPDF').click(function () {
            LoaderShow();
            let municiopiosid = $("#Municipios").val();
            let estadoid = $('#Estate').val();
            let tipopredio = $('#tipopredio').val();
            let vista = $('#tipovista').val();
            jQuery.ajaxSettings.traditional = true;
            $.ajax({
                url: "/BranchAdvances/printReportBranchAdvances",
                type: "POST",
                data: {
                    "estadoid":"'"+ estadoid+"'",
                    "municipiosid": "'" + municiopiosid.join() + "'",
                    "tipopredio": "'" + tipopredio.join() + "'",
                    "tipovista": "'" + vista + "'",
                },
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
                        a.download = "AvencedeSucursales-"+vista+".pdf";
                        a.click();
                    }
                }
            });


        });

    },
    addEventBtnReport() {
        $('#bntReport').click(function () {
            vBranchs.loadData();
        });
        

    },
    getMunicipios(estateID) {  
        let data = new URLSearchParams();
        data.append('estateID', estateID); 
        LoaderShow();
        const getMunicipios = fetch('/BranchAdvances/getMunicipalities', {
            method: 'POST',
            body: data
        }).catch(function (err) {
            console.log(err);

        });
        getMunicipios
            .then(resp => resp.json())
            .then(data => {
                
                let selectMunicipios =$('#Municipios');
                selectMunicipios.empty();
                data.forEach(function (row) {
                    let option = new Option(row.municipalityName, row.municipalityID); 
                    selectMunicipios.append(option); 
                });
                selectMunicipios.selectpicker('refresh');
                LoaderHide();
            }); 
    },
    loadData() {
        let municiopiosid = $("#Municipios").val();
        let estadoid = $('#Estate').val();
        let tipopredio = $('#tipopredio').val();
        let vista = $('#tipovista').val();
        const divElement = $('._tablereport');
         vBranchs.getDataResul(estadoid, municiopiosid.join(), tipopredio.join(), vista);
         
       
    },
    getDataResul(estadoid, municipiosid, tipopredio, vista) {
        const divElement = $('._tablereport');
        let data = {
            estadoid: estadoid,
            municipiosid: municipiosid,
            tipopredio: tipopredio,
            tipovista: vista,
        };
        LoaderShow();
        $.post('/BranchAdvances/getBranchAdvancesData', data, function (dataResult) {
            divElement.empty();
            divElement.html(dataResult);
            LoaderHide();
            
        }); 
        
    },
    initHome() {
        vBranchs.addEventMunicipios();
        vBranchs.addEventBtnReport();
        vBranchs.addEventBtnExportPDF();
        vBranchs.loadData();
    },
    iniDataTable() {
        $(document).ready(function () {
            $('#tablebrachadvances').DataTable({
                "pagingType": "full_numbers",
                "pageLength": 25,
                "lengthMenu": [
                    [10, 25, 50, -1],
                    [10, 25, 50, "All"]
                ],
                responsive: true,
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Buscar",
                    paginate: {
                        first: "Inicio",
                        previous: "Anteorior",
                        next: "Siguiente",
                        last: "Ultimo"
                    },
                    lengthMenu: "Ver _MENU_  Elementos",
                    info: "Registros _START_ al _END_ de _TOTAL_ encontrados",
                     
                } 

            });
        });
    }
}

vBranchs.initHome();
$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};