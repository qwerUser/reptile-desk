/*
 * @Description: 
 * @Date: 2025-04-27 15:54:18
 * @LastEditTime: 2025-04-27 15:54:28
 */
import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router)

app.mount('#app')
