<template>
    <div class="op-btns" :style="{ top:`${styleTop}px`, right: `${styleRight}px`, borderRadius: `${borderRadius}px` }">
        <div class="iconfont" :style="{borderRadius: `${borderRadius}px`}" v-if="showMin" @click="minimize" title="最小化">
            <el-icon><Minus /></el-icon>
        </div>
        <div class="iconfont" :style="{borderRadius: `${borderRadius}px`}" v-if="showMax" @click="maximize" :title="isMax ? '最大化' : '还原'">
            <el-icon>
                <CopyDocument v-if="isMax"/>
                <FullScreen v-else/>
            </el-icon>
        </div>
        <div class="iconfont close" :style="{borderRadius: `${borderRadius}px`}" v-if="showClose" @click="close" title="关闭">
            <el-icon><Close /></el-icon>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Minus, FullScreen, CopyDocument, Close } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const isMax = ref(false)

const props = defineProps({
    showMin: {
        type: Boolean,
        default: true
    },
    showMax: {
        type: Boolean,
        default: false
    },
    showClose: {
        type: Boolean,
        default: true
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

const winOp = (action, data) => {
    window.electron.ipcRenderer.send("winTitleOp", { action, data })
}
// 关闭
const close = () => {
    winOp("close", {closeType: props.closeType, forceClose: props.forceClose})
}
const cuseClose = () => {
    winOp("close", {closeType: props.closeType, forceClose: true})
}

const minimize = () => {
    winOp("minimize")
}

const maximize = () => {
    isMax.value ? winOp("unmaximize") : winOp("maximize")
}

onMounted(() => {
    isMax.value = false
    window.electron.ipcRenderer.on("winIsMax", (e, result) => {
        isMax.value = result
    })
})

defineExpose({
    cuseClose
})


</script>

<style lang="scss" scoped>
.op-btns {
    position: absolute;
    -webkit-app-region: no-drag;
    display: flex;
    .iconfont {
        color: var(--text);
        padding: 6px;
        cursor: pointer;
        &:hover {
            background: #ddd;
        }
    }

    .close {
        border-top-right-radius: 10px !important;
        &:hover {
            background: #fa4e32;
            color: #fff;
        }
    }

    .win-top {
        color: var(--pink);
    }
}
</style>