<template>
    <Header title="全部会议" :showMax="false" :closeType="0"></Header>
    <div class="tabs">
        <el-tabs v-model="activeName">
            <el-tab-pane label="历史会议" name="history"></el-tab-pane>
            <el-tab-pane label="待开会议" name="reserve"></el-tab-pane>
        </el-tabs>
    </div>
    <MeetingHistory v-if="activeName == 'history'"></MeetingHistory>
</template>
<script setup>
import { getCurrentInstance, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import MeetingHistory from './MeetingHistory.vue'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const activeName = ref('history')
</script>

<style lang="scss" scoped>
.tabs {
    padding: 0 10px;

    :deep {
        .el-tabs__header {
            margin: 0;
        }
    }
}
</style>