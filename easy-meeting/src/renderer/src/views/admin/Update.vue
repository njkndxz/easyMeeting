<template>
    <div class="top-panel">
        <el-form :model="searchForm" label-width="70px" label-position="right"><el-row>
                <el-col :span="8">
                    <el-form-item label="发布日期" label-width="70px">
                        <el-date-picker v-model="searchFormData.createTimeRange" type="daterange" range-separator="~"
                            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                            @change="loadDataList"></el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="8" :style="{ paddingLeft: '10px' }">
                    <el-button type="success" @click="loadDataList()">査询</el-button>
                    <el-button type="primary" @click="showEdit()">发布版本</el-button>
                </el-col>
            </el-row>
        </el-form>
    </div>
    <Table :columns="columns" :fetch="loadDataList" :dataSource="dataSource" :options="tableOptions">
        <template #slotUpdateDesc="{ index, row }">
            <div v-for="(item, num) in row.updateDescArray">{{ num + 1 }}、{{ item }}</div>
        </template>
        <template #fileTypeSlot="{ index, row }">
            <div v-if="row.fileType == 0">本地文件</div>
            <div v-if="row.fileType == 1">{{ row.outerLink }}</div>
        </template>
        <template #slotStatus="{ index, row }">
            <div style="color: #f56c6c" v-if="row.status == 0">未发布</div>
            <div style="color: #f7ba2a" v-if="row.status == 1">灰度发布</div>
            <div style="color: #529b2e" v-if="row.status == 2">全网发布</div>
        </template>
        <template #slotOperation="{ index, row }">
            <el-dropdown placement="bottom-end" trigger="click">
                <span class="iconfont icon-more"></span>
                    <template #dropdown>
                        <el-dropdown-item @click="showEdit(row)" v-if="row.status == 0">修改</el-dropdown-item>
                        <el-dropdown-item @click="updatePost(row)">发布</el-dropdown-item>
                        <el-dropdown-item @click="del(row)" v-if="row.status == 0">删除</el-dropdown-item>
                    </template>
            </el-dropdown>
        </template>
    </Table>
    <UpdateEdit ref="updateEditRef" @reload="loadDataList"></UpdateEdit>
    <UpdatePost ref="updatePostRef"  @reload="loadDataList"></UpdatePost>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useMeetingStore } from '@/stores/MeetingStore'
import { mitter } from '@/eventbus/eventBus'
import UpdateEdit from './UpdateEdit.vue'
import UpdatePost from './UpdatePost.vue'


const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const columns = [
    {
        label: '版本',
        props: 'version',
        width: 120,
    },
    {
        label: '更新内容',
        props: 'updateDesc',
        scopedSlots: 'slotUpdateDesc'
    },
    {
        label: '发布时间',
        props: 'createTime',
        width: 180,
    },
    {
        label: '文件类型',
        props: 'fileType',
        scopedSlots: 'fileTypeSlot',
        width: 100
    },
    {
        label: '状态',
        props: 'status',
        width: 80,
        scopedSlots: 'slotStatus'
    },
    {
        label: '操作',
        props: 'operation',
        width: 80,
        scopedSlots: 'slotOperation'
    },
]

const tableData = ref({})
const tableOptions = {}
const searchForm = ref({})
const searchFormData = ref({})
const loadDataList = async () => {
    let params = {
        pageNo: tableData.value.pageNo,
        pageSize: tableData.value.pageSize
    }
    if (searchFormData.value.createTimeRange) {
        params.createTimeStart = searchFormData.value.createTimeRange[0]
        params.createTimeEnd = searchFormData.value.createTimeRange[1]
    }
    delete params.createTimeRange
    Object.assign(params, searchForm.value)
    let result = await proxy.Request({
        url: proxy.Api.loadUpdateDataList,
        params
    })

    if (!result) {
        return
    }
    Object.assign(tableData.value, result.data)
}

const updateEditRef = ref()
const showEdit = () => {
    updateEditRef.value.showEdit()
}

const del = (data) => {
    proxy.Confirm({
        message: `确认要删除【${data.version}】吗?`,
        okfun: async () => {
            let result = await proxy.Request({
                url: proxy.Api.delUpdate,
                params: {
                    id: data.id,
                }
            })

            if (!result) {
                return
            }

            proxy.Message.success('删除成功')
            loadDataList()
        }
    })
}

const updatePostRef = ref()

</script>

<style lang="scss" scoped></style>