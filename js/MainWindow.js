const ipc = require("electron").ipcRenderer;
const settings = {
    daystoshow: 0,
    daysoffset: 0
}

function generateCalendar() {
    //MS in a day
    let ms = 86400000;
    let today = new Date();
    let headHtml = "<thead><tr>";
    let weekCounter = 0;
    let d = today.getDay();
    let day = d;
    for(let i = 0; i < settings.daystoshow; i++)
    {
        let genDate = new Date(Date.now() + (ms * settings.dayoffset) + (ms * day));
        let dispDate = CalendarWords.daysS[genDate.getDay()]+", "+CalendarWords.monthsS[genDate.getMonth()]+" "+genDate.getDate()+" "+genDate.getFullYear();
        if(d > 6) d-=7;
        headHtml += "<th>"+dispDate+"</th>";
        day += 1;
        d += 1;
    }
    headHtml += "</tr></thead>";
    document.getElementById("Calendar").innerHTML = headHtml;
}
function updateSettings() {

}
function loadSettings() {
    let res = ipc.sendSync("LoadCalendarSettigs");
    if(res.success = true)
    {
        settings.daystoshow = res.daystoshow;
        settings.daysoffset = res.dayoffset;
        generateCalendar();

    } else {
        alert("Login Failed")
        btn.classList.remove("btn-danger");
        btn.value = "Log In";
    }
}

document.addEventListener("DOMContentLoaded", function(){
    // Handler when the DOM is fully loaded
    loadSettings();
  });