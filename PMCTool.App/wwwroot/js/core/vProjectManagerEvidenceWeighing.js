$(document).ready(function () {

    $("#ActivityID").change(function () {
        var activityID = $("#ActivityID").val();
        fillTable(activityID)
        return false;
    });

});


function fillTable(activityID) {
    $('#datatables').DataTable().clear().draw();
    $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/ProjectEvidenceWeight/Get",
            data: { projectId: $("#ProjectID").val(), activityId: activityID },
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
            { data: "projectEvidenceID", visible: false },
            { data: "description"},
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
            { data: "evidenceTypeName" },
            {
                data: null,
                orderDataType: "dom-text-numeric",
                render: function (url, type, full) {
                    if(full.status == 5)
                        return '<div><input id="weight" type="number" onkeyup="checkNumericLimit(event)" onkeydown="return event.keyCode !== 69" min="0"  max="100"  value="' + full.weight + '" disabled/><label> %</label></div>';
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
    var newTaskWeights = [];
    var total = 0; 

    table.rows().eq(0).each(function (index) {
        var row = table.row(index);
        var data = row.data();
        var newWeight = table.cell(index, 4).nodes().to$().find('input').val();
        total += parseFloat(newWeight);

        // Check for invalid inputs
        if (newWeight == "") {
            validInputs = false;
            table.cell(index, 4).nodes().to$().find('input').css("border-color", "red");
            Swal.fire({
                type: 'warning',
                title: '',
                text: $("#VerifyNumericField").val(),
                footer: '',
                onAfterClose: () => { }
            });
        }
        else {
            table.cell(index, 4).nodes().to$().find('input').css("border-color", "initial");
        }

        // Store all weights
        if (data.weight != newWeight) {
            newTaskWeights.push({
                'projectEvidenceID': data.projectEvidenceID,
                'Weight': newWeight
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
            url: '/ProjectEvidenceWeight/UpdateBatch',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), activityId: $("#ActivityID").val(), data: newTaskWeights },
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