/*
 * @Description: 
 * @Date: 2025-04-28 09:49:12
 * @LastEditTime: 2025-04-29 17:28:38
 */
const { initTaskListHandlers } = require('./channels/taskList');
const { initTaskDataListHandlers } = require('./channels/taskDataList');

const initIpc = () => {
  initTaskListHandlers();
  initTaskDataListHandlers();
};

module.exports = {
  initIpc,
};
