class projectDetail {
    constructor() {
        this.init();
    }
    init() {
        $('.btn-report').on('click', async () => {
            let projectId = $('#selprojects').val();
            if (projectId.length == 0) {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: $.i18n._("Analytics5_024"),
                    footer: ''
                });
                return;
            }
            await this.getIndividualReportPerProject(projectId);
            await this.getControlChangesDatesParticipansByPorject(projectId);
            await this.getElementsSummaryByProjectID(projectId);
            await this.getProjectElementsByProjectID(projectId);
        });
    }
    async getIndividualReportPerProject(projectId) {
        let request = await fetch(`/Project/individualReportPerProject?projectId=${projectId}`);
        let { plannedProgress, progress, totalChanges, totalParticipants, totalRisk, totalRiskClosed, totalTask, totalTaskDelayed } = await request.json();
        $('.tt-participants').html(totalParticipants);
        $('.tt-task').html(totalTask);
        $('.tt-task-delayed').html(totalTaskDelayed);
        $('.tt-risk').html(totalRisk);
        $('.tt-risk-closed').html(totalRiskClosed);
        $('.tt-changes').html(totalChanges);

        $('.real-progress').html(`${progress}%`);
        $('.graphic-real-progress').css('width', `${progress}%`);
        $('.planned-progress').html(`${plannedProgress}%`);
        $('.graphic-planned-progress').css('width', `${plannedProgress}%`);
    }
    async getControlChangesDatesParticipansByPorject(projectId) {
        let request = await fetch(`/Project/controlChangesDatesParticipansByPorject?projectId=${projectId}`);
        let data = await request.json();
        //console.log(data);
    }
    async getElementsSummaryByProjectID(projectId) {
        let request = await fetch(`/Project/elementsSumaryByProjecID?projectId=${projectId}`);
        let data = await request.json();
        //console.log(data);
    }
    async getProjectElementsByProjectID(projectId) {
        let request = await fetch(`/Project/projectElementsByProject?projectId=${projectId}`);
        let data = await request.json();
        console.log(data);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    new projectDetail();
});
