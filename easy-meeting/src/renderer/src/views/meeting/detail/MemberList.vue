<template>
    <div :class="['member-list', LIST_MAP[layoutType]]" :style="gridStyle">
        <div :class="['member-item', currentSelectUserId == userInfoStore.userInfo.userId ? 'active' : '', proxy.Utils.isEmpty(screenId) ? 'member-my' : '', LAYOUT_MAP[layoutType]]"
            v-for="(item, index) in memberList" :key="index">
            <div class="video-panel"
                v-show="(props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen || !proxy.Utils.isEmpty(screenId))">
                <video :id="`member_${userInfoStore.userInfo.userId}`" ref="localVideoRef" autoplay playsinline loop
                    muted></video>
                <div class="video-user-name">
                    <div :class="['iconfont', proxy.Utils.getSexIcon(userInfoStore.userInfo.sex)]"></div>
                    <div class="user-name">{{ userInfoStore.userInfo.nickName }}</div>
                </div>
            </div>
            <div v-show="!(props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen || !proxy.Utils.isEmpty(screenId))"
                :class="['user-info', currentSelectUserId == item.userId ? 'active' : '', LAYOUT_MAP[layoutType]]">
                <Avatar :avatar="userInfoStore.userInfo.userId" :update="true"></Avatar>
                <div :class="['user-name', 'iconfont', proxy.Utils.getSexIcon(userInfoStore.userInfo.sex)]">
                    {{ userInfoStore.userInfo.nickName }}
                </div>
            </div>
        </div>
        <div :class="['member-item', currentSelectUserId == item.userId ? 'active' : '', proxy.Utils.isEmpty(screenId) ? 'member-my' : '', LAYOUT_MAP[layoutType]]"
            v-for="(item, index) in memberList" :key="index">
            <div class="video-panel"
                v-show="(props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen || !proxy.Utils.isEmpty(screenId))">
                <video :id="`member_${item.userId}`" autoplay playsinline loop></video>
                <div class="video-user-name">
                    <div :class="['iconfont', proxy.Utils.getSexIcon(item.sex)]"></div>
                    <div class="user-name">{{ item.nickName }}</div>
                </div>
            </div>
            <div v-show="!item.openVideo"
                :class="['user-info', currentSelectUserId == item.userId ? 'active' : '', LAYOUT_MAP[layoutType]]">
                <Avatar :avatar="item.userId" :update="true"></Avatar>
                <div :class="['user-name', 'iconfont', proxy.Utils.getSexIcon(item.sex)]">
                    {{ item.nickName }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMeetingStore } from '@/stores/MeetingStore'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { mitter } from '@/eventbus/eventBus'

const props = defineProps({
    deviceInfo: {
        type: Object,
        default: {}
    }
})

const meetingStore = useMeetingStore()
const userInfoStore = useUserInfoStore()
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const localVideoRef = ref()
const currentSelectUserId = ref()
const screenId = ref(route.query.screenId)
const layoutType = ref(0)
const memberList = ref([
    {
        name: '张三'
    },
])

const LIST_MAP = {
    0: 'member-list',
    1: 'member-list-top',
    2: 'member-list-right'
}

const LAYOUT_MAP = {
    0: 'member-item',
    1: 'member-item-top',
    2: 'member-item-right'
}

const calculateGrid = (participantCount) => {
    if (participantCount <= 0) {
        return {
            cols: 0,
            rows: 0
        }
    }

    if (participantCount == 1) {
        return {
            cols: 1,
            rows: 1
        }
    }

    let cols = Math.ceil(Math.sqrt(participantCount))
    let rows = Math.ceil(participantCount / cols)

    return {
        cols,
        rows
    }
}

const gridStyle = computed(() => {
    if (layoutType.value !== 0) {
        return ''
    }

    const { rows, cols } = calculateGrid(memberList.value.length)

    return {
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
    }
})

// 创建空的视频轨道
const createEmptyVideoTrack = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const stream = canvas.captureStream(1)
    return stream.getVideoTracks()[0]
}

// 创建一个静音的音轨
const createEmptyAudioTrack = () => {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const dst = oscillator.connect(audioContext.createMediaStreamDestination())
    oscillator.start()
    const track = dst.stream.getVideoTracks()[0]
    track.enabled = false
    return track
}

let cameraStream = null
let screenStream = null
let localStream = null

const initLocalStream = async () => {
    await nextTick()
    localStream = new MediaStream()
    if (!props.deviceInfo.micEnable) {
        const micTrack = createEmptyAudioTrack()
        micTrack.enabled = false
        localStream.addTrack(micTrack)
    }

    if (props.deviceInfo.cameraEnable || props.deviceInfo.micEnable) {
        await initLocalCameraStream(props.deviceInfo.cameraEnable, props.deviceInfo.micEnable)
        cameraStream.getTracks().forEach(track => {
            track.enabled = false
            localStream.addTrack(track)
        })
    }
    // 没有摄像头也不是共享屏幕，添加空视频轨道
    if (!props.deviceInfo.cameraEnable && !screenId.value) {
        const videoTrack = createEmptyVideoTrack()
        videoTrack.enabled = false
        localStream.addTrack(videoTrack)
    }

    if (screenId.value) {
        const videoTracks = localStream.getVideoTracks()
        if (videoTracks.length > 0) {
            localStream.removeTrack(videoTracks[0])
            videoTracks[0].stop()
        }
        await initLocalScreenStream(props.deviceInfo.cameraEnable, props.deviceInfo.micEnable)
        localStream.addTrack(screenStream.getVideoTracks()[0])
    } else if (!screenId.value && (props.deviceInfo.cameraEnable || props.deviceInfo.micEnable)) {
        localStream.getTracks().forEach(track => {
            if (track.kind == 'audio') {
                track.enabled = props.deviceInfo.micOpen
            }

            if (track.kind == 'video') {
                track.enabled = props.deviceInfo.cameraOpen
            }
        })
    } else if (!screenId.value && !props.deviceInfo.cameraEnable) {
        const videoTrack = createEmptyVideoTrack()
        videoTrack.enabled = false
        localStream.addTrack(videoTrack)
    }

    localVideoRef.value.srcObject = localStream
    // 加入会议
    joinMeeting((props.deviceInfo.cameraEnable && props.deviceInfo.cameraOpen) || !proxy.Utils.isEmpty(screenId.value))
}

const initLocalCameraStream = async (video, audio) => {
    return new Promise(async (resolve, reject) => {
        if (!props.deviceInfo.cameraEnable && !props.deviceInfo.micEnable) {
            cameraStream = null
            resolve(null)
            return
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video,
            audio
        }).catch(error => {
            console.log(error);
        })

        cameraStream = stream
        resolve(stream)
    })
}

const initLocalScreenStream = async () => {
    return new Promise(async (resolve, reject) => {
        const constraints = {
            mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: screenId.value,
                minWidth: 1024,
                maxwidth: 1600,
                minHeight: 768,
                maxHeight: 900,
                minFrameRate: 10,
                maxFrameRate: 25
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: constraints
        }).catch(error => {
            console.log(error)
        })

        screenStream = stream
        resolve(stream)
    })
}

const joinMeeting = async (videoOpen) => {
    let result = await proxy.Request({
        url: proxy.Api.joinMeeting,
        params: {
            videoOpen
        },
        showLoading: false
    })

    if (!result) {
        return
    }
}

const peerConnectionMap = new Map()
const SIGNAL_TYPE_OFFER = 'offer'
const SIGNAL_TYPE_ANSWER = 'answer'
const SIGNAL_TYPE_CANDIDATE = 'candidate'

const sendPeerMessage = ({ sendUserId, receiveUserId, signalType, signalData }) => {
    window.electron.ipcRenderer.send('sendPeerConnection', {
        sendUserId,
        receiveUserId,
        signalType,
        signalData: JSON.stringify(signalData)
    })
}

const createPeerConnection = (member) => {
    let peerConnection = peerConnectionMap.get(member.userId)
    if (peerConnection) {
        return peerConnection
    }

    peerConnection = new RTCPeerConnection({
        sdpSemantics: 'unified-plan', // 明确现代化标准
        codecs: { video: 'VP8' }, // 强制优先使用VP8
        bundlePolicy: 'balanced', // 优化媒体传输通道绑定策略
        rtcpMuxPolicy: 'require', // 强制RTP/RTCP 多路复用
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    if (!props.deviceInfo.cameraEnable) {
        peerConnection.addTransceiver('video', {
            direction: 'recvonly'
        })
    }

    if (!props.deviceInfo.micEnable) {
        peerConnection.addTransceiver('audio', {
            direction: 'recvonly'
        })
    }

    peerConnection.onicecandidate = (e) => {
        if (e.candidate) {
            sendPeerMessage({
                sendUserId: userInfoStore.userInfo.userId,
                signalType: SIGNAL_TYPE_CANDIDATE,
                signalData: e.candidate,
                receiveUserId: member.userId,
            })
        }
    }

    peerConnection.ontrack = (event) => {
        const remoteVideo = document.querySelector("#member_" + member.userId)
        remoteVideo.srcObject = event.streams[0]
    }

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnectionMap.set(member.userId, peerConnection)

    return peerConnection
}

const sendOffer = async (peerConnection, sendUserId, receiveUserId) => {
    let offer = await peerConnection.createOffer({ iceRestart: true })
    await peerConnection.setLocalDescription(offer)
    sendPeerMessage({
        sendUserId,
        receiveUserId,
        signalType: SIGNAL_TYPE_OFFER,
        signalData: offer
    })
}

const onUserJoin = async (messageContent) => {
    const newMember = messageContent.newMember
    const allMemberList = messageContent.meetingMemberList.sort((a, b) => a.joinTime - b.joinTime)
    memberList.value = allMemberList.filter(item => {
        return item.userId != userInfoStore.userInfo.userId && item.status == 1
    })
    meetingStore.setMemberList(memberList.value)
    meetingStore.setAllMemberList(allMemberList)
    await nextTick()
    if (newMember.userId != userInfoStore.userInfo.userId) {
        proxy.Message.success(`用户${newMember.nickName}加入了会议`)
        // 建立peerConnection
        createPeerConnection(newMember)
        return
    }

    memberList.value.forEach((member) => {
        const peerConnection = createPeerConnection(member)
        sendOffer(peerConnection, userInfoStore.userInfo.userId, member.userId)
    })
}

const onPeerConnection = async ({ sendUserId, receiveUserId, messageContent }) => {
    if (receiveUserId != userInfoStore.userInfo.userId) {
        return
    }

    const signalData = messageContent.signalData ? JSON.parse(messageContent.signalData) : {}
    const member = memberList.value.find((item) => {
        return item.userId == sendUserId
    })
    const peerConnection = createPeerConnection(member)
    try {
        switch (messageContent.signalType) {
            case SIGNAL_TYPE_OFFER:
                await peerConnection.setRemoteDescription(signalData)
                const answer = await peerConnection.createAnswer()
                await peerConnection.setLocalDescription(answer)
                sendPeerMessage({
                    sendUserId: receiveUserId,
                    receiveUserId: sendUserId,
                    signalType: SIGNAL_TYPE_ANSWER,
                    signalData: answer
                })
                break;
            case SIGNAL_TYPE_ANSWER:
                await peerConnection.setRemoteDescription(signalData)
                break;
            case SIGNAL_TYPE_CANDIDATE:
                if (!peerConnection.remoteDescription) {
                    return
                }
                peerConnection.addIceCandidate(signalData)
                break;
            default:
                break;
        }
    } catch (error) {
        console.error('err', error);
    }
}

const emit = defineEmits(['exitMeeting', 'selectMember'])
const onUserLeave = (messageContent) => {
    const { exitUserId, meetingMemberList } = JSON.parse(messageContent)
    if(userInfoStore.userInfo.userId == exitUserId) {
        emit('exitMeeting')
        return
    }

    memberList.value = memberList.value.filter(item => item.userId != exitUserId)
    meetingStore.setAllMemberList(meetingMemberList)
    meetingStore.setMemberList(memberList.value)
    peerConnectionMap.delete(exitUserId)
}

const meetingFinish = () => {
    emit('exitMeeting')
}

const initMeetingListener = () => {
    window.electron.ipcRenderer.on("meetingMessage", (e, { sendUserId, receiveUserId, messageContent, messageType }) => {
        switch (messageType) {
            case 1:     //用户加入
                onUserJoin(messageContent)
                break;
            case 2:     // 建立peerConnection
                onPeerConnection({ sendUserId, receiveUserId, messageContent })
                break;
            case 3: // 退出会议
                onUserLeave(messageContent)
                break;
            case 4:
                meetingFinish()
                break;
            default:
                break;
        }
    })
}

onMounted(() => {
    initMeetingListener()
    initLocalStream()
})


</script>

<style lang="scss" scoped>
.member-list {
    height: 100%;
    display: grid;
    gap: 8px;
    max-height: 100%;
    padding: 10px;
    background: #fff;
    transition: grid-template 0.3s ease;
    overflow-y: auto;
}

.member-list-top {
    display: inline-flex;
    grid-gap: apx;
    padding: 10px 0px 10px 10px;
    overflow-x: auto;
    max-width: 100%;
    height: 120px;

    .member-item {
        cursor: pointer;
    }

    .active {
        border: 2px solid var(--blue);
    }
}

.member-list-right {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 10px 10px 0 10px;
    width: 130px;
    align-items: center;
    margin: auto;

    .member-item {
        cursor: pointer;
    }

    .active {
        border: 2px solid var(--blue);
    }
}

.member-item {
    background: #f7f7f7;
    position: relative;
    flex-shrink: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 8px;
    border: 2px solid #fff;

    .video-panel {
        height: 1002;
        position: relative;

        video {
            height: 100%;
            width: 100%;
            object-fit: cover;
        }

        .video-user-name {
            position: absolute;
            top: 0px;
            right: 0px;
            display: flex;
            align-items: center;
            border-radius: epx 0px 0px 5px;
            overflow: hidden;

            .iconfont {
                width: 20px;
                height: 20px;
                background: var(--blue);
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .icon-woman {
                background: #fb7373;
            }

            .user-name {
                background: rgb(0, 0, 0, 0.8);
                color: #fff;
                font-size: 12px;
                height: 20px;
                padding: 0 3px;
                max-width: 80px;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                padding-top: 2px;
            }
        }
    }

    .user-info {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;

        .user-name {
            margin-top: 5px;
            font-size: 13px;
            color: #575757;
            display: flex;
            align-items: center;

            &::before {
                color: var(--blue);
                margin-right: 1px;
                font-size: 16px;
            }
        }

        .icon-woman {
            &::before {
                color: #fb7373;
            }
        }
    }
}

.member-my {
    video {
        transform: scaleX(-1);
    }
}

.member-item-top {
    width: 100px;
    height: 100px;
    margin-right: 10px;

    .video-panel {
        width: 100px;
        height: 100px;
    }
}

.member-item-right {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;

    .video-panel {
        width: 100px;
        height: 100px;
    }
}
</style>