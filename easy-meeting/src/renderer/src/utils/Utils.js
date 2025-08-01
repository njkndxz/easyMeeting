import moment from "moment";
import LunarCalendar from "lunar-calendar";
import Api from "./Api";

moment.locale('zh-cn', {
    months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
    monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
    weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
    longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:sS',
        L: 'YYYY-MM-DD',
        LL: 'YYYY年MM月DD日',
        LLL: 'YYYY年MM月DD日Ah点mm分',
        LLLL: 'YYYY年MM月DD日ddddAh点mm分',
        l: 'YYYY-M-D',
        ll: 'YYYY年M月D日',
        lll: 'YYYY年M月D日 HH:mm',
        llll: 'YYYY年M月D日dddd HH:mm'
    }
});

export const isEmpty = (str) => {
    if (str == null || str == "" || str == undefined) {
        return true;

    }
    return false;
}

export const formatDate = (timestamp) => {
    const timestampTime = moment(timestamp);
    const days = Number.parseInt(moment().format("YYYYMMDD")) - Number.parseInt(timestampTime.format("YYYYMMDD"));
    if (days == 0) {
        return timestampTime.format("HH:mm")
    } else if (days == 1) {
        return '昨天';
    } else if (days >= 2 && days < 7) {//大于1天小于7天显示星期几
        return timestampTime.format("dddd")
    } else if (days >= 7) {//显示年月日
        return timestampTime.format("YYYY-MM-DD")
    }
}

export const formatDate2 = (timestamp, patten) => {
    const timestampTime = moment(timestamp);
    return timestampTime.format(patten);
}

export const getChinaDateDay = () => {
    const today = moment();
    //计算周几(中文)
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][today.day()];
    // 转换为农历日期(注意月份需+1，因moment月份从0开始)
    const lunar = LunarCalendar.solarToLunar(
        today.year(),
        today.month() + 1,
        today.date()
    );
    //-处理闰月显示
    const isLeap = lunar.isleap ? '闰' : '';
    const lunarDate = `${isLeap}${lunar.lunarMonthName}${lunar.lunarDayName}`;

    return `星期${weekday} 农历${lunarDate}`;
}

export const getweekAndDate = (timestamp) => {
    const today = moment(new Date(timestamp));
    // 计算周几(中文)
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][today.day()];
    return `星期${weekday} ${today.format("M月DD日")}`
}

export const size2str = (limit) => {
    let size = "";
    if (limit < 0.1 * 1024)
        //个于0.1KB，则转化成B
        size = limit.toFixed(2) + "B"
    else if (limit < 1024 * 1024) {
        //小于0.1MB，则转化成KB
        size - (limit / 1024).toFixed(2) + "KB"
    } else if (limit < 1024 * 10241024) {
        //小于1GB，则转化成MB
        size = (limit / (1024 * 1024)).toFixed(2) + "MB"
    } else {
        //其他转化成GB
        size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB"
        const sizestr = size + "";
        //转成字符串
        const index = sizestr.indexOf(".");
        //获取小数点处的索引
        const dou = sizestr.slice(index + 1, 2);
        //获取小数点后两位的值
        if (dou == "00") {
            //判断后两位是否为00，如果是则删除00
            return sizestr.slice(0, index) + sizestr.slice(index + 3, 2);
        }
        return size;
    }
}

export const convertSecondsToHMS = (seconds, showHours = false) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;
    let hourStr = showHours ? '00' : '';
    return (hours == 0 ? hourStr : hours.toString().padStart(2, '0') + ':') +
        minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
}

export const timeAddMin = (timestamp, addMin) => {
    return moment(timestamp).add(addMin, 'minutes').format("HH:mm");
}

export const getFileName = (fileName) => {
    if (!fileName) {
        return fileName;
    }
    return fileName.lastIndexOf(".") == -1 ? fileName : fileName.slice(0, fileName.lastIndexOf("."));
}

export const getLocalResource = (resource) => {
    resource = `../assets/${resource}`;
    return new URL(resource, import.meta.url).href;
}

export const resetHtmlContent = (data) => {
    if (!data) {
        return data;
    }

    data = data.replace(/\r\n/g, "<br/>");
    data = data.replace(/\n/g, "<br/>");
    return data;
}

export const getToken = () => {
    let userInfoJson = localStorage.getItem('userInfo');
    const token = userInfoJson ? JSON.parse(userInfoJson).token : '';
    return token;
}

export const getResourcePath = ({ messageId, thumbnail = false, fileType, sendTime }) => {
    return `${import.meta.env.PROD ? import.meta.env.VITE_DOMAIN : ''}${Api.getResource}?messageId=${messageId}&fileType=${fileType}&sendTime=${sendTime}&thumbnail=${thumbnail}`;
}

export const getAvatarPath = ({ userId, forceUpdate = false }) => {
    return `${import.meta.env.PROD ? import.meta.env.VITE_DOMAIN : ''}${Api.getAvatar}?userId=${userId}&token=${getToken()}`;
}

export const formatMeetingNo = (meetingNo) => {
    return meetingNo.slice(0, 3) + " " + meetingNo.slice(3, 6) + " " + meetingNo.slice(6, 10);
}

export const getSexIcon = (sex) => {
    if (sex == 0) {
        return 'icon-woman';
    } else if (sex == 1) {
        return 'icon-man';
    } else {
        return 'icon-user-nick';
    }
}