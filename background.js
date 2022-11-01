chrome.runtime.onConnect.addListener(function (port) {
    const extensionListener = function (message, sender, sendResponse) {
        if (message.name == '信息头') {
            alert(message.data);
        }
    };
    port.onMessage.addListener(extensionListener);
 
    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(extensionListener);
    });
});