<template>
    <div v-loading="showLoading">
        <Header :closeType="1"></Header>

        <div class="login-form">
            <div class="error-msg">{{ errMsg }}</div>
            <el-form ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules" label-width="auto" @submit.prevent>
                <el-form-item prop="email">
                    <el-input placeholder="请输入邮箱" v-model="ruleForm.email" :prefix-icon="Message" clearable />
                </el-form-item>
                <el-form-item prop="nickName" v-if="!isLogin">
                    <el-input placeholder="请输入昵称" v-model="ruleForm.nickName" :prefix-icon="User" clearable />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input placeholder="请输入密码" v-model="ruleForm.password" type="password" autocomplete="off"
                        minLength="8" maxLength="18" :prefix-icon="Lock" clearable />
                </el-form-item>
                <el-form-item label="" prop="checkPass" v-if="!isLogin">
                    <el-input placeholder="请再次输入密码" v-model="ruleForm.checkPass" type="password" autocomplete="off"
                        minLength="8" maxLength="18" :prefix-icon="Lock" clearable />
                </el-form-item>
                <el-form-item prop="checkCode">
                    <div class="check-code-panel">
                        <el-input placeholder="请输入验证码" v-model="ruleForm.checkCode" :prefix-icon="CircleCheck" />
                    </div>
                    <img class="check-code" :src="checkCodeUrl" alt="" @click="changeCheckCode" />
                </el-form-item>
                <el-form-item>
                    <el-button class="login-btn" type="primary" @click="submitForm(ruleFormRef)">
                        {{ isLogin ? '登录' : '注册' }}
                    </el-button>
                </el-form-item>
                <div class="bottom-link" @click="changeOpType">
                    <span class="a-link no-account">
                        {{ isLogin ? '没有账号' : '已有账号?' }}
                    </span>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock, CircleCheck, User } from '@element-plus/icons-vue'
import md5 from 'js-md5'

const { proxy } = getCurrentInstance()
const router = useRouter()

import { useUserInfoStore } from '@/stores/UserInfoStore'
const userInfoStore = useUserInfoStore()

const checkCodeUrl = ref(null)
const changeCheckCode = async () => {
    let result = await proxy.Request({
        url: proxy.Api.checkCode,
    })

    if (!result) {
        return;
    }

    checkCodeUrl.value = result.data.checkCode
    localStorage.setItem("checkCodeKey", result.data.checkCodeKey)
}

requestIdleCallback(changeCheckCode)

const showLoading = ref(false)
const isLogin = ref(true)
const ruleFormRef = ref()
const errMsg = ref('')
const ruleForm = reactive({
    password: '',
    checkCode: '',
    email: '',
    nickName: '',
    checkPass: ''
})

const cleanVerify = () => {
    errMsg.value = ''
}

const changeOpType = async () => {
    await window.electron.ipcRenderer.invoke("loginOrRegister", !isLogin.value)
    isLogin.value = !isLogin.value
    nextTick(() => {
        ruleFormRef.value.resetFields()
        ruleForm.value = {}
        changeCheckCode()
        cleanVerify()
    })
}

const checkValue = (type, value, msg) => {
    if (proxy.Utils.isEmpty(value)) {
        errMsg.value = msg
        return false
    }

    if (type && !proxy.Verify[type](value)) {
        errMsg.value = msg
        return false
    }

    return true
}

const submitForm = async (formEl) => {
    if (!formEl) return
    cleanVerify()

    if (!checkValue('checkEmail', ruleForm.value.email, '请输入正确的邮箱')) {
        return
    }

    if (!isLogin.value && !checkValue(null, ruleForm.value.nickName, '请输入昵称')) {
        return
    }

    if (!checkValue('checkPassword', ruleForm.value.password, '密码只能是数字, 字母, 特殊字符8到18位')) {
        return
    }

    if (!isLogin.value && !checkValue(null, ruleForm.value.checkPass, '请再次输入密码')) {
        return
    }

    if (!checkValue('null', ruleForm.value.checkCode, '请输入正确的验证码')) {
        return
    }

    if (!isLogin.value && ruleForm.value.password !== ruleForm.value.checkPass) {
        errMsg.value = "两次输入的密码不一致"
        return
    }

    if (isLogin.value) {
        showLoading.value = true
    }

    const result = await proxy.Request({
        url: isLogin.value ? proxy.Api.login : proxy.Api.register,
        showError: false,
        showLoading: false,
        params: {
            email: ruleForm.value.email,
            password: isLogin.value ? md5(ruleForm.value.password) : ruleForm.value.password,
            checkCode: ruleForm.value.checkCode,
            nickName: ruleForm.value.nickName,
            checkCodeKey: localStorage.getItem('checkCodeKey')
        },
        errorCallback: (response) => {
            changeCheckCode()
            errMsg.value = response.info
            showLoading.value = false
        }
    })

    if (!result) {
        return
    }

    showLoading.value = false

    if (isLogin.value) {
        proxy.Message.success('登录成功')
        await window.electron.ipcRenderer.invoke("loginSuccess", {
            userInfo: result.data,
            wsUrl: import.meta.env.VITE_WS
        })
        userInfoStore.setInfo(result.data)
        router.replace('/home')
    } else {
        proxy.Message.success('注册成功')
        changeOpType()
    }
}

const rules = reactive({
    email: [{ required: true, trigger: 'blur' }],
    password: [{ required: true, trigger: 'blur' }],
    checkCode: [{ required: true, trigger: 'blur' }],
    nickName: [{ required: true, trigger: 'blur' }],
    checkPass: [{ required: true, trigger: 'blur' }],
})
</script>

<style lang="scss" scoped>
.email-select {
    width: 250px;
}

.loading-panel {
    height: calc(100vh - 32px);
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    font-size: 14px;
    color: #727272;

    img {
        width: 30px;
        margin-right: 3px;
    }
}

.login-form {
    padding: 8px 15px;
    height: calc(100vh - 32px);

    :deep(.el-input__wrapper) {
        box-shadow: none;
        border-radius: none;
    }

    .el-form-item {
        border-bottom: 1px solid #ddd;
    }

    .email-panel {
        align-items: center;
        width: 100%;
        display: flex;

        .input {
            flex: 1;
        }

        .icon-down {
            margin-left: 3px;
            width: 16px;
            cursor: pointer;
            border: none;
        }
    }

    .error-msg {
        line-height: 30px;
        height: 30px;
        color: #fb7373;
    }

    .check-code-panel {
        display: flex;

        .check-code {
            cursor: pointer;
            width: 120px;
            margin-left: 5px;
        }
    }

    .login-btn {
        margin-top: 20px;
        width: 100%;
    }

    .bottom-link {
        text-align: right;
        font-size: 13px;
    }

}
</style>