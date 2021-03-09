$(document).ready(function () {
    $("#dvPage_1").show();
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
