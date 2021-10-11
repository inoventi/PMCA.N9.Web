$(function () {
    factSheetA.addEventBtnVIewReport();
    if (factSheetA.getUrlParameter('projectid')) {
         
        let pp = factSheetA.getUrlParameter('projectid'); 
          let boxContentReport = $('.FactSheetA');
        let btnviewReport = $('.btnviewReport');
        let btnCloseReport = $('.btnCloseReport');
        factSheetA.getReport(factSheetA.getUrlParameter('projectid'));
        btnviewReport.hide();
        btnCloseReport.show(); 
        delete totalmont;
    }
    $('.selectpicker').selectpicker({
        noneResultsText: 'No se encontraron resultados'
    });
});
const evidenceView = [];

let factSheetA = {
    btnReportPDFDetail: function () {
        //$('#btnReportPDF').click(function () {
            LoaderShow();
            debugger;
            let uniqueEvidences = [...new Set(evidenceView)]; 
            let evidences = uniqueEvidences.join();
            const urlSearchParams = new URLSearchParams(window.location.search);
            const params = Object.fromEntries(urlSearchParams.entries());
            let data = {
                "project": "'" + params.project + "'",
                "evidences": "'" + evidences + "'"
            };
            jQuery.ajaxSettings.traditional = true;
            $.ajax({
                url: "/FactSheetA/printReportFactSheetADetail",
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
                        a.download = "FichaDeProyecto - Detalle.pdf";
                        a.click();
                    }
                }
            });


        //});

    },
    savechart: function (imgbase64) {
        let data = {
            "chart": imgbase64 
        }; 
        jQuery.ajaxSettings.traditional = true;
        $.ajax({
            url: "/FactSheetA/LoadImage",
            type: "POST",
            data: data,
            cache: false,
            error: function (xhr, status, error) {
                console.log(error);
            },
            success: function (data) {
                LoaderHide();
                jQuery.ajaxSettings.traditional = false;
            }
        });
    },
    btnReportPDF: function () { 
        $('#btnReportPDF').click(function () {
            LoaderShow(); 
            let project = $('#project').val();
            let projectSelected; 
            if (project == null || project == "") {
                const urlSearchParams = new URLSearchParams(window.location.search);
                const params = Object.fromEntries(urlSearchParams.entries());
                projectSelected = params.projectid;
            } else {
                projectSelected = project;
            }
            let data = {
                "project": "'" + projectSelected + "'"
            };
            jQuery.ajaxSettings.traditional = true;
            $.ajax({
                url: "/FactSheetA/printReportFactSheetA",
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
                        a.download = "FichaDeProyecto.pdf";
                        a.click();
                    }
                }
            });


        });

    },
    addEventBtnVIewReport: function () {
        let boxContentReport = $('.FactSheetA');
        let btnviewReport = $('.btnviewReport');
        let btnCloseReport = $('.btnCloseReport');

        btnviewReport.click(function () {
            let project = $('#project').val();
            if (project != "") {
                $('#project').prop('disabled', true);
                $('#project').selectpicker('refresh');

                factSheetA.getReport(project);
                btnviewReport.hide();
                btnCloseReport.show();
                delete totalmont; 
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: "Debes selecionar un proyecto",
                    footer: ''
                });
            }
               
        });
        btnCloseReport.click(function () {
            delete totalmont;
            window.location.href = window.location.href;
            //boxContentReport.empty();
            //btnviewReport.show();
            //btnCloseReport.hide();
            //$('#project').prop('disabled', false);
            //$('#project').selectpicker('refresh');
        });

    },
    getReport: function (project) {
        let boxContentReport = $('.FactSheetA')
        LoaderShow();
        boxContentReport.empty();
        boxContentReport.html('');
        $.post('/FactSheetA/getReportFactSheet', { projectId: project }, function (r) {
            boxContentReport.html(r);
            LoaderHide();

        });
    },
    getUrlParameter: function (sParam) {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    },
    getControlPoints: function (e) {
        let element = $(e).parent().parent();
        let position = element.index(); 
        if ($('.tbimpact  > tbody > tr').eq(position + 1).data('dinamytr') == true) {
            $('.tbimpact  > tbody > tr').eq(position + 1).remove();
        }
        let data = {
            evidence: $(e).data('evidence')
        }
        evidenceView.push($(e).data('evidence'));
        LoaderShow();
        $.post('/FactSheetA/getControlPointbyEvidence', data, function (r) {
            
                $('.tbimpact  > tbody > tr').eq(position).after(r);
            
            LoaderHide();
        }); 
        e.preventDefault();
        //$('.table  > tbody > tr').eq(position).after(templeteTRHTML());
        //$('.table  > tbody > tr').eq(position).empty();
    }
   ,
    closetr: function(e) {
        let element = $(e).parent().parent(); 
        element.remove();
    }
}