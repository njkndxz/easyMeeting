<template>
    <el-dialog :show-close="showClose" :draggable="draggable" :model-value="show" :close-on-click-modal="false"
        class="cust-dialog" :top="top + 'px'" :width="width" @close="close" @open="open">
        <template #header="{ close, titleId, titleclass }">
            <div v-if="title" class="title">{{ title }}</div>
            <slot v-else name="header"></slot>
        </template>
        <div class="dialog-body" :style="{ 'max-height': maxHeight + 'px', padding: padding + 'px' }">
            <slot></slot>
        </div>
        <template v-if="(buttons && buttons.length > 0) || showCancel">
            <div class="dialog-footer">
                <el-button link @click="close" v-if="showCancel">取消 </el-button>
                <el-button v-for="btn in buttons" ;type="btn.type || 'primary'" @click="btn.click">
                    {{ btn.text }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
const props = defineProps({
    draggable: {
        type: Boolean,
        default: true
    },
    title: {
        type: String,
    },
    show: {
        type: Boolean,
        default: false
    },
    showClose: {
        type: Boolean,
        default: true
    },
    showCancel: {
        type: Boolean,
        default: true
    },
    top: {
        type: Number,
        default: 50
    },
    width: {
        type: String,
        default: '30%'
    },
    buttons: {
        type: Array,
    },
    padding: {
        type: Number,
        default: 15
    },
})

const maxHeight = window.innerHeight - props.top - (!props.buttons || props.buttons.length == 0 ? 50 : 90)

const emit = defineEmits(['close', 'open'])

const close = () => {
    emit('close')
}

const open = () => {
    emit('open')
}
</script>

<style lang="scss" scoped>
.cust-dialog {
    padding: 0 !important;
    margin-bottom: 5px !important;
    -webkit-app-region: no-drag;

    .el-dialog__header {
        padding: 5px 0 5px 10px;
        border-bottom: 1px solid #ddd;
        -webkit-app-region: no-drag;
    }

    .el-dialog_body {
        padding: 0;
    }

    .title {
        font-size: 20px;
    }

    .dialog-body {
        min-height: 80px;
        overflow: auto;
        overflow-x: hidden;
    }

    .dialog-footer {
        border-top: 1px solid #ddd;
        text-align: right;
        padding: 5px 20px;
    }
}
</style>