$(document).ready(function () {
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
