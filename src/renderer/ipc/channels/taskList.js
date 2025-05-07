/*
 * @Description: 
 * @Date: 2025-04-28 09:52:19
 * @LastEditTime: 2025-05-06 17:39:27
 */
import { invokeIpcRenderer} from './common.js';
const getTaskList = async () => {
  return await invokeIpcRenderer('get-task-list');
}
const setTaskData = async (data) => {
  return await invokeIpcRenderer('set-task-data', data);
}

const updateTaskData = async (data, id) => {
  return await invokeIpcRenderer('update-task-data', data, id);
}

const createTaskCode = async () => {
  return await invokeIpcRenderer('create-task-code');
}

const getTaskDataById = async (id) => {
  return await invokeIpcRenderer('get-task-data-by-id', id);
}

const runTaskById = async (id, data = {}) => {
  return await invokeIpcRenderer('handle-run-task', id, data);
}
export {
  getTaskList,
  setTaskData,
  updateTaskData,
  createTaskCode,
  getTaskDataById,
  runTaskById
};
