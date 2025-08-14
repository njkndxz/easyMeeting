<template>
    <div>
        <Header>
            <TitleBar :showMax="true" :closeType="0" :styleTop="6" :styleRight="10" :borderRadius="5" ref="titlebarRef" :forceClose="false"></TitleBar>
        </Header>

        <template v-if="inited">
            <div class="meeting-panel">
                <div :class="['layout', LAYOUT_CLASS[layoutType]]">
                    <MemberList :deviceInfo="deviceInfo"></MemberList>
                    <div v-show="layoutType !== 0">
                        
                    </div>
                </div>
            </div>
            <Footer :deviceInfo="deviceInfo"></Footer>
        </template>
        <template v-else>
            <div class="check-env">正在检查系统环境...</div>
        </template>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Header from './Header.vue'
import Footer from './Footer.vue'
import MemberList from './MemberList.vue'
import { useMeetingStore } from '@/stores/MeetingStore'


const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()


const inited = ref(false)
const deviceInfo = ref({})
const layoutType = ref()

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

onMounted(() => {
    mitter.on('layoutChange', layoutChangeHandler)

    window.electron.ipcRenderer.on('preCloseWindow', () => {
        closeMeeting()
    })
})

onUnmounted(() => {
    mitter.off('layoutChange', layoutChangeHandler)

    window.electron.ipcRenderer.removeAllListeners('preCloseWindow')
})
</script>

<style lang="scss" scoped>
.meeting-panel {
    display:flex;
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
                display:flex;
                flex-direction:column;
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