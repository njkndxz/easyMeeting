<template>
    <div></div>
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