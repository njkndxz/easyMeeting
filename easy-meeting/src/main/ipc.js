import { ipcMain, BrowserWindow, desktopCapturer, shell, dialog, app } from "electron"
import { delWindow, getWindow, saveWindow } from "./windowProxy"
import { initWs, logout, sendWsData } from "./wsClient"
import * as store from './store'
import { startRecording, stopRecording } from "./recording"
import { getSysSetting, saveSysSetting } from "./sysSetting"
import path, { join } from 'path'
import FormData from 'form-data'
import axios from 'axios'
import { downloadUpdate } from "./appUpdate"

export const onLoginOrRegister = () => {
    ipcMain.handle("loginOrRegister", (e, isLogin) => {
        const login_width = 375;
        const login_hight = 365;
        const register_hight = 485;
        const mainWindow = getWindow("main");
        mainWindow.setResizable(true);

        isLogin ? mainWindow.setMinimumSize(login_width, login_hight) : mainWindow.setMinimumSize(login_width, register_hight);

        mainWindow.setResizable(false);
    })
}

export const onWinTitleOp = () => {
    ipcMain.on("winTitleOp", (e, { action, data }) => {
        // 获取主窗口
        const webContents = e.sender;
        const win = BrowserWindow.fromWebContents(webContents);
        // 分类型操作
        switch (action) {
            case "close":
                if (data.closeType === 0) {
                    win.forceClose = data.forceClose();
                    win.close();
                } else {
                    win.setSkipTaskbar(true);
                    win.hide();
                }
                break;
            case "minimize":
                win.minimize();
                break;
            case "maximize":
                win.maximize();
                break;
            case "unmaximize":
                win.unmaximize();
                break;
            default:
                break;
        }
    })
}

export const onLoginSuccess = () => {
    ipcMain.handle("loginSuccess", (e, { userInfo, wsUrl }) => {
        const mainWindow = getWindow("main");
        mainWindow.setResizable(true);
        mainWindow.setMinimumSize(720, 480);
        mainWindow.setSize(720, 480);
        mainWindow.setResizable(false);

        store.initUserId(userInfo.userId);
        store.setData("userInfo", userInfo);

        initWs(wsUrl + userInfo.token);
    });
}

export const onGetScreenSource = () => {
    ipcMain.handle("getScreenSource", async (event, opts) => {
        // 获取整个屏幕
        const sources = await desktopCapturer.getSources(opts)
        return sources.filter(source => {
            const size = source.thumbnail.getSize()
            return size.width > 10 && size.height > 10
        }).map(source => ({
            id: source.id,
            name: source.name,
            displayId: source.display_id,
            thumbnail: source.thumbnail.toDataURL()
        }));
    });
}

export const onStartRecording = () => {
    ipcMain.handle("startRecording", (e, { displayId, mic }) => {
        const sender = e.sender
        startRecording(sender, displayId, mic)
    });
}

export const onStopRecording = () => {
    ipcMain.handle("stopRecording", () => {
        stopRecording()
    });
}

export const onOpenLocalFile = () => {
    ipcMain.on("openLocalFile", (e, { localFilePath, folder = false }) => {
        folder ? shell.openPath(localFilePath) : shell.showItemInFolder(localFilePath)
    });
}

export const onSaveSysSetting = () => {
    ipcMain.handle("saveSysSetting", (e, sysSetting) => {
        saveSysSetting(sysSetting)
    });
}

export const onGetSysSetting = () => {
    ipcMain.handle("getSysSetting", (e) => {
        return getSysSetting()
    });
}

export const onChangeLocalFolder = () => {
    ipcMain.handle("changeLocalFolder", async (e, { localFilePath }) => {
        const options = {
            properties: ["openDirectory"],
            defaultPath: localFilePath
        }
        const result = await dialog.showOpenDialog(options)
        if (result.canceled) {
            return
        }

        return result.filePaths[0].replaceAll('//', '\\')
    });
}

export const onLogout = () => {
    ipcMain.handle("logout", (e) => {
        logout()
    });
}

const openWindow = ({
    windowId, title = '详情', path, width = 960, height = 720, data, maximizable = false
}) => {
    let newWindow = getWindow(windowId)
    const paramsArray = []
    if (data && Object.keys(data).length > 0) {
        path = path.endsWith("?") ? path : path + "?"
        for (let i in data) {
            paramsArray.push(`${i}=${encodeURIComponent(data[i])}`)
        }

        path = path + paramsArray.join('&')
    }

    if (!newWindow) {
        newWindow = new BrowserWindow({
            width,
            height,
            minHeight: height,
            minWidth: width,
            show: false,
            autoHideMenuBar: true,
            frame: false,
            fullscreenable: false,
            resizable: maximizable,
            maximizable,
            ...(process.platform === 'linux' ? { icon } : {}),
            webPreferences: {
                preload: join(__dirname, '../preload/index.js'),
                sandbox: false
            }
        })

        saveWindow(windowId, newWindow)

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            newWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html#${path}`)
        } else {
            newWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: `${path}` })
        }

        newWindow.on('ready-to-show', () => {
            newWindow.show()
        })

        newWindow.on('close', (event) => {
            // 关闭会议窗口
            if (newWindow.forceClose !== undefined && !newWindow.forceClose) {
                preCloseWindow(windowId)
                event.preventDefault()
            }
        })

        newWindow.on('closed', () => {
            closeWindow(windowId)
            delWindow(windowId)
        })

        newWindow.on("maximize", () => {
            newWindow.webContents.send("winIsMax", true)
        })

        newWindow.on("unmaximize", () => {
            newWindow.webContents.send("winIsMax", false)
        })
    } else {
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            newWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html#${path}`)
        } else {
            newWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: `${path}` })
        }

        newWindow.show()
        newWindow.setSkipTaskbar(false)
    }
}

const closeWindow = (windowId) => {
    const mainWindow = getWindow("main")
    if (mainWindow) {
        mainWindow.webContents.send('closeWindow', { windowId })
    }
}

const preCloseWindow = (windowId) => {
    const win = getWindow(windowId)
    if (win) {
        win.webContents.send("preCloseWindow")
    }
}

export const onOpenWindow = () => {
    ipcMain.on("openWindow", (e, { title, windowId, path, width, height, data, maximizable }) => {
        openWindow({
            title,
            windowId,
            path,
            width,
            height,
            data,
            maximizable
        })
    })
}

export const onSendPeerConnection = () => {
    ipcMain.on('sendPeerConnection', (e, peerData) => {
        peerData.token = store.getData('userInfo')?.token
        sendWsData(JSON.stringify(peerData))
    })
}

export const onSelectFile = () => {
    ipcMain.handle("selectFile", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
            title: '选择文件',
            properties: ['openFile'],
        });

        if (canceled) {
            return {}
        }

        const filePath = filePaths[0]
        const { size } = await fstat.promises.stat(filePath)
        return {
            fileName: path.basename(filePath), // 文件名带扩展名
            fileSize: size, // 文件大小，单位字节
            filePath
        }
    })
}

export const onUploadChatFile = () => {
    ipcMain.handle("uploadChatFile", async (e, { uploadUrl, messageId, filePath, sendTime }) => {
        const meetingWin = getWindow("meeting")
        const formData = new FormData()
        formData.append("messageId", messageId)
        formData.append("sendTime", sendTime)
        formData.append("file", fstat.createReadStream(filePath))
        const token = store.getData('userInfo')?.token

        axios.post(uploadUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'token': token,
                onUploadChatFileProgress: function (progressEvent) {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        if (meetingWin) {
                            meetingWin.webContents.send("uploadChatFileProgress", percent)
                        }
                    }
                }
            }
        }).catch(error => {
            console.error('Error uploading file:', error)
        })
    })
}

export const onDownload = () => {
    ipcMain.handle("download", async (event, { messageId, sendTime, fileName, url }) => {
        const { filePath } = await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
            title: "保存文件",
            defaultPath: path.join(app.getPath('downloads'), fileName),
            properties: ["createDirectory"]
        })
        if (!filePath) {
            return
        }

        const suffix = fileName.slice(fileName.lastIndexof("."));
        downloadFile(messageId, sendTime, suffix, url, filePath);
        return filePath
    })
}

export const downloadFile = async (messageId, sendTime, suffix, url, savePath) => {
    const meetingWin = getWindow("meeting");
    return new Promise(async (resolve, reject) => {
        const response = await axios({
            method: "post",
            url,
            responseType: "stream",
            data: {
                messageId,
                sendTime,
                suffix,
                token: store.getData("userInfo")?.token
            },
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onDownloadProgress: function (progressEvent) {
                if (progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    if (meetingWin) {
                        meetingWin.webContents.send("downloadProgress", { messageId, percent, localFilePath: savePath })
                    }
                }
            }
        })
        const stream = fs.createWriteStream(savePath)
        response.data.pipe(stream)
        stream.on("finish", () => {
            stream.close()
            resolve()
        })
    })
}

export const onWindowCommunication = () => {
    ipcMain.on("windowCommunication", (e, { windowId, data }) => {
        const window = getWindow(windowId)
        if(window) {
            window.webContents.send("windowCommunication", data)
        }
    })
}

export const  onDownloadUpdate = () => {
    ipcMain.on("downloadUpdate", (e, { downloadUrl, id, fileName }) => {
        downloadUpdate({downloadUrl, id, fileName})
    })
}