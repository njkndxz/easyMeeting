<template>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="400px" :showCancel="false"
         @close="dialogConfig.show = false">
        <div class="search-panel">
            <el-input clearable placeholder="输入联系人ID搜索" v-model="userId" :prefix-icon="Search"
                :maxLength="12"></el-input>
            <el-button type="primary" class="search-btn" @click="search">搜索</el-button>
        </div>
        <div class="user-info" v-if="userInfo && Object.keys(userInfo).length > 0">
            <Avatar :avatar="userInfo?.userId"></Avatar>
            <div class="nick-name">{{ userInfo?.nickName }}</div>
            <div class="tips">
                <span v-if="userInfo.status == -1">自己</span>
                <span v-if="userInfo.status == 1">已是联系人</span>
                <span v-if="userInfo.status == 3">你被对方拉黑</span>
                <span v-if="userInfo.status == 0">已申请待处理</span>
                <span v-if="!userInfo.status">
                    <el-button type="primary" size="small" @click="contactApply">申请好友</el-button>
                </span>
            </div>
        </div>

        <NoData v-if="!userInfo" msg="用户不存在"></NoData>
    </Dialog>
</template>

<script setup>
import { Search, Avatar } from '@element-plus/icons-vue'
import { getCurrentInstance, nextTick, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const dialogConfig = ref({
    show: false,
    title: '添加联系人',
})

const userId = ref()
const userInfo = ref({})

const search = async () => {
    const result = await proxy.Request({
        url: proxy.Api.searchContact,
        params: {
            userId: userId.value
        }
    })

    if (!result) {
        return
    }

    userInfo.value = result.data
}

const emit = defineEmits(['reload'])
const contactApply = async () => {
    const result = await proxy.Request({
        url: proxy.Api.contactApply,
        params: {
            receiveUserId: userInfo.value.userId
        }
    })

    if (!result) {
        return
    }

    dialogConfig.value.show = false
    if (result.data == 0) {
        proxy.Message.success("申请成功，等待对方接受请求")
    } else {
        proxy.Message.success("添加好友成功")
        emit('reload')
    }
}

const show = () => {
    dialogConfig.value.show = true
    nextTick(() => {
        userId.value = null
        userInfo.value = {}
    })
}

defineExpose({
    show
})

</script>

<style lang="scss" scoped>
.search-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .search-btn {
        margin-left: 5px;
    }
}

.user-info {
    display: flex;
    align-items: center;
    margin-top: 10px;

    .nick-name {
        margin-left: 5px;
        flex: 1;
    }

    .tips {
        font-size: 12px;
        color:
            #7b7b7b;
    }
}

.no-search {
    line-height: 40px;
    text-align: center;
}
</style>