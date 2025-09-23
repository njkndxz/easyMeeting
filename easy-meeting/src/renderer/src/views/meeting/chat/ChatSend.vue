<template>
    <div class="chat-send-panel">
        <div class="chat-send-bar">
            <div class="user-select">
                发送至
                <el-select v-model="receiveUserId" placeholder="所有人" class="select" filterable>
                    <el-option label="所有人" value="0"></el-option>
                    <el-option v-for="item in meetingStore.memberList" :key="item.userId" :label="item.nickName"
                        :value="item.userId"></el-option>
                </el-select>
            </div>
            <el-popover :visible="showEmojiPopover" trigger="click" placement="top" :teleported="false"
                @show="openPopover" @hide="closePopover" :popper-style="{ width: '490px', padding: '0 10px 10px 0' }">
                <template #default>
                    <el-tabs v-model="activeEmoji" @click.stop>
                        <el-tab-pane :label="emojiList.name" :name="emojiList.name" v-for="emoji in emojiList">
                            <div class="emoji-list">
                                <div class="emoji-item" v-for="item in emoji.emojiList" @click="sendEmoji(item)">
                                    {{ item }}
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </template>
                <template #reference>
                    <div class="iconfont icon-emoji" @click="showEmojiPopoverHandler" title="发送表情"></div>
                </template>
            </el-popover>
            <div class="iconfont icon-folder" @click="uploadFile" title="发送文件"></div>
        </div>
        <div class="input-area">
            <el-input type="textarea" clearable placeholder="请输入消息..." v-model="message" resize="none" :rows="6"
                @keydonw.enter.native="sendMessage"></el-input>
        </div>
    </div>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'
import emojiList from '@/utils/Emoji'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
    sysSeting: {
        type: Object,
        default: {}
    }
})

const activeEmoji = ref('笑脸')
const message = ref('')
const showEmojiPopover = ref(false)
const showEmojiPopoverHandler = () => {
    showEmojiPopover.value = true
}

const hidePopover = () => {
    showEmojiPopover.value = false
}

const openPopover = () => {
    document.addEventListener('click', hidePopover, false)
}

const closePopover = () => {
    document.removeEventListener('click', hidePopover, false)
}


const sendEmoji = (emoji) => {
    message.value += emoji
    showEmojiPopover.value = false
}

const receiveUserId = ref('0')

const sendMessageDo = async ({ messageContent, messageType, fileSize, fileName, fileType, callback }) => {
    let result = await proxy.Request({
        url: proxy.Api.sendChatMessage,
        showLoading: false,
        params: {
            receiveUserId: receiveUserId.value,
            message: message.value,
            messageType,
            fileSize,
            fileType,
            fileName
        }
    })

    if (!result) {
        return
    }

    callback && callback(result.data)
}

const sendMessage = () => {
    if (!message.value.trim()) return

    sendMessageDo({
        messageContent: message.value,
        messageType: 5,
    })
}

const uploadFile = async () => {
    const { filePath, fileName, fileSize } = await window.electron.ipcRenderer.invoke("selectFile")
    if (!filePath) {
        return
    }

    if (fileSize == 0) {
        proxy.Message.warning('空文件无法上传')
    }

    const fileType = getFileTypeByName(fileName)

    if (fileType == 0 && fileSize > props.sysSeting.maxImageSize * 1024 * 1024) {
        proxy.Message.error(`图片大小不能超过${props.sysSeting.maxImageSize}MB`)
        return
    }

    if (fileType == 1 && fileSize > props.sysSeting.maxImageSize * 1024 * 1024) {
        proxy.Message.error(`视频大小不能超过${props.sysSeting.maxVideoSize}MB`)
        return
    }

    if (fileType == 2 && fileSize > props.sysSeting.maxImageSize * 1024 * 1024) {
        proxy.Message.error(`文件大小不能超过${props.sysSeting.maxFileSize}MB`)
        return
    }

    sendMessageDo({
        messageType: 6,
        fileSize,
        fileName,
        fileType,
        callback: ({ messageId, sendTime }) => {
            window.electron.ipcRenderer.invoke("uploadChatFile", {
                uploadUrl: import.meta.env.VITE_DOMAIN + proxy.Api.uploadChatFile,
                messageId,
                sendTime,
                filePath
            })
        }
    })
}
</script>

<style lang="scss" scoped>
.emoji-list {
    .emoji-item {
        float: left;
        font-size: 23px;
        padding: 2px;
        text-align: center;
        border-radius: 3px;
        margin-left: 10px;
        margin-top: 5px;
        cursor: pointer;

        &:hover {
            background: #ddd;
        }
    }
}

.chat-send-panel {
    padding: 8px;

    .chat-send-bar {
        display: flex;
        align-items: center;

        .user-select {
            display: flex;
            align-items: center;
            font-size: 14px;

            .select {
                width: 150px;
                margin-left: 5px;
            }


        }
    }

    .iconfont {
        margin: 0 5px;
        font-size: 20px;
        color: #4e5461;
        cursor: pointer;
    }
}

.input-area {
    margin-top: 5px;

    :deep {
        .el-textarea__inner {
            box-shadow: none;
            padding: 0;
        }
    }
}

.send-btn-panel {
    display: flex;
    justify-content: end;
    align-items: center;

    .tips {
        margin-right: 5px;
        font-size: 13px;
        color: #8c8c8c;
    }
}
</style>