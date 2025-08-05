import { ipcMain, BrowserWindow, desktopCapturer, shell, dialog } from "electron"
import { getWindow } from "./windowProxy"
import { initWs, logout } from "./wsClient"
import * as store from './store'
import { startRecording, stopRecording } from "./recording"
import { getSysSetting, saveSysSetting } from "./sysSetting"

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
    ipcMain.handle("changeLocalFolder", async (e, {localFilePath}) => {
        const options = {
            properties: ["openDirectory"],
            defaultPath: localFilePath
        }
        const result = await dialog.showOpenDialog(options)
        if(result.canceled) {
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