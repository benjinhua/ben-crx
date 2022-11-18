//content.js   manifest匹配地址的页面在刷新时会直接执行这里的代码

// 注入拦截请求脚本
var s = document.createElement('script');
s.src = chrome.extension.getURL('js/injected.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

var productKanbanList = [
    { label: '税务-产品需求池', value: '10000' },
    { label: '融合平台—产品需求池', value: '10002' },
    { label: '平台-产品需求池', value: '10004' },
    { label: '风控-产品需求池', value: '10005' },
    { label: '销项-产品需求池', value: '10006' },
    { label: '进项-产品需求池', value: '10007' },
    { label: '系统集成-产品需求池', value: '10018' },
]
// 同步选择的productKanbanId
var productKanbanId = '';
// 需求列表taskList，已同步列表hasAsyncList，已同步列表索引hasAsyncIndexList
var taskList = [], hasAsyncList = [], hasAsyncIndexList = [];
var selectIndex = 0;

var timer = null; // 定时器

$(function() {
    $("body").append("<div class='phoenix-async-success'>同步成功</div>")
    $("body").append("<div class='phoenix-async-fail'>同步失败</div>")
    $("body").append("<div class='phoenix-mask'><div class='phoenix-productKanbanListBox'><div class='phoenix-productKanbanListBox-title'>请选择同步的需求看板</div></div></div>")
    productKanbanList.forEach(item => {
        $('.phoenix-productKanbanListBox').append(`<button class='phoenix-async-demand-item' data-value='${item.value}'>${item.label}</button>`)
    })
    $("body").delegate('.phoenix-async-demand', 'click', function() {
        // 打开选择看板
        selectIndex = $(this).attr('data-index');
        $('.phoenix-mask').show();
   })

   $("body").delegate('.phoenix-mask', 'click', function() {
       // 遮罩层关闭
        $('.phoenix-mask').hide();
    })

    $("body").delegate('.phoenix-productKanbanListBox', 'click', function(e) {
        e.stopPropagation();
    })

    $("body").delegate('.phoenix-async-demand-item', 'click', function() {
        var productKanbanId = $(this).attr('data-value');
        console.log('发送同步请求');
        chrome.runtime.sendMessage(chrome.runtime.id, {
            fromContent: 'sendAjax',
            projectUuid: $($('.project-name')[0]).text(),
            productKanbanId,
            taskData: taskList[selectIndex],
            index: selectIndex
        });
        $('.phoenix-mask').hide();
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
        hasAsyncIndexList = []; // 重置index list
        hasAsyncList = senderRequest.hasAsyncList;
        taskList.forEach((item,index) => {
            if(hasAsyncList.includes(item.uuid)) {
                hasAsyncIndexList.push(index);
            }
        })
        console.log('已同步列表index', hasAsyncIndexList);
        console.log('添加同步按钮');
        $('.phoenix-async-demand').remove();
        $('.phoenix-wrap').remove();
        if($('.task-item-one-row-margin-left').length > 0) {
            // 窄详情 布局
            $('.task-item-one-row-margin-left').each((index,item) => {
                if(hasAsyncIndexList.includes(index)) {
                    $(item).append("<div class='phoenix-wrap'><span>已同步</span></div>")
                } else {
                    $(item).append("<div class='phoenix-wrap'><button data-index='"+index+"' class='phoenix-async-demand'>同步</button><div>")
                }
            });
        } else {
            // 宽详情 布局
            $('.summary-column').each((index,item) => {
                if(hasAsyncIndexList.includes(index)) {
                    $(item).append("<div class='phoenix-wrap'><span>已同步</span></div>")
                } else {
                    $(item).append("<div class='phoenix-wrap'><button data-index='"+index+"' class='phoenix-async-demand'>同步</button><div>")
                }
            });
        }
    }
    if(senderRequest.isAsyncSuccess) {
        console.log('同步成功');
        if($('.task-item-one-row-margin-left').length > 0) {
            // 窄详情 布局
            $($('.task-item-one-row-margin-left')[senderRequest.index]).find('.phoenix-wrap').remove();
            $($('.task-item-one-row-margin-left')[senderRequest.index]).append("<div class='phoenix-wrap'><span>已同步</span></div>");
        } else {
            // 宽详情 布局
            $($('.summary-column')[senderRequest.index]).find('.phoenix-wrap').remove();
            $($('.summary-column')[senderRequest.index]).append("<div class='phoenix-wrap'><span>已同步</span></div>");
        }
        clearTimeout(timer);
        $('.phoenix-async-success').show();
        timer = setTimeout(() => {
            $('.phoenix-async-success').hide();
        },3000)
    }
    if(senderRequest.isAsyncFail) {
        console.log('同步失败');
        clearTimeout(timer);
        $('.phoenix-async-fail').text(senderRequest.msg);
        $('.phoenix-async-fail').show();
        timer = setTimeout(() => {
            $('.phoenix-async-fail').hide();
        },3000)
    }
});