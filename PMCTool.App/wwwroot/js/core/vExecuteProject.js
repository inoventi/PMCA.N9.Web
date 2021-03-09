var chart;
var chartPareto;
var factsheets = [];

var chartParetoVisible = 0;
var projectFactsheetVisible = 0;
var elementsRelationshipVisible = 0;
var customizedReportsVisible = 0;
var participantsVisible = 0;

$(document).ready(function () {
    $("#vganado").show();
    $("#tbpareto").hide();
    $("#projectParticipantsSection").hide();
    $("#elementsRelationshipSection").hide();
    $("#customizedReportsSection").hide();
    $("#reportWizardSection").hide();
    $("#executedReportSection").hide();
    $("#executedReportSection").hide();
    $("#factsheetSection").hide();
    
    var table = $('#datatablesCustomizedReports').DataTable({
        columns: [
            { data: "projectCustomizedReportID", visible: false },
            { data: "name" },
            { data: "description" },
            {
                data: null, targets: 21,
                defaultContent: '<a class="btn btn-link btn-warning" data-toggle="tooltip" title="' + $("#Update").val() + '"><i class="fa fa-edit"></i></a>&nbsp;<a class="btn btn-link btn-danger" data-toggle="tooltip" title="' + $("#Delete").val() + '"><i class="far fa-trash-alt"></i></a>&nbsp;<a class="btn btn-link btn-success" data-toggle="tooltip" title="' + $("#Execute").val() + '"><i class="fas fa-check"></i></a>'
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        paging: false,
        info: false,
        lengthChange: false,
        order: [[1, "asc"]],
        ordering: true,
        responsive: false,
        //scrollX: true,
        searching: false
    });

    $('#datatableParticipants').DataTable({
        columns: [
            { data: "participantName" },
            { data: "companyName" }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        bLengthChange: false,
        bFilter: false,
        pageLength: 50,
        order: [[0, "asc"]],
        responsive: true,
        scrollX: false,
        searching: false
    });

    $('#datatablesRelationship').DataTable({
        autoWidth: false,
        columns: [
            { data: "taskId", visible: false },
            { data: "sortOrder", visible: false },
            { data: "description", width: '40%' },
            {
                data: "projectEvidencesByTask",
                width: '20%',
                className: 'tdbreak',
                render: function (data, type, row, meta) {
                    var list = '';
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            list = '<p>' + list + '- ' + data[i] + '<p/>';
                        }
                    }
                    return list;
                }
            },
            {
                data: "projectIncidentsByTask",
                width: '20%',
                className: 'tdbreak',
                render: function (data, type, row, meta) {
                    var list = '';
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            list = '<p>' + list + '- ' + data[i] + '<p/>';
                        }
                    }
                    return list;
                }
            },
            {
                data: "projectAgreementsByTask",
                width: '20%',
                className: 'tdbreak',
                render: function (data, type, row, meta) {
                    var list = '';
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            list = '<p>' + list + '- ' + data[i] + '<p/>';
                        }
                    }
                    return list;
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        paging: false,
        info: false,
        lengthChange: false,
        order: [[1, "asc"]],
        ordering: true,
        columnDefs: [{
            targets: [2, 3, 4, 5],
            orderable: false,
        }],
        responsive: false,
        //scrollX: true,
        searching: false
    });

    $('#datatablePareto').DataTable({
        columns: [
            {
                data: "wbsCode", bSortable: false
            },
            {
                data: "text", bSortable: false,
                render: function (url, type, full) {
                    return '<a href="' + '../Execution/Activity?projectId=' + $("#idProject").val() + '&activityId=' + full.projectTaskID + '">' + full.text + '</a>';
                }
            },
            {
                data: "cc", bSortable: false
            },
            {
                data: "status", bSortable: false,
                render: function (url, type, full) {
                    return '<span class="bold ' + getStatusClassName(full.status) + ' pb-1 ws">' + getElementStatusName(full.status) + '</span>';
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        paging: false,
        info: false,
        lengthChange: false,
        order: [[1, "asc"]],
        ordering: true,
        responsive: false,
        //scrollX: true,
        searching: false
    });

    let style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.finalStepButton{background-color: #349eff;border-color: #349eff;}';
    document.getElementsByTagName('head')[0].appendChild(style);

    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.limit-height { height: 500px; overflow-y: scroll;}';
    document.getElementsByTagName('head')[0].appendChild(style);

    $("#selectedColumns, #unselectedColumns, #modulesFilters").addClass("limit-height");

    // Tabmenu
    $("#tabmenu").click(function (e) {
        
        if (e.target.outerText == $("#AcquiredValue").val()) {
            $("#vganado").show();
            $("#tbpareto").hide();
            $("#elementsRelationshipSection").hide();
            $("#customizedReportsSection").hide();
            $("#projectParticipantsSection").hide();
            $("#reportWizardSection").hide();
            $("#executedReportSection").hide();
            $("#factsheetSection").hide();
        }
        else if (e.target.outerText == $("#Pareto").val()) {
            $("#vganado").hide();
            $("#tbpareto").show();
            $("#elementsRelationshipSection").hide();
            $("#customizedReportsSection").hide();
            $("#projectParticipantsSection").hide();
            $("#reportWizardSection").hide();
            $("#executedReportSection").hide();
            $("#factsheetSection").hide();
        }
        else if (e.target.outerText == $("#ProjectParticipants").val()) {
            $("#vganado").hide();
            $("#tbpareto").hide();
            $("#elementsRelationshipSection").hide();
            $("#projectParticipantsSection").show();
            $("#customizedReportsSection").hide();
            $("#reportWizardSection").hide();
            $("#executedReportSection").hide();
            $("#factsheetSection").hide();
        }
        else if (e.target.outerText == $("#ElementRelationship").val()) {
            $("#vganado").hide();
            $("#tbpareto").hide();
            $("#projectParticipantsSection").hide();
            $("#elementsRelationshipSection").show();
            $("#customizedReportsSection").hide();
            $("#reportWizardSection").hide();
            $("#executedReportSection").hide();
            $("#factsheetSection").hide();
        }
        else if (e.target.outerText == $("#CustomizedReports").val()) {
            $("#vganado").hide();
            $("#tbpareto").hide();
            $("#projectParticipantsSection").hide();
            $("#elementsRelationshipSection").hide();
            $("#customizedReportsSection").show();
            $("#reportWizardSection").hide();
            $("#executedReportSection").hide();
            $("#factsheetSection").hide();
        }
        else if (e.target.outerText == $("#Factsheet").val()) {
            $("#vganado").hide();
            $("#tbpareto").hide();
            $("#projectParticipantsSection").hide();
            $("#elementsRelationshipSection").hide();
            $("#customizedReportsSection").hide();
            $("#reportWizardSection").hide();
            $("#executedReportSection").hide();
            $("#factsheetSection").show();
        }
    });

    // Action events for customized reports
    $("#datatablesCustomizedReports tbody").click((e) => {
        var tr = $(e.target).closest('tr');
        var data = table.row(tr).data();

        if ($(e.target).attr('class') == 'fa fa-edit') {
            $("#Creation").val("false");
            $("#Execution").val("false");
            loadReport(data.projectCustomizedReportID);
        }
        else if ($(e.target).attr('class') == 'far fa-trash-alt') {
            confirmDeleteReport(data.projectCustomizedReportID);
        }
        else if ($(e.target).attr('class') == 'fas fa-check') {
            $("#Execution").val("true");
            loadReport(data.projectCustomizedReportID);
        }
    });

    // Smart Wizard configuration
    $('#smartwizard').smartWizard({
        selected: 0,
        useURLhash: false,
        lang: {
            next: $("#Next").val(),
            previous: $("#Previous").val()
        }
    });

    // Behaviour for list elements
    $('#modules, #columns').click((event) => {
        let element = event.target;

        if (element.tagName == "LI") {
            if (element.className.includes("active"))
                element.classList.remove("active");
            else
                element.classList.add("active");
        }

        else if (element.tagName == "BUTTON" || element.parentElement.tagName == "BUTTON") {
            let list = "";

            if (event.currentTarget.id == "modules")
                list = "Modules";
            else
                list = "Columns";

            if (element.className.includes("move-left") || element.parentElement.className.includes("move-left")) {
                let selected = $("#selected" + list + " li.active");
                selected.clone().appendTo("#unselected" + list);
                selected.remove();
            }

            else if (element.className.includes("move-right") || element.parentElement.className.includes("move-right")) {
                let unselected = $("#unselected" + list + " li.active");
                unselected.clone().appendTo("#selected" + list);
                unselected.remove();
            }
        }
    });

    // Search bars
    $("#searchBarUnselected, #searchBarSelected").keyup((event) => {
        let element = event.target;
        let columns;

        if (element.id == "searchBarUnselected")
            columns = $("#unselectedColumns")[0].children;
        else
            columns = $("#selectedColumns")[0].children;

        for (let i = 0; i < columns.length; i++)
            if (columns[i].innerText.toUpperCase().includes(element.value.toUpperCase()))
                columns[i].style.display = "";
            else
                columns[i].style.display = "none";
    });

    // Show step event
    $("#smartwizard").on("showStep", function (e, anchorObject, stepNumber, stepDirection) {
        $('button.sw-btn-next').attr("data-step", stepNumber);

        if (stepNumber == 2)
            loadReportColumns();

        if (stepNumber == 3)
            loadReportFilters();

        if (stepNumber != 3) {
            $('button.sw-btn-next')[0].innerText = $("#Next").val();
            $('button.sw-btn-next').removeClass("finalStepButton");
        }
    });

    $("#smartwizard").on("leaveStep", function (e, anchorObject, stepNumber, stepDirection) {
        if (stepNumber == 0) {
            var form = $("#frmFirstStep");
            if (!form.valid())
                return false;
        }
    });

    // Next button click event
    $('button.sw-btn-next').click(clickEventForNextButton);

    drawChart([], [], []);
    getProjectProgressHistory();

    drawChartPareto([], []);
    //getProjectPareto();
    //getProjectFactsheet();
});

function clickEventForNextButton(event) {
    if ($('button.sw-btn-next')[0].innerText == $("#Save").val()) {
        saveReport();
    }
    else if ($('button.sw-btn-next')[0].innerText == $("#Update").val()) {
        editReport();
    }

    if ($('button.sw-btn-next').attr("data-step") == 3) {
        $('button.sw-btn-next').removeClass("disabled");
        $('button.sw-btn-next').addClass("finalStepButton");

        if ($("#Creation").val() == "true")
            $('button.sw-btn-next')[0].innerText = $("#Save").val();
        else
            $('button.sw-btn-next')[0].innerText = $("#Update").val();
    }
}

function newReport() {
    $("#Creation").val("true");
    $("#CustomizedReportId").val("");
    cleanWizard();
    showReportWizard();
    loadReportElements();
}

function saveReport() {
    let report = getFormularyFromWizard();

    // Send information to backend
    $.ajax({
        type: 'POST',
        url: '/Execution/CreateProjectCustomizedReport',
        dataType: 'json',
        data: report,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => {
                        $("#customizedReportsSection").show();
                        $("#reportWizardSection").hide();
                        cleanWizard();
                        customizedReportsVisible = 0;
                        getCustomizedReports();
                    }
                });
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
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

function editReport() {
    let report = getFormularyFromWizard();

    // Send information to backend
    $.ajax({
        type: 'PUT',
        url: '/Execution/EditProjectCustomizedReport',
        dataType: 'json',
        data: report,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => {
                        $("#customizedReportsSection").show();
                        $("#reportWizardSection").hide();
                        cleanWizard();
                        customizedReportsVisible = 0;
                        getCustomizedReports();
                    }
                });
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
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

async function executeReport(report) {
    try {
        // Present title
        $("#executionReportTitle")[0].innerText = report.name;
        $("#executedReportTables")[0].innerHTML = "";
        let elements = [];
        showReportExecution();

        report.projectCustomizedReportParameter.forEach((parameter) => {
            if (parameter.type == 1) {
                let data = {
                    projectId: report.projectID,
                    projectCustomizedReportId: report.projectCustomizedReportID,
                    elementId: parameter.code
                };

                elements.push(data);
            }
        });

        //if (elements.length == 0) {
        //    LoaderHide();
        //    return;
        //}

        // Load every table in the DOM
        for (let i = 0; i < elements.length; i++) {
            let reportInfo = await loadReportExecutionInfo(elements[i]);
            if (reportInfo.length > 0) {
                presentReport(reportInfo, elements[i].elementId);
            }
        }

        // Draw datatables
        for (let i = 0; i < elements.length; i++) {
            await drawDataTable(elements[i].elementId);
            LoaderHide();
        }
    } catch (e) {
        LoaderHide();
    }
}

function presentReport(data, elementCode) {
    let element = `<h4 class="txt-blue">${globalResource[elementCode.toUpperCase()]}</h4>`;
    let table = `<table id="dynamicDatatable${elementCode}" class="table table-striped table-no-bordered table-hover display responsive nowrap" cellspacing="0" style="width:100%">`;
    let thead = `<thead>
                    <tr>`;
    let tfoot = `<tfoot>
                    <tr>`;
    let tbody = `<tbody>`;

    // Get headers
    firstRow = data[0];
    for (column in firstRow) {
        let columnCode = column.toUpperCase();
        let columnName = globalResource[columnCode];

        thead += `<th>${columnName}</th>`;
        tfoot += `<th>${columnName}</th>`;
    }

    thead += `  </tr>
            </thead>`;
    tfoot += `  </tr>
            </tfoot>`;
    table += thead;
    table += tfoot;

    // Get body
    data.forEach((row) => {
        tbody += `<tr>`;
        for (column in row) {
            tbody += `<td>${row[column]}</td>`;
        }
        tbody += `</tr>`;
    });

    tbody += `</tbody>`;
    table += tbody;
    table += `</table>`;

    $("#executedReportTables")[0].innerHTML += element + table;
}

function deleteReport(projectCustomizedReportId) {
    let data = {
        projectId: $("#idProject").val(),
        projectCustomizedReportId: projectCustomizedReportId
    };

    $.ajax({
        type: 'DELETE',
        url: '/Execution/DeleteProjectCustomizedReport',
        dataType: 'json',
        data: data,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => {
                        customizedReportsVisible = 0;
                        getCustomizedReports();
                    }
                });
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (data) {

        }
    });
}

function loadReport(projectCustomizedReportId) {
    $("#CustomizedReportId").val(projectCustomizedReportId);

    let data = {
        projectId: $("#idProject").val(),
        projectCustomizedReportId: projectCustomizedReportId
    };

    $.ajax({
        type: 'GET',
        url: '/Execution/GetProjectCustomizedReportById',
        dataType: 'json',
        data: data,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            LoaderHide();

            if ($("#Execution").val() == "true") {
                executeReport(data);
            }
            else {
                // Else, you are going to edit
                cleanWizard();
                $('#smartwizard').smartWizard("stepState", [0, 1, 2, 3], "enable");
                fillReportData(data);
            }   
        },
        complete: function () {
        },
        error: function (data) {

        }
    });
}

function loadReportElements() {
    // Check for modules already selected
    let selectedModules = document.querySelectorAll("#selectedModules li");

    let reportElements = [];
    let elementCount = 1;


    while (globalResource["E" + convertNumber(elementCount)] !== undefined) {
        let code = "E" + convertNumber(elementCount);
        let value = globalResource["E" + convertNumber(elementCount)];
        let element = {
            code: code,
            value: value
        };

        // Exclude selected elements
        let found = false;
        if (selectedModules != null)
            selectedModules.forEach((selected) => {
                if (selected.getAttribute("data-code") == element.code)
                    found = true;
            });

        if (!found)
            reportElements.push(element);

        elementCount++;
    }

    let reportElementsHTML = reportElements.map((element) => {
        return `<li class="list-group-item pt-2 pb-2" data-code="${element.code}">${element.value}</li>`;
    }).join("");

    $("#unselectedModules").append(reportElementsHTML);
}

function loadReportColumns() {
    // Add columns related to the selected elements
    let selectedModules = document.querySelectorAll("#selectedModules li");
    // Check for columns already selected
    let selectedColumns = document.querySelectorAll("#selectedColumns li");

    selectedModules.forEach((elementHTML) => {
        let elementCode = elementHTML.getAttribute("data-code");
        let elementName = globalResource[elementCode];

        let reportColumns = [];
        let columnCount = 1;

        while (globalResource[elementCode + "-" + convertNumber(columnCount)] !== undefined) {
            let columnCode = elementCode + "-" + convertNumber(columnCount);
            let columnValue = globalResource[elementCode + "-" + convertNumber(columnCount)];
            let column = {
                code: columnCode,
                value: columnValue
            };

            let found = false;
            if (selectedColumns != null)
                selectedColumns.forEach((selected) => {
                    if (selected.getAttribute("data-code") == column.code)
                        found = true;
                });

            if (!found)
                reportColumns.push(column);

            columnCount++;
        }

        let reportColumnsHTML = reportColumns.map((column) => {
            return `<li class="list-group-item pt-2 pb-2" data-code="${column.code}">${elementName + " : " + column.value}</li>`;
        }).join("");

        $("#unselectedColumns").append(reportColumnsHTML);
    });

    // Remove outdated columns
    let unselectedModules = document.querySelectorAll("#unselectedModules li");
    unselectedModules.forEach((elementHTML) => {
        let elementCode = elementHTML.getAttribute("data-code");

        let outdatedUnselectedColumns = document.querySelectorAll("#unselectedColumns li[data-code*=" + elementCode + "]");
        let outdatedSelectedColumns = document.querySelectorAll("#selectedColumns li[data-code*=" + elementCode + "]");

        if (outdatedUnselectedColumns.length > 0)
            outdatedUnselectedColumns.forEach((column) => {
                column.remove();
            });
        if (outdatedSelectedColumns.length > 0)
            outdatedSelectedColumns.forEach((column) => {
                column.remove();
            });
    });
}

function loadReportFilters() {
    // Save previously selected filters
    let selectedFilters = document.querySelectorAll("#modulesFilters input[type='checkbox']:checked");

    let filtersHTML = "";
    let selectedModules = document.querySelectorAll("#selectedModules li");
    let modulesFilters = document.getElementById("modulesFilters");

    modulesFilters.innerHTML = "";

    selectedModules.forEach((elementHTML) => {
        let elementCode = elementHTML.getAttribute("data-code").substr(1);
        let elementName = globalResource["E" + elementCode];

        filtersHTML += `
           <h4 class="txt-blue">${elementName}</h4>
           <h6>${$("#Status").val()}:</h6>
           <br>
        `;

        let filterCount = 1;
        while (globalResource["F" + elementCode + "-" + convertNumber(filterCount)] !== undefined) {
            let filterCode = "F" + elementCode + "-" + convertNumber(filterCount);
            let filterName = globalResource["F" + elementCode + "-" + convertNumber(filterCount)];

            filtersHTML += `
                <div class="form-check form-group form-check-inline">
                    <label class="form-check-label">
                        <input type="checkbox" class="form-check-input" value="${filterCode}" />
                        <span class="form-check-sign"></span>
                    ${filterName}
                    </label>
                </div>
            `;

            filterCount++;
        }

        filtersHTML += ` 
                <h6>${$("#Fields").val()}:</h6>
                <br>
                <ul>
        `;

        let selectedColumns = document.querySelectorAll("#selectedColumns li[data-code*=" + "E" + elementCode + "]");
        selectedColumns.forEach((columnHTML) => {
            let columnCode = columnHTML.getAttribute("data-code");
            let columnName = globalResource[columnCode];

            filtersHTML += "<li>" + columnName + "</li>";
        });

        filtersHTML += "</ul>"
    });

    modulesFilters.innerHTML = filtersHTML;

    // Restore selected filters
    if (selectedFilters != null) {
        selectedFilters.forEach((selectedFilter) => {
            let filter = document.querySelector("#modulesFilters input[type='checkbox'][value='" + selectedFilter.value + "']");
            if (filter != null)
                filter.checked = true;
        });
    }
}

function loadReportExecutionInfo(data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/Execution/ExecuteProjectCustomizedReport',
            dataType: 'json',
            data: data,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                if (data.valueString != "") {
                    var report = JSON.parse(data.valueString);
                    //if (report.length > 0)
                        resolve(report);
                }
                else
                    resolve([]);
            },
            complete: function () {
                LoaderHide();
            },
            error: function (data) {
            }
        });
    });
}

function drawDataTable(elementCode) {
    return new Promise((resolve, reject) => {
        table = $("#dynamicDatatable" + elementCode).DataTable({
            language: {
                url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
            },
            pageLength: 50,
            responsive: true,
            paging: true,
            searching: true,
            fnInitComplete: function (oSettings, json) {
                resolve();
            }
        });
    });
}

function confirmDeleteReport(projectCustomizedReportId){
    Swal.fire({
        title: '',
        text: $("#AreYouSureDelete").val(),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'btn btn-default btn-fill',
        cancelButtonColor: 'btn btn-info btn-fill',
        cancelButtonText: $("#Cancel").val(),
        confirmButtonText: $("#Accept").val()
    }).then((result) => {
        if (result.value) {
            deleteReport(projectCustomizedReportId);
        }
    })
}

function fillReportData(report) {
    let filterList = [];
    showReportWizard();

    $("#reportName").val(report.name);
    $("#reportDescription").val(report.description);

    report.projectCustomizedReportParameter.forEach((parameter) => {
        // Elements
        if (parameter.type == 1) {
            let elementName = globalResource[parameter.code];
            let elementHTML = `<li class="list-group-item pt-2 pb-2" data-code="${parameter.code}">${elementName}</li>`;
            $("#selectedModules").append(elementHTML);
        }

        // Columns
        else if (parameter.type == 2) {
            let columnName = globalResource[parameter.code];   
            let completeColumnName = globalResource[parameter.code.substr(0, 3)] + " : " + columnName;
            let columnHTML = `<li class="list-group-item pt-2 pb-2" data-code="${parameter.code}">${completeColumnName}</li>`;
            $("#selectedColumns").append(columnHTML);
        }

        // Filters
        else if (parameter.type == 3) {
            filterList.push(parameter);
        }
    });

    loadReportElements();
    loadReportColumns();
    loadReportFilters();

    filterList.forEach((filter) => {
        let checkBox = document.querySelector("#modulesFilters input[type='checkbox'][value='" + filter.code + "']");
        checkBox.checked = true;
    });
}

function cleanWizard() {
    $('#smartwizard').smartWizard('reset');
    $('button.sw-btn-next').click(clickEventForNextButton);
    $("#reportName").val("");
    $("#reportDescription").val("");
    $("#selectedModules").html("");
    $("#unselectedModules").html("");
    $("#selectedColumns").html("");
    $("#unselectedColumns").html("");
    $("#modulesFilters").html("");
    $("#searchBarUnselected")[0].value = "";
    $("#searchBarSelected")[0].value = "";
}

function showReportWizard() {
    $("#vganado").hide();
    $("#tbpareto").hide();
    $("#projectParticipantsSection").hide();
    $("#elementsRelationshipSection").hide();
    $("#customizedReportsSection").hide();
    $("#reportWizardSection").show();
    $("#executedReportSection").hide();
    $("#factsheetSection").hide();
}

function showReportExecution() {
    $("#vganado").hide();
    $("#tbpareto").hide();
    $("#projectParticipantsSection").hide();
    $("#elementsRelationshipSection").hide();
    $("#customizedReportsSection").hide();
    $("#reportWizardSection").hide();
    $("#executedReportSection").show();
    $("#factsheetSection").hide();
}

function getFormularyFromWizard() {
    // Get the report's general information
    let report = {};

    report.projectId = $("#idProject").val();
    report.projectCustomizedReportId = $("#CustomizedReportId").val();
    report.name = $("#reportName").val();
    report.description = $("#reportDescription").val();
    report.projectCustomizedReportParameter = [];

    // Get the selected modules
    let selectedModules = document.querySelectorAll("#selectedModules li");
    selectedModules.forEach((elementHTML) => {
        let elementCode = elementHTML.getAttribute("data-code");

        // Add modules
        let reportParameterElement = {};

        reportParameterElement.code = elementCode;
        reportParameterElement.type = 1;
        reportParameterElement.parent = null;

        report.projectCustomizedReportParameter.push(reportParameterElement);

        // Get the selected columns
        let columns = document.querySelectorAll("#selectedColumns li[data-code*=" + elementCode + "]");
        columns.forEach((columnHTML) => {
            // Add columns
            let reportParameterColumn = {};

            reportParameterColumn.code = columnHTML.getAttribute("data-code");
            reportParameterColumn.type = 2;
            reportParameterColumn.parent = elementCode;

            report.projectCustomizedReportParameter.push(reportParameterColumn);
        });

        // Get the selected filters
        let filters = document.querySelectorAll("#modulesFilters input[type='checkbox'][value*='" + "F" + elementCode.substr(1) + "']:checked");
        filters.forEach((filterHTML) => {
            // Add filters
            let reportParameterFilter = {};

            reportParameterFilter.code = filterHTML.value;
            reportParameterFilter.type = 3;
            reportParameterFilter.parent = elementCode;

            report.projectCustomizedReportParameter.push(reportParameterFilter);
        });
    });

    return report;
}

function convertNumber(num) {
    return (num > 9) ? "" + num : "0" + num;
}

function drawChart(categories, progressExpected, progressReal) {
    chart = new Highcharts.chart('aesperado', {
        title: {
            text: $.i18n._('progress')
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: categories,
            crosshair: true,
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                format: '{value:.2f}'
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            animation: {
                duration: 1500
            },
        },
        series: [{
            name: $.i18n._('progressExpected'),
            data: progressExpected
        }, {
            name: $.i18n._('progressReal'),
            data: progressReal,
            color: "#FF0000"
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 800
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        }

    });
}

function getProjectProgressHistory() {
    $.ajax({
        type: 'GET',
        url: '/Execution/GetProjectProgressHistory',
        dataType: 'json',
        data: { projectId: $("#idProject").val(), fromDate: $("#ProjectAcquiredValueStartDate").val(), toDate: $("#ProjectAcquiredValueEndDate").val() },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (data) {
            var categories = [];
            var progressExpected = [];
            var progressReal = [];

            for (var i = 0; i < data.length; i++) {
                categories.push(data[i].date.substr(0, 10));
                progressExpected.push(parseFloat((data[i].plannedProgress * 100).toFixed(2)));
                progressReal.push(parseFloat((data[i].progress * 100).toFixed(2)));
            }

            chart.destroy();
            drawChart(categories, progressExpected, progressReal);
        },
        complete: function () {
            //LoaderHide();
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

function drawChartPareto(categories, complaints) {
    chartPareto = new Highcharts.chart('pareto', {
        chart: {
            renderTo: 'pareto',
            type: 'column'
        },
        title: {
            text: ' '
        },
        tooltip: {
            shared: true,
            valueDecimals: 2
        },
        xAxis: {
            categories: categories,
            crosshair: true
        },
        yAxis: [{
            title: {
                text: ''
            },
            labels: {
                rotation: 90
            }
        }, {
            title: {
                text: ''
            },
            minPadding: 0,
            maxPadding: 0,
            max: 100,
            min: 0,
            opposite: true,
            labels: {
                format: "{value}%"
            }
        }],
        series: [{
            type: 'pareto',
            name: $("#CumulativeDeviationPercentage").val(),
            yAxis: 1,
            zIndex: 10,
            baseSeries: 1
        }, {
            name: $("#AbsoluteDeviationByActivity").val(),
            type: 'column',
            zIndex: 2,
            data: complaints
        }]
    });
}

function getProjectPareto() {

    if (chartParetoVisible == 0) {
        $.ajax({
            type: 'GET',
            url: '/Execution/GetProjectPareto',
            dataType: 'json',
            data: { projectId: $("#idProject").val() },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                var categories = [];
                var complaints = [];
                var partial = 0;

                $('#datatablePareto').DataTable().clear().draw();
                $('#datatablePareto').DataTable().rows.add(data).draw();

                for (var i = 0; i < data.length; i++) {
                    categories.push(data[i].wbsCode);

                    if (i <= (data.length - 1)) {
                        //complaints.push(parseFloat((data[i].avgDev * 100).toFixed(2)));
                        complaints.push(parseFloat((data[i].absDev).toFixed(2)));
                        partial += parseFloat((data[i].avgDev * 100).toFixed(2));
                    }
                    else {
                        complaints.push(parseFloat((100 - parseFloat(partial)).toFixed(2)));
                    }
                }

                chartPareto.destroy();
                drawChartPareto(categories, complaints);
                chartParetoVisible = 1;
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
}

function getProjectFactsheet() { 
    if ($("#factsheetHolder").length) {
        $("#factsheetHolder").html('');
        $("#modalFactsheetHolder").html('');

        $.ajax({
            type: 'GET',
            url: '/Execution/GetFactsheet',
            dataType: 'json',
            data: { projectId: $("#idProject").val() },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {

                var html = '';
                var modal = '';
                factsheets = [];

                for (var i = 0; i < data.length; i++) {
                    var fid = 'fsid_' + i;

                    html = html + '<div class="row pt-2" style="border-bottom: solid 1px #e3e3e3">'
                        + '<div class="col-md-3" style="background-color: #f1f1f1"><b>' + data[i].factSheetDetailName + '</b></div>'
                        + '<div class="col-md-9">' + data[i].factSheetDetailValue + '</div>'
                        + '</div>';

                    modal = modal + '<div class="form-row">'
                        + '<div class="form-group  mb-1 col-md-12">'
                        + '<label>' + data[i].factSheetDetailName + '</label>'
                        + '<textarea id="' + fid + '" class="form-control" data-projectFactsheetID="' + data[i].projectFactsheetID + '" data-factSheetDetailID="' + data[i].factSheetDetailID + '" >' + data[i].factSheetDetailValue + '</textarea>'
                        + '</div >'
                        + '</div>';

                    factsheets.push(fid);
                }
                $("#factsheetHolder").html(html);
                $("#modalFactsheetHolder").html(modal);

                projectFactsheetVisible = 1; 
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
}

function updProjectFactsheet() {
    var items = []; 

    for (var i = 0; i < factsheets.length; i++) {
        var el = $('#' + factsheets[i])[0];
        var item = { projectFactsheetID: el.dataset.projectfactsheetid, projectID: $("#idProject").val(), factSheetID: $("#FactSheetID").val(), factSheetDetailID: el.dataset.factsheetdetailid, factSheetDetailName: '', factSheetDetailValue: el.value };
        items.push(item);
    }

    $.ajax({
        type: 'POST',
        url: '/Execution/CreateFactsheet',
        dataType: 'json',
        data: { projectId: $("#idProject").val(), data: items },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            $('#fichatecnica').hide();
            $('#fichatecnica').modal('toggle');
           
            if (data.isSuccess)
                getProjectFactsheet();
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

function getElementsRelationship() {

    if (elementsRelationshipVisible == 0) {
        $.ajax({
            type: 'GET',
            url: "/Execution/GetProjectElementRelationship",
            dataType: 'json',
            data: { projectId: $("#idProject").val() },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                $('#datatablesRelationship').DataTable().clear().draw();
                $('#datatablesRelationship').DataTable().rows.add(data).draw();
                elementsRelationshipVisible = 1;
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
}

function getCustomizedReports() {

    if (customizedReportsVisible == 0) {
        $.ajax({
            type: "GET",
            url: "/Execution/GetProjectCustomizedReports",
            dataType: 'json',
            data: { projectId: $("#idProject").val() },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                $('#datatablesCustomizedReports').DataTable().clear().draw();
                $('#datatablesCustomizedReports').DataTable().rows.add(data).draw();
                customizedReportsVisible = 1;
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
}

function getParticipants() {

    if (participantsVisible == 0) {
        $.ajax({
            type: "GET",
            url: "/ProjectManager/GetParticipants",
            dataType: 'json',
            data: { id: $("#idProject").val() },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {

                var myParticipants = [];

                for (var i = 0; i < data.length; i++) {
                    if (data[i]["selected"] == 1) {
                        myParticipants.push(
                            {
                                participantName: data[i].participantName + " " + data[i].participantLastname + " " + data[i].participantSurname,
                                companyName: data[i].companyName
                            }
                        );
                    }
                }

                $('#datatableParticipants').DataTable().clear().draw();
                $('#datatableParticipants').DataTable().rows.add(myParticipants).draw();
                participantsVisible = 1;
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
}