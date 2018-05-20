## wetools

微信小程序工具类集合，不断更新中。扫码直接体验。

<img src="https://github.com/hellojammy/wetools/blob/master/res/run/wetools_qr.jpg" height="260"/>



## 如何使用本源码

该源码是作者[《微信公众平台与小程序开发》](https://item.jd.com/12169018.html) 一书中的示例程序。[作者博客](http://hello1010.com)。

只包含小程序源码，后端接口源码暂不开源。所以在小程序源码部分，对接口部分地址做了屏蔽。

1、接口地址配置，在 `/app.js` 中，`YOUR_HOST`变量是接口地址的根地址，可以修改为自己的

```
globalData: {
        apiBaseUrl: "YOUR_HOST",
        hasLogin: false,
        userInfo: null,
        authCode: null,
        userSessionId: null
    }
```

2、[腾讯统计分析mta](http://mta.qq.com/)的相关配置修改，在 `/app.js` 中，把`YOUR_APPID` 和 `YOUR_EVENTID` 修改为自己的。

```
mta.App.init({
          "appID": "YOUR_APPID",
          "eventID": "YOUR_EVENTID",
          "statPullDownFresh": true,
          "statShareApp": true,
          "statReachBottom": true
        });
```

## 第三方接口

本源码使用的第三方接口主要如下：

1、[Face++人脸检测](https://www.faceplusplus.com.cn/face-detection/)接口，并使用了部分付费功能

## 部分效果截图

1、登录部分

<img src="https://github.com/hellojammy/wetools/blob/master/res/run/831526830361_.pic_hd.jpg" height="450"/>
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/841526830361_.pic_hd.jpg" height="450"/> 
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/851526830362_.pic_hd.jpg" height="450"/>
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/861526830362_.pic_hd.jpg" height="450"/> 
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/921526830751_.pic_hd.jpg" height="450"/> 

2、人脸检测

<img src="https://github.com/hellojammy/wetools/blob/master/res/run/881526830363_.pic_hd.jpg" height="450"/> 
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/891526830363_.pic_hd.jpg" height="450"/> 
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/901526830364_.pic_hd.jpg" height="450"/> 
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/911526830365_.pic_hd.jpg" height="450"/> 




