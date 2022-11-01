// 与后台页面消息通信-长连接
const port = chrome.runtime.connect({name: 'devtools'});
// 监听后台页面消息
port.onMessage.addListener((message) => {
});

chrome.devtools.network.onRequestFinished.addListener(
    function(request) {
       //request 包含请求响应数据，如：url,响应内容等
       //request.request.url 接口 的url
       //request.getContent 接口返回的内容

       // 往后台页面发送消息
        port.postMessage({
            name: '信息头',
            tabId: chrome.devtools.inspectedWindow.tabId,
            data: request.request.url //定义要返回的数据 如：request.request.url
        });
    }
  );