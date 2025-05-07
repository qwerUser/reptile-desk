/*
 * @Description: 
 * @Date: 2025-04-27 15:45:50
 * @LastEditTime: 2025-05-06 17:50:24
 */
console.log('main.js');
const { app, BrowserWindow } = require('electron')
const url = require('url');
const path = require('path');
const env = require('../../env/index');
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    title: `test`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })
  console.log('----', process.env.NODE_ENV)
  if (process.env.NODE_ENV === 'development') {
    console.log('development');
    loadURL = 'http://localhost:4578'; // URL for development
    
    win.webContents.on('did-finish-load', () => {
      win.webContents.openDevTools();
    });
  } else {
    loadURL = url.format({
      pathname: path.join(env.outputPath, 'index.html'),
      protocol: 'file:',
      slashes: true,
    });
  }
  win.loadURL(loadURL);
}

app.on('ready', () => {
  const { initializeDatabase } = require('./database');
  const { initIpc } = require('./ipc');
  initializeDatabase();
  initIpc();
  createWindow();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});