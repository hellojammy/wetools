## wetools

微信小程序工具类集合，不断更新中。


## 如何使用本源码

该源码只包含小程序源码，后端接口源码暂不开源。所以在小程序源码部分，对接口部分地址做了屏蔽。

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

## 部分效果截图

1、登录部分

<img src="https://github.com/hellojammy/wetools/blob/master/res/run/831526830361_.pic_hd.jpg" width="400"/>
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/841526830361_.pic_hd.jpg" width="400"/> 
<img src="https://github.com/hellojammy/wetools/blob/master/res/run/851526830362_.pic_hd.jpg" width="400"/> 


