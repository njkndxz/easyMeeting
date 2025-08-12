<template>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="400px"
        :showCancel="false" @close="dialogConfig.show = false">
        <el-form :model="formData" :rules="rules" ref="formDataref" label-width="80px" @submit.prevent>
            <!--input输入-->
            <el-form-item label="会议号" prop="">
                <el-radio-group v-model="formData.meetingNoType">
                    <el-radio :value="0">使用个人会议号</el-radio>
                    <el-radio :value="1">系统生成</el-radio>
                </el-radio-group>
                <el-input clearable placeholder="请输入会议号" v-model.trim="formData.meetingNo" disabled
                    v-if="formData.meetingNoType == 0"></el-input>
            </el-form-item>

            <el-form-item label="会议主题" prop="meetingName">
                <el-input clearable placeholder="请输入会议主题" v-model.trim="formData.meetingName" :maxlength="100"
                    :show-word-limit="true"></el-input>
            </el-form-item>

            <el-form-item label="入会密码" prop="joinType">
                <el-radio-group v-model="formData.joinType">
                    <el-radio :value="0">无需密码</el-radio>
                    <el-radio :value="1">密码入会</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item prop="joinPassword" v-if="formData.joinType == 1">
                <el-input clearable placeholder="请输入入会密码" v-model.trim="formData.joinPassword" :maxlength="5"
                    :show-word-limit="true"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { getCurrentInstance, nextTick, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const formData = ref({})
const formDataRef = ref()
const rules = {
    meetingName: [{ required: true, message: '请输入会议主题' }],
    joinPassword: [{ required: true, message: '请输入入会密码' }],
}

const emit = defineEmits(['joinMeeting'])

const dialogConfig = ref({
    show: false,
    title: '快速会议',
    buttons: [
        {
            type: 'primary',
            text: '确定',
            click: (e) => {
                quickMeeting()
            }
        }
    ]
})

const show = () => {
    dialogConfig.value.show = true
    nextTick(() => {
        formDataRef.value.resetFields()
        formData.value = {
            meetingNoType: 0,
            meetingNo: userInfoStore.userInfo.meetingNo,
            joinType: 0
        }
    })
}

const quickMeeting = async () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }

        let result = await proxy.Request({
            url: proxy.Api.quickMeeting,
            params: object.assign({}, formData.value)
        })

        if (!result) {
            return
        }
        
        dialogConfig.value.show = false
        emit('joinMeeting')
    })
}



defineExpose({
    show
})

</script>

<style lang="scss" scoped></style>