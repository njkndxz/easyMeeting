<template>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :button="dialogConfig.buttons" width="640px"
        :showCancel="false" @close="dialogConfig.show = false">
        <el-form :model="formData" ref="formDataRef" label-width="0px" @submit.prevent>
            <el-form-item label="" prop="">
                <el-transfer v-model="formData.selectContactIds" :titles="['全部', '已选']" :format="{
                    noChecked: '${total}',
                    hasChecked: '${checked}/${total}'
                }" :data="contactList" :props="{
                        key: 'contactId',
                        label: 'nickName'
                    }" filterable :filter-method="search">
                    <template #default="{ options }">
                        <div class="nick-name">{{ options.nickName }}</div>
                    </template>
                </el-transfer>
            </el-form-item>
        </el-form>
    </Dialog>
</template>
<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { mitter } from '@/eventbus/eventBus'

const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const search = (query, item) => {
    return item.nickName.toLowerCase().includes(query.toLowerCase())
}

const contactList = ref([])
const loadContactList = async () => {
    let result = await proxy.Request({
        url: proxy.Api.loadContactUser,
        params: {}
    })

    if (!result) {
        return
    }

    const inMeetingMembers = meetingStore.memberList.map(item => {
        return item.userId
    })

    contactList.value = result.data.map(item => {
        if (inMeetingMembers.includes(item.contactId)) {
            item.disabled = true
            item.nickName = item.nickName + '(已入会)'
        } else if (item.onlineType == 1) {
            item.nickName = item.nickName + '(在线)'
        } else if (item.onlineType == 1) {
            item.disabled = true
            item.nickName = item.nickName + '(离线)'
        }

        return item
    })
}

const formData = ref({
    selectContactIds: []
})

const submitData = async () => {
    if(formData.value.selectContactIds.length === 0) {
        proxy.Message.warning('请选择联系人')
        return
    }

    let params = {}
    Object.assign(params, formData.value)
    params.selectContactIds = params.selectContactIds.join(',')

    let result = await proxy.Request({
        url: proxy.Api.inviteMember,
        params
    })

    if(!result) {
        return
    }

    dialogConfig.value.show = false
    proxy.Message.success('发送邀请成功')
}

const dialogConfig = ref({
    show: false,
    title: '选择联系人',
    buttons: [
        {
            type: 'primary',
            text: '确定',
            click: (e) => {
                submitData()
            }
        }
    ]
})

const show = () => {
    dialogConfig.value.show = true
    loadContactList()
    formData.value = {
        selectContactIds: []
    }
}

defineExpose({
    show
})
</script>
<style lang="scss" scoped>
.el-transfer {
    width: 100%;
    display: block !important;
    display: flex;

    :deep(.el-transfer-panel) {
        width: 280px;
    }

    :deep(.el-transfer-panel__item) {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 5px;
    }
}

:deep(.el-transfer__buttons) {
    width: 60px;
    flex-direction: column;
    text-align: center;
    padding: 0;

    .el-transfer__button {
        text-align: center;
        margin: 5px 0 0 0;
        padding: 10px;
        height: 30px;
        border-radius: 50%;
    }
}

.select-item {
    display: flex;

    .avatar {
        width: 30px;
        height: 30px;
    }

    .nick-name {
        flex: 1;
        margin-left: 5px;
    }
}
</style>