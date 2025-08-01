import { defineStore } from 'pinia'

export const useMeetingStore = defineStore('meetingInfo', {
    state: () => {
        return {
            lastUpdate: null,
            inMeeting: false
        }
    },
    getters: {
        
    },
    actions: {
        updateMeeting(inMeeting) {
            this.lastUpdate = new Date().getTime();
            this.inMeeting = inMeeting;
        }
    }
})