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
    addEventOpenModals: function () {
        $('.btnmodaltwo').click(function (e) {
            let modal = $(this).data('modal');
            factSheetA.openModal(modal);
        });
        $('.btnmodalone').click(function (e) { 
            let modal = $(this).data('modal');
            factSheetA.openModal(modal);
        });
        
    },
    openModal: function (op) {
        switch (op) {
            case 1:
                $('#modalimgOne').modal('show');
                break;
            case 2:
                $('#modalimgTwo').modal('show');
                break;

        }
    },
    uploadImgTwo: function () { 
        var form = $("#formimgTwo");
        if (!form.valid())
            return;
        let ProjectID = $('#ProjectIDx').val();;

        formData = new FormData();
        formData.append("ProjectID", ProjectID);
        formData.append("Type", "B");
        formData.append("Image", $("#ImageTwo")[0].files[0]);
        factSheetA.saveImagen(formData);
    },
    uploadImgOne: function() {
        var form = $("#formimgOne");
            if (!form.valid())
            return;
        let ProjectID = $('#ProjectIDx').val();;

        formData = new FormData();
        formData.append("ProjectID", ProjectID);
        formData.append("Type", "A");
        formData.append("Image", $("#Image")[0].files[0]);
        factSheetA.saveImagen(formData);
    },
    saveImagen: function (formData) {
        $.ajax({
            type: 'PATCH',
            url: '/FactSheetA/UploadFileA',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                console.log(data);
                if (data.isSuccess) {
                    Swal.fire({
                        type: 'success',
                        title: '',
                        text: data.successMessage,
                        footer: '',
                        onAfterClose: function () { 
                            if (data.valueString1 == "A") {
                                $('#modalimgOne').modal('toggle');
                            }
                            if (data.valueString1 == "B") {
                                $('#modalimgTwo').modal('toggle');
                            }
                        }
                    }); 
                    let content = ".content" + data.valueString1;
                    $(content).empty();
                    $(content).html("<center><img src='" + data.valueString + "' class='img-fluid' alt='Responsive image'> </center>");
                } else {
                    Swal.fire({
                        type: 'error',
                        title: '',
                        text: data.errorMessage,
                        footer: ''
                    });
                }
            },
            complete: function (data) {
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
        })

    },
    btnReportPDFDetail: function () {
        //$('#btnReportPDF').click(function () {
            LoaderShow();
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
        let projectID = $('#project').val();
        let data = {
            "chart": imgbase64
        }; 
        jQuery.ajaxSettings.traditional = true;
        $.ajax({
            url: "/FactSheetA/LoadImage",
            type: "POST",
            data: { chart: imgbase64, projectID : projectID},
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
            window.location = "/FactSheetA";
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