if (!window.ganttModules) {
    window.ganttModules = {};
} 
ganttModules.menu = (function () {
    function addClass(node, className) {
        node.className += " " + className;
    }

    function removeClass(node, className) {
        node.className = node.className.replace(new RegExp(" *" + className.replace(/\-/g, "\\-"), "g"), "");
    }

    function getButton(name) {
        return document.querySelector(".gantt-controls [data-action='" + name + "']");
    }

    function highlightButton(name) {
        addClass(getButton(name), "menu-item-active");
    }
    function unhighlightButton(name) {
        removeClass(getButton(name), "menu-item-active");
    }

    function disableButton(name) {
        addClass(getButton(name), "menu-item-disabled");
    }

    function enableButton(name) {
        removeClass(getButton(name), "menu-item-disabled");
    }

    function refreshZoomBtns() {
        var zoom = ganttModules.zoom;
        if (zoom.canZoomIn()) {
            enableButton("zoomIn");
        } else {
            disableButton("zoomIn");
        }
        if (zoom.canZoomOut()) {
            enableButton("zoomOut");
        } else {
            disableButton("zoomOut");
        }
    }

    //function refreshUndoBtns() {
    //    if (!gantt.getUndoStack().length) {
    //        disableButton("undo");
    //    } else {
    //        enableButton("undo");
    //    }

    //    if (!gantt.getRedoStack().length) {
    //        disableButton("redo");
    //    } else {
    //        enableButton("redo");
    //    }

    //}

    //setInterval(refreshUndoBtns, 1000);

    function toggleZoomToFitBtn() {
        if (ganttModules.zoomToFit.isEnabled()) {
            highlightButton("zoomToFit");
        } else {
            unhighlightButton("zoomToFit");
        }
    }

    var menu = {
        undo: function () {
            gantt.undo();
            refreshUndoBtns();
        },
        redo: function () {
            gantt.redo();
            refreshUndoBtns();
        },
        zoomIn: function () {
            ganttModules.zoomToFit.disable();
            var zoom = ganttModules.zoom;
            zoom.zoomIn();
            refreshZoomBtns();
            toggleZoomToFitBtn()
        },
        zoomOut: function () {
            ganttModules.zoomToFit.disable();
            ganttModules.zoom.zoomOut();
            refreshZoomBtns();
            toggleZoomToFitBtn()
        },
        zoomToFit: function () {
            ganttModules.zoom.deactivate();
            ganttModules.zoomToFit.toggle();
            toggleZoomToFitBtn();
            refreshZoomBtns();
        },
        fullscreen: function () { 
            gantt.expand();
        },
        collapseAll: function () {
            gantt.eachTask(function (task) {
                task.$open = false;
            });
            gantt.render();

        },
        expandAll: function () {
            gantt.eachTask(function (task) {
                task.$open = true;
            });
            gantt.render();
        },
        toggleAutoScheduling: function () {
            gantt.config.auto_scheduling = !gantt.config.auto_scheduling;
            if (gantt.config.auto_scheduling) {
                gantt.autoSchedule();
                highlightButton("toggleAutoScheduling");
            } else {
                unhighlightButton("toggleAutoScheduling")
            }
        },
        toggleCriticalPath: function () {
            alert();
            if (!gantt.config.highlight_critical_path) {
                menu.drawCriticalPath();
            } else {
                menu.hideCriticalPath();
            }

            gantt.config.highlight_critical_path = !gantt.config.highlight_critical_path;

            if (gantt.config.highlight_critical_path) {
                highlightButton("toggleCriticalPath");
                gantt.config.highlight_critical_path = true;
                console.log('highlightButton- si');
            } else {

                console.log('unhighlightButton - no');
                unhighlightButton("toggleCriticalPath")
                gantt.config.highlight_critical_path = false;
            }
            gantt.render();
        },
        toPDF: function () {
            //gantt.exportToPDF();
            gantt.exportToPDF({
                name: projectName+".pdf"
            });
        },
        toPNG: function () {
            gantt.exportToPNG({
                name: projectName + ".png"
            });
        },
        toExcel: function () {
            gantt.exportToExcel({
                name: projectName + ".xlsx"
            });
        },
        toMSProject: function () {
            gantt.exportToMSProject();
        },
        showHolidays: function () {

            var msg = "<b><span class='g-info'><i class='fas fa-info-circle'></i> " + $("#Holidays").val()+":</span></b>";
            for (var i = 0; i < gantt.holidays.length; i++) {
                msg = msg + "<br>" + gantt.holidays[i].date.substring(0,10) + " " + gantt.holidays[i].name + "</b>";
            }
            gantt.message({ type: "info", text: msg });
            //gantt.message({ type: "info", text: "<b><span class='g-info'><i class='fas fa-info-circle'></i> Dias no laborables:</span></b> <br>2019-10-05<br>2019-10-05<br>2019-10-05<br>2019-10-05<br>2019-10-05" });
        },
        drawCriticalPath: function () {
            //ganttModules.menu.setup();
            //gantt.load(filedataNotColors);
            gantt.message({
                type: "info",
                text: "<b><span class='g-info'><i class='fas fa-info-circle'></i> " + $("#CirticalPath").val() + "</span> " + $("#Activated").val() +"</b>"
            });
        },
        hideCriticalPath: function () {
            //ganttModules.menu.setup();
            //gantt.load(filedata);
            gantt.message({
                type: "info",
                text: "<b><span class='g-info'><i class='fas fa-info-circle'></i> " + $("#CirticalPath").val() + "</span> " + $("#Deactivated").val() +"</b>"
            });
        },
        baseLine: function () {
            var existeBaseLine = $(".baseline");
            if (existeBaseLine.length) {
                unhighlightButton("baseLine");
                //ganttModules.menu.setup();
                //gantt.load(filedatanotplanned);
                gantt.config.show_baseline = false;
                gantt.render();
                gantt.message({
                    type: "info",
                    text: "<b><span class='g-info'><i class='fas fa-info-circle'></i> " + $("#BaseLine").val() + "</span> " + $("#Deactivated").val() +"</b>"
                });
            } else {
                highlightButton("baseLine");
                //ganttModules.menu.setup();
                //gantt.load(filedata);
                gantt.config.show_baseline = true;
                gantt.render();
                gantt.message({
                    type: "info",
                    text: "<b><span class='g-info'><i class='fas fa-info-circle'></i> " + $("#BaseLine").val() + "</span> " + $("#Activated").val() +"</b>"
                });
            }
        },
        activeRecursos: function () {
            var elementRecursos = $(".gantt_layout_cell.gantt_layout.gantt_layout_x.gantt_layout_cell_border_transparent");
            if (elementRecursos.length > 0) {
                highlightButton("activeRecursos");
                if (elementRecursos.hasClass('hide-gantt')) {
                    elementRecursos.removeClass('hide-gantt');
                    elementRecursos.addClass('show-gantt');

                } else {
                    unhighlightButton("activeRecursos");
                    elementRecursos.removeClass('show-gantt');
                    elementRecursos.addClass('hide-gantt');
                }
            }
        },
        toggleSlack: function () {
            if (!gantt.config.show_slack) {
                highlightButton("toggleSlack");
                //toggle.innerHTML = "Hide Slack";
                //declaring custom config
                gantt.config.show_slack = true;
            } else {
                unhighlightButton("toggleSlack");
                //toggle.innerHTML = "Show Slack";
                gantt.config.show_slack = false;
            }
            gantt.render();
        },
        toggleOverlay: function () {  

            if (overlayControl.isOverlayVisible(lineOverlay)) {
                gantt.config.readonly = false;
                overlayControl.hideOverlay(lineOverlay);
                gantt.$root.classList.remove("overlay_visible");
            } else {
                gantt.config.readonly = true;
                overlayControl.showOverlay(lineOverlay);
                gantt.$root.classList.add("overlay_visible");
            } 
        },
        showModalTemplate: function () {
            $('#ProjectStartDate').val(convertDate());
            $('#templateModal').modal('show');
        }
    };


    return {
        setup: function () {

            var navBar = document.querySelector(".gantt-controls");
            gantt.event(navBar, "click", function (e) {
                var target = e.target || e.srcElement;
                while (!target.hasAttribute("data-action") && target !== document.body) {
                    target = target.parentNode;
                }

                if (target && target.hasAttribute("data-action")) {
                    var action = target.getAttribute("data-action");
                    if (menu[action]) {
                        menu[action]();
                    }
                }
            });
            this.setup = function () { };
        }
    }
})(gantt);

