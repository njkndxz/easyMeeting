<template>
    <div class="layout">
        <div class="left">
            <div class="top-panel">
                <div class="avatar"></div>
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
                <template v-for="item in leftBottomMenus">
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
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useContactStore } from '@/stores/UserContactStore'
import { mitter } from '@/eventbus/eventbus'

const contactStore = useContactStore()
const userInfoStore = useUserInfoStore()

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
        return
    }

    router.push(menu.path)
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
            default:
                break
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

watch(() => contactStore.updateLastUpdateTime, (newVal, oldVal) => {
    if (!newVal) {
        return
    }

    loadContactApplyCount()
}, { immediate: true, deep: true })

onMounted(() => {
    listenMessage()
})

onUnmounted(() => {
    window.electron.ipcRenderer.removeAllListeners('mainMessage')
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