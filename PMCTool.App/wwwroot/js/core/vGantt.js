var lineOverlay = null;
var overlayControl = null;
var myChart;
var today = new Date();
$(document).ready(function () {

    $("#participantUser").remove();

    $('#ModalTemplateBtn').hide();
    $('[data-toggle="tooltip"]').tooltip();
    function byId(list, id) {
        for (var i = 0; i < list.length; i++) {
            if (id == null)
                id = "";
            if (list[i].key == id)
                return list[i].label || "";
        }
        return "";
    }
    function saveLink() {
        var link = gantt.getLink(editLinkId);

        var lagValue = modal.querySelector(".lag-input").value;
        //var lagValue = $("#LinkLag").val();
        if (!isNaN(parseInt(lagValue, 10))) {
            link.lag = parseInt(lagValue, 10);
        }

        gantt.updateLink(link.id);
        if (gantt.autoSchedule) {
            gantt.autoSchedule(link.source);
        }
        endPopup();
    }

    function endPopup() {
        modal = null;
        editLinkId = null;
    }

    function cancelEditLink() {
        endPopup()
    }

    function deleteLink() {
        gantt.deleteLink(editLinkId);
        endPopup()
    }
    //#update1
    gantt.plugins({ // fix update 
        tooltip: true,
        overlay: true,
        critical_path: true,
        click_drag: true,
        auto_scheduling: true,
        drag_timeline: true,
        fullscreen: true,
        grouping: true,
        multiselect: true,
        tooltip: true,
        undo: true,
        marker: true 
    });
  
    overlayControl = gantt.ext.overlay; 

     
    var urlParams = new URLSearchParams(location.search);

    var projectId = urlParams.get('id');
    var projectConfig = getProjectConfig(projectId);
    var participants = getParticipants(projectId);

    $('#ProjectID').val(projectId);

    getProject(projectId);
    loadDateTimePicker($('#ProjectID').val(), $('.datepicker'), true);

    $("#backBtn").click(function () {
        location.href = '/Execution/Project?id=' + $('#ProjectID').val();
    });

    // ***** Initiating Gantt data *****
    gantt.load("/Gantt/Get?id=" + projectId);

    // ***** Server lists *****
    gantt.serverList("staff", participants);

    // ***** Gantt configuration *****
    gantt.config.work_time = true;  // removes non-working time from calculations 
    //gantt.config.skip_off_time = true;    // hides non-working time in the chart

    //gantt.config.scale_unit = "day"; // fix update
    //gantt.config.date_scale = "%D, %d";  // fix update 
    gantt.config.scales = [{ unit: "day", format: "%D, %d" }];
  
    gantt.config.duration_unit = "day";
    //issues1 //desactivar la multi seleciona 
    gantt.config.drag_multiple = false;
   //#update2
    //gantt.config.date_format = "%d-%m-%Y %H:%i"; //fix update
    //issue2
    //gantt.ext.zoom.init(zoomConfig);

    gantt.config.date_format = "%Y-%m-%d %H:%i";
    //gantt.config.date_grid = "%m-%d-%Y %H:%i";


    gantt.config.order_branch = true;
    gantt.config.order_branch_free = true;
    gantt.config.show_errors = false;

    gantt.config.task_height = 23;
    gantt.config.row_height = 29;
    
    gantt.config.show_baseline = false;

    gantt.config.cascade_delete = false;
    gantt.config.open_tree_initially = true;

    gantt.form_blocks["progress_editor"] = {
        render: function (sns) {
            return "<div class='gantt_cal_ltext' style:'height:45px;'><input type='number' min='0' max='100' step='0.01' onfocusout='checkLimits()'/> %</div>";
        },
        set_value: function (node, value, task) {
            node.childNodes[0].value = parseFloat(value * 100).toFixed(2);
        },
        get_value: function (node, task) {
            return node.childNodes[0].value / 100;
        },
        focus: function (node) {
            var a = node.childNodes[0];
            a.select();
            a.focus();
        }
    };

    gantt.form_blocks["checkbox_editor"] = {
        render: function (sns) {
            return "<div class='gantt_cal_ltext' style:'height:45px;'><input type='checkbox' name='vehicle' value='Bike'> " + $.i18n._('gantt_001') + "<br></div>";
        },
        set_value: function (node, value, task) {
            node.childNodes[0].checked = value == 1 ? true : false;
        },
        get_value: function (node, task) {
            return node.childNodes[0].checked == true ? 1 : 0;
        },
        focus: function (node) {
            var a = node.childNodes[0];
            a.select();
            a.focus();
        }
    };

    gantt.form_blocks["test_editor"] = {
        render: function (sns) {
            return "<div><div class='gantt_cal_ltext gantt_resources_filter'><input type='text' class='gantt_resources_filter_input' placeholder='escriba para filtrar' id='input_1575087574704'> <label><input class='switch_unsetted' type='checkbox'><span class='matherial_checkbox_icon'></span>ocultar vacío</label></div><div class='gantt_cal_ltext gantt_resources' data-name='owner' style=''><label class='gantt_resource_row' data-item-id='' data-checked='false'><input class='gantt_resource_toggle' type='checkbox'><div class='gantt_resource_cell gantt_resource_cell_checkbox'><span class='matherial_checkbox_icon'></span></div><div class='gantt_resource_cell gantt_resource_cell_label'>Sin asignar</div><div class='gantt_resource_cell gantt_resource_cell_value'><input data-item-id='' class='gantt_resource_amount_input' disabled='disabled' value='0.00' type='number' min='0' max='100'></div><div class='gantt_resource_cell gantt_resource_cell_unit'></div></label><label class='gantt_resource_row' data-item-id='179f3464 - 5c68 - 4eda - 8e01 - 0cdf3fc61c8f' data-checked='false'><input class='gantt_resource_toggle' type='checkbox'><div class='gantt_resource_cell gantt_resource_cell_checkbox'><span class='matherial_checkbox_icon'></span></div><div class='gantt_resource_cell gantt_resource_cell_label'>ABRAHAM LINCON</div><div class='gantt_resource_cell gantt_resource_cell_value'><input data-item-id='179f3464 - 5c68 - 4eda - 8e01 - 0cdf3fc61c8f' class='gantt_resource_amount_input' disabled='disabled' value='0.00' type='number' min='0' max='100'></div><div class='gantt_resource_cell gantt_resource_cell_unit'>%</div></label><label class='gantt_resource_row' data-item-id='5f326487 - fde4 - 4932 - 8dd2 - 01ed996e52f9' data-checked='false'><input class='gantt_resource_toggle' type='checkbox'><div class='gantt_resource_cell gantt_resource_cell_checkbox'><span class='matherial_checkbox_icon'></span></div><div class='gantt_resource_cell gantt_resource_cell_label'>NODO 4000</div><div class='gantt_resource_cell gantt_resource_cell_value'><input data-item-id='5f326487 - fde4 - 4932 - 8dd2 - 01ed996e52f9' class='gantt_resource_amount_input' disabled='disabled' value='0.00' type='number' min='0' max='100'></div><div class='gantt_resource_cell gantt_resource_cell_unit'>%</div></label></div></div>";
        },
        set_value: function (node, value, task) {
            node.childNodes[0].checked = value == 1 ? true : false;
        },
        get_value: function (node, task) {
            return node.childNodes[0].checked == true ? 1 : 0;
        },
        focus: function (node) {
            var a = node.childNodes[0];
            a.select();
            a.focus();
        }
    };

    gantt.config.columns = [
        { name: "add", width: 50 },
        { name: "wbs", width: "*", resize: true, label: "WBS",  template: gantt.getWBSCode },
        { name: "text", width: 200, resize: true, label: $.i18n._('activity'), tree: true, },
        { name: "start_date", width: 200, resize: true, align: "center" },
        {
            name: "end_date", width: 200, resize: true,
            label: $("#EndDate").val(),
            template: function (task) { 
                return convertDate(getEndDateClientFormat(gantt.calculateEndDate(task.start_date, task.duration), task.type))
            },
            align: "center"
        },
        { name: "duration", width: "*", resize: true, label: $.i18n._('duration'),align: "center" },
        {
            name: "owner", width: "*", resize: true, label: gantt.locale.labels.column_owner, width: 80, align: "center", template: function (item) {
                return byId(gantt.serverList('staff'), item.owner_id)
            }
        },
        //{
        //    name: "progress", width: "*", resize: true, label: gantt.locale.labels.column_plannedProgress, width: 80, align: "center", template: function (item) {
        //        if (item.progress >= 1)
        //            return gantt.locale.labels.task_status_completed;
        //        if (item.progress == 0)
        //            return gantt.locale.labels.task_status_not_started
        //        return Math.round(item.progress * 100) + "%";
        //    }
        //},
        {
            name: "plannedProgress", width: "*", resize: true, label: $('#PlannedProgress').val(), align: "center", template: function (item) {
                return Math.round(item.plannedProgress * 100) + "%";
            }
        },
        {
            name: "progress", width: "*", resize: true, label: $('#RealProgress').val(), align: "center", template: function (item) {
                return Math.round(item.progress * 100) + "%";
            }
        },
        //{
        //    name: "predecessors", label: 'predecessors', width: 120, resize: true,
        //    template: function (task) {
        //        var target_links = task.$target;
        //        var predecessors = []; 
        //        for (var i = 0; i < target_links.length; i++) {
        //            var predecessor_task = gantt.getTask(gantt.getLink(target_links[i]).source); 
                    
        //            predecessors.push(predecessor_task.$wbs);
        //        }
        //        return predecessors;
        //    }
        //},
        
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
        { name: "owner", map_to: "resources", type: "resources", options: gantt.serverList("staff"), default_value: parseFloat(0).toFixed(2) },
        //{ name: "owner", map_to: "resources", type: "test_editor", options: gantt.serverList("staff") },
        //{ name: "progress", height: 45, map_to: "progress", type: "progress_editor" },
        { name: "realProgress", height: 45, map_to: "progress", type: "progress_editor" }, 
        //{ name: "weight", height: 45, map_to: "weight", type: "progress_editor" }, // linea comentada a petición de https://trello.com/c/GQJwv2Tq/321-el-campo-de-ponderaci%C3%B3n-sigue-apareciendo-en-el-gantt y confirmado por Bernardo Mendoza, 13-01-2020
        { name: "time", height: 45, map_to: "auto", type: "duration", year_range: [2015, 2031]}

        //{
        //    name: "time", height: 45, type: "duration",
        //    map_to: { start_date: "start_date", end_date: "endDateClient" }
        //} 
    ];

    gantt.config.lightbox.project_sections = [
        { name: "description", height: 70, map_to: "text", type: "textarea", focus: true },
        { name: "type", height: 45, map_to: "type", type: "typeselect" },
        { name: "time", height: 45, map_to: "auto", type: "duration",  year_range: [2015, 2031]}
    ];

    gantt.config.lightbox.milestone_sections = [
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
        { name: "owner", map_to: "resources", type: "resources", options: gantt.serverList("staff") },
        { name: "realProgress", height: 45, map_to: "progress", type: "checkbox_editor" }, 
        { name: "time", height: 45, type: "duration", map_to: "auto", year_range: [2015, 2031]}
    ];

    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_strict = true;

    // ***** Customizing task edit popup labels *****

    gantt.locale.labels.column_status = $("#Status").val()
    gantt.locale.labels.column_start_date = $("#StartDate").val();
    gantt.locale.labels.column_end_date = $("#EndDate").val();
    gantt.locale.labels.column_realProgress = $("#RealProgress").val();
    gantt.locale.labels.column_plannedProgress = $("#PlannedProgress").val();
    gantt.locale.labels.column_owner = $("#Responsible").val();
    gantt.locale.labels.section_owner = gantt.locale.labels.column_owner;
    gantt.locale.labels.section_progress = gantt.locale.labels.column_progress;
    gantt.locale.labels.section_weight = $('#Weighing').val();
    gantt.locale.labels.section_realProgress = $('#Progress').val();

    // ***** Calendar type *****
    // https://docs.dhtmlx.com/gantt/api__gantt_setworktime.html
    // The default working time is the following:
    //   - Working days: Monday - Friday.
    //   - Working hours: 08: 00 - 17: 00.


    if (projectConfig.project.calendarType == 2) {
        gantt.setWorkTime({ day: 6, hours: [8, 17] });
    }
    else if (projectConfig.project.calendarType == 3) {
        gantt.setWorkTime({ day: 6 })
        gantt.setWorkTime({ day: 0 })
        //gantt.setWorkTime({ day: 0, hours: [8, 17] });
        //gantt.setWorkTime({ day: 6, hours: [8, 17] });
    }
    

    gantt.templates.lightbox_header = function (start, end, ev) {
        var showEnd = new Date();

        if (ev.type != 'milestone')
            showEnd.setDate(end.getDate() - 1);
        else
            showEnd.setDate(end.getDate());

        function pad(s) { return (s < 10) ? '0' + s : s; }
        return ev.text + ' : '
            + [pad(start.getDate()), gantt.locale.date.month_full[pad(start.getMonth())], start.getFullYear()].join(' ')
            + ' - '
            + [pad(showEnd.getDate()), gantt.locale.date.month_full[pad(showEnd.getMonth())], showEnd.getFullYear()].join(' ')

        gantt.calculateEndDate(task.start_date, task.duration)
    };

    // ***** Days off (weekends and holidays) *****
    // gantt.setWorkTime({ date: new Date(2019, 6, 15), hours: false })  //makes a specific date a day-off
    for (var i = 0; i < projectConfig.holidays.length; i++) {
        gantt.setWorkTime({ date: new Date(projectConfig.holidays[i].date), hours: false })  //makes a specific date a day-off    
    }

    gantt.holidays = projectConfig.holidays; // storing holidays within the Gantt

    gantt.templates.scale_cell_class = function (date) {
        if (projectConfig.project.calendarType == 1) {
            if (!gantt.isWorkTime(date) && (date.getDay() == 0 || date.getDay() == 6)) {
                return "weekend"
            }
        }
        else if (projectConfig.project.calendarType == 2) {
            if (!gantt.isWorkTime(date) && (date.getDay() == 0)) {
                return "weekend"
            }
        }
        if (!gantt.isWorkTime(date)) {
            return "holiday";
        }
    };

    //#update3 
    //gantt.templates.task_cell_class = function (task, date) {
    gantt.templates.timeline_cell_class = function (task, date) {
        if (projectConfig.project.calendarType == 1) {
            if (date.getDay() == 0 || date.getDay() == 6) {
                return "weekend"
            }
        }
        else if (projectConfig.project.calendarType == 2) {
            if (date.getDay() == 0) {
                return "weekend"
            }
        }
        if (!gantt.isWorkTime(date)) {
            return "holiday";
        }
    };

    // ***** Customizing Project Task Template *****
    gantt.templates.tooltip_text = function (start, end, task) {
        return "<b>" + gantt.locale.labels.column_status + ": </b>" + '<span class="bold ' + getStatusClassName(task.status) + ' ws">' + $("#EnumProjectElementStatus_" + task.status).val() + '</span>' + "<br/>" +
            "<b>WBS:</b> " + gantt.getWBSCode(task) + "<br/>" +
            "<b>" + gantt.locale.labels.column_text + ":</b> " + task.text + "<br/>" +
            "<b>" + gantt.locale.labels.column_start_date + ":</b> " + convertDate(task.start_date) + "<br/>" +
            "<b>" + gantt.locale.labels.column_end_date + ":</b> " + convertDate(getEndDateClientFormat(gantt.calculateEndDate(task.start_date, task.duration), task.type)) + "<br/>" +
            "<b>" + gantt.locale.labels.column_duration + ":</b> " + task.duration + "<br/>" +
            "<b>" + gantt.locale.labels.column_realProgress + ":</b> " + parseFloat(task.progress * 100).toFixed(2) + "%" + "<br/>" +
            "<b>" + gantt.locale.labels.column_plannedProgress + ":</b> " + parseFloat(task.plannedProgress * 100).toFixed(2) + "%" + "<br/>" +
            "<b>" + gantt.locale.labels.column_owner + ":</b> " + byId(gantt.serverList('staff'), task.owner_id) + "<br/>";
    };

    gantt.attachEvent("onLoadEnd", function () {
        var styleId = "dynamicGanttStyles";
        var element = document.getElementById(styleId);
        if (!element) {
            element = document.createElement("style");
            element.id = styleId;
            document.querySelector("head").appendChild(element);
        }
        var html = [];
        var resources = gantt.serverList("staff");
        
        resources.forEach(function (r) {
            html.push(".gantt_task_line.gantt_resource_" + r.key);
            //html.push(".gantt_task_line.gantt_resource_" + r.key + "{" +
            //    "background-color:" + r.backgroundColor + "; " +
            //    "color:" + r.textColor + ";" +
            //    "}");
            html.push(".gantt_row.gantt_resource_" + r.key + " .gantt_cell:nth-child(1)");
            //html.push(".gantt_row.gantt_resource_" + r.key + " .gantt_cell:nth-child(1) .gantt_tree_content{" +
            //    "background-color:" + r.backgroundColor + "; " +
            //    "color:" + r.textColor + ";" +
            //    "}");
        });
        element.innerHTML = html.join("");
    });

    gantt.attachEvent("onGanttReady", function () {
        var tooltips = gantt.ext.tooltips;
        tooltips.tooltip.setViewport(gantt.$task_data);
    });

    // ***** Customizing Buttons from Lightbox *****
    gantt.attachEvent("onBeforeLightbox", function (task_id) {
        $("#LastOpenedTask").val(task_id);
        let task = gantt.getTask(task_id);
        let phase = $('#ProjectPhase').val();
        let resources = task.resources;
       
        if (phase == "2") {
            if (!task.$new) {
                task = getTaskCompleteInfoById(task_id);
                
                if (task.hasChild) {
                    //gantt.config.buttons_left = ["dhx_delete_btn"];
                    gantt.config.buttons_left = [];
                    gantt.config.buttons_right = ["dhx_save_btn", "dhx_cancel_btn"];
                    gantt.locale.labels["cancel_archive_btn"] = "Cancelar elemento";

                }
                else {
                    //gantt.config.buttons_left = ["dhx_delete_btn"];
                    gantt.config.buttons_left = ["cancel_archive_btn"];
                    gantt.config.buttons_right = ["dhx_save_btn", "dhx_cancel_btn"];
                    gantt.locale.labels["cancel_archive_btn"] = "Cancelar elemento";
                    if (task.status == 1 || task.status == 2 || task.status == 3) {
                        gantt.locale.labels["cancel_archive_btn"] = $("#Cancel").val() + " " + $("#Element").val();
                    }
                    else if (task.status == 5) {
                        if (task.children != 0)
                            gantt.config.buttons_left = [];
                        else
                            gantt.locale.labels["cancel_archive_btn"] = $("#Archive").val() + " " + $("#Element").val();
                    }
                }
               
            }
            else {
                //gantt.config.buttons_left = ["dhx_delete_btn"];
                gantt.config.buttons_left = [];
                gantt.config.buttons_right = ["dhx_save_btn", "dhx_cancel_btn"];
            }
        }
        else {
            gantt.config.buttons_left = ["dhx_delete_btn"];
            gantt.config.buttons_right = ["dhx_save_btn", "dhx_cancel_btn"];
        }

        if (!task.$new) {
            if (resources != null) {
                resources.forEach(function (resource) {
                    resource.value = parseFloat(resource.value).toFixed(2);
                });
            }
        }


        gantt.resetLightbox();

        return true;
    });

    gantt.attachEvent("onLightboxButton", async function (button_id, node, e) {
        gantt.hideLightbox();
        let task = gantt.getTask($("#LastOpenedTask").val());
        if (task.status == 1 || task.status == 2 || task.status == 3) {
            await cancelTask(task.id, gantt);
        }
        else if (task.status == 5) {
            await archiveTask(task.id);  
        }
        gantt.clearAll();
        gantt.load("/Gantt/Get?id=" + projectId);
        //let updatedTask = getTaskCompleteInfoById(task.id);
        //task.status = updatedTask.status;
        //gantt.updateTask(updatedTask.id);
    });

    gantt.attachEvent("onBeforeTaskDisplay", function (id, task) {
        if (task.status == 6) {
            return false;
        }
        return true;
    });

    var modal;

    if (participantUser.rolId == 4) {
        gantt.attachEvent("onLinkDblClick", function (id, e) {
            return false;
        });
    } else {

        gantt.attachEvent("onLinkDblClick", function (id, e) {
            editLinkId = id;
            var link = gantt.getLink(id);
            var linkTitle;
            switch (link.type) {
                case gantt.config.links.finish_to_start:
                    linkTitle = "<span class='post-position'> "+ $.i18n._('gantt_018') +" </span>";
                    break;
                case gantt.config.links.finish_to_finish:
                    linkTitle = "<span class='post-position'> "+ $.i18n._('gantt_019') + " </span>";
                    break;
                case gantt.config.links.start_to_start:
                    linkTitle = "<span class='post-position'> " + $.i18n._('gantt_020') + " </span>";
                    break;
                case gantt.config.links.start_to_finish:
                    linkTitle = "<span class='post-position'> "+ $.i18n._('gantt_021') + " </span>";
                    break;
            }

            linkTitle += " : " + gantt.getTask(link.source).text + " -> " + gantt.getTask(link.target).text;

            modal = gantt.modalbox({
                title: linkTitle,
                text: "<div>" +
                    "<label>" + $.i18n._('gantt_017') + " <input id='LinkLag' type='number' class='lag-input' /></label>" +
                    "</div>",
                buttons: [
                    { label: gantt.locale.labels.icon_save, css: "link-save-btn", value: "save" }, //gantt_btn_set gantt_left_btn_set gantt_save_btn_set
                    { label: gantt.locale.labels.icon_cancel, css: "link-cancel-btn", value: "cancel" },
                    { label: gantt.locale.labels.icon_delete, css: "link-delete-btn", value: "delete" }
                ],
                width: "400px",
                height: "300px",
                type: "popup-css-class-here",
                callback: function (result) {
                    switch (result) {
                        case "save":
                            saveLink();
                            break;
                        case "cancel":
                            cancelEditLink();
                            break;

                        case "delete":
                            deleteLink();
                            break;
                    }
                }
            });

            modal.querySelector(".lag-input").value = link.lag || 0;
            //any custom logic here

            return false;
        });
    }

    gantt.attachEvent("onLightbox", function (task_id) {
        $('div.gantt_cal_light').css('height', '830px');
        $('div.gantt_cal_light').css('width', '835px');

        let task = gantt.getTask(task_id);
        var taskDuration = task.duration;
        
        $('.gantt_resource_amount_input')
            .attr('type', 'number')
            .attr('min', 0)
            .attr('max', 100)
            .attr('style', 'width:50px;')
            .attr('focusout', "checkLimits()")
            .attr("onChange", "updateHours(this, " + taskDuration + ")");

        $('.gantt_resource_cell_value')
            .attr('style', 'width:60px;')

        $('.gantt_resource_cell_unit')
            .attr('style', 'width:20px;')

        $('label.gantt_resource_row[data-item-id]').first().hide();

        $('.matherial_checkbox_icon').attr("onClick", "enableHoursInput(this)");

        $('.gantt_duration_value')
            .attr("onChange", "checkDurationLimits()");

        
         
        var children = $(".gantt_resources").children();
        for (var i = 0; i < children.length; i++) {
            var itemId = children[i].dataset.itemId;

            if (i == 0 || itemId == "") {

            }
            else {
                var objTo = children[i];
                let itemChecked = false;

                if (itemId == task.owner_id) {
                    if (children[i].dataset.checked == "true") {
                        itemChecked = true;
                    }
                    else {
                        objTo.firstElementChild.checked = true;
                        objTo.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.value = "0.00";
                        objTo.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.disabled = false;
                        children[i].dataset.checked = "true";
                        itemChecked = true;
                    }
                }
                else {
                    itemChecked = children[i].dataset.checked == "true" ? true : false;
                }

                // Adding new input for setting hours
                var newInputColumnDiv = document.createElement("div");
                var newInputTotalColumnDiv = document.createElement("div");
                var newInputDisabled = '';
                if (itemChecked == false)
                    newInputDisabled = " disabled='disabled'";
                newInputColumnDiv.className = "gantt_resource_cell gantt_resource_cell_value_daily_hours";
                newInputColumnDiv.innerHTML = "<spam><input data-item-id='" + itemId + "' class='gantt_resource_amount_input_hours timepicker' value='' style='width:100px;' onChange='updateProgress(this, " + taskDuration + ")'" + newInputDisabled + "> " + $('#XDay').val() + "    </spam >";;
                objTo.appendChild(newInputColumnDiv);
                newInputTotalColumnDiv.className = "gantt_resource_cell gantt_resource_cell_value_activity_hours";
                newInputTotalColumnDiv.innerHTML = "<spam><input total_hours='" + itemId + "' class='gantt_resource_amount_input_hours timepicker' style='width:50px;' disabled=true> " + $('#XActivity').val() + "</spam>";
                objTo.appendChild(newInputTotalColumnDiv);

                updateHours($('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').get(0), taskDuration);
            }
           
        }

        //$(".gantt_duration").find("span").remove();
        //var end_client_date = new Date(getEndDateClientFormat(gantt.calculateEndDate(gantt.getTask(task_id).start_date, gantt.getTask(task_id).duration), 'task'));
        //$(".gantt_duration").append("<span>" + end_client_date.getDate() + " " + gantt.locale.date.month_full[end_client_date.getMonth()] + " " + end_client_date.getFullYear() + "<\span>");
        if (!task.$new) {
            if (task.type == gantt.config.types.milestone) {
                $(".gantt_duration").hide();
            }
        }

        $('.timepicker').mask('00:00');

        $('.gantt_resource_cell_value_daily_hours').attr('style', 'width:150px;');
        if (participantUser.rolId == 4) {
            let wbsCodeElement = gantt.getWBSCode(gantt.getTask(task_id))
            let elementBlock = $('.gantt_resources_filter');
            let elementParent = elementBlock.parent();
            let assingned = false; 
             assingned = helper.checkAssignedTask(task);
             if (assingned == false) {
                 gantt.message({ type: 'info', text: 'No puede editar la tarea <br> <b> ' + wbsCodeElement + ' ' + task.text+'</b>', expire: 3000 });
                 gantt.hideLightbox();
             } else {
                 elementParent.css('display', 'none'); 
             }
             assingned = false;


        }

        var el = document.querySelector(".gantt_resources_filter");
        el.oninput = el.onchange = el.onkeyup = function () { addInputs(task); }

        return true;
    });

    if (participantUser.rolId == 4) {
        //arrastrar actividades
        gantt.attachEvent("onBeforeTaskDrag", function (id, mode, e) {
            let task = gantt.getTask(id);
            let assingned = false;
            let wbsCodeElement = gantt.getWBSCode(gantt.getTask(task.id));
            assingned = helper.checkAssignedTask(task);
            if (assingned == false) {
                gantt.message({ type: 'info', text: 'No puede editar la tarea <br> <b> ' + wbsCodeElement + ' ' + task.text + '</b>', expire: 3000 });
            }
            return assingned;
        });
        gantt.config.drag_links = false;
        gantt.config.order_branch = false;
        gantt.config.order_branch_free = false;

       
    }

    var date_to_str = gantt.date.date_to_str(gantt.config.task_date);
    gantt.addMarker({
        start_date: today,
        css: "today",
        text: $.i18n._('gantt2'),
        title: $.i18n._('gantt2')+":" + date_to_str(today)
    });

    if (projectConfig.project.startedDate !== null) {
        var start = new Date(projectConfig.project.startedDate);
        //gantt.addMarker({
        //    start_date: start,
        //    css: "status_line",
        //    text: $.i18n._('gantt1'),
        //    title: $.i18n._('gantt1') +": "+ date_to_str(start)
        //});
    }
  
    // adding baseline display
    gantt.addTaskLayer(function draw_planned(task) {
        if (gantt.config.show_baseline == true) {
            if (task.planned_start && task.planned_end) {
                var sizes = gantt.getTaskPosition(task, task.planned_start, task.planned_end);
                var el = document.createElement('div');
                el.className = 'baseline';
                el.style.left = sizes.left + 'px';
                el.style.width = sizes.width + 'px';
                el.style.top = sizes.top + gantt.config.task_height + 13 + 'px';
                return el;
            }
        }
        return false;
    });

    gantt.templates.task_class = function (start, end, task) {
        switch (task.status) {
            case 1:
                task.color = '#4CAF50'; // intentar obtener este valor desde el CSS
                break;
            case 2:
                task.color = "#f7d408";
                break;
            case 3:
                task.color = "#dc3545";
                break;
            case 4:
                task.color = "#d0d0d0";
                break;
            case 5:
                task.color = "#545454";
                break;
        }

        if (task.planned_end) {
            var classes = ['has-baseline'];
            //(if (end.getTime() > task.planned_end.getTime()) {
                classes.push('overdue');
            //}
            return classes.join(' ');
        }
    };

    gantt.attachEvent("onTaskLoading", function (task) {
        task.planned_start = gantt.date.parseDate(task.planned_start, "xml_date");
        task.planned_end = gantt.date.parseDate(task.planned_end, "xml_date");
        return true;
    });

    gantt.attachEvent("onAfterTaskUpdate", function (id, item) { 
        ////let taskDB = xgantt.getTaskCompleteInfoById(id);
        //let taskGantt = gantt.getTask(id);
        ////taskGantt.start_date = new Date(taskDB.start_date);
         ////taskGantt.end_date = new Date(taskComplete.end_date);
        //taskGantt.duration = 5;
        //gantt.updateTask(id);  
    });

    //arrastrar actividades
    gantt.attachEvent("onAfterTaskDrag", async function (id, mode, e) {
        var taskObj = gantt.getTask(id);
        var targetLinks = taskObj.$target;
        if (targetLinks.length > 0) {
            for (var i = 0; i < targetLinks.length; i++) {
                var link = gantt.getLink(targetLinks[i]);
                //FINISH TO START
                if (link.type == 0) {
                    var date = new Date(taskObj.start_date);
                    var taskBD = await getTaskById(link.source);
                    if (taskBD.type == 'task') {
                        var dateBD = new Date(taskBD.endDateClient);
                    } else if (taskBD.type == 'milestone') {
                        var dateBD = new Date(taskBD.end_date);
                    }
                }
                //START TO START
                if (link.type == 1) {
                    var date = new Date(taskObj.start_date);
                    var taskBD = await getTaskById(link.source);
                    var dateBD = new Date(taskBD.start_date);
                }
                //FINISH TO FINISH
                if (link.type == 2) {
                    if (taskObj.type == 'task') {
                        var date = new Date(taskObj.end_date);
                    } else if (taskObj.type == 'milestone') {
                        var date = new Date(taskObj.end_date);
                    }
                    var taskBD = await getTaskById(link.source);
                    if (taskBD.type == 'task') {
                        var dateBD = new Date(taskBD.endDateClient);
                    } else if (taskBD.type == 'milestone') {
                        var dateBD = new Date(taskBD.end_date);
                    }
                }
                //START TO FINISH
                if (link.type == 3) {
                    var taskBD = await getTaskById(link.source);
                    if (taskObj.type == 'task') {
                        var date = new Date(taskObj.end_date);
                    } else if (taskObj.type == 'milestone') {
                        var date = new Date(taskObj.end_date);
                    }
                    var dateBD = new Date(taskBD.start_date);
                }
                let duration = gantt.calculateDuration(new Date(dateBD.getFullYear(), dateBD.getMonth(), dateBD.getDate()), new Date(date.getFullYear(), date.getMonth(), date.getDate()));
                if (link.type == 1) { gantt.getLink(link.id).lag = duration - 1; } else { gantt.getLink(link.id).lag = duration - 1; }
                gantt.updateLink(link.id);
            }
        }
    });

    gantt.init("gantt");

    //create chart Overlay
    var dateToStr = gantt.date.date_to_str("%F %j, %Y");
    lineOverlay = overlayControl.addOverlay(function (container) {
        
        var scaleLabels = [];

        var chartScale = getChartScaleRange();

        chartScale.forEach(function (date) {
            scaleLabels.push(dateToStr(date));
        });

        var values = getProgressLine();

        var canvas = document.createElement("canvas");
        container.appendChild(canvas);
        canvas.style.height = container.offsetHeight + "px";
        canvas.style.width = container.offsetWidth + "px";

        var ctx = canvas.getContext("2d");
        if (myChart) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "Planned progress",
                        backgroundColor: "#001eff",
                        borderColor: "#001eff",
                        data: values.planned,
                        fill: false,
                        cubicInterpolationMode: 'monotone'
                    },
                    {
                        label: "Real progress",
                        backgroundColor: "#ff5454",
                        borderColor: "#ff5454",
                        data: values.real,
                        fill: false,
                        cubicInterpolationMode: 'monotone'
                    }
                    ,
                    {
                        label: "Real progress (predicted)",
                        backgroundColor: "#ff5454",
                        borderColor: "#ff5454",
                        data: values.predicted,
                        borderDash: [5, 10],
                        fill: false,
                        cubicInterpolationMode: 'monotone'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: getScalePaddings()
                },
                onResize: function (chart, newSize) {
                    var dataRange = gantt.getSubtaskDates();
                    if (dataRange.start_date) {
                        // align chart with the scale range
                        chart.options.layout.padding = getScalePaddings();
                    }
                },
                legend: {
                    display: false
                },
                tooltips: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var dataset = data.datasets[tooltipItem.datasetIndex];
                            return dataset.label + ": " + dataset.data[tooltipItem.index] + "%";
                        }
                    }
                },
                hover: {
                    mode: "nearest",
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        labels: scaleLabels,
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            display: false
                        }
                    },
                    {
                        position: "top",
                        labels: scaleLabels,
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            display: false
                        }
                    }
                    ],
                    yAxes: [{
                        display: true,
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            display: true,
                            min: 0,
                            max: 100,
                            stepSize: 10,
                            callback: function (current) {
                                if (current > 100) { return ""; }
                                return current + "%";
                            }
                        }
                    },
                    {
                        display: true,
                        position: "right",
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            display: true,
                            min: 0,
                            max: 100,
                            stepSize: 10,
                            callback: function (current) {
                                if (current > 100) { return ""; }
                                return current + "%";
                            }
                        }
                    }
                    ]
                }
            }
        });
        return canvas;
    });
     // initializing dataProcessor

    var dp = gantt.createDataProcessor({
        //url: "/Gant",
        //mode: "REST",
        task: {
            create: function (data) {
                return new gantt.Promise(function (resolve, reject) {
                    data.projectId = projectId;
                    data.endDate = gantt.calculateEndDate(gantt.getTask(data.id));
                    data.wbsCode = gantt.getWBSCode(gantt.getTask(data.id));
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/CreateTask',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (result) {
                            if (!result.isSuccess) {
                                Swal.fire({
                                    type: 'error',
                                    title: '',
                                    text: result.errorMessage,
                                    footer: '',
                                    onAfterClose: () => {
                                        gantt.clearAll();
                                        gantt.load("/Gantt/Get?id=" + projectId);
                                        return resolve();
                                    }
                                });
                            }
                            else {
                                var newTask = JSON.parse(result.valueString);
                                var parentStatus = getParentStatus(projectId, newTask.id);
                                var i = 0;
                                parentStatus.forEach(function (parent) {
                                    if (i > 0) {
                                        gantt.getTask(parent.projectTaskID).progress = parent.progress;
                                        gantt.getTask(parent.projectTaskID).status = parent.status;
                                        gantt.getTask(parent.projectTaskID).plannedProgress = parent.plannedProgress;
                                    }
                                    i++;
                                });
                                batcWbshUpdate();
                                gantt.refreshData();

                                return resolve({ tid: newTask.id });
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
            },
            update: function (data, id) {
                return new gantt.Promise(function (resolve, reject) {
                    //var taskBD = getTaskWbsById(data.id);
                    data.projectId = projectId;
                    data.endDate = gantt.calculateEndDate(gantt.getTask(data.id));
                    data.wbsCode = gantt.getWBSCode(gantt.getTask(data.id));
                    //data.status == 5 ? data.status = 1 : data.status = data.status; 
                    data.status == 3 ? data.status : data.status = 1; 
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/UpdateTask',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            //LoaderShow();
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
                                        gantt.load("/Gantt/Get?id=" + projectId);
                                        return reject(new Error(response.errorMessage));
                                    }
                                });
                            }
                            else {
                                var parentStatus = getParentStatus(projectId, data.id);
                                parentStatus.forEach(function (parent) {
                                    if (gantt.isTaskExists(parent.projectTaskID)) {
                                        gantt.getTask(parent.projectTaskID).progress = parent.progress;
                                        gantt.getTask(parent.projectTaskID).status = parent.status;
                                        gantt.getTask(parent.projectTaskID).plannedProgress = parent.plannedProgress;
                                    }
                                });
                                //xgantt.LoadGanttHttpRequest(projectId)
                                gantt.refreshData(); 
                                gantt.render();

                                return resolve();
                            }
                        },
                        complete: function () {
                            //if (taskBD.wbsCode != data.wbsCode) { batcWbshUpdate(); }
                            batcWbshUpdate();
                            //LoaderHide();
                        },
                        error: function (xhr, status, error) {
                            //LoaderHide();
                            return reject();
                        }
                    });
                });
            },
            delete: function (id) {
                return new gantt.Promise(function (resolve, reject) {
                    var data = {
                        id: id,
                        projectId: projectId
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/DeleteTask',
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
                                        gantt.load("/Gantt/Get?id=" + projectId);
                                        return resolve();
                                    }
                                });
                            }
                            else {
                                batcWbshUpdate();
                                gantt.clearAll();
                                gantt.load("/Gantt/Get?id=" + projectId);
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
                        url: '/Gantt/CreateLink',
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
                            //batcWbshUpdate();
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
                        url: '/Gantt/UpdateLink',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {
                            return resolve();
                            gantt.refreshData();
                            gantt.render();
                        },
                        complete: function () {
                            //batcWbshUpdate();
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
                        id: id,
                        projectId: projectId
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/Gantt/DeleteLink',
                        dataType: 'json',
                        data: data,
                        beforeSend: function () {
                            LoaderShow();
                        },
                        success: function (data) {

                        },
                        complete: function () {
                            //batcWbshUpdate();
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

    dp.attachEvent("onAfterUpdate", async function (id, action, tid, response) {
        if (action == "inserted") {
            if (gantt.isTaskExists(tid)) {
                let task = await getTaskById(tid);
                completeTaskInfo(task);
                gantt.clearAll();
                gantt.load("/Gantt/Get?id=" + projectId);
            }
        } 
    })
    // and attaching it to gantt
    dp.init(gantt);
    ganttModules.menu.setup();
}); //end funcion ready

function batcWbshUpdate() {
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('id');
    
    //var tasks = gantt.getTaskByTime();
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
        url: '/Gantt/UpdateBatchWbs',
        dataType: "json",
        data: { projectId: id, data: value },
        beforeSend: function () {
            //LoaderShow();
        },
        success: function (result) {

        },
        complete: function () {
            //LoaderHide();
        },
        error: function (xhr, status, error) {
            //LoaderHide();
        }
    })
};

function getProjectConfig(projectId) {
    var result = {};
    $.ajax({
        method: "GET",
        url: "/Gantt/GetGanttConfig?id=" + projectId,
        async: false,
        success: function (data) {
            result.project = data.project;
            result.holidays = [];

            for (var i = 0; i < data.holidays.length; i++) {
                //result.holidays[i] = data.holidays[i]["date"];
                result.holidays[i] = data.holidays[i];
            }
        }
    });
    return result;
}

function getProject(projectId) {
    $.ajax({
        method: "GET",
        url: "/Projects/GetById?id=" + projectId,
        async: false,
        success: function (data) {

            $('#ProjectPhase').val(data.phase);

            if (data.phase == 1) {
                $('#ModalTemplateBtn').show();
            }
            else 
                $('#ModalTemplateBtn').hide();
            
        }
    });
}

function getParticipants(projectId) {
    var result = [];
    $.ajax({
        method: "GET",
        url: "/Participants/GetByProjectSelectionItemList?projectID=" + projectId,
        async: false,
        success: function (data) {
            data.forEach(function (participant) {
                if (participant.key !== null) {
                    result.push({
                        key: participant.key,
                        label: participant.value,
                        unit: "%"
                    });
                }
                else {
                    result.push({
                        key: "",
                        label: participant.value
                    });
                }
            });
        }
    });
    return result;
}

function getParentStatus(projectId, taskId) {
    var result = [];
    $.ajax({
        method: "GET",
        url: "/Gantt/GetParentTaskStatus?projectId=" + projectId + "&taskId=" + taskId,
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return result;
}

function loadTemplate() {
    var form = $("#frmMain");
    form.validate();
    if (!form.valid())
        return;

    var data = $("form").serialize();
    var projectID = document.getElementById("ProjectID").value;
    $.ajax({
        type: 'POST',
        url: '/Gantt/GetGanttTemplate',
        dataType: 'json',
        data: data,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (result) {
            gantt.unselectTask();
            gantt.clearAll(); 
            gantt.load("/Gantt/Get?id=" + projectID);
            gantt.refreshData();
            //gantt.init("gantt");
        },
        complete: function () {
            $('#templateModal').modal('hide');
            LoaderHide();
        },
        error: function (xhr, status, error) {
            $('#templateModal').modal('hide');
            LoaderHide();
        }
    })
}

function nowDate() {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date();
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date();
    if (inputFormat !== undefined) {
        d = new Date(inputFormat);
    }
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
}

function getEndDateClientFormat(endDate, taskType) {
    return taskType == 'milestone' ? endDate : endDate.setDate(endDate.getDate() - 1);
}

function updateProgress(obj, duration) {
    switch (obj.value.length) {
        case 1:
            obj.value = obj.value + "0:00";
            $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val(obj.value + "0:00");
            break;
        case 2:
            obj.value = obj.value + ":00";
            $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val(obj.value + ":00");
            break;
        case 3:
            obj.value = obj.value + "00";
            $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val(obj.value + "00");
            break;
        case 4:
            obj.value = obj.value + "0";
            $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val(obj.value + "0");
            break;
        default:
    }

    var itemId = obj.dataset.itemId;
    if (obj.value !== '') {
        $('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').val(moment.duration(obj.value).asHours() * 100 / 8);
        var totalHours = moment.duration($('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val()).asHours() * duration;
        $('input.gantt_resource_amount_input_hours[total_hours="' + itemId + '"]').val((moment.duration(totalHours, 'h')).format('HH:mm'));
    }
    else
        $('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').val('');
    return true;
}

function updateHours(obj, duration) {  
    var itemId = obj.dataset.itemId;

    if (obj.value == 0) {
        $('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').val('0.00'); 
    }
    if (Number.parseFloat(obj.value) > 100) {
        $('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').val('100');  
    }
    else if (Number.parseFloat(obj.value) < 0 || Number.isNaN(Number.parseFloat(obj.value))) {

        $('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').val(parseFloat(0).toFixed(2));   
    }
  
    if (obj.value !== '') {
        let xDay = moment.duration(obj.value * 8 / 100, 'h').format('HH:mm');
        if (xDay.includes(":"))
            $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val(xDay);
        else
            $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val("00:" + xDay);

        var totalHours = moment.duration($('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val()).asHours() * duration;
        $('input.gantt_resource_amount_input_hours[total_hours="' + itemId + '"]').val((moment.duration(totalHours, 'h')).format('HH:mm'));
    }
    else
        $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').val('');
    return true;
}

function enableHoursInput(obj) {
    var itemId = obj.parentElement.parentElement.dataset.itemId;
    var itemChecked = obj.parentElement.parentElement.dataset.checked;
    if (itemChecked != "false") {
        $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').attr('disabled', 'disabled').val('');
        $('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').val('');
    }
    else {
        $('input.gantt_resource_amount_input_hours[data-item-id="' + itemId + '"]').removeAttr('disabled');
        $('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').val('0.00');

    }
    return true;
}

function checkLimits() {  
    if (Number.parseFloat(event.target.value) > 100) {
        event.target.value = 100;
    }
    else if (Number.parseFloat(event.target.value) < 0 || Number.isNaN(Number.parseFloat(event.target.value))) {
        event.target.value = parseFloat(0).toFixed(2);
    }
}

function checkDurationLimits() {
    var duration = parseInt($('.gantt_duration_value').val());
    if (duration <= 0) {
        $('.gantt_duration_value').val(1);
    }
}

function completeTaskInfo(task) {
    if (task.parent == null)
        task.parent = 0;

    // Copy all missing properties
    for (var property in task) {
        if (task.hasOwnProperty(property)) {
            if (property == "start_date" || property == "end_date") {
                gantt.getTask(task.id)[property] = new Date(task[property].split("-")[0], task[property].split("-")[1] - 1, task[property].split("-")[2]);
            }
            else
                gantt.getTask(task.id)[property] = task[property];
        }
    }

    gantt.updateTask(task.id);
}

function getTaskById(taskId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'GET',
            url: '/Gantt/GetTaskById',
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), taskId: taskId },
            beforeSend: function () {
            },
            success: function (task) {
                resolve(task);
            },
            complete: function () {
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        });
    });
}

function getTaskWbsById(taskId) {
    
    $.ajax({
        type: 'GET',
        url: '/Gantt/GetTaskById',
        dataType: 'json',
        data: { projectId: $("#ProjectID").val(), taskId: taskId },
        beforeSend: function () {
        },
        success: function (task) {
            result = task;
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
        }
    });
    return result;
}

function getTaskCompleteInfoById(taskId) {
    let result = {};
    let task = gantt.getTask(taskId);

    if (task.type == "task") {
        $.ajax({
            type: 'GET',
            url: '/Gantt/GetActivityCompleteInfoById',
            async: false,
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), activityId: taskId },
            beforeSend: function () {
            },
            success: function (task) {
                result = task;
            },
            complete: function () {
            },
            error: function (xhr, status, error) {
            }
        });
    }
    else {
        $.ajax({
            type: 'GET',
            url: '/Gantt/GetMilestoneCompleteInfoById',
            async: false,
            dataType: 'json',
            data: { projectId: $("#ProjectID").val(), milestoneId: taskId },
            beforeSend: function () {
            },
            success: function (task) {
                result = task;
            },
            complete: function () {
            },
            error: function (xhr, status, error) {
            }
        });
    }
    
    return result;
}

function archiveTask(taskId) {
    return new Promise((resolve, reject) => {
        let task = gantt.getTask(taskId);
        task.projectId = $("#ProjectID").val();
        task.wbsCode = gantt.getWBSCode(gantt.getTask(task.id));

        $.ajax({
            type: 'PATCH',
            url: '/Gantt/ArchiveTask/',
            dataType: 'json',
            data: task,
            beforeSend: function () {
                LoaderShow();
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
                resolve(data);
            },
            complete: function () {
                LoaderHide();
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        })
    });
}

function cancelTask(taskId, gantt) {
    return new Promise((resolve, reject) => {
        let task = gantt.getTask(taskId);
        task.projectId = $("#ProjectID").val();
        task.wbsCode = gantt.getWBSCode(gantt.getTask(task.id));
        $.ajax({
            type: 'PUT',
            url: '/Gantt/CancelTask/',
            dataType: 'json',
            data: task,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) {
                resolve(data);
            },
            complete: function () {
                LoaderHide();
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        })
    });
} 

function addInputs(task) {
    var taskDuration = task.duration;

    $('div.gantt_cal_light').css('height', '830px');
    $('div.gantt_cal_light').css('width', '835px');

    $('.gantt_resource_cell_value')
        .attr('style', 'width:60px;')

    $('.gantt_resource_cell_unit')
        .attr('style', 'width:20px;')

    $('label.gantt_resource_row[data-item-id=""]').first().hide();

    $('.matherial_checkbox_icon').attr("onClick", "enableHoursInput(this)");

    $('.gantt_resource_amount_input')
        //.attr('type', 'number')
        .attr('min', 0)
        .attr('max', 100)
        //.attr('style', 'width:50px;')
        .attr('focusout', "checkLimits()")
        .attr("onChange", "updateHours(this, " + taskDuration + ")");

    var resource_filter = document.querySelector(".gantt_resources");
    var old_hours_input = document.querySelectorAll(".gantt_resource_cell_value_daily_hours");
    var old_amount_input = document.querySelectorAll(".gantt_resource_cell_value_activity_hours");
  
    if (!old_hours_input[0] && !old_amount_input[0]) {
        var resource_rows = document.querySelectorAll(".gantt_resource_row");
        var children = $(".gantt_resources").children();
        for (var i = 0; i < children.length; i++) {
            var itemId = children[i].dataset.itemId;

            if (itemId == "") {

            }
            else {
                var objTo = children[i];
                let itemChecked = false;
                if (itemId == task.owner_id) {
                    if (children[i].dataset.checked == "true") {
                        itemChecked = true;
                    }
                    else {
                        objTo.firstElementChild.checked = true;
                        objTo.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.value = "0.00";
                        objTo.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.firstElementChild.disabled = false;
                        children[i].dataset.checked = "true";
                        itemChecked = true;
                    }
                }
                else {
                    itemChecked = children[i].dataset.checked == "true" ? true : false;
                }
             
                // Adding new input for setting hours
                var newInputColumnDiv = document.createElement("div");
                var newInputTotalColumnDiv = document.createElement("div");
                var newInputDisabled = '';
                if (itemChecked == false)
                    newInputDisabled = " disabled='disabled'";
                newInputColumnDiv.className = "gantt_resource_cell gantt_resource_cell_value_daily_hours";
                newInputColumnDiv.innerHTML = "<spam><input data-item-id='" + itemId + "' class='gantt_resource_amount_input_hours timepicker' value='' style='width:100px;' onChange='updateProgress(this, " + taskDuration + ")'" + newInputDisabled + "> " + $('#XDay').val() + "    </spam >";;
                objTo.appendChild(newInputColumnDiv);

                newInputTotalColumnDiv.className = "gantt_resource_cell gantt_resource_cell_value_activity_hours";
                newInputTotalColumnDiv.innerHTML = "<spam><input total_hours='" + itemId + "' class='gantt_resource_amount_input_hours timepicker' style='width:50px;' disabled=true> " + $('#XActivity').val() + "</spam>";
                objTo.appendChild(newInputTotalColumnDiv);
                //resource_rows[i].appendChild(newInputTotalColumnDiv)
                updateHours($('input.gantt_resource_amount_input[data-item-id="' + itemId + '"]').get(0), taskDuration);
            }
        }
    }

}
