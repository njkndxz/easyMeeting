<template>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="400px"
        :showCancel="false" @close="dialogConfig.show = false">
        <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent="submitForm">
            <!--input输入-->
            <el-form-item label="原密码" prop="oldPassword">
                <el-input clearable placeholder="请输入原密码" type="password" v-model.trim="formData.oldPassword"></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
                <el-input clearable placeholder="请输入新密码" type="password" v-model.trim="formData.newPassword"></el-input>
            </el-form-item>
            <el-form-item label="确认新密码" prop="rePassword">
                <el-input clearable placeholder="请输入确认新密码" type="rePassword"
                    v-model.trim="formData.rePassword"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useContactStore } from '@/stores/UserContactStore'
import { mitter } from '@/eventbus/eventBus'

const contactStore = useContactStore()
const userInfoStore = useUserInfoStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const formData = ref({})
const formDataRef = ref()
const dialogConfig = ref({
    show: false,
    title: '修改密码',
})

const checkRePassword = (rule, value, callback) => {
    if (value !== formData.value.newPassword) {
        callback(new Error(rule.message))
    } else {
        callback()
    }
}


const rules = {
    oldpassword: [{ required: true, message: "请输入原密码" }],
    password: [
        { required: true, message: '请输入密码' },
        {
            validator: proxy.Verify.password,
            message: '密码只能是数字，字母，特殊字符 8-18位'
        }
    ],
    rePassword: [
        { required: true, message: "请再次输入密码" },
        {
            validator: checkRePassword,
            message: '两次输入的密码不一致'
        }
    ]
}

const submitForm = () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }
        let params = {}
        object.assign(params, formData.value)
        let result = await proxy.Request({
            url: proxy.Api.updatePassword,
            params
        })
        if (!result) {
            return
        }
        proxy.Message.success('请重新登录')
        dialogConfig.value.show = false
        await window.electron.ipcRenderer.invoke('logout')
        router.replace('/login')
    })
}

const show = async () => {
    dialogConfig.value.show = true
    await nextTick()
    formDataRef.value.resetFields()
}


defineExpose({
    show
})
</script>
<style lang="scss" scoped></style>