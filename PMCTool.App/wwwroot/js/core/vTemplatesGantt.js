$(document).ready(function () {
    var urlParams = new URLSearchParams(location.search);
    var projectId = $("#ProjectId").val();

    $('[data-toggle="tooltip"]').tooltip();
    // initiating data loading
    //#update1
    gantt.plugins({ // fix update 
        tooltip: true,
        //overlay: true,
        //critical_path: true,
        //click_drag: true,
        auto_scheduling: true,
        //drag_timeline: true,
        fullscreen: true,
        //grouping: true,
        multiselect: true 
        //tooltip: true,
        //undo: true,
        //marker: true
    });

    gantt.load("/Templates/GetGantt/" + projectId);

    gantt.config.work_time = false;  // includes non-working time from calculations
    //gantt.config.skip_off_time = true;    // hides non-working time in the chart

    //#update1 //Cambios enla sacales como tipo objeto apartir de las version 7.0
    //gantt.config.scale_unit = "day";
    //gantt.config.date_scale = "%D, %d";
    gantt.config.scales = [{ unit: "day", format: "%D, %d" }];

    //gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.duration_unit = "day";

    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.order_branch = true;
    gantt.config.order_branch_free = true;
 
    gantt.config.task_height = 23;
    gantt.config.row_height = 29;

    gantt.config.cascade_delete = false;
    gantt.config.open_tree_initially = true;

    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_strict = true;

    gantt.locale.labels.column_start_date = $("#StartDate").val();
    gantt.locale.labels.column_end_date = $("#EndDate").val();

    gantt.config.columns = [
        { name: "add", width: 44 },
        { name: "wbs", width: "*", resize: true, label: "WBS", template: gantt.getWBSCode },
        { name: "text", width: 200, resize: true, label: $.i18n._('activity'), tree: true },
        { name: "start_date", width: 200, resize: true, align: "center", label: $("#StartDate").val() },
        {
            name: "end_date", width: 200, resize: true,
            label: $("#EndDate").val(),
            template: function (task) {
                return convertDate(getEndDateColumnFormat(gantt.calculateEndDate(task.start_date, task.duration), task.type))
            },
            align: "center"
        },
        { name: "duration", width: "*", resize: true, align: "center" },
    ];
    //Inicio código para restar un dia a la fecha planeada de fin en el lightbox cuando se cambia la duración
    gantt.templates.task_end_date = function (date) {
        return gantt.templates.task_date(new Date(date.valueOf() - 1));
    };

    var gridDateToStr = gantt.date.date_to_str("%Y-%m-%d");
    gantt.templates.grid_date_format = function (date, column) {
        if (column === "end_date") {
            return gridDateToStr(new Date(date.valueOf() - 1));
        } else {
            return gridDateToStr(date);
        }
    }
    //Fin

    gantt.config.min_grid_column_width = 100;

    gantt.config.layout = {
        css: "gantt_container",
        cols: [
            {
                width: 400,
                min_width: 300,
                rows: [
                    { view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer" },
                    { view: "scrollbar", id: "gridScroll", group: "horizontal" }
                ]
            },
            { resizer: true, width: 1 },
            {
                rows: [
                    { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                    { view: "scrollbar", id: "scrollHor", group: "horizontal" }
                ]
            },
            { view: "scrollbar", id: "scrollVer" }
        ]
    };

    gantt.config.lightbox.sections = [
        { name: "description", height: 70, map_to: "text", type: "textarea", focus: true },
        {
            name: "type", height: 45, map_to: "type", type: "select", options: [{ key: "task", label: $.i18n._('activity') }, { key: "milestone", label: $.i18n._('milestone') }],
            onchange: function () {
                var type = gantt.getLightboxSection('type');
                if (type.getValue() == "milestone")
                    $(".gantt_duration").hide();
                else {
                    $('.gantt_duration_value').val(1);
                    $(".gantt_duration").show();
                }
            }
        },
        { name: "time", height: 45, map_to: "auto", type: "duration", year_range: [2015, 2031] }
    ];

    gantt.config.lightbox.project_sections = [
        { name: "description", height: 70, map_to: "text", type: "textarea", focus: true },
        { name: "type", height: 45, map_to: "type", type: "select", options: [{ key: "task", label: $.i18n._('activity') }, { key: "milestone", label: $.i18n._('milestone') }] },
        { name: "time", height: 45, map_to: "auto", type: "duration", year_range: [2015, 2031] }
    ];

    gantt.config.lightbox.milestone_sections = [
        { name: "description", height: 70, map_to: "text", type: "textarea", focus: true },
        {
            name: "type", height: 45, map_to: "type", type: "select", options: [{ key: "task", label: $.i18n._('activity') }, { key: "milestone", label: $.i18n._('milestone') }],
            onchange: function() {
                var type = gantt.getLightboxSection('type');
                if (type.getValue() == "milestone")
                    $(".gantt_duration").hide();
                else {
                    $('.gantt_duration_value').val(1);
                    $(".gantt_duration").show();
                }
            } },
        { name: "time", height: 45, map_to: "auto", type: "duration", year_range: [2015, 2031] }
    ];

    // ***** Customizing Project Task Template *****
    gantt.templates.tooltip_text = function (start, end, task) {
        return "<b>" + gantt.locale.labels.column_text + ":</b> " + task.text + "<br/>" +
            "<b>" + gantt.locale.labels.column_start_date + ":</b> " + convertDate(task.start_date) + "<br/>" +
            "<b>" + gantt.locale.labels.column_end_date + ":</b> " + convertDate(getEndDateColumnFormat(gantt.calculateEndDate(task.start_date, task.duration), task.type)) + "<br/>" +
            "<b>" + gantt.locale.labels.column_duration + ":</b> " + task.duration + "<br/>";
    };

    gantt.attachEvent("onLightbox", function (id) {
        $('div.gantt_cal_light').css('height', '430px');
        $('div.gantt_cal_light').css('width', '550px');

        let task = gantt.getTask(id);

        if (!task.$new) {
            if (task.type == gantt.config.types.milestone) {
                $(".gantt_duration").hide();
            }
        }

    });

    gantt.attachEvent("onBeforeLightbox", function (task_id) {
        gantt.resetLightbox();
        return true;
    });

    gantt.ext.zoom.init(zoomConfig);

    gantt.init("gantt");
   

    // initializing dataProcessor
    var dp = gantt.createDataProcessor({
        task: {
            create: function (data) {
                return new gantt.Promise(function (resolve, reject) {
                    data.projectId = projectId;
                    data.endDate = gantt.calculateEndDate(gantt.getTask(data.id));
                    data.wbsCode = gantt.getWBSCode(gantt.getTask(data.id));
                    $.ajax({
                        type: 'POST',
                        url: '/Templates/CreateTask/',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (response) {
                            if (!response.isSuccess) {
                                Swal.fire({
                                    type: 'error',
                                    title: '',
                                    text: response.errorMessage,
                                    footer: '',
                                    onAfterClose: () => {
                                        gantt.clearAll();
                                        gantt.load("/Templates/GetGantt/" + projectId);
                                        gantt.refreshData();

                                        return resolve();
                                    }
                                });
                            }
                            else {
                                var newTask = JSON.parse(response.valueString);
                                batcWbshUpdate();

                                gantt.clearAll();
                                gantt.load("/Templates/GetGantt/" + projectId);
                                gantt.refreshData();
                                return resolve({ tid: newTask.Id });
                            }
                        },
                        complete: function () {
                            gantt.refreshData();
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                            return reject();
                        }
                    });
                });
            },
            update: function (data, id) {
                return new gantt.Promise(function (resolve, reject) {

                    data.projectId = projectId;
                    data.wbsCode = gantt.getWBSCode(gantt.getTask(data.id));
                    $.ajax({
                        type: 'POST',
                        url: '/Templates/UpdateTask',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            if (!data.isSuccess) {
                                Swal.fire({
                                    type: 'error',
                                    title: '',
                                    text: data.errorMessage,
                                    footer: '',
                                    onAfterClose: () => {
                                        gantt.clearAll();
                                        gantt.load("/Templates/GetGantt/" + projectId);
                                        return reject(new Error(data.errorMessage));
                                    }
                                });
                            }
                            else {
                                gantt.refreshData();
                                gantt.render();
                                return resolve();
                            }
                          
                        },
                        complete: function () {
                            batcWbshUpdate();
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                            return reject();
                        }
                    });
                });
            },
            delete: function (id) {
                return new gantt.Promise(function (resolve, reject) {
                    var data = {
                        id: id
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/Templates/DeleteTask',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            if (!data.isSuccess) {
                                Swal.fire({
                                    type: 'error',
                                    title: '',
                                    text: data.errorMessage,
                                    footer: '',
                                    onAfterClose: () => {
                                        gantt.clearAll();
                                        gantt.load("/Templates/GetGantt/" + projectId);
                                        return resolve();
                                    }
                                });
                            }
                            else {
                                batcWbshUpdate();
                                return resolve();

                            }
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                            return reject();
                        }
                    });
                });
            }
        },
        link: {
            create: function (data) {
                return new gantt.Promise(function (resolve, reject) {
                    data.projectId = projectId;
                    $.ajax({
                        type: 'POST',
                        url: '/Templates/CreateLink/' + projectId,
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            var newLink = JSON.parse(data.valueString);
                            return resolve({ tid: newLink.id });
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                        }
                    });
                });
            },
            update: function (data, id) {
                return new gantt.Promise(function (resolve, reject) {
                    data.projectId = projectId;
                    $.ajax({
                        type: 'POST',
                        url: '/Templates/UpdateLink',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            return resolve();
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                            return reject();
                        }
                    });
                });
            },
            delete: function (id) {
                return new gantt.Promise(function (resolve, reject) {
                    var data = {
                        id: id
                    };
                    $.ajax({
                        type: 'POST',
                        url: '/Templates/DeleteLink',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                        },
                        complete: function () {
                            LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            LoaderHide();
                        }
                    });
                });
            }
        }
    });

    // setting the REST mode for dataProcessor
    //dp.setTransactionMode("REST");

    // and attaching it to gantt
    dp.init(gantt);
});

function batcWbshUpdate() {
    var id = $("#ProjectId").val();

    var tasks = gantt.serialize().data;
    var value = new Array();

    for (var i = 0; i < tasks.length; i++) {
        var taskId = tasks[i].id;
        let task = gantt.getTask(taskId);

        task.wbsCode = gantt.getWBSCode(gantt.getTask(task.id));
        value.push({
            Id: taskId,
            WbsCode: gantt.getWBSCode(gantt.getTask(task.id)),
            SortOrder: i
        });
    }
    $.ajax({
        type: 'PATCH',
        url: '/Templates/UpdateBatchWbs',
        dataType: "json",
        data: { templateId: id, data: value },
        beforeSend: function () {
            LoaderShow();
        },
        success: function (result) {

        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            LoaderHide();
        }
    })
};

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date();
    if (inputFormat !== undefined) {
        d = new Date(inputFormat);
    }
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function getEndDateColumnFormat(endDate, taskType) {
    return taskType == 'milestone' ? endDate : endDate.setDate(endDate.getDate() - 1);
}

function fullscreenGantt() {
    gantt.expand();
}
function zoomIn() {
    gantt.ext.zoom.zoomIn();
}
function zoomOut() {
    gantt.ext.zoom.zoomOut()
}
function collapseAll() {
    gantt.eachTask(function (task) {
        task.$open = false;
    });
    gantt.render();
}

function expandAll() {
    gantt.eachTask(function (task) {
        task.$open = true;
    });
    gantt.render();
}