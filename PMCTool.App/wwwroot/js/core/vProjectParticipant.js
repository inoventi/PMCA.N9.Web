
let rowRef;
let trRef;

$(document).ready(function () {

    var table = $('#datatables').DataTable({
        ajax: {
            method: "GET",
            url: "/Projects/GetParticipants",
            dataType: 'json',
            data: { id: $("#ProjectID").val() },
            beforeSend: function () {
                LoaderShow();
            },
            complete: function () {
                LoaderHide();
            },
            dataSrc: function (data) {
                for (var i = 0, ien = data.length; i < ien; i++) {
                    if (data[i]["selected"] == 1) {
                        data[i]["selected"] = "<a class='btn btn-link btn-info like'><i class='far fa-check-square'></i></a>";
                        data[i]["participantName"] = "<b>" + data[i]["participantName"].toUpperCase() + " " + data[i]["participantLastname"].toUpperCase() + " " + data[i]["participantSurname"].toUpperCase() + "</b>";

                    }
                    else {
                        data[i]["selected"] = "<a class='btn btn-link btn-info like'><i class='far fa-square'></i></a>";
                        data[i]["participantName"] = data[i]["participantName"] + " " + data[i]["participantLastname"] + " " + data[i]["participantSurname"];

                    }

                }
                return data;
            },
        },
        columns: [
            { data: "projectID", visible: false },
            { data: "participantID", visible: false },
            {
                data: "selected",
                visible: false,
                render: function (data, type, row, meta) {
                    if (data !== null) {
                        if (data == "<a class='btn btn-link btn-info like'><i class='far fa-check-square'></i></a>")
                            data = 1;
                        else
                            data = 0;
                    }

                    return data;
                }
            },
            { data: "selected" },
            { data: "participantCode" },
            { data: "participantName", type: 'unicode-string' },
            { data: "companyName" },
            {
                data: "role",
                render: function (data, type, row, meta) {
                    if (data !== null)
                        data = $("#EnumParticipantRole_" + data).val();

                    return data;
                }
            },
        ],
        language: {
            url: "../json/" + Cookies.get('pmctool-lang-app') + ".json"
        },
        pageLength: 50,
        order: [[2, "desc"],[5, "asc"]],
        responsive: true,
        scrollX: true
    });

    $('#datatables tbody').on('click', 'a', function (e) {

        var tr = $(this).closest('tr');

        if ($(tr).hasClass('child'))
            tr = $(tr).prev();

        rowRef = e;
        trRef = tr;
        
        var data = table.row(tr).data();

        if ($(e.target).attr('class') == 'far fa-check-square') {
            $(e.target).removeClass("far fa-check-square");
            $(e.target).addClass("far fa-square");
            Delete($("#ProjectID").val(), data.participantID);
        }
        else {
            if ($(e.target).attr('class') == 'far fa-square') {
                $("#mwTitle").text(data["name"]);
                $("#ParticipantID").val(data.participantID); 
                getRoles(data, e);
            }
        }

    });
});

function reload() {
    $('#datatables').DataTable().ajax.reload()
}

function getRoles(oData, e) {
    
    if (oData.userID == null || oData.userID == '') {
        $(e.target).removeClass("far fa-square");
        $(e.target).addClass("far fa-check-square");
        Create($("#ProjectID").val(), oData.participantID, null);
    }
    else {
        $.ajax({
            type: 'GET',
            url: '/Projects/GetparticipantRoles',
            dataType: 'json',
            data: { id: oData.userID },
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {

                if (data.length == 0) {
                    $(e.target).removeClass("far fa-square");
                    $(e.target).addClass("far fa-check-square");
                    Create($("#ProjectID").val(), oData.participantID, null);
                }
                else {

                    document.getElementById("RoleID").options.length = 0;
                    select = document.getElementById('RoleID');

                    for (var i = 0; i < data.length; i++) {
                        var opt = document.createElement('option');
                        opt.value = data[i]["roleID"];
                        opt.innerHTML = $("#EnumParticipantRole_" + data[i]["roleID"]).val();
                        select.appendChild(opt);
                    }

                    $('#roleModal').modal('show');
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
        })
    }


}

function Select() {

    $('#roleModal').modal('toggle');
    $(rowRef.target).removeClass("far fa-square");
    $(rowRef.target).addClass("far fa-check-square");
    Create($("#ProjectID").val(), $("#ParticipantID").val(), $("#RoleID").val());

    var ix = $("#RoleID").val();
    var table = $('#datatables').DataTable();
    var data = table.row(trRef).data();
    data["selected"] = "<a class='btn btn-link btn-info like'><i class='far fa-check-square'></i></a>";
    data["role"] = ix;
        
    table.row(table.row(trRef).index()).data(data).draw();

}

function Create(projectID, participantID, role) {
    $.ajax({
        type: 'POST',
        url: '/Projects/CreateParticipant',
        dataType: 'json',
        data: { id: projectID, participantID: participantID, role: role },
        beforeSend: function () {
        },
        success: function (data) {
            if (!data.isSuccess) {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    })
}

function Delete(projectID, participantID) {
    $.ajax({
        type: 'POST',
        url: '/Projects/DeleteParticipant',
        dataType: 'json',
        data: { id: projectID, participantID: participantID },
        beforeSend: function () {
        },
        success: function (data) {
            if (!data.isSuccess) {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
            else {
                var table = $('#datatables').DataTable();
                var data = table.row(trRef).data();
                data["selected"] = "<a class='btn btn-link btn-info like'><i class='far fa-square'></i></a>";
                data["role"] = null;

                table.row(table.row(trRef).index()).data(data).draw();
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    })
}