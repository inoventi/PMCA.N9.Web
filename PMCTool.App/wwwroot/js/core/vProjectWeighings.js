$(document).ready(function () {

    var fileExportOptions = {
        exportOptions: {
            columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            format: {
                body: function (data, row, column, node) {
                    return data;
                }
            }
        }
    };

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/ProjectManager/Get",
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                }
                return data;
            }
        },
        columns: [
            { data: "projectID", visible: false },
            { data: "code" },
            { data: "name" },
            { data: "sponsorName" },
            { data: "leaderName" },
            { data: "projectManagerName" },
            { data: "factSheetName" },
            { data: "companyName" },
            { data: "parentName" },
            {
                data: "phase",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectPhase_" + data).val();

                    return data;
                }
            },
            {
                data: "managementType",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectManagementType_" + data).val();

                    return data;
                }
            },
            {
                data: "changeManagement",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectChangeManagement_" + data).val();

                    return data;
                }
            },
            {
                data: "weighingManagement",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectWeighingManagement_" + data).val();

                    return data;
                }
            },
            {
                data: "calendarType",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumProjectCalendarType_" + data).val();

                    return data;
                }
            },
            {
                data: "createdOn",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0] + ' ' + array[1].substr(0, 5);
                    }
                    return data;
                }
            },
            { data: "createdByName" },
            {
                data: "lastUpdatedOn",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0] + ' ' + array[1].substr(0, 5);
                    }
                    return data;
                }
            },
            { data: "updatedByName" },
            {
                data: null, targets: 13,
                defaultContent: '<a class="btn btn-link btn-info" data-toggle="tooltip" title="' + $("#Weighing").val() + '"><i class="fas fa-calculator"></i></a>'
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        dom: 'Bfrtip',
        buttons: [
            $.extend(true, {}, fileExportOptions, { extend: 'excelHtml5' }),
        ],
        order: [[2, "asc"]],
        responsive: true,
        scrollX: true
    });

    $('#datatables tbody').on('click', 'a', function (e) {
        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child')) {
            tr = $(tr).prev();
        }

        var data = table.row(tr).data();

        if ($(e.target).attr('class') === 'fas fa-calculator') {
            $('#exampleModal').modal('show');
            $("#projectWorkinPlan").click(function () {
                location.href = '/ProjectManager/Weighings?id=' + data.projectID;
            })
            $("#projectControlPoints").click(function () {
                location.href = '/ProjectManager/ControlPointsWeighing?id=' + data.projectID;
            })
            $("#projectEvidences").click(function () {
                location.href = '/ProjectManager/EvidenceWeighing?id=' + data.projectID;
            })
        }
    });

});