$(document).ready(function () {
    vBranchLocationClass.initReport();
});
// Initialize and add the map
var map, locations, markers;
var vBranchLocationClass = {
    initMap: (data) => {
    $('.div-map').removeAttr('hidden');
    // Multiple markers location, latitude, and longitude
    markers = [];
    for (var a = 0; a < data.length; a++) {
        var advance = data[a].advance * 100;        
        var lenght = data[a].lenght;
        var latitude = data[a].latitude;
        if (latitude.length > 8) {
            markers.push([data[a].projectName, parseFloat(latitude), parseFloat(lenght), data[a].projectID, Math.trunc(advance), data[a].status]);
        }    
    }
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap',
        zoom: 5,
        center: { lat: 23.314402, lng: -102.674031 }
    };
    // Display a map on the web page
    map = new google.maps.Map(document.getElementById("regularMap"), mapOptions);
    map.setTilt(50);

    
 

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
            $('#btnPDF').removeAttr('hidden');
            $('#Estate').prop('disabled', true);
            $('#Estate').selectpicker('refresh');
            $('#Municipios').prop('disabled', true);
            $('#Municipios').selectpicker('refresh');
            $('#predio').prop('disabled', true);
            $('#predio').selectpicker('refresh');
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
    },
    MakePDF: () => {
        LoaderShow();
        $('html').css('overflow', 'hidden');
        $('#rowEncabezado').removeAttr('hidden');
        $objetivo = document.querySelector("#encabezado"), // A qué le tomamos la foto
        $tablareport = document.querySelector('#tablereport');
        if (!markers || markers === null || markers.lenght < 1) {
            return;
        }
        const pdf = new jspdf.jsPDF("p", "pt", "letter");
        var encabezado, tablereport;
        html2canvas($objetivo) // Llamar a html2canvas y pasarle el elemento
            .then(canvas => {
                // Convertir la imagen a Base64
                encabezado = canvas.toDataURL();
                const e = new Image();
                e.crossOrigin = 'Anonymous';
                e.onload = event => {
                    var canvas = document.createElement('CANVAS');
                    var ctx = canvas.getContext('2d');
                    var dataURL;
                    ctx.drawImage(e, 0, 0);
                    dataURL = canvas.toDataURL('image/jpeg,1.0');
                    pdf.addImage(encabezado, "JPEG", 0, 40, 600, 30);
                    $('#rowEncabezado').attr("hidden", true);
                    $('html').css('overflow', 'overlay');
                    window.URL.revokeObjectURL(dataURL);
                    canvas = null;
                    const r = pdf.internal.pageSize.getWidth() / pdf.internal.pageSize.getHeight();
                    const wh = [Math.floor(974 / 2), Math.floor((974 / r) / 2)];
                    const center = map.getCenter();
                    let staticurl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat()},${center.lng()}&scale=2&zoom=${map.getZoom() - 1}&size=${wh[0]}x${wh[1]}&maptype=hybrid`;
                    staticurl += '&markers=color:red';
                    console.log(markers);
                    markers.forEach(mark => {
                        staticurl += '%7C' + mark[1] + ',' + mark[2];
                    });
                    staticurl += '&key=AIzaSyAT4_lYZoSRsv9h_reS4rR8lBgzY6ZchYI&libraries=&v=weekly';
                    console.log(staticurl);
                    if (staticurl.lenght > 8192) {
                        Swal.fire({
                            type: 'error',
                            title: '',
                            text: 'Too much data on map',
                            footer: ''
                        });
                        LoaderHide();
                        return;
                    }
                    const d = new Image();
                    d.crossOrigin = 'Anonymous';
                    d.onload = event => {
                        var canvas = document.createElement('CANVAS');
                        var ctx = canvas.getContext('2d');
                        var dataURL;
                        canvas.height = wh[1] * 2;
                        canvas.width = wh[0] * 2;
                        ctx.drawImage(d, 0, 0);
                        dataURL = canvas.toDataURL('image/jpeg,1.0');
                        pdf.addImage(dataURL, "JPEG", 60, 100, 500, 0);
                        pdf.save('ReporteMapaUbicacionSucursales.pdf');
                        $('#rowEncabezado').attr("hidden", true);
                        window.URL.revokeObjectURL(dataURL);
                        canvas = null;
                    };
                    d.src = staticurl;
                };
                e.src = encabezado;

            });
        let State = $('#Estate').val();
        let Municipalities = $("#Municipios").val();
        let Predio = $('#predio').val();
        jQuery.ajaxSettings.traditional = true;
        $.ajax({
            url: "/BranchLocations/PrintReportBranchLocation",
            type: "POST",
            data: {
                "State": "'" + State + "'",
                "Municipalities": "'" + Municipalities.join() + "'",
                "Predio": "'" + Predio.join() + "'",
            },
            cache: false,
            error: function (xhr, status, error) {
                console.log(error);
                LoaderHide();
            },
            success: function (data) {
                console.log(data);
                jQuery.ajaxSettings.traditional = false;
                if (data != null) {
                    var a = document.createElement("a");
                    a.href = src = 'data:application/pdf;base64,' + encodeURI(data.FileContents);
                    a.download = "ReporteTablaUbicacionSucursales.pdf";
                    a.click();
                    LoaderHide();
                }
            }
        });
    }
}
$.fn.selectpicker.defaults = {
    selectAllText: 'Seleccionar Todo',
    deselectAllText: 'Deseleccionar Todo'
};