$(document).ready(function () {
    vReportedIncidentsController.initPetition();
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
                states: states.join(),
                generalDirection: generalDirection.join(),
                projectType: projectType.join(),
                stage: stage.join(),
                investment: investment.join(),
                advertisement: advertisement.join(),
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
            $('#divFichaTecnicaProyecto').empty();
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
            console.log(data);
            $.post('/ReportedIncidents/GetDataReportedIncidents', data, function (data) {
                //data == '' ? (ActionsToMakeController.initCustomReaction(2)) : (ActionsToMakeController.initCustomReaction(1), ActionsToMakeController.initConstructionTable(data));
                $('#divFichaTecnicaProyecto').append(data);
                LoaderHide();
            }).fail(function (e) {
                console.log("ERROR: ", e);
            });
        });
    },
    getIncidents: function (e) {
        let element = $(e).parent().parent();
        let position = element.index();
        if ($('.tbimpact  > tbody > tr').eq(position + 1).data('dinamytr') == true) {
            $('.tbimpact  > tbody > tr').eq(position + 1).remove();
        }
        let data = {
            project: $(e).data('incidents')
        }
        LoaderShow();
        $.post('/ReportedIncidents/getIncidentsByProject', data, function (r) {

            $('.tbimpact  > tbody > tr').eq(position).after(r);

            LoaderHide();
        });
        e.preventDefault();
        //$('.table  > tbody > tr').eq(position).after(templeteTRHTML());
        //$('.table  > tbody > tr').eq(position).empty();

    },
    closetr: function (e) {
        let element = $(e).parent().parent();
        element.remove();
    }
}