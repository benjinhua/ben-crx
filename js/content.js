//content.js   manifest匹配地址的页面在刷新时会直接执行这里的代码

// 注入拦截请求脚本
var s = document.createElement('script');
s.src = chrome.extension.getURL('js/injected.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

// 需求列表taskList，已同步列表hasAsyncList，已同步列表索引hasAsyncIndexList
var taskList = [], hasAsyncList = [], hasAsyncIndexList = [];

$(function() {
    $("body").append("<div class='phoenix-async-success' style='position: absolute;top: 10%;left: 50%;color: #000;background: #f6ffed;display: none;border: 1px solid #b7eb8f;padding: 8px 15px;'>同步成功</div>")
    $("body").delegate('.phoenix-async-demand', 'click', function() {
        var index = $(this).attr('data-index');
        chrome.runtime.sendMessage(chrome.runtime.id, {
            fromContent: 'sendAjax',
            projectUuid: $($('.project-name')[0]).text(),
            index
        });
        $($('.task-item-one-row-margin-left')[index]).find('.phoenix-wrap').remove();
        $($('.task-item-one-row-margin-left')[index]).append("<div class='phoenix-wrap'><span style='margin-left: 8px;color: #000;'>已同步</span></div>");
    })
})

// 监听来自注入脚本的postMessage
window.addEventListener('message', (e) => {
    if (e && e.data && e.data.type === 'inject_message_type') {
      console.log('内容脚本接收到注入list', e.data.message);
      taskList = e.data.message.data.buckets[0].tasks || [];
      console.log('发送请求获取已同步列表');
      chrome.runtime.sendMessage(chrome.runtime.id, { fromContent: 'getAsyncList' });
    }
  })

chrome.runtime.onMessage.addListener(function(senderRequest, sender, sendResponse) {
    // 获取通过devtools监听的响应正文，现已废弃
    // if(senderRequest.isGetData) {
    //     console.log('添加同步按钮');
    //     $('.phoenix-async-demand').remove();
    //     setTimeout(() => {
    //         $('.task-item-one-row-margin-left').each((index,item) => {
    //             if(senderRequest.hasAsyncIndexList.includes(index)) {
    //                 $(item).append("<div class='phoenix-wrap'><span style='margin-left: 8px;color: #000;'>已同步</span><button style='border: none;background: #5ca5ea;color: #fff;padding: 2px 12px;border-radius: 3px;margin-left: 8px;' data-index='"+index+"' class='phoenix-async-demand'>更新同步</button></div>")
    //             } else {
    //                 $(item).append("<div class='phoenix-wrap'><button style='border: none;background: #5ca5ea;color: #fff;padding: 2px 12px;border-radius: 3px;margin-left: 8px;' data-index='"+index+"'  class='phoenix-async-demand'>同步</button><div>")
    //             }
    //         });
    //     },1000)
    // }

    if(senderRequest.getAsyncListSuccess) {
        console.log('获取到已同步列表', senderRequest.hasAsyncList);
        taskList.forEach((item,index) => {
            if(hasAsyncList.includes(item.uuid)) {
                hasAsyncIndexList.push(index);
            }
        })
        console.log('添加同步按钮');
        $('.phoenix-async-demand').remove();
        setTimeout(() => {
            $('.task-item-one-row-margin-left').each((index,item) => {
                if(hasAsyncIndexList.includes(index)) {
                    $(item).append("<div class='phoenix-wrap'><span style='margin-left: 8px;color: #000;'>已同步</span></div>")
                } else {
                    $(item).append("<div class='phoenix-wrap'><button style='border: none;background: #5ca5ea;color: #fff;padding: 2px 12px;border-radius: 3px;margin-left: 8px;' data-index='"+index+"'  class='phoenix-async-demand'>同步</button><div>")
                }
            });
        },1000)
    }
    if(senderRequest.isAsyncSuccess) {
        console.log('同步成功');
        $('.phoenix-async-success').show();
        setTimeout(() => {
            $('.phoenix-async-success').hide();
        },1000)
    }
});