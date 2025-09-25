<template>
    <div class="data-list">
        <DataLoadMoreList :dataSource="dataSource" :loading="loading" @loadData="load">
            <template #default="{ data }">
                <MeetingReserveItem :data="data" @delRecrod="delRecrodHandler"></MeetingReserveItem>
            </template>
        </DataLoadMoreList>
    </div>
</template>
<script setup>
import { getCurrentInstance, ref, onMounted, onUnmounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import MeetingReserveItem from './MeetingReserveItem.vue'

const userInfoStore = useUserInfoStore()
const meetingStore = useMeetingStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const dataSource = ref({})
const load = async () => {
    if (Object.keys(dataSource.value).length > 0 &&
        dataSource.value.pageNo == dataSource.value.pageTotal
    ) {
        return
    }

    loading.value = true
    let pageNo = dataSource.value.pageNo || 0
    pageNo++
    let result = await proxy.Request({
        url: proxy.Api.loadMeetingReserve,
        params: {
            pageNo
        }
    })

    if (!result) {
        return
    }

    loading.value = false
    let list = dataSource.value.list || []
    list = list.concat(result.data.list)
    result.data.list = list
    dataSource.value = result.data
}

const delRecrodHandler = (meetingId) => {
    dataSource.value.list = dataSource.value.list.filter((item) => {
        return item.meetingId != meetingId
    })
}
</script>
<style lang="scss" scoped></style>