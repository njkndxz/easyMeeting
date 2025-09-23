<template>
    <div class="media-window">
        <div class="header">
            <div class="media-op-no-drag">
                <div :class="['iconfont icon-left', currentIndex == 0 ? 'not-allow' : '']" @dbclick.stop title="上一张"
                    @click="next(-1)"></div>
                <div :class="['iconfont icon-right', currentIndex >= allFileList.length - 1 ? 'not-allow' : '']"
                    @dbclick.stop title="下一张" @click="next(1)"></div>
                <template v-if="currentFile.fileType == 0">
                    <el-divider direction="vertical" />
                    <div class="iconfont icon-enlarge" @click.stop="changeSize(0.1)" @dbclick.stop title="放大"></div>
                    <div class="iconfont icon-narrow" @click.stop="changeSize(-0.1)" @dbclick.stop title="缩小"></div>
                    <div :class="['iconfont', isOne2One ? 'icon-resize' : 'icon-source-size']" @dbclick.stop
                        @click="resize" :title="isOne2One ? '图片适应窗口大小' : '图片原始大小'"></div>
                    <div class="iconfont icon-rotate" @dbclick.stop @click="rotate" title="旋转"></div>
                    <el-divider direction="vertical" />
                </template>
                <div class="iconfont icon-download" @dbclick.stop @click="download" title="另存为..."></div>
            </div>
            <Titlebar :closeType="0" :styleTop="0" :styleRight="0" ref="titlebarRef"></Titlebar>
        </div>
        <div class="media-panel">
            <viewer :options="options" @inited="inited" :images="[currentFile.url]" v-if="currentFile.fileType == 0">
                <img :src="currentFile.url" />
            </viewer>
            <Player v-show="currentFile.fileType == 1" ref="player"></Player>
        </div>
    </div>
</template>
<script setup>
import 'viewerjs/dist/viewer.css'
import { component as Viewer } from 'v-viewer'
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'
import Player from '../../../components/Player.vue'

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

const currentIndex = ref(0)
const allFileList = ref([])
const currentFile = ref({ fileType: 0 })
const options = ref({
    inline: true,
    button: false,
    navbar: false,
    toolbar: false,
    title: false,
    zoomRatio: 0.1,
    zoomOnWheel: false,
})
const player = ref(null)
const viewerMy = ref(null)
const inited = (e) => {
    viewerMy.value = e
}

const changeSize = (zoomRatio) => {
    viewerMy.value.zoom(zoomRatio, true)
}

const rotate = () => {
    viewerMy.value.rotate(90, true)
}

const isOne2One = ref(false)
const resize = () => {
    isOne2One.value = !isOne2One.value
    if (!isOne2One.value) {
        viewerMy.value.zoomTo(viewerMy.value.initialImageData.ratio, true)
    } else {
        viewerMy.value.zoomTo(1, true)
    }
}

const onWheel = (e) => {
    if(e.deltaY < 0) {
        changeSize(0.1)
    } else {
        changeSize(-0.1)
    }
}


const getCurrentFile = () => {
    const curFile = allFileList.value[currentIndex.value]
    const url = proxy.Utils.getResourcePath(curFile)
    currentFile.value = { ...curFile, url }
    if(curFile.fileType == 1) {
        // 视频播放
        player.value.showPlayer(url)
    }
}

const next = (index) => {
    if(currentIndex.value + index < 0 || currentIndex.value + index >= allFileList.value.length) {
        return
    }
    player.value.destoryPlayer()
    currentIndex.value += index
    getCurrentFile()
}

const download = async () => {
    await window.electron.ipcRenderer.invoke('download', {
        url: import.meta.env.VITE_DOMAIN + proxy.Api.downloadFile,
        fileName: currentFile.value.fileName,
        messageId: currentFile.value.messageId,
        sendTime: currentFile.value.sendTime,
    })
} 

onMounted(() => {
    window.addEventListener("wheel", onWheel)

    const {mediaList, currentMessageId} = route.query
    allFileList.value = JSON.parse(decodeURIComponent(mediaList))
    currentIndex.value = allFileList.value .findIndex(item => item.messageId == currentMessageId) 
    getCurrentFile()
})

onUnmounted(() => {
    window.removeEventListener("wheel", onWheel)
})
</script>
<style lang="scss" scoped>
.media-window {
    padding: 0;
    background: #fff;
    position: relative;
    overflow: hidden;

    .header {
        height: 30px;
        -webkit-app-region: drag;
        display: flex;

        .media-op {
            -webkit-app-region: no-drag;
            height: 100%;
            line-height: 30px;
            display: flex;
            align-items: center;

            .iconfont {
                font-size: 18px;
                padding: 0 10px;

                &:hover {
                    background: #f3f3f3;
                    cursor: pointer;
                }
            }

            .not-allow {
                cursor: pointer;
                color: #ddd;
                text-decoration: none;

                &:hover {
                    color: #ddd;
                    cursor: pointer;
                    background: none;
                }
            }
        }
    }

    .media-panel {
        height: calc(100vh - 32px);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        :deep(.viewer-backdrop) {
            background: #f5f5f5;
        }

        .file-panel {
            .file-item {
                margin-top: 5px;
            }

            .download {
                margin-top: 20px;
                text-align: center;
            }
        }
    }
}
</style>