<template>
    <Header title="管理后台" :showBottomBorder="true"></Header>
    <div class="layout">
        <div class="left-side">
            <div :class="['menu-item', route.path === item.path ? 'active' : '']" v-for="item in leftMenus"
                @click="jump(item)">
                {{ item.name }}
            </div>
        </div>
        <div class="right-content">
            <router-view></router-view>
        </div>
    </div>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useContactStore } from '@/stores/UserContactStore'
import { useMeetingStore } from '@/stores/MeetingStore'
import { mitter } from '@/eventbus/eventBus'


const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const leftMenus = [
    {
        name: '用户管理',
        path: '/userList'
    },
    {
        name: '会议管理',
        path: '/meetingMange'
    },
    {
        name: '应用更新',
        path: '/appUpdate'
    },
    {
        name: '系统设置',
        path: '/sysSetting'
    },
]

const jump = (item) => {
    router.push(item.path)
}
</script>

<style lang="scss" scoped>
.layout {
    display: flex;

    .left-side {
        width: 300px;
        border-right: 1px solid #ddd;
        padding: 10px;

        .menu-item {
            border-radius: 5px;
            padding: 10px 20px;
            cursor: pointer;

            &:hover {
                background: #ddd;
            }
        }

        .active {
            background: var(--blue);
            color: #fff;

            &:hover {
                background: var(--blue);
                color: #fff;
            }
        }
    }

    .right-content {
        flex: 1;
        width: 0;
        height: calc(100vh - 32px);
        padding: 10px;
    }
}
</style>