const ipc = require('electron').ipcRenderer;
    

function tryLogin() {
    let btn = document.getElementById('LoginButton');
    btn.classList.add('btn-danger');
    btn.value = "Logging In...";
    if(ipc.sendSync("TryLogin", [document.getElementById("username").value, document.getElementById("password").value]))
    {
        document.getElementById("main").innerHTML = "Loading up your software";
    } else {
        alert("Login Failed")
        btn.classList.remove("btn-danger");
        btn.value = "Log In";
    }
}
function OpenSecuritySettings() {
    console.log(ipc.sendSync('createWindow', 'SecuritySettings'));
}