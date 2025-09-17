<template>
    <div :style="{ width: width + 'px', height: width + 'px' }">
        <Cover :lazy="false" :width="width" :source="avatarUrl" borderRadius="50%" :scale="1"></Cover>
    </div>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'

const userInfoStore = useUserInfoStore()

const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
    width: {
        type: Number,
        default: 50
    },
    avatar: {
        type: String,
    },
    update: {
        type: Boolean,
        default: false
    }
})

const avatarUrl = ref(proxy.Utils.getAvatarPath(props.avatar, props.update))

const updateAvatarUrl = () => {
    avatarUrl.value = proxy.Utils.getAvatarPath(props.avatar, true)
}

defineExpose({
    updateAvatarUrl
})
</script>
<style lang="scss" scoped>
</style>