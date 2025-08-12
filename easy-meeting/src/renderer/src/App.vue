<template>
  <el-config-provider :locale="zhCn">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import { useUserInfoStore } from '@/stores/UserInfoStore'
import { onMounted } from 'vue'

const userInfoStore = useUserInfoStore()

const saveUserInfoStore = async () => {
  userInfoStore.setInfo(JSON.parse(localStorage.getItem('userInfo')) || {})
}

onMounted(() => {
  saveUserInfoStore()
})

</script>

<style lang="scss" scoped>

</style>