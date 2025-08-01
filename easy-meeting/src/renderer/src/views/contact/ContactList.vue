<template>
    <div class="search-panel">
        <el-input clearable placeholder="输入联系人搜索" v-model="keywords" :prefix-icon="Search" @keyup="search"></el-input>
        <div class="iconfont icon-invite" @click="applyContact"></div>
    </div>

    <div class="contact-list">
        <div class="contact-item" v-for="item in contactList">
            <Avatar :avatar="item.contactId"></Avatar>
            <div class="nick-name">{{ item.nickName }}</div>

            <el-dropdown>
                <div class="iconfont icon-more"></div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="delContact(item.contactId, 2)">删除</el-dropdown-item>
                        <el-dropdown-item @click="delContact(item.contactId, 3)">拉黑</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <NoData v-if="contactList.length == 0" msg="暂无联系人"></NoData>
    </div>

    <ApplyContact ref="applyContactRef" @reload="loadContactUser"></ApplyContact>
</template>

<script setup>
import { getCurrentInstance, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, Avatar } from '@element-plus/icons-vue'
import ApplyContact from './ApplyContact.vue'
import { mitter } from '@/eventbus/eventbus'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const keywords = ref()
const search = () => {

}

const sourceContactList = ref([])
const contactList = ref([])

const loadContactUser = async () => {
    const result = await proxy.Request({
        url: proxy.Api.loadContactUser
    })

    if (!result) {
        return
    }

    sourceContactList.value = result.data
    contactList.value = result.data
}
loadContactUser()

const applyContactRef = ref()
const applyContact = () => {
    applyContactRef.value.show()
}

onMounted(() => {
    mitter.on("reloadContact", loadContactUser)
})

onUnmounted(() => {
    mitter.off("reloadContact", loadContactUser)
})
</script>

<style lang="scss" scoped>
.search-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .icon-invite {
        margin-left: 10px;
        background: #eeeeee;
        border-radius: 5px;
        padding: 8px;
        color: #747474;
        cursor: pointer;

        &::before {
            font-size: 18px;
        }
    }
}

.contact-list {
    height: calc(100vh - 100px);
    overflow: auto;

    .contact-item {
        padding-top: 5px;
        display: flex;
        align-items: center;

        .nick-name {
            flex: 1;
            width: 0;
            margin: 0px 5px;
            font-size: 14px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;

            .icon-more {
                cursor: pointer;
            }

            .el-tooltip_trigger:focus-visible {
                outline: unset;
            }
        }
    }
}
</style>