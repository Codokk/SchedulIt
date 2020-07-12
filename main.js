const {app, BrowserWindow, ipcMain, Menu} = require('electron'),
    mysql = require('mysql'),
    fs = require('fs'),
    path = require('path'),
    url = require('url');
const { create } = require('domain');
const Cryptr = require('cryptr');
const GlobalUser = {};


const pek = "P1nk@ppl3P@ssw0rd";
let Windows = {count: 0};

//Create and set the default menu
const DefaultMenu = Menu.buildFromTemplate([
    {
        label: "View",
        submenu: [
            {
                label: "Reload",
                role:"forcereload"
            },
            {type: 'separator'},
            {
                label: "Actual Size",
                role:"resetZoom",
                accelerator: 'CmdOrCtrl+0'
            },
            {
                label: "Zoom In",
                role: "zoomin",
                accelerator: 'CmdOrCtrl+='
            },
            {
                label: "Zoom Out",
                role: "zoomout",
                accelerator: 'CmdOrCtrl+-'
            },
            {type:'separator'},
            {
                label: "Fullscreen",
                role: "togglefullscreen",
                accelerator: 'F11'
            },
            {type:'separator'},
            {
                label: "Toggle Dev Tools",
                role: "toggledevtools",
                accelerator: 'F12'
            }
        ]
    },
    {
        label: "Help",
        submenu: [
            {
                label: "Documentation"
            },
            {
                label: "A Software By Cody Krist"
            }
        ]
    },
    {
        label: "Exit",
        click() {
            app.quit();
        }
    }
])
Menu.setApplicationMenu(DefaultMenu);


function createWindow(winName) {
    if(!Windows[winName])
    {
        Windows[winName] = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            }
        });
        Windows.count += 1;
        Windows[winName].loadURL(url.format({
            pathname: path.join(__dirname, ("html/" + winName + '.html')),
            protocol: "file",
            slashes: true
        }))

        Windows[winName].on('closed', () => {
            Windows[winName] = null;
            Windows.count -= 1;
        })
    } else {
        Windows[winName].show();
    }
}

//On Reqady
app.on('ready', ()=>{createWindow("Login")});

//Listening
ipcMain.on('createWindow', (event, args) => {
    createWindow(args);
    event.returnValue = "Window Opened";
})
ipcMain.on('CloseWindow', (e, args) => {
    Windows[args].close();
    Windows[args] = null;
})
ipcMain.on('LoadCalendarSettigs', (e, args) => {
    let con;
    try {
        con = getDatabase();
    } catch {
        e.returnValue = {success: false};
        return;
    }
    con.connect((err) => {
        if (err) {
            e.returnValue = 'false';
            throw err;
            return;
        }
        con.query("Select * From `settings`", (err, res) => {
            if(err) {
                e.returnValue = {success: false};
                throw err;
                return;
            }
            else {
                let ret = {
                    success: true,
                    daystoshow: res.daystoshow,
                    dayoffset: res.dayoffset
                };
                e.returnValue = ret;
                return;
            }
        }) 
    })
})
ipcMain.on('MakeTopWindow', (e, args) => {
    Windows[args].show();
})
ipcMain.on("TryLogin", (e, args) => {
    let con;
    try{
        con = getDatabase();
    } catch {
        e.returnValue = false;
        return;
    }
    con.connect((err) => {
        if (err) {
            e.returnValue = 'false';
            throw err;
            return;
        }
        con.query("Select * from users where username = "+con.escape(args[0])+" and password = "+con.escape(args[1]), (err, res) => {
            if (err | res.length != 1) {
                e.returnValue = false;
                return;
            }
            else if(res.length == 1)
            {
                console.log(res);
                console.log(res[0].uid);
                GlobalUser.id = res[0].uid;
                e.returnValue = true;
                //Start loading up the software
                createWindow("MainWindow");
                Windows["Login"].close();
                Windows["Login"]= null;
                return;
            }
        });

    })
})
ipcMain.on('UpdateDatabaseSettings', (e, args) => {
    let cryptr = new Cryptr(pek);
    let dbstring = "";
    dbstring += "host|"+cryptr.encrypt(args.host)+"~";
    dbstring += "user|"+cryptr.encrypt(args.user)+"~";
    dbstring += "password|"+cryptr.encrypt(args.password)+"~";
    dbstring += "database|"+cryptr.encrypt(args.database);
    fs.writeFile(path.join(__dirname, "docs/schedulit.info"), dbstring, (err)=>{
        if(err)
        {
            console.error(err);
            e.returnValue = false;
        } else {
            e.returnValue =true;
        }
    })
})
//App Events
app.on('window-all-closed', ()  => {
    if(process.platform !== 'darwin')//not mac
    {
        app.quit();
    }
})

app.on('activate', () => { //On icon click on mac
    if(Windows.count == 0)
    {
        createWindow('Login')
    }
}) 

//Functions
function getDatabase() {
    let connDetails = fs.readFileSync(__dirname + "/docs/schedulit.info").toString().split("~");
    let dbobj = {};
    let cryptr = new Cryptr(pek);
    for(let i = 0; i < connDetails.length; i++){
        let item = connDetails[i].split("|");
        dbobj[item[0]] = cryptr.decrypt(item[1]);
    }
    return mysql.createConnection(dbobj);
}