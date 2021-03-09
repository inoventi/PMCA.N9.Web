$(document).ready(function () {

    // ***** Initiating Gantt data *****
    var urlParams = new URLSearchParams(location.search);
    var projectId = urlParams.get('id');
    gantt.load("/Gantt/Get?id=" + projectId);
    gantt.init("gantt");

    $("#TaskID").change(function () {
        var activityID = $("#TaskID").val();
        if (activityID == '00000000-0000-0000-0000-000000000000')
            getParents();
        else
            getChildren(activityID);

        return false;
    });

});

function getChildren(activityID) {
    $('#datatables').DataTable().clear().draw();
    $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/ProjectTaskWeighing/GetByParentId",
            data: { projectId: $("#ProjectID").val(), parentId: activityID },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide(); ProjectID
            },
            dataSrc: function (data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].wbs = gantt.getWBSCode(gantt.getTask(data[i].projectTaskId));
                }
                return data;
            }
        },
        columns: [
            {
                data: "projectTaskId", visible: false
            },
            {
                data: "sortOrder", visible: false
            },
            {
                data: "wbs"
            },
            {
                data: "text"
            },
            {
                data: "startDate",
                render: function (url, type, full) {
                    return '<p align="center">' + convertDate(full.startDate) + '</p>';
                },
                align: "center"
            },
            {
                data: "endDate",
                render: function (url, type, full) {
                    return '<p align="center">' + convertDate(full.endDate) + '</p>';
                },
                align: "center"
            },
            {
                data: "duration",
                render: function (url, type, full) {
                    return '<p align="center">' + full.duration + '</p>';
                },
                align: "center"
            },
            {
                data: "isMilestone",
                render: function (url, type, full) {
                    return '<p align="center">' + isMilestone(full.isMilestone) + '</p>';
                },
                align: "center"
            },
            {
                data: null,
                orderDataType: "dom-text-numeric",
                render: function (url, type, full) {
                    if (full.status == 5) {
                        return '<div align="center"><input id="weight" type="number" onkeyup="checkNumericLimit(event)" onkeydown="return event.keyCode !== 69" min="0"  max="100"  value="' + full.weight.toFixed(2) + '" disabled/><label> %</label></div>';
                    }
                    else
                        return '<div align="center"><input id="weight" type="number" onkeyup="checkNumericLimit(event)" onkeydown="return event.keyCode !== 69" min="0"  max="100"  value="' + full.weight.toFixed(2) + '"/><label> %</label></div>';
                }
            },
            {
                data: "calculatedWeight",
                render: function (url, type, full) {
                    return '<p align="right">' + percentageFormat(full.calculatedWeight) + '</p>';
                }
            },
            {
                data: "parent", visible: false
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        bFilter: false,
        lengthChange: false,
        order: [[1, "asc"]],
        responsive: true,
        scrollX: true,
        destroy: true
    });
}

function getParents() {
    $('#datatables').DataTable().clear().draw();
    $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/ProjectTaskWeighing/GetParents",
            data: { projectId: $("#ProjectID").val()},
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide(); ProjectID
            },
            dataSrc: function (data) {
                for (var i = 0; i < data.length; i++) {
                    data[i].wbs = gantt.getWBSCode(gantt.getTask(data[i].projectTaskId));
                }
                return data;
            }
        },
        columns: [
            {
                data: "projectTaskId", visible: false
            },
            {
                data: "sortOrder", visible: false
            },
            {
                data: "wbs"
            },
            {
                data: "text"
            },
            {
                data: "startDate",
                render: function (url, type, full) {
                    return '<p align="center">' + convertDate(full.startDate) + '</p>';
                },
                align: "center"
            },
            {
                data: "endDate",
                render: function (url, type, full) {
                    return '<p align="center">' + convertDate(full.endDate) + '</p>';
                },
                align: "center"
            },
            {
                data: "duration",
                render: function (url, type, full) {
                    return '<p align="center">' + full.duration + '</p>';
                },
                align: "center"
            },
            {
                data: "isMilestone",
                render: function (url, type, full) {
                    return '<p align="center">' + isMilestone(full.isMilestone) + '</p>';
                },
                align: "center"
            },
            {
                data: null,
                orderDataType: "dom-text-numeric",
                render: function (url, type, full) {
                    if (full.status == 5) {
                        return '<div align="center"><input id="weight" type="number" onkeyup="checkNumericLimit(event)" onkeydown="return event.keyCode !== 69" min="0"  max="100"  value="' + full.weight.toFixed(2) + '" disabled/><label> %</label></div>';
                    }
                    else
                        return '<div align="center"><input id="weight" type="number" onkeyup="checkNumericLimit(event)" onkeydown="return event.keyCode !== 69" min="0"  max="100"  value="' + full.weight.toFixed(2) + '"/><label> %</label></div>';
                }
            },
            {
                data: "calculatedWeight",
                render: function (url, type, full) {
                    return '<p align="right">' + percentageFormat(full.calculatedWeight) + '</p>';
                }
            },
            {
                data: "parent", visible: false
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        bFilter: false,
        lengthChange: false,
        order: [[1, "asc"]],
        responsive: true,
        scrollX: true,
        destroy: true
    });
}

function reload() {
    $('#datatables').DataTable().ajax.reload();
}

function checkNumericLimit(event) {
    let input = event.target;

    if (input.value > 100)
        input.value = 100;
    else if (input.value < 0)
        input.value = 0;
}

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date();
    if (inputFormat !== undefined) {
        d = new Date(inputFormat);
    }
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function updateWeights() {
    let validInputs = true;
    var table = $('#datatables').DataTable();
    var total = 0; 
    var newTaskWeights = [];

    table.rows().eq(0).each(function (index) {
        var row = table.row(index);

        var data = row.data();
        var newWeight = table.cell(index, 8).nodes().to$().find('input').val();
        total += parseFloat(newWeight);

        // Check for invalid inputs
        if (newWeight == "") {
            validInputs = false;
            table.cell(index, 8).nodes().to$().find('input').css("border-color", "red");
            Swal.fire({
                type: 'warning',
                title: '',
                text: $("#VerifyNumericField").val(),
                footer: '',
                onAfterClose: () => {}
            });
        } 
        else {
            table.cell(index, 8).nodes().to$().find('input').css("border-color", "initial");
        }

        // Store all weights
        newTaskWeights.push({
            'projectTaskID': data.projectTaskId,
            'weight': newWeight,
            'parent': data.parent
        });
    });

    if (validInputs) {
        $.ajax({
            type: 'PUT',
            url: '/ProjectTaskWeighing/UpdateBatch',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), data: newTaskWeights },
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
                        onAfterClose: () => reload()
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
}

function setDetaultWeights() {
    $.ajax({
        type: 'PUT',
        url: '/ProjectTaskWeighing/UpdateDefaultBatch',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val() },
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
                    onAfterClose: () => reload()
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

function percentageFormat(value) {
    return value.toFixed(2) + " %";
}

function isMilestone(value) {
    return value == true ? $("#Yes").val() : $("#No").val();
}