<template>
    <Header :closeType="0" :showMax="false" :title="`会议【${route.query.meetName}】成员`"></Header>
    <div class="member-list">
        <div class="member-item" v-for="item in memberlist">
            <Avatar :avatar="item.userId"></Avatar>
            <div class="nick-name">{{ item.nickName }}{{ item.memberType == 1 ? '(主持人)' : '' }}</div>
        </div>
    </div>
</template>
<script setup>
import { getCurrentInstance, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const memberList = ref([])
const loadMembers = async () => {
    let result = await proxy.Request({
        url: proxy.Api.loadMeetingMembers,
        params: {
            meetingId: route.query.meetingId
        }
    })

    if (!result) {
        return
    }
    memberList.value = result.data
}
loadMembers()
</script>

<style lang="scss" scoped>
.member-list {
    height: calc(100vh - 32px);
    overflow: auto;
    padding-bottom: 10px;

    .member-item {
        align-items: center;
        display: flex;
        padding: 10px;

        .nick-name {
            margin-left: 10px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
    }
}
</style>