//index.js
var mta = require('../../lib/mta_analysis.js');
//获取应用实例
const app = getApp();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    year: 2017
  },
  
  onLoad: function () {
    app.mtaInit(mta);
    
    //copyright中的年份信息
    var date = new Date;
    var currentYear = date.getFullYear();
    console.log("this.year: " + this.year);
    if (currentYear > this.data.year){
      this.setData({
        year: this.data.year + "-" + currentYear
      });
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况 
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          console.log('wx.getUserInfo, user agree auth');
          app.globalData.userInfo = res.userInfo;
          app.userLogin(res);
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        },
        fail: res => {
          var err = 'wx.getUserInfo, [base < 1.3] user reject:' + res.errMsg;
          console.warn(err);
          app.userReject(err);
        }
      })
    }
  },

  /**
   * 响应userInfo类型的按钮
   */
  getUserInfo: function (e) {
    console.log(e);
    app.logger('[press loginBtn] begin');
    if(e.detail.userInfo !== undefined){
      app.globalData.userInfo = e.detail.userInfo;
      app.logger('[press loginBtn] agree, userInfo:' + JSON.stringify(e.detail.userInfo));
      app.userReLogin(e.detail);//通过后台完成数据解密
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
    }else{
      var err = '[press loginBtn] reject, errMsg:' + e.detail.errMsg;
      console.warn(err);
      app.userReject(err); //用户选择了拒绝，后续处理
    }
  }
})
