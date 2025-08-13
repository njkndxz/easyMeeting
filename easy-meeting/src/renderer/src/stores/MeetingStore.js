import { defineStore } from 'pinia'

export const useMeetingStore = defineStore('meetingInfo', {
    state: () => {
        return {
            lastUpdate: null,
            inMeeting: false,
            noReadChatCount: 0,
            chatOpen: false,
            allMemberList: [],
            memberList: []
        }
    },
    getters: {
        
    },
    actions: {
        updateMeeting(inMeeting) {
            this.lastUpdate = new Date().getTime();
            this.inMeeting = inMeeting;
        },
        addnoReadChatCount() {
            if(this.chatOpen) {
                return
            }
            this.noReadChatCount++
        },
        updateChatOpen(open) {
            if(open) {
                this.noReadChatCount = 0
            }
            this.chatOpen = open
        },
        setMemberList(memberList) {
            this.memberList = memberList
        },
        setAllMemberList(allMemberList) {
            this.allMemberList = allMemberList
        }
    }
})