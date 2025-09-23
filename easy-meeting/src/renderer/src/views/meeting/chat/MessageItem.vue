<template>
    <div :class="['message-item', data.isMe ? 'my-message' : '']">
        <Avatar :width="30" :avatar="data.sendUserId"></Avatar>
        <div class="message-content">
            <div class="nick-name">{{ data.sendUserNickName }}</div>
            <div class="message" v-if="data.messageType == 5">
                {{ data.messageContent }}
                <div class="direct"></div>
            </div>
        </div>
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
    data: {
        type: Object,
        default: {}
    }
})
</script>
<style lang="scss" scoped>
.message-item {
    margin-top: 10px;
    display: flex;
    padding: 0 15px;

    .message-content {
        margin-left: 10px;

        .nick-name {
            font-size: 12px;
            color: #5d5d5d;
            margin-right: 5px;
        }

        .message {
            margin-top: 3px;
            background: #f1f2f4;
            border-radius: 5px;
            padding: 5px 8px;
            font-size: 14px;
            width: fit-content;
            margin-right: 40px;
            position: relative;

            .direct {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #f1f2f4;
                transform: rotate(45deg);
                top: 10px;
                left: -4px;
            }
        }
    }
}

.my-message {
    flex-direction: row-reverse;

    .message-content {
        margin-left: 0;
        margin-right: 10px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .nick-name {
            margin-right: 0;
            margin-left: 5px;
        }

        .message {
            background: #409eff;
            color: #fff;
            margin-left: 40px;
            margin-right: 0;

            .direct {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #409eff;
                transform: rotate(45deg);
                top: 10px;
                right: -4px;
                left: auto;
            }
        }
    }
}
</style>