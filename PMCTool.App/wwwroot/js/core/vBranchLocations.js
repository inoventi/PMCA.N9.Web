$(document).ready(function () {
    // Load initialize function
    google.maps.event.addDomListener(window, 'load', vBranchLocationClass.initMap());
    vBranchLocationClass.initDatatable();
    vBranchLocationClass.filtersSelects();
})
var vBranchLocationClass = {
    initMap: () => {
            var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };

    // Display a map on the web page
    map = new google.maps.Map(document.getElementById("regularMap"), mapOptions);
    map.setTilt(50);

    // Multiple markers location, latitude, and longitude
    var markers = [
        ['Sucursal 1', 22.234257, -101.335193, 1, '50%', 1],
        ['Sucursal 2', 20.709082, -103.409315, 2, '100%', 4],
        ['Sucursal 3', 30.157879, -111.674817, 3, '20%', 2]
    ];

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
                + '<a type="button" href="http://doc.pmc-tool.mx/PMCAnalytics/ficha_proyectos.php">'
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
    initDatatable: ()=> {
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


        var table = $('#datatables').DataTable();

        // Edit record
        table.on('click', '.edit', function () {
            $tr = $(this).closest('tr');

            if ($tr.hasClass('child')) {
                $tr = $tr.prev('.parent');
            }

            var data = table.row($tr).data();
            alert('You press on Row: ' + data[0] + ' ' + data[1] + ' ' + data[2] + '\'s row.');
        });

        // Delete a record
        table.on('click', '.remove', function (e) {
            $tr = $(this).closest('tr');
            table.row($tr).remove().draw();
            e.preventDefault();
        });

        //Like record
        table.on('click', '.like', function () {
            alert('You clicked on Like button');
        });
    },
    filtersSelects: () => {

        $('#State').change(() => {
            console.log($('#State').val());
            
        })

    }
}