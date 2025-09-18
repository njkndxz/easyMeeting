<template>
    <div class="member-panel">
        <div class="member-panel-title">
            <div class="iconfont icon-members">管理成员</div>
        </div>
        <div class="member-list" id="member-list" ref="memberListRef">
            <div class="member-item" v-for="item in meetingStore.allMemberList">
                <Avatar :avatar="item.userId"></Avatar>
                <div class="member-info">
                    <div class="nick-name">
                        {{ item.nickName }}{{ item.memberType === 1 ? '（主持人）' : '' }}
                    </div>
                    <div class="status-name" :style="{ color: STATUS_MAP[item.status].color }">
                        {{ STATUS_MAP[item.status].desc }}
                    </div>
                </div>

                <el-dropdown v-if="isCreater && item.userId !== userInfoStore.userInfo.userId">
                    <div class="iconfont icon-more"></div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="kickOutMeeting(item)">踢出会议</el-dropdown-item>
                            <el-dropdown-item @click="blackMeeting(item)">拉黑</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'

const meetingStore = useMeetingStore()
const userInfoStore = useUserInfoStore()

const props = defineProps({
    initWidth: {
        type: Number,
    }
})


const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const isCreater = computed(() => {
    const creater = meetingStore.allMemberList.find((item) => {
        return item.memberType === 1
    })
    if (creater?.userId === userInfoStore.userInfo.userId) {
        return true
    }

    return false
})

const STATUS_MAP = {
    1: {
        desc: '会议中',
        color: '#67C23A'
    },
    2: {
        desc: '退出会议',
        color: '#E6A23C'
    },
    3: {
        desc: '被踢出会议',
        color: '#F56C6C'
    },
    4: {
        desc: '被拉黑',
        color: '#909399'
    },
}

//踢出会议
const kickOutMeeting = (item) => {
    proxy.Confirm({
        message: `确定要将【${item.nickName}】踢出会议吗?`,
        okfun: async () => {
            let result = await proxy.Request({
                url: proxy.Api.kickoutMeeting,
                params: {
                    userId: item.userId
                }
            })
            if (!result) {
                return
            }
            proxy.Message.success('踢出成功')
        }
    })
}

//拉黑
const blackMeeting = (item) => {
    proxy.Confirm({
        message: `确定要将【${item.nickName}】拉黑吗?`,
        okfun: async () => {
            let result = await proxy.Request({
                url: proxy.Api.blackMeeting,
                params: {
                    userId: item.userId
                }
            })
            if (!result) {
                return
            }
            proxy.Message.success('拉黑成功')
        }
    })
}
</script>

<style lang="scss" scoped>
.member-panel {
    height: calc(100vh - 135px);
    background: #fff;

    .member-panel-title {
        border-bottom: 1px solid #ddd;
        padding: 10px;
        color: #4e5461;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .icon-members {
            display: flex;
            align-items: center;
            font-size: 14px;

            &::before {
                margin-right: 3px;
                font-size: 20px;
            }
        }
    }

    .member-list {
        height: 100%;
        overflow: auto;
        padding-bottom: 10px;

        .member-item {
            align-items: center;
            display: flex;
            padding: 10px 5px;

            .member-info {
                flex: 1;
                margin-left: 10px;
                font-size: 14px;
                width: 0;

                .nick-name {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }

                .status-name {
                    font-size: 12px;
                    margin-top: 2px;
                }
            }
        }
    }
}
</style>