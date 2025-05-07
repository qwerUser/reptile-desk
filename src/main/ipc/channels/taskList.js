/*
 * @Description: 
 * @Date: 2025-04-28 09:49:42
 * @LastEditTime: 2025-05-07 17:15:20
 */
const { ipcMain } = require('electron');
const database = require('../../database');
const Db = database.Database;
const db = new Db();
const { getUpperStrRandom } = require('../../plugins/tools');
const uuid = require('uuid')

const { runTask } = require('../../puppeteer/index');
function initTaskListHandlers() {

  ipcMain.handle('get-task-list', async (event, args) => {
    const result = await db.select('taskList');
    return result
  });

  ipcMain.handle('set-task-data', async (event, data) => {
    const result = await db.insert('taskList', data)
    return result;
  });
  
  ipcMain.handle('update-task-data', async (event, data, id) => {
    const result = await db.update('taskList', data, `id = ${id}`)
    return result;
  });
  // 生成任务code
  ipcMain.handle('create-task-code', async (event) => {
    let hasCode = true;
    let code = '';
    while(hasCode) {
      code = getUpperStrRandom(7);
      const result = await db.select('taskList', ` WHERE code = '${code}'`);
      if(!result || result.length === 0) {
        hasCode = false;
      }
    }
    return code;
  })

  ipcMain.handle('get-task-data-by-id', async (event, id) => {
    const result = await db.select('taskList', ` WHERE id = ${id}`)
    return result;
  });
  
  const pageCache = {};
  // 执行某个任务
  ipcMain.handle('handle-run-task', async (event, id, { randomCode = '', startIndex = 0, code = '' }) => {
    const result = await db.select('taskList', ` WHERE id = ${id}`);
    console.log(result);
    let res = null;
    if(result && result.length > 0) {
      const data = result[0];
      const list = JSON.parse(data.taskJson);
      const randomStr = randomCode || uuid.v4();
      console.log('randomStr-----', randomStr);
      if(randomCode && pageCache[randomCode]) {
        res = await runTask(list, randomStr, { stopPage: pageCache[randomCode] || null, startIndex, code })
      } else {
        res = await runTask(list, randomStr, { stopPage: null, startIndex });
        delete pageCache[res.randomStr];
      }
      if(res.type === 'waitCode') {
        pageCache[res.randomStr] = res.page;
      }
      const reptileDataList = await db.select('reptileData', ` WHERE taskCode = '${result[0].code}'`);
      let json = null;
      // 如果已经存在就更新
      if(reptileDataList && reptileDataList.length > 0) {
        json = reptileDataList[0].json ? JSON.parse(reptileDataList[0].json) : '';
        if(json || res.apiResult) {
          const keys = [...new Set(Object.keys(json||{})), ...new Set(Object.keys(res.apiResult || {}))]
          for(let i = 0; i < keys.length; i++) {
            json[keys[i]] = [...(json[keys[i]] || []), ...(res.apiResult[keys[i]] || [])];
          }
        }
        await db.update('reptileData', { json: json ? JSON.stringify(json) : '' }, `taskCode = '${result[0].code}'`);
      } else {
        const insertRes = await db.insert('reptileData', { taskCode: result[0].code, json: res.apiResult ? JSON.stringify(res.apiResult) : '' })
      }
      
    }
    return res && res.type ? res : (!!res);
  })
}
module.exports = {
  initTaskListHandlers,
};
