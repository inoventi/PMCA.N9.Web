function zoom_tasks(e) { 
    var action = $(e).data('action'); 
    switch (action) {
        case "week":
            gantt.config.scale_unit = "day";
            gantt.config.date_scale = "%d %M";

            gantt.config.scale_height = 60;
            gantt.config.min_column_width = 30;
            gantt.config.subscales = [
                { unit: "hour", step: 1, date: "%H" }
            ];
            show_scale_options("hour");
            break;
        case "trplweek":
            gantt.config.min_column_width = 70;
            gantt.config.scale_unit = "day";
            gantt.config.date_scale = "%d %M";
            gantt.config.subscales = [];
            gantt.config.scale_height = 35;
            show_scale_options("day");
            break;
        case "month":
            gantt.config.min_column_width = 70;
            gantt.config.scale_unit = "week";
            gantt.config.date_scale = "Week #%W";
            gantt.config.subscales = [
                { unit: "day", step: 1, date: "%D" }
            ];
            show_scale_options();
            gantt.config.scale_height = 60;
            break;
        case "year":
            gantt.config.min_column_width = 70;
            gantt.config.scale_unit = "month";
            gantt.config.date_scale = "%M";
            gantt.config.scale_height = 60;
            show_scale_options();
            gantt.config.subscales = [
                { unit: "week", step: 1, date: "#%W" }
            ];
            break;
    }
 

    //
    if (overlayControl.isOverlayVisible(lineOverlay)) {
        console.log(overlayControl.isOverlayVisible(lineOverlay));
        gantt.config.readonly = false;
        overlayControl.hideOverlay(lineOverlay);
        gantt.$root.classList.remove("overlay_visible");
    }  
    //

    set_scale_units();
    gantt.render();
}
function show_scale_options(mode) {
    /*var hourConf = document.getElementById("filter_hours"),
        dayConf = document.getElementById("filter_days");
    if(mode == 'day'){
        hourConf.style.display = "none";
        dayConf.style.display = "";
        dayConf.getElementsByTagName("input")[0].checked = true;
    }else if(mode == "hour"){
        hourConf.style.display = "";
        dayConf.style.display = "none";
        hourConf.getElementsByTagName("input")[0].checked = true;
    }else{
        hourConf.style.display = "none";
        dayConf.style.display = "none";
    }*/
}
function set_scale_units(mode) {
    if (mode && mode.getAttribute) {
        mode = mode.getAttribute("value");
    }

    switch (mode) {
        case "work_hours":
            gantt.config.subscales = [
                { unit: "hour", step: 1, date: "%H" }
            ];
            gantt.ignore_time = function (date) {
                if (date.getHours() < 9 || date.getHours() > 16) {
                    return true;
                } else {
                    return false;
                }
            };

            break;
        case "full_day":
            gantt.config.subscales = [
                { unit: "hour", step: 3, date: "%H" }
            ];
            gantt.ignore_time = null;
            break;
        case "work_week":
            gantt.ignore_time = function (date) {
                if (date.getDay() == 0 || date.getDay() == 6) {
                    return true;
                } else {
                    return false;
                }
            };

            break;
        default:
            gantt.ignore_time = null;
            break;
    }
    gantt.render();
}
function zoomingReset() {
    ganttModules.zoom.setZoom(4);
    if (overlayControl.isOverlayVisible(lineOverlay)) {
        gantt.config.readonly = false;
        overlayControl.hideOverlay(lineOverlay);
        gantt.$root.classList.remove("overlay_visible");
    }
}