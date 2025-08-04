import fs from 'fs'
import { spawn } from 'child_process'
import path from 'path'
import { app, screen } from 'electron'

const NODE_ENV = process.env.NODE_ENV
const ffmpegPath = "/resources/ffmpeg.exe"

const getResourcePath = () => {
    const resourcePath = app.getAppPath()
    if (NODE_ENV !== 'development') {
        resourcePath = path.dirname(app.getPath("exe")) + "/resources"
    }
    return resourcePath
}


const getFFmpegPath = () => {
    return path.join(getResourcePath(), ffmpegPath)
}


const getScreenInfo = (displayId) => {
    const displays = screen.getAllDisplays()
    return displays.find(item => {
        return item.id == displayId
    })
}

let ffmpegProcess = null
let currentTime = 0
let sender = null
export const startRecording = (_sender, displayId, mic) => {
    sender = _sender
    currentTime = 0

    let filePath = "E:/EasyMeeting/"
    filePath = filePath + new Date().getTime() + "_temp.mp4"

    const { bounds, workArea } = getScreenInfo(displayId)

    const ffmpeg = getFFmpegPath()
    
    let args = [
        //视频输入
        '-f', 'gdigrab', //gdigrab指定使用 Windows GDI 屏幕捕获设备
        '-draw_mouse', '1', // 捕获录屏的时候的鼠标指针 1显示 0隐藏
        '-framerate', '30', // 设置视频捕获频率
        '-offset_x', `${bounds.x}`, // 设置屏幕坐标
        '-offset_y', '0',
        '-video_size', `${workArea.width}x${workArea.height}`,
        '-i', 'desktop', // 输入源为整个桌面(可替换为title-窗口标题，捕获特定窗口)
    ]

    if (mic) {
        //音频输入 指定DirectionShow音频设备
        args = args.concat(['-f', 'dshow', '-i', `audio=${mic}`])
    }


    const otherArgs = [
        // 视频编码
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '18',
        '-g', '60',
        // 每2秒一个关键帧
        '-x264-params', 'nal-hrd=cbr:force-cfr=1',//恒定帧率
        //音频编码
        '-c:a', 'aac',
        '-b:a', '192k',
        '-ar', '44100',
        '-ac', '2', //立体声
        // 像索格式
        '-pix_fmt', 'yuv420p',
        //防损坏关键参数- 修复moov atom 问题
        '-movflags', 'frag_keyframe+empty_moov+faststart',
        '-flush_packets', '1',
        '-fflags', '+genpts',
        '-max_interleave_delta', '0',//减少交错延迟
        filePath
    ]

    args = args.concat(otherArgs)

    ffmpegProcess = spawn(ffmpeg, args, {
        stdio: ['ignore', 'pipe', 'pipe'], // 捕获stdout和stderr
        detached: true //创建独立进程
    })

    ffmpegProcess.stderr.on('data', (data) => {
        const output = data.toString()
        const timeMatch = output.match(/time=(\S+)/)
        if (timeMatch && timeMatch[1]) {
            const seconds = parseTime(timeMatch[1])
            if(seconds > currentTime) {
                sender.send("recordTime", seconds)
                currentTime = seconds
            }
        }
    })

    ffmpegProcess.on("error", (err) =>{
        console.log(err);
        ffmpegProcess = null
    })

    ffmpegProcess.on("exit", () =>{
        ffmpegProcess = null
        repairVideo(filePath)
    })

}

// 修复文件
const repairVideo = (filePath) => {
    const ffmpeg = getFFmpegPath()
    const args = [
        '-i', filePath,
        filePath.replace('_temp', '')
    ]

    const process = spawn(ffmpeg, args, {
        stdio: ['ignore', 'pipe', 'pipe'], // 捕获stdout和stderr
        detached: true //创建独立进程
    })

    process.on('error', (err) => {
        console.log(err);
    })

    process.on('exit', (code) => {
        if(code === 0) {
            fs.unlinkSync(filePath)
            sender.send("finishRecording", filePath.replace('_temp', ''))
        }
    })
}

export const stopRecording = () => {
    if(ffmpegProcess) {
        ffmpegProcess.kill("SIGINT")
    }
}

const parseTime = (timeStr) => {
    const parts = timeStr.split(':')
    let seconds = 0
    if (parts.length === 3) {
        // HH:MM:SS
        seconds = parseInt(parts[0]) * 3600 +
            parseInt(parts[1]) * 60 +
            parseInt(parts[2].split('.')[0])
    }

    return seconds
}