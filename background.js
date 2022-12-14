//background.js
// 已同步列表taskUuid list
var hasAsyncList = [];

chrome.runtime.onMessage.addListener(function(senderRequest, sender, sendResponse) {
    if(senderRequest.fromContent && senderRequest.fromContent=='getAsyncList'){
        hasAsyncList = [];
        // 获取已同步的需求
        $.ajax({
            type: 'GET',
            url: 'http://172.23.50.102:8002/product/ones/taskList',
            dataType: 'json',
            contentType: 'application/json',
            success: function(res) {
                if(res.code === '0') {
                    if(res.result && res.result.length > 0) {
                        res.result.forEach(item => {
                            hasAsyncList.push(item.taskUuid);
                        })
                    }
                }
                chrome.tabs.query({
                    active: true, 
                    currentWindow: true
                }, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, { getAsyncListSuccess: true, hasAsyncList }, function(res) {
                        console.log('接收content的回调', res);
                    });
                });
            },
            
        })
    }
    if(senderRequest.fromContent && senderRequest.fromContent === 'sendAjax') {
        const { projectUuid, productKanbanId, taskData, index } = senderRequest;
        console.log('发送同步请求', senderRequest);
        $.ajax({
            type: 'POST',
            url: 'http://172.23.50.102:8002/product/ones/syncTask',
            data: JSON.stringify({
                projectUuid,
                productKanbanId,
                taskData
            }),
            dataType: 'json',
            contentType: 'application/json',
            success: function(res) {
                if(res.code === '0') {
                    console.log('同步成功');
                    chrome.tabs.query({
                        active: true, 
                        currentWindow: true
                    }, function(tabs){
                        chrome.tabs.sendMessage(tabs[0].id, {isAsyncSuccess: true, index}, function(response) {
                            console.log('接收content的回调', response);
                        });
                    });
                } else {
                    chrome.tabs.query({
                        active: true, 
                        currentWindow: true
                    }, function(tabs){
                        chrome.tabs.sendMessage(tabs[0].id, {isAsyncFail: true, index, msg: res.msg}, function(response) {
                            console.log('接收content的回调', response);
                        });
                    });
                }
            },
            error: function(err) {
                chrome.tabs.query({
                    active: true, 
                    currentWindow: true
                }, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {isAsyncFail: true, index}, function(response) {
                        console.log('接收content的回调', response);
                    });
                });
            }
        })
    }
});