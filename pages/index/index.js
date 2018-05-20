// pages/index/index.js
var mta = require('../../lib/mta_analysis.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //定义九宫格区域
    grids: [
      {
        'name' : '人脸检测',
        'image': '../../res/img/face_detect.png',
        'url': '/pages/face/detect/detect'
      },
      // {
      //   'name': '小程序Demo',
      //   'image': '../../res/img/face_search.png',
      //   'url': '/example/index'
      // },
      // {
      //   'name': '人脸特征提取',
      //   'image': '../../res/img/face_detect.png',
      //   'url': ''
      // },
      // {
      //   'name': '小程序demo',
      //   'image': '../../res/img/demo.png',
      //   'url': '/example/index'
      // },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mtaInit(mta);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})