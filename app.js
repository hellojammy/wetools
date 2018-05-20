var mta = require('./lib/mta_analysis.js');
App({
    onLaunch: function () {
        console.log('App Launch');
        //腾讯统计分析初始化
        mta.App.init({
          "appID": "YOUR_APPID",
          "eventID": "YOUR_EVENTID",
          "statPullDownFresh": true,
          "statShareApp": true,
          "statReachBottom": true
        });

        // // 登录，获取code
        // wx.login({
        //   success: res => {
        //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //     this.globalData.authCode = res.code;
        //     this.logger("[wx.login] res:" + JSON.stringify(res));
        //     //向后台请求登录，不用获取用户敏感信息
        //     this.userLogin();
        //   },
        //   fail: res => {
        //     console.warn('wx.login fail, res:' + JSON.stringify(res));
        //   }
        // });

        var self = this;
        //获取用户信息  基础库 >= 1.2.0才有
        if(wx.getSetting){
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                //用户已经授权，获取用户敏感信息并登陆
                self.getUserInfoAndLogin();
              }else{
                self.userReLogin(null);
              }
            },
            fail: function(err){
              self.userReLogin(null);
            }
          });
        }else{
          self.userReLogin(null);
          console.warn('base < 1.2.0, can not use wx.getSetting');
        }
    },

    /**
     * 用户已经同意授权后
     * 获取用户信息，并向后台请求登录
     */
    getUserInfoAndLogin: function(){
      wx.login({
        success: res => {
          this.globalData.authCode = res.code;
          this.logger("getUserInfoAndLogin[wx.login] res:" + JSON.stringify(res));
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            //withCredentials: true,
            success: res => {
              console.log('getUserInfo, res:' + JSON.stringify(res));
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              //向后台请求登录
              this.userLogin(res);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            },
            fail: res => {
              console.error('user auth fail!');
            }
          });

        },
        fail: res => {
          console.warn('getUserInfoAndLogin[wx.login] fail, res:' + JSON.stringify(res));
        }
      });
    },

    /**
     * 登录 - wx.login获取code，从后端获取登录态
     * data可为空
     */
    userReLogin: function(data){
      // 重新登录，获取code
      wx.login({
        success: res => {
          this.globalData.authCode = res.code;
          this.logger("Re[wx.login] res:" + JSON.stringify(res));
          //向后台请求登录
          this.userLogin(data);
        },
        fail: res => {
          console.warn('Re[wx.login] fail, res:' + JSON.stringify(res));
        }
      });
    },

    /**
     * 向后台发起请求，获取用户登录态
     * iv和encryptedData可有可无
     */
    userLogin: function (data){
      var self = this;
      var requestData = data || {};
      requestData.authCode = self.globalData.authCode;

      self.request(
        {
          url: self.globalData.apiBaseUrl + 'miniapp/auth_new',
          data: requestData,
          success: function(res){
            self.logger("[userLogin] res:" + JSON.stringify(res));
            console.log(res);
            if(res.data.code == 0){
              self.globalData.userSessionId = res.data.data;
              wx.setStorage({
                key: "userSessionId",
                data: res.data.data
              });
            }else{
              console.error(res.data.msg);
              wx.showToast({
                title: '登陆失败，需要再次登陆，请关闭小程序后重新打开',
                icon: 'none',
                duration: 5000
              });
            }
          }
        }
      );
    },

    /**
     * 用户拒绝授权，例如获取用户信息，获取地理位置等
     */
    userReject: function(res){
      var self = this;
      self.logger(res);
      wx.showModal({
        title: '温馨提示',
        content: '若不授权微信登录，则无法使用该小程序的部分功能；点击重新授权，则可重新使用；若点不授权，后期还想使用小程序，需要在微信【发现】-【小程序】中，删除该小程序，重新搜索即可重新授权登录',
        cancelText: '不授权',
        confirmText: '重新授权',
        success: function (res) {
          if (res.confirm) {
            self.logger('[reject.tips], go auth setting');
            //https://developers.weixin.qq.com/miniprogram/dev/api/setting.html
            if (wx.openSetting) {
              //再次打开授权设置
              wx.openSetting({
                success: (res) => {
                  console.log('wx.openSetting, res:' + JSON.stringify(res));
                  if (res.authSetting['scope.userInfo'] == true) {
                    self.logger('[wx.openSetting] get userInfo');
                    //再次获取用户信息，完成登录
                    self.getUserInfoAndLogin();
                  }else{
                    self.logger('[wx.openSetting] not get userInfo');
                  }
                }
              });
            }
          } else if (res.cancel) {
            self.logger('[reject.tips], reject auth again, so sad!');
          }
        }
      });

    },

    request: function(option){
      var self = this;
      option.data = option.data || {};
      //加上token参数
      option.data.token = wx.getStorageSync('userSessionId');
      wx.request({
        url: option.url,
        data: option.data || {},
        method: option.method || 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res){
          console.log('request response:' + JSON.stringify(res));
          if (res.data.code == -10) {
            wx.showToast({
              title: 'token非法，请先在[我的]主动授权登陆',
              icon: 'none',
              duration: 3000
            });
          }
          option.success && option.success(res);
        },
        fail: function(err){
          option.fail && option.fail(err);
        },
        complete: function (res) {
          option.complete && option.complete(res);
        },
      });
    },

    upload: function(option){
      var self = this;
      option.formData = option.formData || {};
      //加上token参数
      option.formData.token = wx.getStorageSync('userSessionId');
      var uploadTask = wx.uploadFile({
        url: option.url,
        filePath: option.filePath,
        name: option.name,
        formData: option.formData,
        success: function (res) {
          console.log('upload res:' + res);
          var resJson = JSON.parse(res.data);
          if (resJson.code == -10){
            wx.showToast({
              title: 'token非法，请先在[我的]主动授权登陆',
              icon: 'none',
              duration: 5000
            });
          }
          option.success && option.success(res);
        },
        fail: function (err) {
          option.fail && option.fail(res);
        }
      });

      return uploadTask;
    },

    /**
     * 检查是否登录，未登录则强制跳转至登录页
     */
    checkLogin: function(){
      var self = this;
      var token = wx.getStorageSync('userSessionId');
      console.log("checkLogin, userSessionId: " + token);
      if(!token){
        console.warn('not login');
        self.logger("[checkLogin] not login");
        wx.showModal({
          title: '未授权',
          content: '检测到未登陆授权，请先在[我的]中主动授权登陆',
          success: function (res) {
            if (res.confirm) {
              self.logger("[checkLogin] press confirm");
              //把之前的所有页面都关闭
              wx.reLaunch({
                url: '/pages/user/index'
              })
            } else if (res.cancel) {
              self.logger("[checkLogin] press cancel");
              wx.navigateBack({
                delta: 1,
              });
            }
          }
        });
      }
    },

    logger: function(msg){
      console.log(msg);
    },

    mtaInit: function(mta){
      mta && mta.Page.init();
    },

    onShow: function () {
        console.log('App Show')
    },
    onHide: function () {
        console.log('App Hide')
    },
    globalData: {
        apiBaseUrl: "YOUR_HOST",
        hasLogin: false,
        userInfo: null,
        authCode: null,
        userSessionId: null
    }
});