// pages/face/detect/detect.js
var mta = require('../../../lib/mta_analysis.js');
const app = getApp();

Page({
  data: {
    files: [],
    progress: 0,
    faceRetDes: '',
    faceBrief: '',
    pImage: null,
    showView: false,
    cssIndex: 0,
    winWidth: 0, //屏幕宽度
    imageSize: {}, //图片尺寸
    imageRatio: 1, //图片真实显示与实际大小的缩放系数
    faceCover: [], //每个脸部的线框
    faceCnt: '还未上传',//人脸识别结果
    singleFaceIdx: '',
    singleFaceDes: '',
  },

  chooseImage: function (e) {
    var self = this;
    wx.chooseImage({
      sizeType: ['compressed', 'original'], // original, compressed可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      count: 1, //一次选择一张图片
      success: function (res) {
        app.logger('[wx.chooseImage] res:' + JSON.stringify(res));
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        self.setData({
          files: self.data.files.concat(res.tempFilePaths),
          faceRetDes: '',
          pImage: res.tempFilePaths,
          faceCover: [],
        });

        var tempFilePaths = res.tempFilePaths;
        console.log('upload file path:' + tempFilePaths);
        
        wx.showLoading({
          title: '人脸检测中'
        });

        //请求的超时时间在app.json中的networkTimeout.uploadFile中设置
        var uploadTask = app.upload({
          url: app.globalData.apiBaseUrl + 'facepp/detect',
          filePath: tempFilePaths[0],
          name: 'wx_file',
          formData: {
            'type': 'detect'
          },
          success: function (res) {
            wx.hideLoading();
            var data = res.data
            console.log(data);
            self.setData({
              faceRetDes: data
            });
            //看看是否有错误
            var faceJsonData = JSON.parse(data);
            app.logger('[faceDetect] resCode:' + faceJsonData['code']);

            if (faceJsonData['code'] != 0) {
              self.setData({
                faceRetDes: faceJsonData['msg']
              });
              return;
            }
            //看看是否有识别到人脸
            var faceData = faceJsonData['data']['faces'];
            var faceCnt = faceData.length;
            if (faceCnt == 0) {
              self.setData({
                faceCnt: "识别到0人"
              });

              wx.setStorage({
                key: tempFilePaths[0],
                data: { faceCnt: "识别到0人", faceStyles: []} 
              });
              return;
            }
            //获取脸部区域
            var faceStyles = [];
            var ratio = self.data.imageRatio;
            //等比例设置每个人脸的线框坐标以及尺寸
            for (let i = 0; i < faceCnt; ++i) {
              var faceObj = {};

              console.log(faceData[i]);
              var faceArea = faceData[i]['face_rectangle'];
              //定位值设置
              var faceStyle = [];
              faceStyle.push("top:" + (faceArea['top'] * ratio) + "px");
              faceStyle.push("left:" + (faceArea['left'] * ratio) + "px");
              faceStyle.push("width:" + (faceArea['width'] * ratio) + "px");
              faceStyle.push("height:" + (faceArea['height'] * ratio) + "px");

              faceObj.style = faceStyle.join(";");//人脸线框样式
              faceObj.des = faceData[i]['ext_des']; //人脸描述信息
              faceObj.idx = i;
              faceObj.current = false;

              faceStyles.push(faceObj);
            }
            //设置第一个为当前选中的人脸
            faceStyles[0].current = true;
            console.log(faceStyles);
            var faceCntDes = "识别到" + faceCnt + "人";
            //设置人脸线框
            self.setData({
              faceCover: faceStyles,
              faceCnt: faceCntDes,
              singleFaceDes: faceStyles[0].des,
            });

            var faceAll = {};
            faceAll.faceCnt = faceCntDes;
            faceAll.faceStyles = faceStyles;
            //把人脸识别结果缓存到本地
            wx.setStorage({
              key: tempFilePaths[0],
              data: faceAll
            });
          },

          fail: function (err) {
            console.error(err);
            self.setData({
              faceRetDes: JSON.stringify(err)
            });
          }
        });

        //显示上传进度
        uploadTask.onProgressUpdate((res) => {
          self.setData({
            progress: res.progress
          });
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        });
      }
    });
  },

  /**
   * 图片加载失败
   */
  imageError: function (e) {
    console.log('image发生error事件:', e.detail.errMsg);
  },

  /**
   * 图片加载完成之后，计算图片显示尺寸，以及图片缩放比例
   */
  imageLoad: function (e) {
    console.log('imageLoad, height:' + e.detail.height + ",width:" + e.detail.width);
    this.setData({
      showView: true,
      cssIndex: 1
    });

    //计算图片的真实长宽，以适应屏幕显示
    var originWidth = e.detail.width,
      originHeight = e.detail.height,
      ratio = originWidth / originHeight; //图片长宽比
    var viewWidth = this.data.winWidth, viewHeight;//手机长宽 
    //判断图片原有宽度和屏幕宽度哪个大
    if (originWidth > this.data.winWidth) {
      viewHeight = viewWidth / ratio;
    } else {
      viewWidth = originWidth;
      viewHeight = originHeight;
    }
    //设置图片显示长宽，以及缩放比例系数
    this.setData({
      imageSize: {
        width: viewWidth,
        height: viewHeight
      },
      imageRatio: viewWidth / originWidth
    });
  },

  /**
   * 点击缩略图显示相应的大图，并画人脸线框
   */
  showImage: function(e){
    var self = this;
    console.log(e);
    wx.getStorage({
      key: e.currentTarget.id,
      success: function (res) {
        console.log(res.data);
        //设置图片，并画线框
        var faceAll = res.data;
        self.setData({
          pImage: e.currentTarget.id,
          faceCover: faceAll.faceStyles,
          faceCnt: faceAll.faceCnt,
          singleFaceDes: faceAll.faceStyles.length === 0 ? "" : faceAll.faceStyles[0].des
        });
      }
    });
  },

  /**
   * 长按图片进入图片滑动预览
   */
  previewImage: function (e) {
    console.log("preview image:" + e.currentTarget.id);
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },

  /**
     * 点击人脸后显示相应的描述信息
     */
  showFaceDes: function (e) {
    console.log(e);
    var faceIdx = e.target.dataset.idx;
    var faceCoverArr = this.data.faceCover;
    faceCoverArr.forEach(function (item) {
      item.current = false;
    });

    faceCoverArr[faceIdx].current = true;
    var faceObj = this.data.faceCover[faceIdx];
    //console.log(faceObj);
    this.setData({
      faceCover: faceCoverArr,
      singleFaceDes: faceObj.des,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mtaInit(mta);
    app.checkLogin();
    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        self.setData({
          winWidth: res.windowWidth,
        });
        console.log("windowWH: " + res.windowWidth);
      }
    });
    var pageStack = getCurrentPages();
    console.log(pageStack);
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