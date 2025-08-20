<template>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="400px"
        :showCancel="false" @close="dialogConfig.show = false">
        <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent>
            <el-form-item label="会议号" prop="meetingNo" v-if="!formData.meetingId">
                <el-input clearable placeholder="请输入会议号" v-model.trim="formData.meetingNo"></el-input>
            </el-form-item>

            <el-form-item label="你的名称" prop="nickName">
                <el-input clearable placeholder="请输入你的名称" v-model.trim="formData.nickName"></el-input>
            </el-form-item>

            <el-form-item label="会议密码" prop="">
                <el-radio-group v-model="formData.joinType">
                    <el-radio :value="0">免密入会</el-radio>
                    <el-radio :value="1">密码入会</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="入会密码" prop="joinPassword">
                <el-input :maxLength="5" show-word-limit clearable placeholder="请输入入会密码" v-model.trim="formData.joinPassword"></el-input>
            </el-form-item>

            <el-form-item label="选择屏幕" prop="screenId" v-if="formData.addType == 1 && screenSources.length > 1">
                <el-radio-group v-model="formData.screenId">
                    <el-radio :value="item.id" size="large" v-for="item in screenSources">
                        <template #default>
                            <Cover :width="90" :scale="0.6" :source="item.thumbnail" borderRadius="0px"></Cover>
                            <div>{{ item.name }}</div>
                        </template>
                    </el-radio>
                </el-radio-group>
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
const emit = defineEmits(['joinMeeting'])

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const formData = ref({})
const formDataRef = ref()

const dialogConfig = ref({
    show: false,
    title: '快速会议',
    buttons: [
        {
            type: 'primary',
            text: '确定',
            click: (e) => {
                addMeeting()
            }
        }
    ]
})

const rules = {
    meetingNo: [{ required: true, message: '请输入会议号' }],
    nickName: [{ required: true, message: '请输入你的名字' }],
    joinPassword: [{ required: true, message: '请输入入会密码' }],
    screenId: [{ required: true, message: '请选择共享屏幕' }]
}

const addMeeting = async () => {
    formDataRef.value.validate(async (valid) => {
        if(!valid) {
            return
        }

        let params = {}
        Object.assign(params, formData.value)
        let result = await proxy.Request({
            url: formData.value.meetingId ? proxy.Api.reserveJoinMeeting: proxy.Api.preJoinMeeting,
            params
        })

        if(!result) {
            return
        }

        dialogConfig.value.show = false
        emit('joinMeeting', formData.value.addType, formData.value.screenId)
    })
}

const screenSources = ref([])

const show = async ({ meetingId, addType = 0 }) => {
    const textInfo = addType === 0 ? '加入会议' : '共享屏幕'
    dialogConfig.value.show = true
    dialogConfig.value.title = textInfo
    dialogConfig.value.buttons[0].text = textInfo
    let screenId = ''
    if(addType == 1) {
        screenSources.value = await window.electron.ipcRenderer.invoke("getScreenSource", {
            types: ['screen'],
            thumbnailSize: {
                width: 600,
                height: 360
            }
        })

        screenId = screenSources.value[0].id
    }

    await nextTick()

    formDataRef.value.resetFields()
    formData.value = {
        addType,
        meetingId,
        joinType: 0,
        nickName: userInfoStore.userInfo.nickName,
        screenId
    }
}

defineExpose({
    show
})
</script>

<style lang="scss" scoped>
.setting-panel {
    margin-bottom: 0;

    :deep {
        .el-checkbox-group {
            display: flex;
            flex-direction: column;
        }
    }
}
</style>