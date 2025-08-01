<template>
    <div class="main-body">
        <div class="left-panel">
            <div class="quick-btns">
                <div :class="['btn', meetingStore.inMeeting ? 'btn-disable' : '']" @click="addMeeting(0)">
                    <div class="iconfont icon-add"></div>
                    <div class="name">加入会议</div>
                </div>
                <div :class="['btn', meetingStore.inMeeting ? 'btn-disable' : '']" @click="quickMeeting">
                    <div class="iconfont icon-quick"></div>
                    <div class="name">快速会议</div>
                    <div class="btn-disable" v-if="meetingStore.inMeeting"></div>
                </div>
                <div class="btn" @click="reserveMeeting">
                    <div class="iconfont icon-ok"></div>
                    <div class="name">预定会议</div>
                </div>
                <div :class="['btn', meetingStore.inMeeting ? 'btn-disable' : '']" @click="addMeeting(1)">
                    <div class="iconfont icon-share-screen"></div>
                    <div class="name">共享屏幕</div>
                </div>
            </div>
        </div>
        <div class="right-panel">
            <Today></Today>
        </div>
        <TitleBar :showMax="false"></TitleBar>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import Today from './Today.vue'

const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

</script>

<style lang="scss" scoped>
.main-body {
    display: flex;
    height: calc(100vh - 2px);
    -webkit-app-region: drag;

    .left-panel {
        width: 40%;
        border-right: 1px solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;

        .quick-btns {
            margin: 0 auto;
            text-align: center;
            width: 200px;
            grid-template-columns: repeat(2, 1fr);
            display: grid;
            gap: 30px;

            .btn {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                -webkit-app-region: no-drag;
                cursor: pointer;
                position: relative;
                overflow: hidden;

                &:hover {
                    opacity: 0.9;
                }

                .iconfont {
                    width: 65px;
                    height: 65px;
                    background: var(--blue);
                    color: #fff;
                    font-weight: bold;
                    font-size: 35px;
                    border-radius: 10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                }

                .name {
                    margin-top: 10px;
                    font-size: 13px;
                }
            }

            .btn-disable {
                opacity: 0.5;
                cursor: not-allowed;

                &:hover {
                    opacity: 0.5;
                }
            }
        }
    }


    .right-panel {
        flex: 1;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
}
</style>