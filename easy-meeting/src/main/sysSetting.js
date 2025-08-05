import os from 'os'
const userDir = os.homedir()

import fs from 'fs'
import * as store from './store'

const localFolder = userDir.replaceAll('\\', '/') + '/.easyMeeting/'
console.log(localFolder)
if(!fs.existsSync(localFolder)) {
    fs.mkdirSync(localFolder)
}

export const saveSysSetting = (sysSetting) => {
    const userId = store.getUserId()
    const configFile = localFolder + userId
    fs.writeFileSync(configFile, sysSetting, 'utf-8')
}

export const getSysSetting = () => {
    const userId = store.getUserId()
    const configFile = localFolder + userId
    if(!fs.existsSync(configFile)) {
        return {
            openCamera: false,
            openMic: false,
            screencapFolder: localFolder
        }
    } else {
        return JSON.parse(fs.readFileSync(configFile, 'utf-8'))
    }
}