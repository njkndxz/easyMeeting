<template>
    <div class="no-data">
        <div class="iconfont icon-coffe"></div>
        <div class="msg">{{ msg }}</div>
    </div>
</template>

<script setup>
const props = defineProps({
    msg: {
        type: String
    }
})
</script>

<style lang="scss" scoped>
.no-data {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .icon-coffe {
        color:#dadada;
        font-size: 50px;
    }

    .msg {
        margin-top: 10px;
        color:#909399;
        font-size: 14px;
    }
}
</style>