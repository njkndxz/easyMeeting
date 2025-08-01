import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfo', {
    state: () => {
        return {
            userInfo: {}
        }
    },
    getters: {
        getInfo() {
            return this.userInfo
        }
    },
    actions: {
        setInfo(userInfo) {
            this.userInfo = userInfo
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
        },
    }
})