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
    </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
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