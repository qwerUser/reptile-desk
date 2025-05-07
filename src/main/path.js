/*
 * @Description: 
 * @Date: 2025-04-28 09:07:28
 * @LastEditTime: 2025-05-07 17:43:45
 */
const path = require('path');

// 尝试获取 userDataPath
function getUserDataPath() {
  // 当在主进程中运行时，直接从 Electron 的 app 模块获取路径
  try {
    const { app } = require('electron');
    return app.getPath('userData');
  } catch (error) {
    console.log('getUserDataPath  error-------', error);
    // 当在子进程或非 Electron 环境中运行时，从环境变量获取
    return (
      process.env.userDataPath ?? path.join(__dirname, '../../../userData')
    );
  }
}
const userDataPath = getUserDataPath();

const DATABASE_PATH = path.join(userDataPath, 'database.db');
console.log('DATABASE_PATH---', DATABASE_PATH);

module.exports = {
  DATABASE_PATH
};