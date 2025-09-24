<template>
    <div class="today-panel">
        <div class="cur-date">{{ proxy.Utils.formatDate2(new Date().getTime(), 'M月DD日') }}</div>
        <div class="history">
            <div class="china-date-day">
                {{ proxy.Utils.getChinaDateDay() }}
            </div>
            <div class="btn" @click="meetingHistory">
                全部会议<span class="iconfont icon-narrow-right"></span>
            </div>
        </div>
        <div class="today-meeting">
            <template v-if="Object.keys(currentMeeting).length > 0 || todayMeetingList.length > 0">
                <div class="today">今天 {{ proxy.Utils.formatDate2(new Date().getTime(), 'M月DD日') }}</div>
                <div class="meeting-list">
                    <div class="current-meeting" v-if="object.keys(currentMeeting).length > 0">
                        <div class="meeting-title-info">
                            <div class="meeting-title">{{ currentMeeting.meetingName }}</div>
                            <el-dropdown v-if="currentMeeting, createUserId === userInfostore.userInfo.userId">
                                <div class="iconfont icon-more"></div>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="finishMeeting">结束会议</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                            <div class="iconfont icon-share" @click="shareMeeting"></div>
                            <div class="join-status">已入会</div>
                        </div>
                        <div class="meeting-no">{{ proxy.Utils.formatMeetingNo(currentMeeting.meetingNo) }}</div>
                        <div class="status-name">进行中</div>
                    </div>

                    <div v-for="item in toadyMeetingList" class="today-meeting-item">
                        <div class="meeting-name">{{ item.meetingName }}</div>
                        <div class="time-info-panel">
                            <div class="time-info">
                                <div>
                                    {{ proxy.Utils.formatDate2(item.startTime, 'HH:mm') }}~{{
                                        proxy.Utils.timeAddmin(item.startTime, item.duration) }}
                                </div>
                                <div class="point">·</div>
                                <div>{{ proxy.Utils.formatMeetingNo(item.meetingId) }}</div>
                            </div>
                            <div class="op-panel">
                                <el-button type="danger" size="small" @click="delMeeting(item)">删除</el-button>
                                <el-button type="primary" size="small" @click="joinMeeting(item)">入会</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <NoData msg="暂无会议" v-else></NoData>
        </div>
    </div>

    <MeetingShare ref="meetingShareRef"></MeetingShare>
    <AddMeeting ref="addMeetingRef" @joinMeeting="joinMeetingHandler"/>
</template>

<script setup>
import { getCurrentInstance, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'
import MeetingShare from './history/MeetingShare.vue'
import AddMeeting from './AddMeeting.vue'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const currentMeeting = ref({})
const todayMeetingList = ref([])
const loadTodayMeeting = async () => {
    let result = await proxy.Request({
        url: proxy.Api.loadTodayMeeting
    })

    if (!result) {
        return
    }

    todayMeetingList.value = result.data.filter((item) => {
        return item.meetingId !== currentMeeting.value.meetingId
    })
}

const getCurrentMeeting = async () => {
    const result = await proxy.Request({
        url: proxy.Api.getCurrentMeeting
    })

    if (!result) {
        return
    }

    currentMeeting.value = result.data || {}
    loadTodayMeeting()
}

const meetingShareRef = ref()
const shareMeeting = () => {
    meetingShareRef.value.show(currentMeeting.value)
}

const finishMeeting = () => {
    proxy.Confirm({
        message: '确定要结束会议',
        okfun: async () => {
            let result = await proxy.Request({
                url: proxy.Api.finishMeeting,
                params: {
                    meetingId: currentMeeting.value.meetingId
                }
            })

            if (!result) {
                return
            }
            currentMeeting.value = {}
        }
    })
}

const delMeeting = (item) => {
    proxy.Confirm({
        message: '确定要删除会议吗?',
        okfun: async () => {
            let result = await proxy.Request({
                url: proxy.Api.delMeetingReserveByUser,
                params: {
                    meetingId: item.meetingId
                }
            })

            if(!result) {
                return
            }

            loadTodayMeeting()
        }
    })
}

const addMeetingRef = ref()
const joinMeeting = (item) => {
    addMeetingRef.value.show({meetingId: item.meetingId})
}
const joinMeetingHandler = () => {
    window.electron.ipcRenderer.send('openWindow', {
        title: '会议详情',
        windowId: 'meeting',
        path: '/meeting',
        width: 1310,
        height: 800,
        maximizable: true,
        resizable: false
    })
}

watch(() => meetingStore.lastUpdate, (newVal, oldVal) => {
    getCurrentMeeting()
}, { immediate: true, deep: true })

onMounted(() => {
    window.electron.ipcRenderer.on("windowCommunication", (e, data) => {
        loadTodayMeeting()
    })
})

onUnmounted(() => {
    window.electron.ipcRenderer.removeAllListeners("windowCommunication")
})
</script>

<style lang="scss" scoped>
.today-panel {
    padding-left: 20px;
    padding-top: 80px;

    .cur-date {
        font-size: 28px;
        font-weight: bold;
        text-align: left;
        width: 350px;
    }

    .history {
        -webkit-app-region: no-drag;
        border-bottom: 1px solid #e6e6e6;
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px;

        .china-date-day {
            font-size: 13px;
            color: #535353;
        }

        .btn {
            background: #f0f0f0;
            border-radius: 5px;
            font-size: 13px;
            padding: 2px 5px 2px 5px;
            color: #424242;
            cursor: pointer;

            .iconfont {
                font-size: 12px;
                color: #424242;
            }
        }
    }

    .today-meeting {
        -webkit-app-region: no-drag;

        .today {
            color: #5c5c5c;
            font-size: 13px;
            padding: 10px 0 0 0;
        }

        .no-data {
            margin-top: 30px;
        }

        .meeting-list {
            height: calc(100vh - 182px);
            overflow: auto;
            padding-right: 10px;

            .current-meeting {
                margin-top: 20px;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
                background: #ededed;

                &:hover {
                    background: #e1e1e1;
                }

                .meeting-title-info {
                    display: flex;
                    align-items: center;

                    .meeting-title {
                        flex: 1;
                        width: 0;
                        font-size: 14px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }

                    .iconfont {
                        margin-right: 5px;
                        background: #c2c2c2;
                        border-radius: 5px;
                        padding: 4px;
                        color: #484848;
                    }

                    .join-status {
                        color: var(--blue);
                        font-size: 12px;
                    }
                }

                .meeting-no {
                    margin-top: 5px;
                    font-size: 12px;
                    color: #838383;
                }

                .status-name {
                    color: var(--blue);
                    font-size: 12px;
                    margin-top: 3px;
                }
            }

            .today-meeting-item {
                margin-top: 10px;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;

                &:hover {
                    background: #e1e1e1;

                    .time-info-panel {
                        .op-panel {
                            display: block;
                        }
                    }
                }

                .meeting-name {
                    font-size: 15px;
                }

                .time-info-panel {
                    margin-top: 3px;
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    color: #6c6c6c;
                    height: 28px;

                    .time-info {
                        flex: 1;
                        display: flex;

                        .point {
                            margin: 0 5px;
                        }

                        .tips {
                            color: #ff7a15;
                        }
                    }

                    .op-panel {
                        display: none;
                    }
                }
            }
        }
    }
}
</style>