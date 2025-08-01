<template>
    <div class="contact-apply-list">
        <div class="contact-item" v-for="item in contactApplyList">
            <Avatar :avatar="item.applyUserId"></Avatar>
            <div class="nick-name">{{ item.nickName }}</div>
            <div class="result-tip" v-if="item.status !== 0">{{ item.statusName }}</div>
            <el-dropdown v-else>
                <el-button type="primary" size="small">接受</el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="dealWithApply(item.applyUserId, 1)">同意</el-dropdown-item>
                        <el-dropdown-item @click="dealWithApply(item.applyUserId, 2)">拒绝</el-dropdown-item>
                        <el-dropdown-item @click="dealWithApply(item.applyUserId, 3)">拉黑</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mitter } from '@/eventbus/eventbus'
import { Avatar } from '@element-plus/icons-vue'
import { useContactStore } from '@/stores/UserContactStore'


const contactStore = useContactStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const contactApplyList = ref([])
const loadContactApply = async () => {
    const result = await proxy.Request({
        url: proxy.Api.loadContactApply
    })

    if (!result) {
        return
    }

    contactApplyList.value = result.data
}
loadContactApply()

const dealWithApply = async (applyUserId, status) => {
    const result = await proxy.Request({
        url: proxy.Api.dealWithApply,
        params: {
            applyUserId,
            status
        }
    })

    if (!result) {
        return
    }

    mitter.emit('reloadContact')
    contactStore.updateLastUpdateTime()
}

watch(() => contactStore.updateLastUpdateTime, (newVal, oldVal) => {
    if (!newVal) {
        return
    }

    loadContactApply()
}, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.contact-apply-list {
    height: calc(100vh - 65px);
    overflow: auto;

    .contact-item {
        padding-top: 5px;
        display: flex;
        align-items: center;

        .nick-name {
            flex: 1;
            margin: 0 5px;
            font-size: 14px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .result-tip {
            font-size: 12px;
            color: #5b5b5b;
        }
    }
}

.el-tooltip__trigger:focus-visible {
    outline: unset;
}
</style>