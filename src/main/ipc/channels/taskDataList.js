/*
 * @Description: 
 * @Date: 2025-04-29 17:26:25
 * @LastEditTime: 2025-04-29 17:36:56
 */
const { ipcMain } = require('electron');
const database = require('../../database');
const Db = database.Database;
const db = new Db();
function initTaskDataListHandlers() {
  ipcMain.handle('get-task-data-list', async (event, args) => {
    const result = await db.select('reptileData', args);
    return result;
  });

  ipcMain.handle('delete-task-data', async (event, id) => {
    const result = await db.delete('reptileData', `id = ${id}`);
    return result;
  });
}
module.exports = {
  initTaskDataListHandlers,
};