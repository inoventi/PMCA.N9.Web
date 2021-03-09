
$(document).ready(function () {

    var projects = [];
    $(".name").each(function () {
        var projectName = $(this).text()
        var projectId = $(this).attr('data-project');
        projects.push ({
            label: projectName,
            value: projectId
        });
    });

    $("#search").autocomplete({
        source: projects,
        //LINK A LA VISTA DE INICIO DEL PROYECTO
        select: function (event, ui) {
            window.location = "/Execution/Project?id=" + ui.item.value;
            return false;
        }
        //MOSTRAR PROYECTO SELECCIONADO SIN LINK
        /*select: function (event, ui) {
            var matcher = new RegExp(ui.item.label, 'i');
            $('.box').show().not(function () {
                return matcher.test($(this).find('.name').text())
            }).hide();
            return false;
        }*/
    });

    $("#search").on('input', function () {
        $('.page').show();
        var matcher = new RegExp($(this).val(), 'i');
        $('.box').show().not(function () {
            return matcher.test($(this).find('.name').text())
        }).hide();
        if ($(this).val() == '') {
            var page = $('.pagination li.active:first').attr('data-lp');
            goToPage(page);
        }
    })

    $("#dvPage_1").show();

    $('#show_paginator').bootpag({
        total: $("#TotalPages").val(),
        page: 1,
        maxVisible: 8,
        next: '›', 
        prev: '‹',
        firstLastUse: true,
        first: '«',
        last: '»',
        wrapClass: 'pagination justify-content-center',
    }).on('page', function (event, num) {
        goToPage(num)
    });

    $('.pagination a').addClass('page-link');
    $('.pagination li').addClass('page-item');
});

function goToPage(inx) {

    var totpages = $("#TotalPages").val();

    for (var i = 1; i <= totpages; i++) {
        $("#dvPage_" + i).hide();
        $("#pagelink_" + i).removeClass("active");
    }

    $("#dvPage_" + inx).show();
    $("#pagelink_" + inx).addClass("active");
}

function sortData(opt) {
    LoaderShow();
    $("#sortID").val(opt);
    $('form').submit();
}

function archiveProject(idProject) {
    $.ajax({
        type: 'PATCH',
        url: '/Execution/ArchiveProject',
        dataType: 'json',
        data: { idProject: idProject },
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
                    onAfterClose: () => { LoaderShow(); location.reload(); }
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