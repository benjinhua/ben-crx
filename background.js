//background.js
console.log('background.js');

$.get('http://172.23.50.102:8002/product/ones/taskList?projectUuid=LFsDxNc6UznjG7S7',(res) => {
    console.log(res);
})
var taskList = [];

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
        taskList = JSON.parse(senderRequest.content).data.buckets[0].tasks;
        chrome.tabs.query({
            active: true, 
            currentWindow: true
        }, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {isGetData: taskList.length > 0}, function(res) {
                console.log('接收content的回调', res);
            });
        });
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