/*
 * @Description: 
 * @Date: 2025-04-28 09:52:19
 * @LastEditTime: 2025-04-29 17:35:50
 */
import { invokeIpcRenderer} from './common.js';
const getTaskDataList = async (data) => {
  return await invokeIpcRenderer('get-task-data-list', data);
}

const deleteTaskData = async (id) => {
  return await invokeIpcRenderer('delete-task-data', id);
}
export {
  getTaskDataList,
  deleteTaskData
};
