// Modules to control application life and create native browser window
import {app, BrowserWindow, globalShortcut} from "electron";
import * as path from "path";

const activeWin = require("active-win");
const shortcuts = require("electron-localshortcut");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow|null;

function hide() {
  if (mainWindow) {
    mainWindow.blur();
    mainWindow.hide();
  }
}

function show() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 640,
    height: 320,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    },
    closable: false,
    frame: false
  });

  shortcuts.register(mainWindow, "Esc", hide);
  shortcuts.register(mainWindow, "CommandOrControl+F4", hide);
  shortcuts.register(mainWindow, "Alt+F4", () => app.quit());
  shortcuts.register(mainWindow, "CommandOrControl+W", hide);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  const globalShow = globalShortcut.register("Super+F3", async () => {
    let activeWindow = activeWin();
    if (mainWindow && mainWindow.isVisible()) {
      hide();
    } else {
      show();
    }
    console.log(activeWindow);
  });

  // mainWindow.on("blur", () => mainWindow.hide());

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    globalShortcut.unregisterAll();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
try {
  require('electron-reloader')(module);
} catch (err) {}
