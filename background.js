//background.js
console.log('background.js');

var taskList = [];
// 已同步列表，已同步列表index
var hasAsyncList = [], hasAsyncIndexList = [];

function sendMessageToContentScript(message, callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		chrome.tabs.sendMessage(tabs[0].id, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}
sendMessageToContentScript({cmd:'test', value:'你好，我是popup！'}, function(response)
{
	console.log('来自content的回复：'+response);
});


chrome.runtime.onMessage.addListener(function(senderRequest, sender, sendResponse) {
    if(senderRequest.fromDevTools && senderRequest.fromDevTools=='request' && senderRequest.content){
        // 监听到请求列表响应正文
        taskList = JSON.parse(senderRequest.content).data.buckets[0].tasks;
        hasAsyncList = [];
        // 获取已同步需求
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
                taskList.forEach((item,index) => {
                    if(hasAsyncList.includes(item.uuid)) {
                        hasAsyncIndexList.push(index);
                    }
                })
                chrome.tabs.query({
                    active: true, 
                    currentWindow: true
                }, function(tabs){
                    chrome.tabs.sendMessage(tabs[0].id, {isGetData: taskList.length > 0, hasAsyncIndexList}, function(res) {
                        console.log('接收content的回调', res);
                    });
                });
            }
        })
    }
    if(senderRequest.fromContent && senderRequest.fromContent === 'sendAjax') {
        var projectUuid = senderRequest.projectUuid;
        var taskData = taskList[senderRequest.index]
        $.ajax({
            type: 'POST',
            url: 'http://172.23.50.102:8002/product/ones/syncTask',
            data: JSON.stringify({
                projectUuid,
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
                        chrome.tabs.sendMessage(tabs[0].id, {isAsyncSuccess: true}, function(res) {
                            console.log('接收content的回调', res);
                        });
                    });
                }
            }
        })
    }
});