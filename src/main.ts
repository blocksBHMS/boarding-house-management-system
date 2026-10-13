import './main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.router'
import { onUnauthorized } from './services/api'
import { clearSession } from './services/session'

onUnauthorized(() => {
  clearSession()
  router.push('/login')
})

createApp(App).use(router).mount('#app')