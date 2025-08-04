<template>
    <div class="image-panel" ref="coverRef" :style="{
        'border-radius': borderRadius,
        width: width ? width + 'px' : '100%',
        height: scale ? width * scale + 'px' : 'auto',
    }">
        <el-image :lazy="lazy" :src="fileSource || fileImage" :fit="fit" v-if="fileSource || fileImage"
            preview-teleported :preview-src-list="imageListResult" :initial-index="initialIndex">
            <template #error>
                <img src="../assets/images/404.png" class="el-image__inner" :style="{ 'object-fit': fit }" />
            </template>
        </el-image>
    </div>
</template>

<script setup>
import { computed, getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mitter } from '@/eventbus/eventBus'


const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const props = defineProps({
    source: {
        type: [String, File]
    },
    width: {
        type: Number,
    },
    fit: {
        type: String,
        default: 'scale-down',
    },
    preview: {
        type: Boolean,
        default: false
    },
    borderRadius: {
        type: String,
        default: '5px'
    },
    lazy: {
        type: Boolean,
        default: true
    },
    scale: {
        type: Number
    },
    initialIndex: {
        type: Number,
        default: 0
    },
    imageList: {
        type: Array
    }
})

const fileImage = ref()
const fileSource = computed(() => {
    if(!props.source) {
        fileImage.value = null
        return null
    }

    if(props.source instanceof File) {
        let img = new FileReader()
        img.readAsDataURL(props.source)
        img.onload = ({target}) => {
            fileImage.value = target.result
        }
        return
    }

    if(typeof props.source === 'string') {
        return props.source
    }
})

const imageListResult = computed(() => {
    if(!props.preview) {
        return []
    }
    if(props.imageList) {
        // 聊天预览图片
        const result = props.imageList.map((item) => {

        })
        return []
    }
})
</script>

<style lang="scss" scoped>
.image-panel {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background:#f8f8f8;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;

    :deep(.eL-image) {
        width: 100%;
        height: 100%;
    }

    :deep(.is-loading) {
        display: none;
    }

    :deep(.el-image__wrapper) {
        position: relative;
        vertical-align: top;
        width: 100%;
        height: 100%;
        display: flex;
    }

    .icon-image-error {
        margin: opx auto;
        font-size: 20px;
        color:
            #838383;
        height: 100%;
    }

    .loading {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
            width: 20px;
        }
    }

    .no-image {
        text-align: center;
        color: #9f9f9f;
    }
}
</style>