//content.js   manifest匹配地址的页面在刷新时会直接执行这里的代码
$(function() {
    $("body").append("<div class='phoenix-async-success' style='position: absolute;top: 10%;left: 50%;color: #000;background: #f6ffed;display: none;border: 1px solid #b7eb8f;padding: 8px 15px;'>同步成功</div>")
    $("body").delegate('.phoenix-async-demand', 'click', function() {
        chrome.runtime.sendMessage(chrome.runtime.id, {//当页面刷新时发送到bg
            fromContent: 'sendAjax',
            projectUuid: $($('.project-name')[0]).text(),
            index: $(this).attr('data-index')
        });
    })
})

chrome.runtime.onMessage.addListener(function(senderRequest, sender, sendResponse) {
    console.log('demo已运行', senderRequest);
    if(senderRequest.isGetData) {
        $('.phoenix-async-demand').remove();
        setTimeout(() => {
            $('.task-item-one-row-margin-left').each((index,item) => {
                $(item).append("<button style='border: none;background: #5ca5ea;color: #fff;padding: 2px 12px;border-radius: 3px;margin-left: 8px;' data-index='"+index+"' class='phoenix-async-demand'>同步</button>")
            });
        },1000)
    }
    if(senderRequest.isAsyncSuccess) {
        $('.phoenix-async-success').show();
        setTimeout(() => {
            $('.phoenix-async-success').hide();
        },1000)
    }
});