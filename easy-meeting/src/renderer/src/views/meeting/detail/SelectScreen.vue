<template>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :button="dialogConfig.buttons" width="640px"
        :showCancel="false" @close="dialogConfig.show = false">
        <div class="screen-source-list">
            <div :class="['source-item', screenSource?.displayId == item.displayId ? 'active' : '']"
                v-for="item in screenSources" @click="selectSource(item)">
                <Cover :width="125" :scale="0.6" :source="item.thumbnail" borderRadius="0px"></Cover>
                <div class="name">{{ item.name }}</div>
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { mitter } from '@/eventbus/eventBus'

const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const dialogConfig = ref({
    show: false,
    title: '共享',
    buttons: [
        {
            type: 'primary',
            text: '开始共享',
            click: (e) => {
                submitForm()
            }
        }
    ]
})

const screenSource = ref()
const screenSources = ref([])
const show = () => {
    dialogConfig.value.show = true
    nextTick(async () => {
        screenSources.value = await window.electron.ipcRenderer.invoke('getScreenSource', {
            types: ['screen'], //同时显示屏幕和窗口
            thumbnailSize: {
                width: 640,
                height: 360
            }
        })

        screenSource.value = screenSources.value[0]
    })
}

const selectSource = async (source) => {
    screenSource.value = source
}

const emit = defineEmits(['shareScreen'])
const submitForm = () => {
    mitter.emit('shareScreen', screenSource.value.id)
    dialogConfig.value.show = false
}

defineExpose({
    show
})
</script>
<style lang="scss" scoped>
.screen-source-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    flex-wrap: wrap;
    .source-item {
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 8px 10px;
    }
}
</style>