chrome.devtools.panels.create(
    'San',
    './img/logo.png',
    './html/devtools.html'
);

chrome.runtime.sendMessage(chrome.runtime.id, {
    fromDevTools: 'request',
    body: chrome.devtools
});

function handleRequestFinished(request) {
    request.getContent(function(content, mimeType) {
        if(request.request.url.includes('t=group-task-data')) {
            chrome.runtime.sendMessage(chrome.runtime.id, {
                fromDevTools: 'request',
                tabId: chrome.devtools.inspectedWindow.tabId,
                content: content
            });
        }
    });
}

chrome.devtools.network.onRequestFinished.addListener(handleRequestFinished);