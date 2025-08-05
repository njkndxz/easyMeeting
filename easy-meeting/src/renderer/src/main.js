import './assets/base.scss'
import './assets/icons/iconfont.css'

import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import router from '@/router'

import request from '@/utils/Request'
import Api from '@/utils/Api'
import * as Utils from '@/utils/Utils'
import * as Verify from '@/utils/Verify'
import { Confirm, Alert } from '@/utils/Confirm'

import Header from "@/components/Header.vue"
import TitleBar from '@/components/TitleBar.vue'
import NoData from '@/components/NoData.vue'
import Dialog from '@/components/Dialog.vue'


import { createPinia } from 'pinia'
const pinia = createPinia()
const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(pinia)

app.component("Header", Header)
app.component("TitleBar", TitleBar)
app.component("NoData", NoData)
app.component("Dialog", Dialog)


app.config.globalProperties.Request = request
app.config.globalProperties.Api = Api
app.config.globalProperties.Utils = Utils
app.config.globalProperties.Verify = Verify
app.config.globalProperties.Confirm = Confirm
app.config.globalProperties.Alert = Alert

app.mount('#app')

