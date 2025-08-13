<template>
    <div class="header">
        <div class="left">会议详情</div>
        <div class="right">
            <el-popover placement="top-end" :width="260" trigger="click" ref="layoutPopoverRef">
                <template #reference>
                    <div class="layout-btn">
                        <div :class="['cur-layout-icon iconfont', 'icon-' + currentLayout.icon]"></div>
                        <div class="text">切换布局</div>
                        <div class="iconfont icon-narrow-down"></div>
                    </div>
                </template>
            </el-popover>

            <div class="layout">
                <div class="layout-item" v-for="item in layoutList" :key="item.name" @click="selectLayout(item)">
                    <div :class="[
                        'iconfont',
                        'icon-' + item.icon,
                        currentLayout.type == item.type ? 'active' : '']"></div>
                    <div class=" name">{{ item.name }}</div>
                </div>
            </div>
        </div>
    </div>
    <slot></slot>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import {mitter} from '@/eventbus/eventBus'

const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const layoutList = ref([
    {
        type: 0,
        icon: 'layout-grid',
        name: '宫格布局'
    },
    {
        type: 1,
        icon: 'layout-top',
        name: '顶部缩略图'
    },
    {
        type: 2,
        icon: 'layout-right',
        name: '侧边缩略图'
    }
])
const layoutPopoverRef = ref()
const currentLayout = ref(layoutList.value[0])

const selectLayout = (item) => {
    currentLayout.value = item
    layoutPopoverRef.value.hide()
    mitter.emit('layoutChange', item.type)
}
</script>

<style lang="scss" scoped>
.header {
    height: 40px;
    -webkit-app-region: drag;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;

    .left {
        padding-left: 20px;
    }

    .right {
        margin-right: 100px;
        display: flex;
        align-items: center;

        .layout-btn {
            -webkit-app-region: no-drag;
            cursor: pointer;
            padding: 3px 8px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            font-size: 14px;

            .cur-layout-icon {
                font-weight: bold;
                color: var(--text2);
                font-size: 13px;
            }

            .text {
                margin: 0 3px;
            }

            .icon-narrow-down {
                font-size: 10px;
            }

            &:hover {
                background: #ddd;
            }
        }
    }
}

.layout {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    .layout-item {
        text-align: center;
        cursor: pointer;

        &:hover {
            .iconfont {
                &::before {
                    border: 2px solid var(--blue);
                    color: #d0ddfc;
                }
            }
        }

        .iconfont {
            font-size: 50px;
            border-radius: 5px;
            padding: 0;

            &::before {
                border: 2px solid #fff;
                padding: 2px;
                border-radius: 5px;
                color: #b4b4b4;
            }
        }

        .name {
            font-size: 12px;
        }

        .active {
            &::before {
                border: 2px solid var(--blue);
                color: #d0ddfc;
            }
        }
    }
}
</style>