<template>
    <div class="chat-panel">
        <div class="chat-panel-title">
            <div class="iconfont icon-chat">聊天</div>
        </div>
        <div class="chat-list" id="chat-list" ref="chatListRef">
            <DataLoadMoreList ref="dataLoadMoreRef" :loadMoreType="1" :dataSource="dataSource" :loading="loading"
                @loadData="loadMessage">
                <template #default="{ data, index }">
                    <MessageItem :data="data"></MessageItem>
                </template>
            </DataLoadMoreList>
        </div>

        <ChatSend :sysSetting="sysSetting"></ChatSend>
    </div>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'
import ChatSend from './ChatSend.vue'
import MessageItem from './MessageItem.vue'
import DataLoadMoreList from '../../../components/DataLoadMoreList.vue'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const dataSource = ref({})
const sortMessage = () => {
    dataSource.value.list.sort((a, b) => (a.messageId - b.messageId))
}

const dataLoadMoreRef = ref()
const loadMessage = async () => {
    if (Object.keys(dataSource.value).length > 0 && dataSource.value.pageNo == dataSource.value.pageTotal) {
        return
    }

    loading.value = true
    let pageNo = dataSource.value.pageNo[0]
    pageNo++
    const result = await proxy.Request({
        url: proxy.Api.loadMessage,
        params: {
            pageNo,
            maxMessageId: pageNo > 1 ? dataSource.value.list[0].messageId : null
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
    sortMessage()
    if (dataSource.value.pageNo > 1) {
        await nextTick()
        dataLoadMoreRef.value.gotoTop()
    }
}

const listenMessage = () => {
    window.electron.ipcRenderer.on("chatMessage", async (e, messageObj) => {
        switch (messageObj.messageType) {
            case 5:
            case 6:
                // 加载未读消息数量
                meetingStore.addNoReadChatCount()
                messageObj.isMe = userInfoStore.userInfo.userId === messageObj.senderUserId
                dataSource.value.list.push(messageObj)
                sortMessage()
                await nextTick()
                // 滚动到底部
                dataLoadMoreRef.value.gotoBottom(true)
                break;
            case 7:
                const messageItem = dataSource.value.list.find(item => item.messageId == messageObj.messageId)
                if (!messageItem) {
                    return
                }
                messageItem.status = 1
                messageItem.messageContent = messageObj.messageContent
                break;
            default:
                break;
        }
    })
}

const listenUploadProgress = () => {
    window.electron.ipcRenderer.on("uploadProgress", async (e, { messageId, percent }) => {
        const message = dataSource.value.list.find(item => item.messageId === messageId)
        if (!message) {
            return
        }
        message.uploadProgress = percent
    })
}

const listenDownloadProgress = () => {
    window.electron.ipcRenderer.on("downloadProgress", (e, { messageId, percent, localFilePath }) => {
        const message = dataSource.value.list.find(item => item.messageId === messageId)
        if (!message) {
            return
        }
        message.downloadProgress = percent
        message.localFilePath = localFilePath
    })
}

const showChatPanel = async () => {
    await nextTick()
    dataLoadMoreRef.value.gotoBottom(true)
}

onMounted(() => {
    listenMessage()
    listenUploadProgress()
    listenDownloadProgress()
})

onUnmounted(() => {
    window.electron.ipcRenderer.removeAllListeners('chatMessage')
    window.electron.ipcRenderer.removeAllListeners('uploadProgress')
    window.electron.ipcRenderer.removeAllListeners('downloadProgress')
})

const sysSetting = ref()
const loadSysSetting = async () => {
    let result = await proxy.Request({
        url: proxy.Api.getSysSetting,
        showLoading: false
    })

    if (!result) {
        return
    }

    sysSetting.value = result.data
}
loadSysSetting()

provide("showMedia", (messageId) => {
    const mediaList = dataSource.value.list.filterter(item => {
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

defineExpose({
    showChatPanel
})
</script>

<style lang="scss" scoped>
.chat-panel {
    height: calc(100vh -300px);
    background: #fff;

    .chat-panel-title {
        border-bottom: 1px solid #ddd;
        padding: 10px;
        color: #4e5461;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .icon-chat {
            display: flex;
            align-items: center;
            font-size: 14px;

            &::before {
                margin-right: 3px;
                font-size: 20px;
            }
        }

        .icon-transfer {
            cursor: pointer;
        }
    }

    .chat-list {
        overflow: auto;
        height: calc(100vh 0 345px);
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }
}
</style>