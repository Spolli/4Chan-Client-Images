const electron = require('electron');
const path = require('path');
const url = require('url');
const DownloadManager = require("electron-download-manager");
var https = require('https');


DownloadManager.register();
/*
DownloadManager.register({
    downloadFolder: app.getPath("downloads") + "/4chan"
});
*/
// SET ENV
process.env.NODE_ENV = 'development';

const {
    app,
    BrowserWindow,
    Menu,
    ipcMain
} = electron;

let mainWindow;
let ThreadWindow;

// Listen for app to be ready
app.on('ready', function () {
    // Create new window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: '4Chan Master'
    });
    // Load html in window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function () {
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
/*
function createThreadWindow() {
    ThreadWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Thread'
    });
    ThreadWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'thread.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Handle garbage collection
    ThreadWindow.on('close', function () {
        ThreadWindow = null;
    });
}
*/

// Catch item:add

ipcMain.on('dl-single-image', (event, link) => {
    DownloadManager.download({
        url: link
    }, function (error, info) {
        if (error) {
            console.log(error);
            return;
        }

        console.log("DONE: " + info.url);
    });
})

ipcMain.on('dl-all-images', (event, links) => {
    DownloadManager.bulkDownload({
        urls: links,
        path: "4chan-download"
    }, function (error, finished, errors) {
        if (error) {
            console.log("finished: " + finished);
            console.log("errors: " + errors);
            ipcMain.on('temp', (event, arg) => {
                event.sender.send('finish-dl-all', false);
            })
            return;
        }
        ipcMain.on('temp', (event, arg) => {
            event.sender.send('finish-dl-all', true);
        })
        console.log("all finished");
    });
})

ipcMain.on('send-catalog-json', (event, link) => {
    https.get(link, function (res) {
        var info = '';

        res.on('data', function (chunk) {
            info += chunk;
        });

        res.on('end', function () {
            event.sender.send('get-catalog-json', info);
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
    });
})

ipcMain.on('send-thread-json', (event, link) => {
    https.get(link, function (res) {
        var info = '';

        res.on('data', function (chunk) {
            info += chunk;
        });

        res.on('end', function () {
            event.sender.send('get-thread-json', info);
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
    });
})

ipcMain.on('send-sub-thread-json', (event, link) => {
    https.get(link, function (res) {
        var info = '';

        res.on('data', function (chunk) {
            info += chunk;
        });

        res.on('end', function () {
            event.sender.send('get-sub-thread-json', info);
        });
    }).on('error', function (e) {
        console.log("Got an error: ", e);
    });
})

// Create menu template
const mainMenuTemplate = [
    // Each object is a dropdown
    {
        label: 'File',
        submenu: [{
                label: 'Coming Soon',
                click() {

                }
            },
            {
                label: 'Coming Soon',
                click() {
                    //mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If OSX, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
                role: 'reload'
            },
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    });
}