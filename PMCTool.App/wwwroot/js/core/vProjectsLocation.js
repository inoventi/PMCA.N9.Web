$(document).ready(() => {
    projectsLocationController.initPetition();
})
let projectsLocationController = {
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
            $.post('/ProjectsLocations/GetDataProjectsLocation', data, function (data) {
                data == '' ? projectsLocationController.initCustomReaction(2) : projectsLocationController.initAcomodateData(data);    
                LoaderHide();
            }).fail(function (e) {
                console.log("ERROR: ", e);
            });
        });
    },
    initAcomodateData: (data) => {
        let markers = [];
        for (a = 0; a < data.length; a++){
            let coordenate = data[a].location;
            if (coordenate != "") {
                let latitud = coordenate.split(',')[0];
                let longitud = coordenate.split(',')[1];
                let progress = data[a].progress * 100;
                markers.push([data[a].projectID, data[a].name, Math.trunc(progress), data[a].status, latitud, longitud]);
            }
        }
        if (markers.length > 0) {
            projectsLocationController.initCustomReaction(1);
            projectsLocationController.initMap(markers);
            // Load initialize function
            google.maps.event.addDomListener(window, 'load', projectsLocationController.initMap);
        } else {
            projectsLocationController.initCustomReaction(2);
        }
    },
    initCustomReaction: (e) => {
        switch (e){
            case 1:
                $('#divCardMap').removeAttr('hidden');
                projectsLocationController.ResetSelects();
            break;
            case 2:
                $('#divCardMap').removeAttr('hidden');
                $('#regularMap').removeClass('map');
                $('#regularMap').append('<center>No se encontraron registros.</center>');
                projectsLocationController.ResetSelects();
            break;
        } 
        $('#btnClose').click(() => {
            window.location.href = window.location.href;
        })
    },
    ResetSelects: () => {
        $('#btnReport').hide();
        $('#btnClose').removeAttr('hidden');
        //$('#btnPDF').removeAttr('hidden');
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
    initMap: (markers) => {
        let map;
        let bounds = new google.maps.LatLngBounds();
        let mapOptions = {
            mapTypeId: 'roadmap'
        };

        // Display a map on the web page
        map = new google.maps.Map(document.getElementById("regularMap"), mapOptions);
        map.setTilt(50);
        // Multiple markers location, latitude, and longitude

       
        // Add multiple markers to map
        let infoWindow = new google.maps.InfoWindow(), marker, i;

        // Place each marker on the map
        for (i = 0; i < markers.length; i++) {
            let position = new google.maps.LatLng(markers[i][4], markers[i][5]);
            bounds.extend(position);
            let status = markers[i][3];
            status == 1 ? status = '<span class="badge badge-success">En tiempo</span>' : '';
            status == 2 ? status = '<span class="badge badge-warning">Atrasado</span>' : '';
            status == 3 ? status = '<span class="badge badge-danger">Con impacto</span>' : '';
            status == 4 ? status = '<span class="badge badge-secondary">Terminado</span>' : '';

            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: markers[i][1],
                idProject: markers[i][0],
                avance: markers[i][2],
                status: status
            });

            // Add info window to marker
            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                let html = '<div class="container-fluid"><div class="row">'
                    + '<div class="col-12">'
                    + '<div class="row text-center">'
                    + '<div class="col-12" style="background: #235b4e;color: white;background: #235b4e;padding: 6px;">'
                    + '<h5 style="margin-bottom: 2px;margin-top: 2px;font-weight: 500;text-transform: uppercase;">' + marker.title + '</h5>'
                    + '</div>'
                    + '</div>'
                    + '<div class="row" style="border:1px solid #E6E6E6">'
                    + '<div class="col-6" style="padding: 2px;margin-top: 3px;margin-bottom: 3px;">'
                    + '<h6>Avance</h6>'
                    + '</div>'
                    + '<div class="col-6 text-center">'
                    + '<h6>' + marker.avance + '</h6>'
                    + '</div>'
                    + '</div>'
                    + '<div class="row" style="border:1px solid #E6E6E6">'
                    + '<div class="col-6" style="padding: 2px;margin-top: 3px;margin-bottom: 3px;">'
                    + '<h6>Estatus</h6>'
                    + '</div>'
                    + '<div class="col-6 text-center">'
                    + marker.status
                    + '</div>'
                    + '</div>'
                    + '<div class="row justify-content-center pt-3">'
                    + '<a type="button" href="/FactSheetA?projectid=' + marker.idProject +'">'
                    + 'Ficha de proyecto <span class="btn-label btn-label-right">'
                    + '<i class="fa fa-arrow-right"></i>'
                    + '</span>'
                    + '</a>'
                    + '</div>'
                    + '</div>'
                    + '</div></div>';
                //var html = marker.title;
                return function () {
                    infoWindow.setContent(html);
                    infoWindow.open(map, marker);
                }
            })(marker, i));

            // Center the map to fit all markers on the screen
            map.fitBounds(bounds);
        }
        // Set zoom level
        let boundsListener = google.maps.event.addListener((map), 'bounds_changed', function (event) {
            this.setZoom(5);
            google.maps.event.removeListener(boundsListener);
        });

     }
}
$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};