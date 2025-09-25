<template>
    <div v-if="showUpdate">
        <div class="update-container drag"></div>
        <div class="update-panel no-drag">
            <div class="update-inner">
                <div class="update-content">
                    <div class="update-content-title">更新内容</div>
                    <div class="update-list">
                        <div v-for="(item, index) in updateInfo.updateList">{{ index + 1 }}、{{ item }}</div>
                    </div>
                </div>
                <div class="download-progress" v-if="downloading">
                    <div v-if="downloadPercent.progress != 100">
                        <el-progress :percentage="downloadPercent.progress" />
                        <div class="download-tips">
                            正在下载，请稍后({{
                                proxy.Utils.size2Str(downloadPercent.loaded)}}/{{ proxy.Utils.size2Str(downloadPercent.total) }})
                        </div>
                    </div>
                    <div v-else class="finish-tips">下载完成，准备安装...</div>
                </div>
                <div class="op-btn" v-else>
                    <div class="cancel" @click="cancelUpdateHandler">残忍拒绝</div>
                    <div class="update" @click="startDownload">更新</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useMeetingStore } from '@/stores/MeetingStore'
import { mitter } from '@/eventbus/eventBus'
import config from '../../../package.json'


const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const props = defineProps({
    autoUpdater: {
        type: Boolean,
        default: true
    }
})

const showUpdate = ref(false)
const updateInfo = ref({
    size: 0,
    updateList: []
})

const checkUpdateAuto = async (data) => {
    let result = await proxy.Request({
        url: proxy.Api.checkVersion,
        params: {
            appVersion: config.version,
            uid: userInfoStore.getInfo().userId
        }
    })

    if (!result) {
        return
    }

    if(result.data == null) {
        if(!auto) {
            proxy.Confirm({
                message: '已经是最新版本!',
                showCancelBtn: false
            })
        }
        return
    }

    showUpdate.value = true
    updateInfo.value = result.data
}

const cancelUpdateHandler = () => {
    showUpdate.value = false
}

const downloading = ref(false)
const downloadPercent = ref({
    progress: 0,
    loaded: 0,
    total: updateInfo.value.size
})

const startDownload = () => {
    if(updateInfo.value.fileType == 0) {
        downloading.value = true
        window.electron.ipcRenderer.send('downloadUpdate', {
            fileName: updateInfo.value.fileName,
            id: updateInfo.value.id,
            downloadUrl: import.meta.env.VITE_DOMAIN + proxy.Api.donwloadUpdate
        })
    } else if(updateInfo.value.fileType == 1) {
        window.electron.ipcRenderer.send('openUrl', {
            url: updateInfo.value.outerLink
        })
    }
}

onMounted(() => {
    if(props.autoUpdater) {
        checkUpdateAuto(true)
    }

    window.electron.ipcRenderer.on('updateDownloadCallback', (e, loaded) => {
        downloadPercent.value.loaded = loaded
        downloadPercent.value.progress = Math.floor((loaded / updateInfo.value,size) * 100)
        if(downloadPercent.value.progress == 100) {
            setTimeout(() => {
                showUpdate.value = false
            }, 1500);
        }
    })
})

onUnmounted(() => {
    window.electron.ipcRenderer.removeAllListeners('updateDownloadCallback')
})

const checkUpdate = () => {
    checkUpdateAuto(false)
}

defineExpose({
    checkUpdate
})
</script>

<style lang="scss" scoped>
.update-container {
    opacity: 0.2;
    background: #000;
    z-index: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: calc(100vh);
}

.update-panel {
    -webkit-app-region: no-drag;
    top: 30px;
    left: 0;
    width: 100%;
    position: absolute;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;

    .update-inner {
        background-image: url('@/assets/update_bg.png');
        background-size: 100%;
        background-position: top center;
        background-repeat: no-repeat;
        width: 350px;
        min-height: 400px;

        .update-content {
            margin-top: 230px;
            background: #fff;
            padding: 15px;

            .update-content-title {
                font-size: 18px;
                color: #000;
            }

            .update-list {
                margin-top: 5px;
                max-height: 80px;
                overflow: auto;
            }
        }

        .download-progress {
            background: #fff;
            padding: 10px;
            border-radius: 0 0 10px 10px;

            .download-tips {
                margin-top: 5px;
                text-align: center;
                font-size: 14px;
                color: #6e6e6e;
            }

            .finish-tips {
                text-align: center;
                color: #4d4d4d;
                font-size: 13px;
            }
        }

        .op-btn {
            background: #fff;
            border-radius: 0 0 10px 10px;
            border-top: 1px solid #ddd;
            display: flex;
            align-items: center;
            overflow: hidden;
            line-height: 40px;

            .cancel {
                width: 50%;
                text-align: center;
                color: #989898;
                cursor: pointer;
            }

            .update {
                width: 50%;
                border-left: 1px solid #ddd;
                text-align: center;
                background: #07c160;
                color: #fff;
                cursor: pointer;
            }
        }
    }
}
</style>