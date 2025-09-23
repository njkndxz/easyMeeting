<template>
    <div class="chat-panel">
        <div class="chat-panel-title">
            <div class="iconfont icon-chat">聊天</div>
        </div>
        <div class="chat-list" id="chat-list" ref="chatListRef">
            <MessageItem v-for="item in dataSource.list" :data="item"></MessageItem>
        </div>

        <ChatSend :sysSetting="sysSetting"></ChatSend>
    </div>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'
import ChatSend from './ChatSend.vue'
import MessageItem from './MessageItem.vue'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const dataSource = ref({ list: [] })

const listenMessage = () => {
    window.electron.ipcRenderer.on("chatMessage", async (e, messageObj) => {
        messageObj.isMe = userInfoStore.userInfo.userId === messageObj.senderUserId
        dataSource.value.list.push(messageObj)
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

onMounted(() => {
    listenMessage()
    listenUploadProgress()
})

onUnmounted(() => {
    window.electron.ipcRenderer.removeAllListeners('chatMessage')
    window.electron.ipcRenderer.removeAllListeners('uploadProgress')
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