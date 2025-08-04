<template>
    <Header :showBottomBorder="true"></Header>
    <div class="body-main">
        <template v-if="recordStatus === 0">
            <div class="setting-panel">
                <div>录制设置</div>
                <div class="device-panel">
                    <div class="device-title">音频输入</div>
                    <!-- <MicIcon v-model="micInfo" ref="micInfoRef" @click="openOrClose"></MicIcon> -->
                </div>
                <div class="record-btn">
                    <el-button class="btn" type="primary" size="large" @click="startRecord">开始录制</el-button>
                </div>
            </div>
            <div class="screen-panel">
                <div class="screen-select">选择录制屏幕</div>
                <ScreenSelect ref="screenSelectRef" @selectScreenDisplayId="screenDisplayIdHandler"></ScreenSelect>
            </div>
        </template>
        <template v-else>
            <div class="recording-panel">
                <div v-if="recordStatus === 1" class="status-tips">开始录制中,请稍后...</div>
                <div v-if="recordStatus === 3" class="status-tips">停止录制中,请稍后...</div>
                <div v-if="recordStatus === 2" class="recording-time">录制中:{{ proxy.Utils.convertSecondsToHMS(recordTime,
                    true) }}</div>
                <div :class="['iconfont icon-stop', recordTime < 3 ? 'stop-disable' : '']" v-if="recordStatus === 2">
                    <el-button class="btn" type="primary" size="large" @click="stopRecord">停止录制</el-button>
                </div>
                <div v-if="recordStatus === 4">
                    <div class="file-panel">
                        <div class="file-path" :title="filePath">{{ filePath }}</div>
                        <div class="iconfont icon-folder" @click="openFile">打开文件</div>
                    </div>
                    <el-button type="primary" @click="restart">
                        <span class="iconfont icon-narrow-left"></span>继续录制
                    </el-button>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ScreenSelect from './ScreenSelect.vue'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

//0初始化 1开始录制 2录制中 3停止录制中 4停止录制
const recordStatus = ref(0)
const screenDisplayId = ref()
const screenDisplayIdHandler = (_screenDisplayId) => {
    screenDisplayId.value = _screenDisplayId
}

const startRecord = () => {
    recordStatus.value = 1
    window.electron.ipcRenderer.invoke('startRecording', {
        displayId: screenDisplayId.value,
        mic: ''
    })
}

const stopRecord = () => {
    recordStatus.value = 3
    window.electron.ipcRenderer.invoke('stopRecording')
}

const recordTime = ref(1)
const filePath = ref()
const listenRecordTime = () => {
    window.electron.ipcRenderer.on('recordTime', (e, _recordTime) => {
        recordTime.value = _recordTime
        // 时间太短会有问题，要超过1秒才结束
        if (_recordTime === 1) {
            recordStatus.value = 2
        }
    })

    window.electron.ipcRenderer.on('finishRecording', (e, _filePath) => {
        recordStatus.value = 4
        filePath.value = _f
    })
}

onMounted(() => {
    listenRecordTime()
})

const openFile = () => {
    window.electron.ipcRenderer.send('openLocalFile', { localFilePath: filePath.value })
}

const restart = () => {
    recordStatus.value = 0
    recordTime.value = 0
    startRecord()
}

</script>

<style lang="scss" scoped>
.body-main {
    height: calc(100vh - 32px);
    display: flex;

    .setting-panel {
        width: 300px;
        padding: 20px;
        position: relative;

        .device-panel {
            margin-top: 5px;

            .device-title {
                font-size: 13px;
                margin: 5px 0;
            }
        }

        #preview {
            width: 200px;
            height: 150px;
            background: #000;
            margin: 10px 0;
        }

        .record-btn {
            position: absolute;
            left: 20px;
            right: 20px;
            bottom: 20px;

            .btn {
                width: 100%;
            }
        }
    }

    .screen-panel {
        flex: 1;
        background: #f3f3f4;
        padding: 20px;
    }

    .recording-panel {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .status-tips {
            margin-bottom: 20px;
        }

        .icon-stop {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: red;
            cursor: pointer;

            &::before {
                font-size: 50px;
                margin-right: 4px;
            }
        }

        .stop-disable {
            color: rgba(255, 0, 0, 0.5);
            pointer-events: none;
            cursor: not-allowed;
        }

        .fill-panel {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;

            .fill-path {
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 3px 5px;
                width: 300px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }

            .icon-folder {
                cursor: pointer;
                margin-left: 10px;
                font-size: 14px;
                display: flex;
                align-items: center;
                color: #555555;

                &::before {
                    font-size: 28px;
                    color: var(--blue);
                    margin-right: 2px;
                }
            }
        }
    }
}
</style>