<template>
    <div>

    </div>
</template>

<script setup>
const props = defineProps({
    autoUpdater: {
        type: Boolean,
        default: false
    }
})

const checkUpdate = () => {

}

defineExpose({
    checkUpdate
})
</script>

<style lang="scss" scoped>

</style>