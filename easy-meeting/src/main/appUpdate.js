import fs from 'fs'
import axios from 'axios'
import store from './store'
import os from 'os'
import { exec } from 'child_process'
import { getWindow } from './windowProxy'

const execCommand = async (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            resolve(stdout)
        })
    })
}


export const downloadUpdate = async ({ downloadUrl, id, fileName }) => {
    const userDir = os.homedir()
    const token = store.getData("userInfo")?.token
    const config = {
        responseType: "stream",
        headers: {
            'Content-Type': 'multipart/form-data',
            "token": token,
        },
        onDownloadProgress: function (progressEvent) {
            const loaded = progressEvent.loaded
            const mainWindow = getWindow("main")
            if (!mainWindow) {
                return
            }
            mainWindow.webContents.send('updateDownloadCallback', loaded)
        },
    }

    const response = await axios.post(downloadUrl, { id }, config)
    const localFile = userDir + '/' + fileName
    const stream = fs.createWriteStream(localFile)
    response.data.pipe(stream)
    stream.on("finish", () => {
        stream.close()
        const command = `${localFile}`
        execCommand(command)
    })
}

