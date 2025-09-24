<template>
    <Header :showMax="false" ref="headerRef"></Header>
    <div class="body-content">
        <div class="title">预定会议</div>
        <div class="form-panel">
            <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="50px" @submit.prevent
                label-position="top">
                <el-form-item label="开始" prop="startTime">
                    <el-date-picker v-model="formData.startTime" type="datetime" placeholder="选择开始时间"
                        time-format="HH:mm" :disabled-date="disabledDate" value-format="YYYY-MM-DD HH: mm"
                        format="YYYY-MM-DD HH:mm" :style="{ width: '100%' }" />
                </el-form-item>
                <!--input输入-->
                <el-form-item label="主题" prop="meetingName">
                    <el-input clearable placeholder="请输入主题" v-model="formData.meetingName"></el-input>
                </el-form-item>
                <!--input输入-->
                <el-form-item label="时长(分钟)" prop="duration">
                    <el-input-number v-model="formData.duration" :step="5" :min="10" :max="180" />
                </el-form-item>
                <el-form-item label="安全" prop="joinType">
                    <el-checkbox v-model="formData.joinType" label="入会密码” size=" large” />
                </el-form-item>
                <el-form-item prop="joinPassword" v-if="formData.joinType">
                    <el-input clearable placeholder="请输入密码" v-model="formData.joinPassword" :maxlength="5"></el-input>
                </el-form-item>
                <el-form-item label="邀请" prop="inviteUserIds">
                    <el-select v-model="formData.inviteuserIds" multiple placeholder="请选择联系人" style="width: 100%">
                        <el-option v-for="item in contactlist" :key="item.contactId" :label="item.nickName"
                            :value="item.contactId" />
                    </el-select>
                </el-form-item>
            </el-form>
        </div>
        <div class="submit-btn">
            <el-button tyde="primary" :style="{ width: '100%' }" size="large" @click="submit">预定</el-button>
        </div>
    </div>
</template>
<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const disabledDate = (time) => {
    return time.getTime() < Date.now() - 8.64e7 // -8.64e7是今天可选
}

const formData = ref({
    duration: 30,
    startTime: proxy.Utils.formatDate2(new Date(), 'YYYY-MM-DD HH:mm')
})

const formDataRef = ref()
const rules = {
    startTime: [{ required: true, message: '请选择开始时间' }],
    duration: [{ required: true, message: '请选择时长' }],
    meetingName: [{ required: true, message: '请输入主题' }],
    joinPassword: [{ required: true, message: '请输入入会密码' }],
}

const headerRef = ref()
const submit = () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }
        let params = {}
        Object.assign(params, formData.value)
        if (params.joinType) {
            params.joinType = 1
        } else {
            params.joinType = 0
        }

        let result = await proxy.Request({
            url: proxy.Api.createMeetingReserve,
            params
        })

        if (!result) {
            return
        }

        formDataRef.value.resetFields()
        // 向主框口发送消息
        window.electron.ipRenderer.send('windowCommunication', { windowId: 'main', data: 'reload' })
        headerRef.value.close()
    })
}

const contactList = ref([])
const loadContact = async () => {
    let result = await proxy.Request({
        url: proxy.Api.loadContactUser
    })

    if (!result) {
        return
    }

    contactList.value = result.data
}
loadContact()
</script>
<style lang="scss" scoped>
.body-content {
    padding: 10px 20px;

    .title {
        font-size: 18px;
        font-weight: bold;
    }

    .form-panel {
        margin-top: 10px;
    }

    .submit-btn {
        right: 10px;
        left: 10px;
        position: absolute;
        bottom: 10px;
    }
}
</style>