<template>
    <Dialog :show="dialogconfig.show" :title="dialogconfig.title" :buttons="dialogconfig.buttons" width="400px"
        :showCancel="false" @close="dialogconfig.show = false">
        <div>#会议号:{{ proxy.utils.formatMeetingNo(meetingInfo.meetingNo) }}</div>
        <div>#密&nbsp;&nbsp;&nbsp;码:{{ meetingInfo.password || '无密码' }}</div>
        <div class="copy-btn">
            <el-button type="primary" @click="copyText">复制会议信息</el-button>
        </div>
    </Dialog>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const dialogconfig = ref({
    show: false,
    title: '分享会议'
})
const meetingInfo = ref({})
const show = (data) => {
    dialogconfig.value.show = true
    meetingInfo.value = data
}

const copyText = async () => {
    await navigator.clipboard.writeText(`#会议号: ${meetingInfo.value.meetingInfo}  #密码: ${meetingInfo.value.password||'无密码'}`)
    proxy.Message.success('复制成功')
}

defineExpose({
    show
})
</script>

<style lang="scss" scoped>
.copy-btn {
    display: flex;
    justify-content: end;
}
</style>