$(document).ready(function () {
    vReportedIncidentsController.initPetition();
    vReportedIncidentsController.CleanReport();
});

const vReportedIncidentsController = {
    btnReportPDF: () => {
            LoaderShow();
            let states = $("#Entidad").val();
            let generalDirection = $('#DireccionGral').val();
            let projectType = $('#TipoProyecto').val();
            let stage = $('#Etapa').val();
            let investment = $('#Inversion').val();
            let advertisement = $('#Anuncio').val();
            let data = {
                "states": "'" + states.join() + "'",
                "generalDirection": "'" + generalDirection.join() + "'",
                "projectType": "'" + projectType.join() + "'",
                "stage": "'" + stage.join() + "'",
                "investment": "'" + investment.join() + "'",
                "advertisement": "'" + advertisement.join() + "'"
            };
            jQuery.ajaxSettings.traditional = true;
            $.ajax({
                url: "/ReportedIncidents/printReportReportedIncidents",
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
                        a.download = "IncidenciasReportadas.pdf";
                        a.click();
                    }
                }
            });
    },
    initPetition: () => {
        $('#btnReport').click(() => {
            $('#btnReport').hide();
            $('#btnClose').removeAttr('hidden');
            LoaderShow();
            let states = $("#Entidad").val();
            let generalDirection = $('#DireccionGral').val();
            let projectType = $('#TipoProyecto').val();
            let stage = $('#Etapa').val();
            let investment = $('#Inversion').val();
            let advertisement = $('#Anuncio').val();
            let data = {
                states: states.join(),
                generalDirection: generalDirection.join(),
                projectType: projectType.join(),
                stage: stage.join(),
                investment: investment.join(),
                advertisement: advertisement.join(),
            };
            $.post('/ReportedIncidents/GetDataReportedIncidents', data, function (data) {
                //data == '' ? (ActionsToMakeController.initCustomReaction(2)) : (ActionsToMakeController.initCustomReaction(1), ActionsToMakeController.initConstructionTable(data));
                $('#divFichaTecnicaProyecto').append(data);
                $('.tbincidents').dataTable({
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
                vReportedIncidentsController.resetSelects();
                LoaderHide();
            }).fail(function (e) {
                console.log("ERROR: ", e);
            });
        });
    },
    getIncidents: (e) => {
        //e.preventDefault();
        let element = $(e).parent().parent();
        let position = element.index();
        if ($('.tbincidents > tbody > tr').eq(position + 1).data('dinamytr') == true) {
            $('.tbincidents > tbody > tr').eq(position + 1).remove();
        }
        let data = {
            project: $(e).data('incidents')
        }
        LoaderShow();
        $.post('/ReportedIncidents/getIncidentsByProject', data, function (r) {

            $('.tbincidents  > tbody > tr').eq(position).after(r);

            LoaderHide();
        });
        
        //$('.table  > tbody > tr').eq(position).after(templeteTRHTML());
        //$('.table  > tbody > tr').eq(position).empty();

    },
    closetr: (e) => {
        let element = $(e).parent().parent();
        element.remove();
    },
    CleanReport: () => {
        $('#btnClose').click(() => {
            window.location.href = window.location.href;
        });
    },
    resetSelects: () => {
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
    }
}
$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};