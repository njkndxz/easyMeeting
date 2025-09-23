<template>
    <div class="player-panel">
        <div id="player" ref="playerRef" class="player-style"></div>
        <div id="play">
            <img src="../assets/play.png" />
        </div>
    </div>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'
import Artplay from 'artplayer'

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

const playerRef = ref(null)
let player = null

const initplayer = (url) => {
    //隐藏右键菜单
    Artplayer.CONTEXTMENU = false
    //自动回放功能的最大记录数，默认为10
    Artplayer.AUTO_PLAYBACK_MAX = 20
    //自动回放功能的最小记录时长，单位为秒，默认为5
    Artplayer.AUTO_PLAYBACK_MIN = 10
    Artplayer.DBCLICK_FULLSCREEN = false
    player = new Artplayer({
        container: playerRef.value,
        url,
        type: 'm3u8',
        theme: '#23ade5',//播放器主题颜色，目前用于进度条和 高亮元素上
        volume:0.7,//播放器的默认音量
        autoplay: true,//是否自动播放 假如希望默认进入页面就能自动播放视频,muted 必需为 true
        autoMini:true,//当播放器滚动到浏览器视口以外时，自动进入 迷你播放 模式
        fullscreen:false,//设置和获取播放器窗口全屏
        fullscreenweb:false,//设置和获取播放器网页全屏
        setting: false,
        pip: false,//开启画中画
        playbackRate: false, //是否显示视频播放速度功能，会出现在 设置面板 和 右键菜单 里
        flip:false,//是否显示视频翻转功能，目前只出现在 设置面板 和 右键菜单
        aspectRatio: true,//比例
        miniProgressBar:true,//迷你进度条，只在播放器失去焦点后且正在播放时出现
        screenshot:false,//截图
        autoPlayback: false,//自动回放
        //自定义图标
        icons: {
            state: document.querySelector('#play')
        }
    })

    /* player.on('ready', () => {
        player.value.autoSize()
        player.value.autoHeight()
        player.seek = 5
    })

    player.on('resize', () => {
        player.value.autoHeight()
    }) */

    player.on('hover', (state) => {
        let display = 'none'
        if(state) {
            display = 'flex'
        }
        player.template.$bottom.style.display = display
    })
}

const showPlayer = (url) => {
    if(player) {
        player.switch = url
        return
    }

    initplayer(url)
}

const destoryPlayer = () => {
    if (player) {
        player.destory(false)
    }
}

defineExpose({
    showPlayer,
    destoryPlayer
})
</script>
<style lang="scss" scoped>
.player-panel {
    width: 100%;
    height: 100%;

    .player-style {
        width: 100%;
        height: 100%;

        :deep(.art-video-player.art-mask-show .art-state) {
            position: absolute;
            right: 40px;
            bottom: 70px;

            .art-icon-state {
                width: 60px;
                height: 60px;

                img {
                    width: 100%;
                }
            }
        }
    }
}
</style>