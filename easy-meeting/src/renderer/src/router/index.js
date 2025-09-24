import { createRouter, createWebHashHistory } from "vue-router";


const router = createRouter({
    mode: "hash",
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "login",
            component: () => import('@/views/login/Login.vue')
        },
        {
            path: "/meeting",
            name: "meeting",
            component: () => import('@/views/meeting/detail/Meeting.vue')
        },
        {
            path: "/home",
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
                },
            ]
        },
        {
            path: "/showMedia",
            name: "showMedia",
            component: () => import('@/views/meeting/chat/ShowMedia.vue'),
            meta: {
                code: "showMedia"
            }
        },
        {
            path: "/meetingReserve",
            name: "meetingReserve",
            component: () => import('@/views/meeting/history/MeetingReserve.vue'),
            meta: {
                code: "meetingReserve"
            }
        },
        {
            path: "/meetingAll",
            name: "meetingAll",
            component: () => import('@/views/meeting/history/MeetingAll.vue'),
            meta: {
                code: "meetingAll"
            }
        },
        {
            path: "/meetingMember",
            name: "meetingMember",
            component: () => import('@/views/meeting/history/MeetingMember.vue'),
            meta: {
                code: "meetingMember"
            }
        },
        {
            path: "/meetingMessage",
            name: "meetingMessage",
            component: () => import('@/views/meeting/history/MeetingMessage.vue'),
            meta: {
                code: "meetingMessage"
            }
        },
    ]
})

export default router;