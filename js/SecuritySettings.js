const ipc = require('electron').ipcRenderer;
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
let dbobj = {};
function updateSettings() {
    //First, check if the connection is any good
    console.log("Updating Settings");
    document.getElementById("UpdateSettingsButton").setAttribute('disabled', true);
    let settingsCheck = new Promise((res, rej) => {
        let servertypes = document.getElementsByName("ServerType");
        let servertype = Array.from(servertypes).find(i => i.checked);
        switch (servertype.value) {
            case "mysql":
                dbobj = {
                    host: "localhost",
                    user: document.getElementById('SQLUsername').value,
                    password: document.getElementById("SQLPassword").value,
                    database: document.getElementById("SQLDatabase").value,
                    multipleStatements: true
                }
                let testConn = mysql.createConnection(dbobj)
                testConn.connect((err) => {
                    if (!err) {
                        res("Connection Successful")
                    } else {
                        rej("SQL Connection Failure")
                    }
                })
                break;
        }
    }).then((res) => {
        //Then, save the results as an encrypted file
        if (ipc.sendSync('UpdateDatabaseSettings', dbobj)) {
            //Ask if they want to format the database
            if (confirm("Connection Successful, Would you like to format this database?")) {
                let testConn = mysql.createConnection(dbobj);
                testConn.connect((err) => {
                    if (err) throw err;
                    text = fs.readFileSync(path.join(__dirname, "../docs/formatDatabase.sql")).toString();
                    let arr = text.split(";");
                    console.log(arr);
                    for(let i = 0; i < arr.length - 1; i++){
                        console.log(arr[i]);
                        testConn.query(arr[i], (err, res) => {
                            if (err) alert(err + "ERROR");
                            alert(JSON.stringify(res));
                            console.log(res);
                        })
                    }
                })
            }
        } else {
            alert("Something went wrong on the main process, please try again.");
            ipc.send('MakeTopWindow', 'Login');
            ipc.send('CloseWindow', 'SecuritySettings');
        }
        ;
    }, (err) => {
        console.warn(err);
        alert("The SQL Connection settings are invalid");
        document.getElementById("UpdateSettingsButton").removeAttribute("disabled");
    });
}