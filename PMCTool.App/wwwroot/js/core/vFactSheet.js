var pmcUrl;
$(document).ready(function () {
    $("#divFichaTecnicaProyecto").hide();

    $("#progress").html('');
    $('#btnIrPMC').off('click');
    let projectId = $("#ProjectID").val();
    
    if ($("#ProjectID").val() != "") {
        refresh(projectId);
    } else {
        $("#divFichaTecnicaProyecto").hide();
        $("#btnClose").hide();
        $('#btnIrPMC').hide();
    }

    $("#btnSearch").click(function () {
        refresh(projectId);
    });
    vFactSheet.addEventBtnExportPDF();
});

let vFactSheet = { 
    printRefresh() { 
            let projectId = $("#ProjectID").val(); 
        getFactSheet(projectId);
        getStagesProgress(projectId); 
    },
    addEventBtnExportPDF() {
        $('.bntReportPDF').click(function () {
            LoaderShow();
            let projectid = $("#proyecto").val(); 
            jQuery.ajaxSettings.traditional = true;
            $.ajax({
                url: "/FactSheet/printReport",
                type: "POST",
                data: {
                    "ProjectID": "'" + projectid + "'"
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
                        a.download = "FechaDeProyecto.pdf";
                        a.click();
                    }
                }
            });


        });

    }
}

function refresh(projectId) {
    if (projectId == "") {
        projectId = $("#proyecto").val();
    }
    if ($("#proyecto").val() == "" && projectId == "") {
        OnFailure();
    } else {
        getFactSheet(projectId);
        getStagesProgress(projectId);
        
    }
}

$("#btnClose").click(function () {
    $("#divFichaTecnicaProyecto").hide();
    window.location = "/FactSheet/Index";
});

function cleanFactSheet() {
    $("#projectName").html('');
    $("#resumenEjecutivo").html('');
    $("#DesicionesClave").html('');
    $("#institucion").html('');
    $("#tipoPredio").html('');
    $("#categoriaPredio").html('');
    $("#progress").html('');
    $("#estado").html('');
    $("#municipio").html('');
    $("#localidad").html('');
}

function getFactSheet(projectId) {
    cleanFactSheet();
    $.ajax({
        type: 'GET',
        url: '/FactSheet/GetProjectTab',
        dataType: 'json',
        data: { projectId: projectId },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            for (let i = 0; i < data.length; i++) {
                data[i].progress = data[i].progress * 100;
                data[i].progress = parseFloat(data[i]["progress"]).toFixed(2);
                $("#projectName").append(data[i].projectName);
                $("#resumenEjecutivo").append(data[i].executiveSummary);
                $("#DesicionesClave").append(data[i].keyDecisions);
                $("#institucion").append(data[i].institution);
                $("#tipoPredio").append(data[i].venue);
                $("#categoriaPredio").append(data[i].categoryVenue);
                $("#progress").append(
                    '<div class="progress-circle border-primary progress-' + parseInt(data[i].progress) + '"><span id="progressCircle">' + data[i].progress + '</span></div>'
                );
                $("#progressCircle").css({ 'font-size': '1.0em'});
                $("#estado").append(data[i].state);
                $("#municipio").append(data[i].municipality);
                $("#localidad").append(data[i].locality);

                $("#btnSearch").hide();
                $("#btnClose").show();
                $('#btnIrPMC').show();
                $('#btnIrPMC').on('click', function () {
                    RedirectPMC(projectId);
                })
                $('.selectpicker').selectpicker('val', projectId);
                $('#proyecto').selectpicker('refresh');
                $('#proyecto').prop('disabled', true);
                $('#proyecto').selectpicker('refresh');
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}

function getStagesProgress(projectId) {
    $("#tStageProgress").html('');
    $.ajax({
        type: 'GET',
        url: '/FactSheet/GetProjectTabTask',
        dataType: 'json',
        data: { projectId: projectId },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            //var obj = '[{"Description":"Obra civil","Progress":100,"Status":4},{ "Description": "Legal", "Progress": 80, "Status": 2 }, { "Description": "Recursos Humanos", "Progress": 60, "Status": 3 }, { "Description": "Tecnología", "Progress": 80, "Status": 1 }, { "Description": "Pre prueba", "Progress": 10, "Status": 1 }]';
            //var data = jQuery.parseJSON(obj);
            //console.log(data);
            for (let i = 0; i < data.length; i++) {
                data[i].progress = data[i].progress * 100;
                data[i].progress = parseFloat(data[i]["progress"]).toFixed(2);
                let markup = '<tr>'
                    + '<td width= "40%">' + data[i].activity
                    + '<br><span class="bold ' + getStatusClassName(data[i].status) + '">' + getElementStatusName(data[i].status) + '</span></td>'
                    + '<td  width= "100%">'
                    + '<div class="progress" style="height: 16px;">'
                    + '<div class="' + barColor(data[i].status) + '" style="width: ' + data[i].progress +'%" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"> ' + data[i].progress + ' %</div> '
                    + '</div></td>'
                    + '</tr>';
                $("#tStageProgress").append(markup);
                $("#divFichaTecnicaProyecto").show();
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}

function barColor(status) {
    let barColor = '';
    switch (status) {
        case 1:
            barColor = "progress-bar bg-success progress-bar-striped progress-bar-animated";
            break;
        case 2:
            barColor = "progress-bar bg-warning progress-bar-striped progress-bar-animated";
            break;
        case 3:
            barColor = "progress-bar bg-danger progress-bar-striped progress-bar-animated";
            break;
        case 4:
            barColor = "progress-bar bg-secondary progress-bar-striped progress-bar-animated";
            break;
        default:
            break;
    }
    return barColor;
}

function OnFailure() {
    Swal.fire({
        type: 'error',
        title: '',
        text: 'Seleccione un proyecto',
        footer: ''
    });
}

function RedirectPMC(id) {
    const url = `${pmcUrl}/Execution/Project?id=${id}`;
    const el = document.createElement('a');
    el.href = url;
    el.target = '_blank';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

function saveUrl(url) {
    pmcUrl = url;
}