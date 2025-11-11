var helper = {
    checkAssignedTask: function (task) {
        let blockModal = true;
        if (task.resources.length > 0) {
            for (var j = 0; j < task.resources.length; j++) {
                if (task.resources[j].resource_id == participantUser.participantID) {
                    blockModal = true
                    break;
                } else {
                    blockModal = false;
                }
            }
        } else {
            blockModal = false;
        }
        return (blockModal);
    },
    convertDecimaltoHours: function (decimal) {
        let decimalTimeString = decimal;
        let decimalTime = parseFloat(decimalTimeString);
        decimalTime = decimalTime * 60 * 60;
        let hours = Math.floor((decimalTime / (60 * 60)));
        decimalTime = decimalTime - (hours * 60 * 60);
        let minutes = Math.floor((decimalTime / 60));
        decimalTime = decimalTime - (minutes * 60);
        let seconds = Math.round(decimalTime);
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return ("" + hours + ":" + minutes + ":" + seconds);
     },
     highlightInput: function (element) {
         $(element).css({
             'border': '1px solid #ffa534',
             'background-color': '#ffa5002e' 
         });
     } 
};