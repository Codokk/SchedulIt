const ipc = require("electron").ipcRenderer;
const settings = {
    daystoshow: 0,
    daysoffset: 0,
    open: 0,
    close: 0,
    interval: 0
}
const CalendarWords = {
    daysL: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    daysS: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    monthsS: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

function generateCalendar() {
    console.log("Generating Calendar");
    console.log(settings);
    //MS in a day
    let ms = 86400000;
    let today = new Date();
    let headHtml = "<thead><tr><th>Time</th>";
    let weekCounter = 0;
    let d = today.getDay();
    let day = d;
    for (let i = 0; i < settings.daystoshow; i++) {
        let genDate = new Date(Date.now() + (ms * settings.daysoffset) + (ms * day));
        let dispDate = CalendarWords.daysS[genDate.getDay()] + ", " + CalendarWords.monthsS[genDate.getMonth()] + " " + genDate.getDate() + " " + genDate.getFullYear();
        if (d > 6) d -= 7;
        headHtml += "<th>" + dispDate + "</th>";
        day += 1;
        d += 1;
    }
    headHtml += "</tr></thead>";
    document.getElementById("Calendar").innerHTML = headHtml;
    //Convert the open and close to mins
    let openmins = settings.open;
    while (openmins < settings.close) {
        console.log("fixing Minutes");
        //Create the row for every day
        let rowHTML = "<tr><td>" + minToTime(openmins) + "</td>";
        for (let i = 0; i < settings.daystoshow; i++) {
            rowHTML += "<td data-day='"+i+"' data-time='"+openmins+"' id='timeblock"+i+"|"+openmins+"' onClick='activateTimeblock(\"timeblock"+i+"|"+openmins+"\")'>--</td>";
        }
        rowHTML += "</tr>";
        document.getElementById("Calendar").innerHTML += rowHTML;
        //increment openmins
        openmins += settings.interval;
    }
}

function updateSettings() {

}

function loadSettings() {
    let res = ipc.sendSync("LoadCalendarSettigs");
    if (res.success = true) {
        settings.daystoshow = res.daystoshow;
        settings.daysoffset = res.dayoffset;
        settings.open = res.open;
        settings.close = res.close;
        settings.interval = res.interval;
        generateCalendar();

    } else {
        alert("Login Failed")
        btn.classList.remove("btn-danger");
        btn.value = "Log In";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Handler when the DOM is fully loaded
    loadSettings();
});

function minToTime(mins) {
    let hrs = 0;
    let time = " am";
    while (mins >= 60) {
        hrs += 1;
        mins -= 60;
    }
    if (hrs > 12) {
        hrs -= 12;
        time = " pm";
    }
    return "" + hrs + ":" + (mins == 0 ? mins + "0" : mins) + time;
}
function activateTimeblock(id) {
    let el = document.getElementById(id);
    if(el.classList.contains("table-success"))
    {
        let arg = id.split("k");
        arg = arg[1];
        let args = {
            timestring: arg,
            settings: settings
        }
        ipc.send("OpenNewTicket", args);
    } else {
        let els = document.getElementsByClassName("table-success");
    for(let i = 0; i < els.length; i++)
    {
        els[i].classList.remove("table-success");
    }
    document.getElementById(id).classList.add("table-success");
    }    
}