$(document).ready(function () {

    $("#ActivityID").change(function () {
        var activityId = $("#ActivityID").val();
        getEvidences(activityId);
        return false;
    });

    $("#evidenceID").change(function () {
        var evidenceID = $("#evidenceID").val();
        fillTable(evidenceID)
        return false;
    });
});

function getEvidences(activityId) {

    $.ajax({
        type: 'GET',
        url: '/Execution/GetEvidenceByActivity',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), activityId: activityId },
        beforeSend: function () {
        },
        success: function (data) {
            document.getElementById("evidenceID").options.length = 0;
            select = document.getElementById("evidenceID");

            for (var i = 0; i < data.length; i++) {
                var opt = document.createElement('option');

                opt.value = data[i]["key"];
                opt.innerHTML = data[i]["value"];

                select.appendChild(opt);
            }
        },
        complete: function () {
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

function fillTable(evidenceID) {

    $('#datatables').DataTable().clear().draw();
    $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/ProjectEvidenceControlPointWeight/Get",
            data: { projectId: $("#ProjectID").val(), activityId: $("#ActivityID").val() , evidenceId: evidenceID },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                return data;
            }
        },
        columns: [
            { data: "projectEvidenceControlPointID", visible: false},
            { data: "description" },
            {
                data: "plannedEndDate",
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        var array = data.split("T");
                        data = array[0];
                    }
                    return data;
                }
            },
            {
                data: null,
                orderDataType: "dom-text-numeric",
                render: function (url, type, full) {
                    if(full.status == 5)
                        return '<div><input id="weight" type="number" onkeyup="checkNumericLimit(event)" onkeydown="return event.keyCode !== 69" min="0"  max="100"  value="' + full.weight + '" disabled /><label> %</label></div>';
                    else
                        return '<div><input id="weight" type="number" onkeyup="checkNumericLimit(event)" onkeydown="return event.keyCode !== 69" min="0"  max="100"  value="' + full.weight + '"/><label> %</label></div>';
                }
            }
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        paging: false,
        order: [[1, "asc"]],
        responsive: true,
        scrollX: true,
        searching: false,
        destroy: true
    });
}

function checkNumericLimit(event) {
    let input = event.target;

    if (input.value > 100)
        input.value = 100;
    else if (input.value < 0)
        input.value = 0;
}

function updateWeights() {
    let validInputs = true;
    var table = $('#datatables').DataTable();
    var total = 0; 
    var newTaskWeights = [];

    table.rows().eq(0).each(function (index) {
        var row = table.row(index);
        var data = row.data();
        var newWeight = table.cell(index, 3).nodes().to$().find('input').val();
        total += parseFloat(newWeight);

        // Check for invalid inputs
        if (newWeight == "") {
            validInputs = false;
            table.cell(index, 3).nodes().to$().find('input').css("border-color", "red");
            Swal.fire({
                type: 'warning',
                title: '',
                text: $("#VerifyNumericField").val(),
                footer: '',
                onAfterClose: () => { }
            });
        }
        else {
            table.cell(index, 3).nodes().to$().find('input').css("border-color", "initial");
        }

        // Store all weights
        if (data.weight != newWeight) {
            newTaskWeights.push({
                'projectEvidenceControlPointID': data.projectEvidenceControlPointID,
                'weight': newWeight
            });
        }
    });

    if (validInputs) {
        if (total != 0 && total != 100) {
            Swal.fire({
                type: 'error',
                title: '',
                text: $("#Equal100").val(),
                footer: ''
            });
            return false;
        }

        $.ajax({
            type: 'PUT',
            url: '/ProjectEvidenceControlPointWeight/UpdateBatch',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), activityId: $("#ActivityID").val(), evidenceId: $("#evidenceID").val(), data: newTaskWeights },
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

function reload() {
    $('#datatables').DataTable().ajax.reload();
}