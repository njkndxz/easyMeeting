<template>
    <div class="top-panel">
        <el-form :model="searchForm" label-width="50px" label-position="right">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="昵称">
                        <el-input class="password-input" v-model="searchForm.nickNameFuzzy" clearable
                            placeholder=" 支持模糊搜索" @keyup.enter="loadDataList"></el-input>
                    </el-form-item>
                </el-col>

                <el-col :span="4" :style="{ paddingLeft: '10px' }">
                    <el-button type="success" @click="loadDataList()">査询</el-button>
                </el-col>
            </el-row>
        </el-form>

        <Table :columns="columns" :fetch="loadDataList" :dataSource="tableData" :options="tableOptions">
            <template #slotAvatar="{ index, row }">
                <Avatar :avatar="row.userId"></Avatar>
            </template>
            <template #slotNickName="{ index, row }">
                {{ row.nickName }} ({{ row.userId }})
                <span v-if="row.sex == 0" class="iconfont icon-woman"></span>
                <span v-if="row.sex == 1" class="iconfont icon-man"></span>
            </template>
            <template #slotStatus="{ index, row }">
                <span style="color:red" v-if="row.status == 0">禁用</span>
                <span style="color: green" v-else>启用</span>
            </template>
            <template #slotOnline="{ index, row }">
                <span style="color: green" v-if="row.onlineType == 0">在线</span>
                <span style="color: #8a8a8a" v-else>离线</span>
            </template>
            <template #slotOperation="{ index, row }">
                <el-dropdown placement="bottom-end" trigger="click" v-if="userInfoStore.userInfo.userId != row.userId">
                    <span class="iconfont icon-more"></span>
                    <template #dropdown>
                        <el-dropdown-item @click="changeAccountStatus(row)">{{ row.status
                            == 0 ? '启用' : '禁用' }}</el-dropdown-item>
                        <el-dropdown-item @click="forceOffLine(row)" v-if="row.onlineType == 1">强制下线</el-dropdown-item>
                    </template>
                </el-dropdown>
                <div v-else>管理员</div>
            </template>
        </Table>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useMeetingStore } from '@/stores/MeetingStore'
import { mitter } from '@/eventbus/eventBus'


const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const columns = [
    {
        label: '头像',
        props: 'userId',
        width: 70,
        scopedSlots: 'slotAvatar'
    },
    {
        label: '昵称',
        props: 'nickName',
        scopedSlots: 'slotNickName'
    },
    {
        label: '邮箱',
        props: 'email',
        width: 200
    },
    {
        label: '加入时间',
        props: 'createTime',
        width: 200
    },
    {
        label: '用户状态',
        props: 'status',
        width: 100,
        scopedSlots: 'slotStatus'
    },
    {
        label: '在线状态',
        props: 'onlineType',
        width: 100,
        scopedSlots: 'slotOnline'
    },
    {
        label: '操作',
        props: 'operation',
        width: 100,
        scopedSlots: 'slotOperation'
    },
]

const tableData = ref({})
const tableOptions = {}
const searchForm = ref({})
const loadDataList = async () => {
    let params = {
        pageNo: tableData.value.pageNo,
        pageSize: tableData.value.pageSize
    }
    Object.assign(params, searchForm.value)
    let result = await proxy.Request({
        url: proxy.Api.localUserList,
        params
    })

    if (!result) {
        return
    }
    Object.assign(tableData.value, result.data)
}

const changeAccountStatus = (data) => {
    let status = data.status == 0 ? 1: 0
    let info = status == 0 ? '禁用' : '启用'
    proxy.Confirm({
        message: `确认要【${info}】【${data.nickName}】吗?`,
        okfun: async () => {
            let result = await proxy.Request({
                url: proxy.Api.updateUserStatus,
                params: {
                    userId: data.userId,
                    status
                }
            })

            if (!result) {
                return
            }

            proxy.Message.success('操作成功')
            loadDataList()
        }
    })
}

const forceOffLine = (data) => {
    proxy.Confirm({
        message: `确认要将【${data.nickName}】强制下线吗?`,
        okfun: async () => {
            let result = await proxy.Request({
                url: proxy.Api.forceOffLine,
                params: {
                    userId: data.userId,
                }
            })

            if (!result) {
                return
            }

            proxy.Message.success('操作成功')
            loadDataList()
        }
    })
}
</script>

<style lang="scss" scoped>
.icon-man {
    color: #2cb6fe;
}

.icon-woman {
    color: #fb7373;
}
</style>