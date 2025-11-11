const divElementTable = $('._box001');

class pe {
    constructor() { 
        console.log("okeeey");
        this.init();
    }
    init() { 
        $(document).on('click', '.btn-report', async (e) => {
            if ($('#selprojects').val() === null || $('#selprojects').val().length === 0) {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: 'Debe seleccionar al menos un proyecto',
                    footer: ''
                });
                return;
            }
            let data = {
                projectID: $('#selprojects').val()  
            };
            LoaderHide();
            this.getReportEvidencs(data);
        });

        
    }
    reloadPartialPage() {
        
    }
    async getReportEvidencs(d) {
         
        $.post('/Project/GetReportEvidencesByProjec006', d, function (dataResult) {
            console.log(dataResult);
            divElementTable.empty();
            divElementTable.html(dataResult);
            LoaderHide(); 
        });
    }
    
}
document.addEventListener("DOMContentLoaded", () => {
    new pe();
});
