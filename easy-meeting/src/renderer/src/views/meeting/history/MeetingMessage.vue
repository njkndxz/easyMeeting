<template>
    <Header :closeType="0" :showMax="false" :title="`会议【${route.query.meetName}】聊天记录`"></Header>
    <div class="data-list">
        <DataLoadMoreList ref="dataLoadingMoreRef" :loadMoreType="1" :dataSource="dataSource" :loading="loading"
            @loadData="loadMessage">
            <template #default="{ data, index }">
                <MessageItem :data="data"></MessageItem>
            </template>
        </DataLoadMoreList>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref, onMounted, onUnmounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const dataSource = ref({})
const init = ref(false)
const dataLoadingMoreRef = ref()
const loadMessage = async () => {
    if (Object.keys(dataSource.value).length > 0 && dataSource.value.pageNo == dataSource.value.pageTotal) {
        return
    }

    loading.value = true
    let pageNo = dataSource.value.pageNo[0]
    pageNo++
    const result = await proxy.Request({
        url: proxy.Api.loadHistoryMessage,
        params: {
            pageNo,
            meetingId: route.query.meetingId
        }
    })
    if (!result) {
        return
    }
    loading.value = false
    const queryMessageList = result.data.list.map(item => {
        item.isMe = userInfoStore.userInfo.userId == item.sendUserId
        return item
    })

    let list = dataSource.value.list || []
    list.unshift(...queryMessageList)
    result.data.list = list
    dataSource.value = result.data
    if (!init.value) {
        init.value = true
        await nextTick()
        dataLoadingMoreRef.value.gotoBottom(true)
    }
    if (dataSource.value.pageNo > 1) {
        await nextTick()
        dataLoadingMoreRef.value.gotoTop()
    }
}

provide("showMedia", (messageId) => {
    const mediaList = dataSource.value.list.filter(item => {
        return item.status == 1 && (item.fileType == 0 || item.fileType == 1)
    }).map(item => {
        return {
            messageId: item.messageId + ',',
            fileType: item.fileType,
            fileName: item.fileName,
            sendTime: item.sendTime,
        }
    })

    window.electron.ipcRenderer.send("openWindow", {
        title: '媒体详情',
        windowId: "media",
        path: '/showMedia',
        width: 960,
        height: 720,
        data: {
            currentMessageId: messageId,
            mediaList: JSON.stringify(mediaList)
        }
    })
})

</script>

<style lang="scss" scoped>
.data-list {
    height: calc(100vh - 32px);
    background: #fff;
}
</style>