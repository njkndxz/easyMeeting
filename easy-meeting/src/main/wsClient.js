import { WebSocket } from "ws";
import { getWindow, getWindowManage } from "./windowProxy";


let ws = null;
const maxRetries = 5;
let retryCount = 0;
const retryInterval = 2000;
const HEARTBEAT_INTERVAL = 5000;
let heartBeatTimer = null;
let wsUrl = null;
let needReconnect = false;

export const initWs = (_wsUrl) => {
    wsUrl = _wsUrl;
    needReconnect = true;
    connectWs();
}

export const wsCheck = () => {
    return import.meta.env.VITE_WS_CHECK === "true";
}

export const connectWs = () => {
    if(ws && ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        console.log('已经连接上了');
        return;
    }
    console.log(`尝试连接....(重试次数:${retryCount}/${maxRetries}),连接地址:${wsUrl}`);
    ws = new WebSocket(wsUrl);
    ws.onopen = () => {
        if(retryCount > 0 && wsCheck()) {
            const mainWindow = getWindow("main");
            mainWindow.webContent.send("reconnect", true);
        }

        retryCount = 0;
        console.log('websocket连接成功');
        startHeartBeat();
    }

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('收到ws消息', data);
        const meetingWin = getWindow("meeting");
        const mainWindow = getWindow("main");
        switch (data.messageType) {
            case 8: // 好友申请
            case 12: // 处理好友申请
                if(!mainWindow) {
                    return;
                }
                mainWindow.webContents.send("mainMessage", data)
                break;
            default:
                break;
        }
    }

    ws.onerror = () => {
        ws.close();
    }

    ws.onclose = () => {
        cleanHeartBeatTimer();
        handleReconnect();
    }
}

export const handleReconnect = () => {
    if(!needReconnect) {
        return;
    }

    if(retryCount >= maxRetries) {
        console.error('已经达到最大重试次数，停止重试');
        retryCount = 0;
        if(wsCheck()) {
            logout(false);
        }
        return;
    }

    retryCount += 1;
    const delay = retryInterval * Math.pow(1.5, retryCount - 1);
    console.log(`连接断开,等待${delay/1000}秒后重试`);

    if(wsCheck()) {
        const mainWindow = getWindow("main");
        mainWindow.webContent.send("reconnect", true);
    }

    setTimeout(() => {
        connectWs();
    }, delay);
}

export const logout = ({closeWs = true}) => {
    const login_width = 375;
    const login_hight = 365;
    const mainWindow = getWindow("main");
    mainWindow.setResizable(true);
    mainWindow.setMinimumSize(login_width, login_hight)
    mainWindow.setResizable(false);

    if(closeWs) {
        needReconnect = false;
        ws.close();
    }

    const windows = getWindowManage();
    for (const winKey in windows) {
        const win = windows.get(winKey);
        if(winKey !== "main") {
            win.close();
        }
    }

    mainWindow.webContent.send("logout");
}

export const startHeartBeat = () => {
    heartBeatTimer = setInterval(() => {
        if(ws?.readyState === WebSocket.OPEN) {
            // ws.send("ping");
        }
    }, HEARTBEAT_INTERVAL);
}


export const cleanHeartBeatTimer = () => {
    clearInterval(heartBeatTimer);
    heartBeatTimer = null;
}

export const sendWsData = (data) => {
    if(!ws) {
        return;
    }

    ws.send(data);
}