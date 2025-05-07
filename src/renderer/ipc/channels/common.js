/*
 * @Description: 
 * @Date: 2025-04-28 10:00:56
 * @LastEditTime: 2025-04-28 10:00:59
 */
function getIpcRenderer() {
  if (window.require) {
    const { ipcRenderer } = window.require('electron');
    return ipcRenderer;
  } else {
    console.log('window.require not found');
    return null;
  }
}

async function invokeIpcRenderer(channel, ...args) {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    return await ipcRenderer.invoke(channel, ...args);
  }
  return null;
}

function sendIpcRenderer(channel, ...args) {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    ipcRenderer.send(channel, ...args);
  }
}

function onIpcRenderer(channel, callback) {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    ipcRenderer.on(channel, callback);
  }
}
export {
  invokeIpcRenderer,
  sendIpcRenderer,
  onIpcRenderer
}