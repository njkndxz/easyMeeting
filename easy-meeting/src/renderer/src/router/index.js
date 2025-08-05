import { createRouter, createWebHashHistory } from "vue-router";


const router = createRouter({
    mode: "hash",
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/login",
            name: "login",
            component: () => import('@/views/login/Login.vue')
        },
        {
            path: "/",
            name: "home",
            component: () => import('@/views/Layout.vue'),
            redirect: "/meetingMain",
            children: [
                {
                    path: "/meetingMain",
                    name: "meetingMain",
                    component: () => import('@/views/meeting/MeetingMain.vue'),
                    meta: {
                        code: "meeting"
                    }
                },
                {
                    path: "/contact",
                    name: "contact",
                    component: () => import('@/views/contact/Contact.vue'),
                    meta: {
                        code: "contact"
                    }
                },
                {
                    path: "/screencap",
                    name: "screencap",
                    component: () => import('@/views/screencap/Screencap.vue'),
                    meta: {
                        code: "screencap"
                    }
                },
                {
                    path: "/setting",
                    name: "setting",
                    component: () => import('@/views/setting/Setting.vue'),
                    meta: {
                        code: "setting"
                    }
                }
            ]
        }
    ]
})

export default router;