$(function () {
    factSheetA.addEventBtnVIewReport();
    if (factSheetA.getUrlParameter('projectid')) {
         
        let pp = factSheetA.getUrlParameter('projectid');
        console.log(pp);
          let boxContentReport = $('.FactSheetA');
        let btnviewReport = $('.btnviewReport');
        let btnCloseReport = $('.btnCloseReport');
        factSheetA.getReport(factSheetA.getUrlParameter('projectid'));
        btnviewReport.hide();
        btnCloseReport.show(); 
        delete totalmont;
    }
});

let factSheetA = {
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
            boxContentReport.empty();
            btnviewReport.show();
            btnCloseReport.hide();
            $('#project').prop('disabled', false);
            $('#project').selectpicker('refresh');
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
        console.log('position : ' + position);
        if ($('.tbimpact  > tbody > tr').eq(position + 1).data('dinamytr') == true) {
            $('.tbimpact  > tbody > tr').eq(position + 1).remove();
        }
        let data = {
            evidence: $(e).data('evidence')
        }
        console.log(data);
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
        console.log(element);
        element.remove();
    }
}