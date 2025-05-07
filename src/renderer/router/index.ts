/*
 * @Description: 
 * @Date: 2025-04-27 15:55:45
 * @LastEditTime: 2025-04-28 14:20:32
 */
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/taskList/index.vue'),
    },
    {
      path: '/taskDataList',
      name: 'taskDataList',
      component: () => import('@/views/taskDataList/index.vue'),
    },
    {
      path: '/taskList',
      name: 'taskList',
      component: () => import('@/views/taskList/index.vue'),
    },
    {
      path: '/createTask',
      name: 'createTask',
      component: () => import('@/views/taskList/createTask.vue'),
    }
  ],
})

export default router