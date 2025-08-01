<template>
    <div class="header" :style="{ borderBottom: showBottomBorder ? '1px solid #ddd' : 'none' }">
        <div class="title" v-if="title">{{ title }}</div>
        <TitleBar :closeType="closeType" :showMax="showMax"></TitleBar>
    </div>
</template>

<script setup>
import { getCurrentInstance, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
    title: {
        type: String,
    },
    showMin: {
        type: Boolean,
        default: true
    },
    showMax: {
        type: Boolean,
        default: true
    },
    showClose: {
        type: Boolean,
        default: true
    },
    showBottomBorder: {
        type: Boolean,
        default: false
    },
    closeType: {
        type: Number,
        default: 1 // 0关闭,1隐藏
    },
    styleTop: {
        type: Number,
        default: 0
    },
    styleRight: {
        type: Number,
        default: 0
    },
    borderRadius: {
        type: Number,
        default: 0
    },
    forceClose: {
        type: Boolean,
        default: true
    }
})
</script>

<style lang="scss" scoped>
.header {
    height: 30px;
    -webkit-app-region: drag;
    text-align: center;
    padding-top: 5px;
    overflow: hidden;
    border-radius: 10px;
}
</style>