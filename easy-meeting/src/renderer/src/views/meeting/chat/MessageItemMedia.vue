<template>
    <div class="media-panel" @click="showMediaHandler">
        <div class="uploading" v-if="data.status === 0">
            <img src="../../../assets/loading.gif"/>
            <div class="info">政治上传中...</div>
        </div>
        <template v-else>
            <div class="play-btn" v-if="data.fileType == 1">
                <img src="../../../assets/play.png"/>
            </div>
            <div class="media-cover">
                <img :src="proxy.Utils.getResourcePath({...data, thumbnail: true})" fit="cover"/>
            </div>
        </template>
    </div>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick, inject } from 'vue'
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

const showMedia = inject("showMedia")
const showMediaHandler = () => {
    if(props.data.status == 0) {
        return
    }

    showMedia(props.data.messageId)
} 
</script>
<style lang="scss" scoped>
.media-panel {
    margin-top: 3px;
    width: 200px;
    height: 130px;
    background: #ddd;
    border-radius: 5px;
    overflow: hidden;
    cursor: pointer;
    position: relative;

    .uploading {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, .1);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        img {
            width: 30px;
        }

        .info {
            font-size: 12px;
            color: #00a1d6;
        }

    }

    .play-btn {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
        position: absolute;
        width: 100%;
        left: 0;
        top: 0;
        img {
            width: 100%;
            height: 100%;
        }
    }

    .media-cover {
        width: 100%;
        height: 100%;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
}
</style>