import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useToastStore } from '@/stores/toast'

import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.errorHandler = (err, _instance, info) => {
    console.error('[Vue error]', info, err)
    useToastStore(pinia).error('Đã có lỗi xảy ra', 'Vui lòng thử lại. Nếu lỗi lặp lại, hãy tải lại trang.')
}

// Promise bị reject không được .catch()
window.addEventListener('unhandledrejection', (e) => {
    console.error('[Unhandled rejection]', e.reason)
    useToastStore(pinia).error('Đã có lỗi xảy ra', 'Vui lòng thử lại.')
})

app.mount('#app')