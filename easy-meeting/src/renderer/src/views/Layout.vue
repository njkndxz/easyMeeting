<template>
    <div class="layout">
        <div class="left">
            <div class="top-panel">
                <div class="avatar">
                    <Avatar ref="avatarRef" :width="30" :avatar="userInfoStore.userInfo.avatar" :update="true"
                        @click="showUserInfo"></Avatar>
                </div>
                <div class="top-menus">
                    <div :class="['menu-item', item.codes.includes(route.meta.code) ? 'active' : '']"
                        v-for="item in leftTopMenus" @click="jumpMenu(item)">
                        <el-badge :value="item.messageCount" :max="99" :hidden="item.messageCount == 0"
                            :offset="[-5, 0]">
                            <div :class="['iconfont', 'icon-' + item.icon]"></div>
                            <div class="name">{{ item.name }}</div>
                        </el-badge>
                    </div>
                </div>
            </div>
            <div class="bottom-menus">
                <template v-for="item in leftBottomMenus" :key="item.name">
                    <div :class="['menu-item', item.codes.includes(route.meta.code) ? 'active' : '']"
                        v-if="!item.onlyAdmin || (item.onlyAdmin && userInfoStore.userInfo.admin)"
                        @click="jumpMenu(item)">
                        <div :class="['iconfont', 'icon-' + item.icon]"></div>
                    </div>
                </template>
            </div>
        </div>
        <div class="right">
            <router-view></router-view>
        </div>
    </div>

    <UpdateUser ref="updateUserRef" @reloadInfo="reloadInfoHandler"></UpdateUser>
    <AppUpdate></AppUpdate>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useContactStore } from '@/stores/UserContactStore'
import { useMeetingStore } from '@/stores/MeetingStore'
import { mitter } from '@/eventbus/eventBus'
import UpdateUser from './UpdateUser.vue'
import AppUpdate from '../AppUpdate.vue'
import { ElLoading } from 'element-plus'

const contactStore = useContactStore()
const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const leftTopMenus = ref([
    {
        name: '会议',
        icon: 'video',
        path: '/meetingMain',
        codes: ['meeting'],
        messageCount: 0
    },
    {
        name: '通讯录',
        icon: 'contact',
        path: '/contact',
        codes: ['contact'],
        messageCount: 0
    },
    {
        name: '录制',
        icon: 'record',
        path: '/screencap',
        codes: ['screencap'],
        messageCount: 0
    }
])

const leftBottomMenus = ref([
    {
        icon: 'setting',
        path: '/setting',
        codes: ['setting'],
        onlyAdmin: false
    },
    {
        icon: 'admin',
        codes: [],
        btnType: 'admin',
        onlyAdmin: true
    },
])

const jumpMenu = (menu) => {
    if (menu.btnType === "admin") {
        // 去管理后台
        window.electron.ipcRenderer.send('openWindow', {
            title: '管理后台',
            windowId: 'adminWindow',
            path: '/admin',
            width: 1310,
            height: 800
        })
        return
    }

    router.push(menu.path)
}

const acceptInvite = async (meetingId) => {
    let result = await proxy.Request({
        url: proxy.Api.acceptInvite,
        params: {
            meetingId
        }
    })

    if (!result) {
        return
    }

    window.electron.ipcRenderer.send("openWindow", {
        title: '会议详情',
        windowId: 'meeting',
        path: '/meeting',
        width: 1310,
        height: 800,
        maximizable: true
    })
}

const listenMessage = () => {
    window.electron.ipcRenderer.on("mainMessage", (e, messageObj) => {
        console.log("收到消息", messageObj)
        switch (messageObj.messageType) {
            case 8:
                contactStore.updateLastUpdateTime()
                break
            case 12:
                let result = ""
                if (messageObj.messageContent == 1) {
                    mitter.emit('reloadContact')
                    result = "已同意你的申请"
                } else if (messageObj.messageContent == 2) {
                    result = "已拒绝你的申请"
                } else if (messageObj.messageContent == 3) {
                    result = "已将你拉黑"
                }
                proxy.Alert(`【${messageObj.sendUserNickName}${result}】`)
                break
            case 1://加入会议
                const newMember = messageObj.messageContent.newMember
                if (newMember.userId === userInfoStore.userInfo.userId) {
                    meetingStore.updateMeeting(true)
                }
                break;
            case 3://退出会议
                const { exitStatus, exitUserId } = JSON.parse(messageObj.messageContent)
                // 3是踢出会议 4是被拉黑 2是自己退出
                if ((exitStatus == 3 || exitStatus == 4) && exitUserId == userInfoStore.userInfo.userId) {
                    proxy.Confirm({
                        message: '你被强制退出会议了',
                        showCancelBtn: false
                    })
                }
                if (exitStatus == 2 || exitStatus == 4 || exitStatus == 3) {
                    meetingStore.updateMeeting(false)
                }
                break;
            case 4: //结束会议
                meetingStore.updateMeeting(false)
                proxy.Confirm({
                    message: '会议已结束, 你已退出会议',
                    showCancelBtn: false
                })
                break;
            case 9://邀请入会
                if (meetingStore.inMeeting) {
                    return
                }
                const { meetingName, meetingId, inviteUserName } = JSON.parse(messageObj.messageContent)
                proxy.Confirm({
                    message: `【${inviteUserName}】邀请你加入会议【${meetingName}】`,
                    okText: '接受邀请',
                    cancelText: '拒绝',
                    okfun: () => {
                        acceptInvite(meetingId)
                    }
                })
                break;
            case 10: // 强制退出
                proxy.Alert('你被管理员强制退出', async () => {
                    await window.electron.ipcRenderer.invoke('logout')
                    router.push('/')
                })
                break;
            default:
                break;
        }
    })
}

const loadContactApplyCount = async () => {
    const result = await proxy.Request({
        url: proxy.Api.loadContactApplyDealWithCount,
    })

    if (!result) {
        return
    }

    leftTopMenus.value[1].messageCount = result.data
}

const updateUserRef = ref()
const showUserInfo = () => {
    updateUserRef.value.show()
}

const avatarRef = ref()
const reloadInfoHandler = (data) => {
    userInfoStore.setInfo(data)
    avatarRef.value.updateAvatarUrl()
}

watch(() => contactStore.updateLastUpdateTime, (newVal, oldVal) => {
    if (!newVal) {
        return
    }

    loadContactApplyCount()
}, { immediate: true, deep: true })

// ws断开重连
let reconnectLoading = null
const listenReconnect = () => {
    window.electron.ipcRenderer.on('reconnect', (e, connectSuccess) => {
        if (reconnectLoading == null && !connectSuccess) {
            reconnectLoading = ElLoading.service({
                lock: true,
                text: '与服务器断开连接，正在重连......',
                background: 'rgba(0, 0, 0, 0.7)',
            });
        }

        if (connectSuccess) {
            proxy.Message.success('重连成功')

            if (reconnectLoading != null) {
                reconnectLoading.close()
                reconnectLoading = null
            }
        }
    })
}

// 监听退出登录
const listenLogout = () => [
    window.electron.ipcRenderer.on('logout', (e, connectSuccess) => {
        if (reconnectLoading != null) {
            reconnectLoading.close()
            reconnectLoading = null
        }
        router.push('/')
    })
]

onMounted(() => {
    listenMessage()
    listenReconnect()
    listenLogout()
})

onUnmounted(() => {
    window.electron.ipcRenderer.removeAllListeners('mainMessage')
    window.electron.ipcRenderer.removeAllListeners('reconnect')
    window.electron.ipcRenderer.removeAllListeners('logout')
})

</script>

<style lang="scss" scoped>
.layout {
    display: flex;

    .left {
        width: 64px;
        background: #f3f3f4;
        margin: 0 auto;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: space-between;
        -webkit-app-region: drag;

        .top-panel {
            text-align: center;

            .avatar {
                display: flex;
                justify-content: center;
                -webkit-app-region: no-drag;
                margin: 40px 0 20px 0;
            }
        }

        .bottom-menus {
            margin-bottom: 30px;
        }

        .menu-item {
            text-align: center;
            -webkit-app-region: no-drag;
            cursor: pointer;
            margin-bottom: 20px;
            color: #4c5262;

            .iconfont {
                font-size: 20px;
            }

            .name {
                margin-top: 5px;
                font-size: 12px;
            }

            &:hover {
                color: #353535;
            }

            &:last-child {
                margin-bottom: 0;
            }
        }

        .active {
            .iconfont {
                color: var(--blue);
            }

            .name {
                color: var(--blue);
            }
        }
    }

    .right {
        flex: 1;
        height: calc(100vh);
    }
}
</style>