const Api = {
    addMeeting: "/meeting/addMeeting",//加入会议
    checkCode: "/account/checkCode",//验证码
    login: "/account/login",//登录
    register: "/account/register",//注册
    logout: "/account/logout",//退出,
    updatePassword: "/account/updatePassword",//修改密码
    getsysSetting: "/account/getsyssetting",//获取系统设置
    getResource: "/api/file/getResource",//资源
    getAvatar: "/api/file/getAvatar",//获取头像
    updateUserInfo: "/account/updateUserInfo",//更新用户信息
    uploadChatFile: "/api/chat/uploadFile",//上传聊天资源
    downloadFile: "/api/file/downloadFile",//下载文件
    quickMeeting: "/meeting/quickMeeting",//快速会议
    preJoinMeeting: "/meeting/preJoinMeeting",//预加入会议
    joinMeeting: "/meeting/joinMeeting",//加入会议
    exitMeeting: "/meeting/exitMeeting",//退出会议
    inviteMember: "/meeting/inviteMember",//邀请成员
    acceptInvite: "/meeting/acceptInvite",//接受邀请
    finishMeeting: "/meeting/finishMeeting",//结束会议
    kickOutMeeting: "/meeting/kickoutMeeting", // 踢出会议
    blackMeeting: "/meeting/blackMeeting",//拉黑
    sendChatMessage: "/chat/sendMessage",//发送聊天消息，
    loadMessage: "/chat/loadMessage",//聊天消息
    loadMeeting: "/meeting/loadMeeting",//历史会议
    loadMeetingMembers: "/meeting/loadMeetingMembers",//会议成员
    getCurrentMeeting: "/meeting/getCurrentMeeting",//获取会议信息
    loadHistoryMessage: "/chat/loadHistoryMessage",//获取历史聊天记录
    delMeetingRecord: "/meeting/delMeetingRecord",//删除会议记录
    searchcontact: "/usercontact/searchContact",//搜索联系人
    contactApply: "/userContact/contactApply",//申请联系人
    loadContactUser: "/userContact/loadContactuser",//获取联系人
    loadContactApply: "/userContact/loadContactApply",//申请列表
    dealWithApply: "/userContact/dealWithApply",//处理联系人
    delContact: "/userContact/delContact",//删除联系人
    loadContactApplyDealWithCount: "/userContact/loadContactApplyDealWithCount",//获取未处理的联系人数
    createMeetingReserve: "/meetingReserve/createMeetingReserve",//会议预约
    loadMeetingReserve: "/meetingReserve/loadMeetingReserve",//预约的会议
    loadTodayMeeting: "/meetingReserve/loadTodayMeeting",//今天待开会议
    delMeetingReserveByUser: "/meetingReserve/delMeetingReserveByuser",//用户删除会议
    delMeetingReserve: "/meetingReserve/delMeetingReserve",//创建人删除会议
    reserveJoinMeeting: "/meeting/reserveJoinMeeting",//预约加入会议
    //管理后台
    loadUserList: "/admin/loadUserList",//用户列表
    updateUserstatus: "/admin/updateUserStatus",//修改用户状态
    force0ffLine: "/admin/force0ffLine",//制下线
    loadUpdateDataList: '/admin/loadupdateList',//获取更新列表
    delupdate: '/admin/delupdate',//删除更新
    saveUpdate: "/admin/saveUpdate",//保存更新
    postupdate: "/admin/postUpdate",//发布更新
    getSysSetting4Admin: "/admin/getsysSetting",//管理员获取系统设置
    saveSysSetting: "/admin/saveSysSetting",//保存设置
    loadAdminMeeting: "/admin/loadAdminMeeting",//获取会议
    adminfinishMeeting: "/admin/adminFinishMeeting",//管理员结束会议
    checkversion: "/update/checkversion",//更新检测
    downloadupdate: "/api/update/download",//下载史新
    sendopenVideoChangeMessage: "/meeting/sendOpenVideoChangeMessage",//用户开启关闭摄像头
}

export default Api