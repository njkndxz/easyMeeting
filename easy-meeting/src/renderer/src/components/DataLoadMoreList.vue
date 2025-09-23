<template>
    <div ref="scrollbarRef" @scroll="handleScroll" class="scrollbar">
        <div class="bottom-loading" v-if="loading && loadMoreType == 1">
            <img src="../assets/loading.gif" />数据加载中...
        </div>
        <div class="reach-bottom"
            v-if="dataSource.pageNo >= dataSource.pageTotal && loadMoreType == 1 && !loading && dataSource.list.length > 0">
            没有更多数据了
        </div>
        <template v-for="(item, index) in dataSource.list">
            <slot :data="item" :index="index"></slot>
        </template>
        <div class="bottom-loading" v-if="loading && loadMoreType == 0">
            <img src="../assets/loading.gif" />数据加载中...
        </div>
        <div class="reach-bottom"
            v-if="dataSource.pageNo >= dataSource.pageTotal && loadMoreType == 0 && !loading && dataSource.list.length > 0">
            没有更多数据了
        </div>
        <NoData v-if="dataSource.list && dataSource.list.length == 0" msg="暂无数据"></NoData>
    </div>
</template>
<script setup>
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
    dataSource: {
        type: Object
    },
    loading: {
        type: Boolean
    },
    loadMoreType: {
        type: Number,
        default: 0
    }
})

let oldScrollHeight = 0
const emit = defineEmits(['loadData'])

const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight }  = e.target
    if(props.loading) {
        return
    }

    // 往上滚动
    if(props.loadMoreType == 1 && scrollTop == 0) {
        oldScrollHeight = scrollHeight
        emit('loadData')
        return
    }

    // 往下滚动
    if(props.loadMoreType == 0 && (scrollHeight - scrollTop + clientHeight) < 1) {
        emit('loadData')
        return
    }
}

const scrollbarRef = ref()
const gotoBottom = (forceBottom = false) => {
    const distanceToBottom = scrollbarRef.value.scrollHeight -  scrollbarRef.value.scrollTop + scrollbarRef.value.clientHeight
    if(!forceBottom && distanceToBottom > 200) {
        return
    }

    scrollbarRef.value.scrollTo({
        top: scrollbarRef.value.scrollHeight
    })
}

const gotoTop = () => {
    const newScrollHeight = scrollbarRef.value.scrollHeight
    scrollbarRef.value.scrollTop = newScrollHeight - oldScrollHeight
}

onMounted(() => {
    emit('loadData')
})

defineExpose({
    gotoBottom,
    gotoTop
})
</script>

<style lang="scss" scoped>
.scrollbar {
    height: 100%;
    overflow: auto;
    padding-bottom: 10px;
}

.reach-bottom {
    text-align: center;
    line-height: 40px;
    color: var(--text2);
    font-size: 12px;
}

.bottom-loading {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text2);

    img {
        width: 20px;
        margin-right: 10px;
    }
}
</style>