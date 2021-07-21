$(document).ready(() => {
    ActionsToMakeController.initPetition(); 
});
let ActionsToMakeController = {
    initPetition: () => {
        $('#btnReport').click(() => {
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
            $.post('/ActionsToMake/GetDataActionsToMake', data, function (data) {
                ActionsToMakeController.initCustomReaction();
                ActionsToMakeController.initConstructionTable(data);
                LoaderHide();
            }).fail(function (e) {
                console.log("ERROR: ", e);
            });
        });
    },
    initConstructionTable: (data) => {
        for (a = 0; a < data.length; a++) {
            let Date = data[a].startDate;
            let status = '';
            switch (data[a].estatus) {
                case 1:
                    status = '<span class=" st-entiempo">En tiempo</span>'
                    break;
                case 2:
                    status = '<span class=" st-atrasado">Atrasado</span>'
                    break;
                case 3:
                    status = '<span class=" st-cimpacto">Con impacto</span>'
                    break;
            }
            $('#datatable').append('<tr>'
                + ' <th>' + data[a].code +'</th>'
                + ' <td> <a href="/FactSheetA?projectid=' + data[a].projectID +'">' + data[a].name +'</a></td>'
                + ' <td>' + data[a].inversion +' MDP</td>'
                + ' <td>' + Date.split('T')[0] +'</td>'
                + ' <td>' + data[a].fase + '</td>'
                + ' <td>' + status + '</td > '
                + ' <td>' + data[a].actionToMake + '</td>'
                + ' <td>' + data[a].nota +'</td>'
                + '</tr>');
        }
        ActionsToMakeController.initDataTable();
    },
    initCustomReaction: () => {
        $('#cardTable').removeAttr('hidden');
        $('#btnReport').hide();
        $('#btnClose').removeAttr('hidden');
        $('#btnPDF').removeAttr('hidden');
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
        $('#btnClose').click(() => {
            location.reload();
        })
    },
    initDataTable: () => {
        $('#datatables').DataTable({
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
$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};
