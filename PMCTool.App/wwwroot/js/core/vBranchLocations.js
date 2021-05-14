$(document).ready(function () {
    vBranchLocationClass.initReport();
})
var vBranchLocationClass = {
    initMap: (data) => {
    $('.div-map').removeAttr('hidden');
    var markers = [];

    for (var a = 0; a < data.length; a++) {
        var advance = data[a].advance * 100;        
        var lenght = data[a].lenght;
        var latitude = data[a].latitude;
        if (latitude.length > 8) {
            markers.push([data[a].projectName, parseFloat(latitude), parseFloat(lenght), data[a].projectID, Math.trunc(advance), data[a].status]);
        }    
    }
        //ArrayMapCordenate.push(["Sucursal 1", 22.234257, -101.335193, "11cd0b2c-bf6c-47f7-abab-0132df91c450", 50, 1]);
    var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: google.maps.MapTypeId.HYBRID
    };

    // Display a map on the web page
    map = new google.maps.Map(document.getElementById("regularMap"), mapOptions);
    map.setTilt(50);

    // Multiple markers location, latitude, and longitude
        //var markers = ArrayMapCordenate;

        //var markers = [
        //    ["LA HUERTA", -104.6458522042, 19.4763826892, "e68980dc-6639-42c1-a102-3ec856f8242e", 37, 1]
        //];
    // Info window content
    /*var infoWindowContent = [
        ['<div class="info_content">' +
        '<h3>Brooklyn Museum</h3>' +
        '<p>The Brooklyn Museum is an art museum located in the New York City borough of Brooklyn.</p>' + '</div>'],
        ['<div class="info_content">' +
        '<h3>Brooklyn Public Library</h3>' +
        '<p>The Brooklyn Public Library (BPL) is the public library system of the borough of Brooklyn, in New York City.</p>' +
        '</div>'],
        ['<div class="info_content">' +
        '<h3>Prospect Park Zoo</h3>' +
        '<p>The Prospect Park Zoo is a 12-acre (4.9 ha) zoo located off Flatbush Avenue on the eastern side of Prospect Park, Brooklyn, New York City.</p>' +
        '</div>']
    ];*/

    // Add multiple markers to map
    var infoWindow = new google.maps.InfoWindow(), marker, i;

    // Place each marker on the map
        for (i = 0; i < markers.length; i++) {
            
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);

        bounds.extend(position);
        var status = markers[i][5];
        status == 1 ? status = '<span class="badge badge-success">En tiempo</span>' : '';
        status == 2 ? status = '<span class="badge badge-warning">Atrasado</span>' : '';
        status == 3 ? status = '<span class="badge badge-danger">Con impacto</span>' : '';
        status == 4 ? status = '<span class="badge badge-secondary">Terminado</span>' : '';

        marker = new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0],
            idProject: markers[i][3],
            avance: markers[i][4],
            status: status
        });
        // Add info window to marker
        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            var html = '<div class="container-fluid"><div class="row">'
                + '<div class="col-12">'
                + '<div class="row text-center">'
                + '<div class="col-12" style="background: #a5a5a5;color: white;background: #205180;padding: 6px;">'
                + '<h5 style="margin-bottom: 2px;margin-top: 2px;font-weight: 500;text-transform: uppercase;">' + marker.title + '</h5>'
                + '</div>'
                + '</div>'
                + '<div class="row" style="border:1px solid #E6E6E6">'
                + '<div class="col-6" style="padding: 2px;margin-top: 3px;margin-bottom: 3px;">'
                + '<h6>Avance</h6>'
                + '</div>'
                + '<div class="col-6 text-center">'
                + '<h6>' + marker.avance + '%</h6>'
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
                + '<a type="button" href="/FactSheet/Index?projectId=' + marker.idProject + '">'
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
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function (event) {
        this.setZoom(5);
        google.maps.event.removeListener(boundsListener);

    });
    },
    initDatatable: (data) => {
        $('.div-table').removeAttr('hidden');
        for (var b = 0; b < data.length; b++) {
            var status = data[b].status;
            status == 1 ? status = '<span class="badge badge-success">En tiempo</span>' : '';
            status == 2 ? status = '<span class="badge badge-warning">Atrasado</span>' : '';
            status == 3 ? status = '<span class="badge badge-danger">Con impacto</span>' : '';
            status == 4 ? status = '<span class="badge badge-secondary">Terminado</span>' : '';
            $('#dataTable').append('<tr>'
                + '<td> <a href="/FactSheet/Index?projectId=' + data[b].projectID+'">'+data[b].projectName+'</a></td>'
                + '<td>' + data[b].state +'</td>'
                + '<td>' + data[b].municipalities +'</td>'
                + '<td>' + data[b].location + '</td>'
                + '<td>' + status + '</td>'
                + '<td>'
                + Math.trunc(data[b].advance*100)+'%'
                + '</td>'
                + '</tr>');
        }
        $('#datatables').DataTable({
            "pagingType": "full_numbers",
            "lengthMenu": [
                [10, 25, 50, -1],
                [10, 25, 50, "All"]
            ],
            responsive: true,
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search records",
            }

        });
        

    },
    initReport: () => {
        $('#btnReporte').click(() => {
            $('#btnReporte').hide();
            $('#btnClose').removeAttr('hidden');
            let Municipalities = $("#Municipios").val();
            let State = $('#Estate').val();
            let Predio = $('#predio').val();
            vBranchLocationClass.getDataResul(State, Municipalities.join(), Predio.join());
        })
        $('#btnClose').click(() => {
            location.reload();
        });
    },
    getDataResul(State, Municipalities, Predio) {
        let data = {
            State: State,
            Municipalities: Municipalities,
            Predio: Predio
        };
        LoaderShow();
        $.post('/BranchLocations/GetBranchLocation', data, function (dataResult) {
            LoaderHide();
            vBranchLocationClass.initConstruction(dataResult);
        });
    },
    initConstruction: (data) => {
        // Load initialize function
        google.maps.event.addDomListener(window, 'load', vBranchLocationClass.initMap(data));
        vBranchLocationClass.initDatatable(data);
    }
}