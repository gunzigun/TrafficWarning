//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'GPS定位小程序',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var interval

    wx.connectSocket({
      url: 'ws://192.168.1.105:9000'
    })

    wx.onSocketOpen(function (res){
      console.log('WebSocket连接已打开！')

      interval = setInterval(function () {

        wx.getLocation({
          type: 'wgs84',
          success: function (res) {
            var x = res.longitude
            var y = res.latitude
            var strx = String(x)
            var stry = String(y)
            var xlenth = strx.substr(strx.indexOf('.')).length
            var ylenth = strx.substr(stry.indexOf('.')).length
            console.log(strx + "," + stry)
            if (xlenth > 4 && ylenth > 4)
            {
              console.log('可以发送坐标')
              wx.sendSocketMessage({
                data: strx + "," + stry
              })
            }
            
          }
        })
      }, 1000) //循环时间 这里是1秒 
      
    })

    wx.onSocketMessage(function (msg){
      console.log(msg)
    })

    wx.onSocketClose(function (res){
      console.log('WebSocket连接已关闭！')
      clearInterval(interval);
    })  
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  onShareAppMessage: function () {
    return {
      title: '微信小程序联盟',
      desc: '最具人气的小程序开发联盟!',
    }
  }
})
