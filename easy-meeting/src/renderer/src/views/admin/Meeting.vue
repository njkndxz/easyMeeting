<template>
    <div class="top-panel">
        <el-form :model="searchForm" label-width="50px" label-position="right">
            <el-row>
                <el-col :span="8">
                    <el-form-item label="会议主题">
                        <el-input class="password-input" v-model="searchForm.meetingNameFuzzy" clearable
                            placeholder="支持模糊搜索" @keyup.enter="loadDataList">
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="4" :style="{ paddingLeft: '10px' }">
                    <el-button type="success" @click="loadDataList()">査询</el-button>
                </el-col>
            </el-row>
        </el-form>
    </div>
    <Table :columns="columns" :fetch="loadDataList" :dataSource="tableData" :options="tableOptions">
        <template #slotStatus="{ index, row }">
            <span style="color: green" v-if="row.status == 0">进行中</span>
            <span style="color:#8a8a8a" v-else>已结束</span>
        </template>
        <template #slotOperation="{ index, row }">
            <span class="a-link" v-if="row.status == 0" @click="finishMeeting(row)">结束会议</span>
            <span v-else>-</span>
        </template>
    </Table>
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
        label: '会议ID',
        props: 'meetingId',
        width: 200,
    },
    {
        label: '会议主题',
        props: 'meetingName',
    },
    {
        label: '创建时间',
        props: 'createTime',
        width: 200,
    },
    {
        label: '创建人',
        props: 'createUserName',
        width: 100
    },
    {
        label: '加入类型',
        props: 'joinType',
        width: 100,
        scopedSlots: 'slotOnline'
    },
    {
        label: '用户状态',
        props: 'status',
        width: 100,
        scopedSlots: 'slotStatus'
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
        url: proxy.Api.localAdminMeeting,
        params
    })

    if (!result) {
        return
    }
    Object.assign(tableData.value, result.data)
}

const finishMeeting = (data) => {
    proxy.Confirm({
        message: `确认要结束会议【${data.meetingName}】吗?`,
        okfun: async () => {
            let result = await proxy.Request({
                url: proxy.Api.adminFinishMeeting,
                params: {
                    meetingId: data.meetingId,
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

</style>