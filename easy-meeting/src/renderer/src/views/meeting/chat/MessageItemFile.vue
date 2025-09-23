<template>
    <div class="file-panel">
        <div class="file-name" :title="data.fileName">{{ data.fileName }}</div>
        <div class="file-size">{{ proxy.Utils.size2Str(data.fileSize) }}</div>
        <div class="uploading" v-if="data.status == 0">
            <el-progress type="circle" :percentage="data.uploadProgress || 0" :width="80"></el-progress>
        </div>
  
        <div class="progress" v-if="data.downloadProgress != null">
            <div v-if="data.downloadProgress < 100" class="downloading">
                <span class="iconfont icon-download"></span>
                <el-progress :stroke-width="5" :percentage="data.uploadProgress"></el-progress>
            </div>
        </div>

        <div v-else class="download-complete">
            <div class="iconfont icon-success download-success">下载完成</div>
            <div class="iconfont icon-folder" @click="openLocalFile"></div>
        </div>

        <div v-else class="iconfont icon-download download-link" @click="download">下载</div>
    </div>
</template>
<script setup>
import 'viewerjs/dist/viewer.css'
import { component as Viewer } from 'v-viewer'
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
    data: {
        type: Object,
        default: {}
    }
})

const download = async () => {
    const savePath = await window.electron.ipcRenderer.invoke('download', {
        url: import.meta.env.VITE_DOMAIN + proxy.Api.downloadFile,
        fileName: props.data.fileName,
        messageId: props.data.messageId,
        sendTime: props.data.sendTime,
    })

    if(!savePath) {
        return
    }

    props.data.downloadProgress = 0
}

const openLocalFile = () => {
    window.electron.ipcRenderer.send("openLocalFile", {
        localFilePath: props.data.localFilePath
    })
}
</script>
<style lang="scss" scoped>
.file-panel {
    margin-top: 5px;
    display: flex;
    padding: 15px 10px 10px 10px;
    background: #e2e2e2;
    border: 1px solid #ddd;
    border-radius: 5px;
    width: 200px;
    flex-direction: column;
    position: relative;
    overflow: hidden;

    .file-name {
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .file-size {
        margin-top: 5px;
        font-size: 12px;
        color: #6e6e6e;
    }

    .uploading {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background: rgb(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        :deep {
            .el-progress__text {
                color: #20a0ff;
            }
        }
    }

    .download-link {
        margin-top: 5px;
        text-align: right;
        font-size: 12px;
        color: var(--blue);
        cursor: pointer;

        &::before {
            font-size: 16px;
            margin-right: 2px;
        }
    }

    .progress {
        margin-top: 5px;
        .downloading {
            display: flex;
            align-items: center;

            .icon-download {
                margin-right: 5px;
                color: var(--blue);
            }

            :deep {
                .el-progress {
                    flex: 1;
                }
                .el-progress__text {
                    min-width: 20px;
                }
            }
        }

        .download-complete {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .download-success {
                color: green;
                font-size: 13px;
                display: flex;
                align-items: center;

                &::before {
                    font-size: 16px;
                    margin-right: 2px;
                }
            }
        }

        .icon-folder {
            font-size: 20px;
            cursor: pointer;
            color: var(--blue)
        }
    }
}
</style>