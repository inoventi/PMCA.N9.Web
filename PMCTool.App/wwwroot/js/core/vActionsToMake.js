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
                data == '' ? (ActionsToMakeController.initCustomReaction(2)): (ActionsToMakeController.initCustomReaction(1),ActionsToMakeController.initConstructionTable(data));
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
                    status = '<span class="ws st-entiempo">En tiempo</span>'
                    break;
                case 2:
                    status = '<span class="ws st-atrasado">Atrasado</span>'
                    break;
                case 3:
                    status = '<span class="ws st-cimpacto">Con impacto</span>'
                    break;
            }

            $('#datatable').append('<tr>'
                + ' <th>' + data[a].code +'</th>'
                + ' <td> <a href="/FactSheetA?projectid=' + data[a].projectID +'">' + data[a].name +'</a></td>'
                + ' <td><span class="ws">' + formatter.format(data[a].inversion) +' mdp</span></td>'
                + ' <td><span class="ws">' + Date.split('T')[0] +'</span></td>'
                + ' <td>' + data[a].fase + '</td>'
                + ' <td>' + status + '</td > '
                + ' <td>' + data[a].actionToMake + '</td>'
                + ' <td>' + data[a].nota +'</td>'
                + '</tr>');
        }
        ActionsToMakeController.initDataTable();
    },
    initCustomReaction: (e) => {
        switch (e) {
            case 1:
                $('#cardTable').removeAttr('hidden');
                $('#btnReport').hide();
                $('#btnClose').removeAttr('hidden');
                //$('#btnPDF').removeAttr('hidden');
                ActionsToMakeController.resetSelects();
                break;
            case 2:
                $('#cardTable').removeAttr('hidden');
                $('#rowTable').attr('hidden', true);
                $('#btnClose').removeAttr('hidden');
                $('#messageBox').append('<center>No se encontraron registros</center>');
                $('#btnReport').hide();
                ActionsToMakeController.resetSelects();
                break;
        }
        $('#btnClose').click(() => {
            window.location.href = window.location.href;
        })
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
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};
