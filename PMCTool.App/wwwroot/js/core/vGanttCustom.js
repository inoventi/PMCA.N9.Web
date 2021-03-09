
var xgantt = {
    LoadGanttHttpRequest: function (projectId) {  
        gantt.load("/Gantt/Get?id=" + projectId); 
             //let taskComplete = xgantt.getTaskCompleteInfoById(task.id);
            //let taskGantt = gantt.getTask(task.id);
            //taskGantt.start_date = new Date(taskComplete.start_date);
            ////taskGantt.end_date = new Date(taskComplete.end_date);
            //taskGantt.duration = taskComplete.duration;
            //gantt.updateTask(taskGantt.id);
            //taskComplete = null;
            //taskGantt = null; 
            //    resolve();
            
       
        
        //let /*start_date*/ = taskComplete.start_date;
        
        //var taskgantt = {
        //    id: taskComplete.id, text: taskComplete.text,
        //    start_date: start_date,
        //    //end_date: new Date(taskComplete.end_date),
        //    duration: taskComplete.duration
        ////}
        //console.log(taskGantt);
        ////gantt.updateTask(taskGantt.id);
        //taskComplete = null;
        //taskGantt = null; 
        //gantt.updateTask(2, taskgantt); 
    },
    updateTaskAjax: function () {
        $.ajax({
            type: 'POST',
            url: '/Companies/DeleteCompany',
            dataType: 'json',
            data: data,
            beforeSend: function () {
                LoaderShow();
            },
            success: function (data) { 
                console.log("success ->updateTaskAjax");
            },
            complete: function () {
              
            },
            error: function (xhr, status, error) {
                console.log("Error ->updateTaskAjax");
            }
        })
    },
    getTaskCompleteInfoById: function (taskId) {
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
}
var zoomConfig = {
    levels: [
        {
            name: "day",
            scale_height: 27,
            min_column_width: 80,
            scales: [
                { unit: "day", step: 1, format: "%d %M" }
            ]
        },
        {
            name: "week",
            scale_height: 50,
            min_column_width: 50,
            scales: [
                {
                    unit: "week", step: 1, format: function (date) {
                        var dateToStr = gantt.date.date_to_str("%d %M");
                        var endDate = gantt.date.add(date, -6, "day");
                        var weekNum = gantt.date.date_to_str("%W")(date);
                        return "#" + weekNum + ", " + dateToStr(date) + " - " + dateToStr(endDate);
                    }
                },
                { unit: "day", step: 1, format: "%j %D" }
            ]
        },
        {
            name: "month",
            scale_height: 50,
            min_column_width: 120,
            scales: [
                { unit: "month", format: "%F, %Y" },
                { unit: "week", format: "Week #%W" }
            ]
        },
        {
            name: "quarter",
            height: 50,
            min_column_width: 90,
            scales: [
                { unit: "month", step: 1, format: "%M" },
                {
                    unit: "quarter", step: 1, format: function (date) {
                        var dateToStr = gantt.date.date_to_str("%M");
                        var endDate = gantt.date.add(gantt.date.add(date, 3, "month"), -1, "day");
                        return dateToStr(date) + " - " + dateToStr(endDate);
                    }
                }
            ]
        },
        {
            name: "year",
            scale_height: 50,
            min_column_width: 30,
            scales: [
                { unit: "year", step: 1, format: "%Y" }
            ]
        }
    ]
};

