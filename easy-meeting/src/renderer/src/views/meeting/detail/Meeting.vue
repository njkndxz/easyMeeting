<template>
    <div>
        <Header>
            <TitleBar :showMax="true" :closeType="0" :styleTop="6" :styleRight="10" :borderRadius="5" ref="titlebarRef"
                :forceClose="false"></TitleBar>
        </Header>

        <template v-if="inited">
            <div class="meeting-panel">
                <div :class="['layout', LAYOUT_CLASS[layoutType]]">
                    <MemberList :deviceInfo="deviceInfo" @exitMeeting="forceExit" @selectMember="selectMemberHandler"></MemberList>
                    <div :class="['show-panel', transformShowPanelVideo && !screenId ? 'transform-video' : '']"
                        v-show="layoutType !== 0" :style="{ height: `calc(100vh - ${(layoutType == 1 ? 123 : 0) + 90})px` }">
                        <video v-show="openVideoRef" muted autoplay ref="centerScreenRef" playsinline loop></video>
                        <div v-show="!openVideoRef" class="user-info">
                            <Avatar :avatar="selectUserInfo.userId"></Avatar>
                            <div :class="['user-name', 'iconfont', proxy.Utils.getSexIcon(selectUserInfo.sex)]">{{ selectUserInfo.nickName }}</div>
                        </div>
                    </div>
                </div>

                <SplitLine v-show="memberOpened || chatOpened" :initWidth="initRightWidth" @widthChange="widthChange"></SplitLine>
                <div v-show="memberOpened || chatOpened" :style="{width: rightWidth + 'px'}">
                    <MemberPanel v-show="memberOpened" ref="memberPanelRef"></MemberPanel>
                </div>
            </div>
            <Footer :deviceInfo="deviceInfo" @openChat="openChatHandler" @openMember="openMemberHandler"></Footer>
        </template>
        <template v-else>
            <div class="check-env">正在检查系统环境...</div>
        </template>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from './Header.vue'
import Footer from './Footer.vue'
import MemberList from './MemberList.vue'
import SplitLine from './SplitLine.vue'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import MemberPanel from '../../member/MemberPanel.vue'

const userInfoStore = useUserInfoStore()

const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()


const inited = ref(false)
const deviceInfo = ref({})
const layoutType = ref(0)

const initEnv = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const defaultMic = devices.find(device => device.kind == 'audioinput')
    const sysSetting = await window.electron.ipcRenderer.invoke('getSysSetting')
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
    }).catch(error => {
        console.log("获取摄像头失败", error);
    })

    deviceInfo.value = {
        micEnable: defaultMic != null,
        cameraEnable: stream != null,
        micOpen: sysSetting.openMic,
        cameraOpen: sysSetting.openCamera
    }

    inited.value = true
}
initEnv()

const LAYOUT_CLASS = {
    0: 'layout-grid',
    1: 'layout-top',
    2: 'layout-right'
}

const layoutChangeHandler = (type) => {
    layoutType.value = type
}

const titlebarRef = ref()
const closeMeeting = () => {
    proxy.Confirm({
        message: '确定要退出会议吗?',
        okfun: () => {
            titlebarRef.value.custClose()
        }
    })
}

const forceExit = () => {
    titlebarRef.value.custClose()
}

const screenId = ref()
const shareScreenHandler = (_screenId) => {
    screenId.value = _screenId
}

const centerScreenRef = ref()
const transformShowPanelVideo = ref(false)
const openVideoRef = ref(true)
const selectUserInfo = ref({})
const selectMemberHandler = async ({srcObject, userId, sex, nickName, openVideo}) => {
    if(layoutType.value == 0) {
        return
    }

    selectUserInfo.value = {
        userId,
        nickName,
        sex
    }

    openVideoRef.value = openVideo
    await nextTick()
    centerScreenRef.value.srcObject = srcObject
    if(userId == userInfoStore.userInfo.userId) {
        transformShowPanelVideo.value = true
    } else {
        transformShowPanelVideo.value = false
    }

}

onMounted(() => {
    mitter.on('layoutChange', layoutChangeHandler)
    mitter.on('shareScreen', shareScreenHandler)
    window.electron.ipcRenderer.on('preCloseWindow', () => {
        closeMeeting()
    })
})

onUnmounted(() => {
    mitter.off('layoutChange', layoutChangeHandler)
    mitter.off('shareScreen', shareScreenHandler)
    window.electron.ipcRenderer.removeAllListeners('preCloseWindow')
})

// 右侧内容
const initRightWidth = 400
const rightWidth = ref(initRightWidth)
const widthChange = (width) => {
    rightWidth.value = width
}

const memberOpened = ref(false)
const chatOpened = ref(false)

const openMemberHandler = () => {
    memberOpened.value = !memberOpened.value
    chatOpened.value = false
}

const openChatHandler = () => {
    chatOpened.value = !chatOpened.value
    memberOpened.value = false
}

</script>

<style lang="scss" scoped>
.meeting-panel {
    display: flex;

    .layout {
        flex: 1;
        height: calc(100vh- 92px);

        .show-panel {
            display: flex;
            align-items: center;
            justify-content: center;

            video {
                height: 100%;
                width: 100%;
                object-fit: contain;
            }

            .user-info {
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;

                .user-name {
                    margin-top: 5px;
                    font-size: 13px;
                    color: #575757;
                    display: flex;
                    align-items: center;

                    &::before {
                        color: var(--blue);
                        margin-right: 1px;
                        font-size: 16px;
                    }
                }

                .icon-woman {
                    &::before {
                        color: #fb7373;
                    }
                }
            }
        }

        .transform-video {
            video {
                transform: scaleX(-1);
            }
        }
    }

    .layout-top {
        margin: 0 auto;
        text-align: center;

        .show-panel {
            border-top: 1px solid #ddd;
        }
    }
}

.check-env {
    height: calc(100vh - 42px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #797979;
}
</style>