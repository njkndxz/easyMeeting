<template>
    <Dialog :show="dialogconfig.show" :title="dialogconfig.title" :buttons="dialogconfig.buttons" width="600px"
        :showCancel="false" @close="dialogconfig.show = false">
        <el-form ref="formDataRef" :model="formData" :rules="rules" label-width="100px" @submit.prevent>
            <el-form-item label="版本号">{{ formData.version }}</el-form-item>
            <el-form-item label="发布状态" prop="status">
                <el-radio-group v-model="formData.status">
                    <el-radio :value="0">取消发布</el-radio>
                    <el-radio :value="1">灰度发布</el-radio>
                    <el-radio :value="2">全网发布</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="灰度uID" prop="grayscaleUid" v-if="formData.status == 1">
                <div class="tag-panel">
                    <el-tag v-for="(tag, index) in formData.grayscaleUid" :key="tag" closable @close="closeTag(index)"
                        :type="tag.type" class="tag" {{ tag }}>
                    </el-tag>
                    <div class="tag input" v-if="showInput">
                        <el-input size="small" clearable placeholder="请输入UID" v-model.trim="tagInput"
                            @blur="addUid" @keyup.enter="addUid"></el-input>
                    </div>
                    <div class="tag" v-if="!showInput">
                        <el-button type="primary" size="small" @click="showInputHandler"></el-button>
                    </div>
                </div>
            </el-form-item>
        </el-form>
    </Dialog>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { useMeetingStore } from '@/stores/MeetingStore'
import { mitter } from '@/eventbus/eventBus'


const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const formData = ref({})
const formDataRef = ref()
const rules = {
    status: [{ required: true, message: '请选择发布状态' }],
}

const emit = defineEmits(['reload'])

const submitForm = () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return
        }

        let params = {}
        Object.assign(params, formData.value)
        params.grayscaleUid = params.grayscaleUid.join(',')
        let result = await proxy.Request({
            url: proxy.Api.postUpdate,
            params
        })

        if (!result) {
            return
        }

        dialogconfig.value.show = false
        emit('reload')
    })
}

const showEdit = (data) => {
    dialogconfig.value.show = true
    nextTick(() => {
        formDataRef.value.resetFields()
        formData.value = Object.assign({
            id: data.id,
            version: data.version,
            status: data.status,
            grayscaleUid: data.grayscaleUid ? data.grayscaleUid.split(',') : []
        })
    })
}

const showInput = ref()
const tagInput = ref()
const addUid = () => {
    if (tagInput.value) {
        formData.value.grayscaleUid.push(tagInput.value)
    }

    tagInput.value = ''
    showInput.value = false
}
const showInputHandler = () => {
    showInput.value = true
}

const closeTag = (index) => {
    formData.value.grayscaleUid.splice(index, 1)
}

const dialogconfig = ref({
    show: false,
    title: '发布更新',
    buttons: [
        {
            type: 'primary',
            text: '确定',
            click: (e) => {
                submitForm()
            }
        }
    ]
})

defineExpose({
    showEdit
})

</script>

<style lang="scss" scoped>
.tag-panel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .tag {
        margin: 0 5px 5px 0;
    }

    .input {
        width: 150px;
    }
}
</style>