 var datas = [];

 (function(xhr) {
     var XHR = XMLHttpRequest.prototype;

     var open = XHR.open ;
     var send = XHR.send ;
     var setRequestHeader = XHR.setRequestHeader;

     XHR.open = function(method, url) {
         this._method = method;
         this._url = url ;
         this._requestHeaders = {};
         this._startTime = (new Date ()).toISOString();

         return open.apply(this, arguments);
     };

     XHR.setRequestHeader = function (header, value) {
         this._requestHeaders[header] = value;
         return setRequestHeader.apply(this, arguments);
     };

     XHR.send = function(postData) {
         this.addEventListener('load', function() {
            var endTime = (new Date ()).toISOString();
            var  myUrl = this._url ? this._url.toLowerCase() : this._url;
             if(myUrl)  {
                // console.log ('url: ', myUrl );
                // console.log ( 'postData:', postData);
                if(this.responseType != 'blob' && this.responseText )  {
                    try {
                        var text = this.responseText;  
                        if(myUrl.includes('api/project/team/') && myUrl.includes('/items/graphql?t=group-task-data')) {
                            // 发送消息到content.js
                            window.postMessage({type: "inject_message_type", message:JSON.parse(text)})
                            console.log ('注入脚本发送获取list: ', JSON.parse(text));    
                        }                    
                    } catch (err)  {
                        // console.log ( "Error in responseType try catch" );
                        // console.log ( err );
                    }
                }

             }
         });
         return send.apply(this, arguments);
     };
 })(XMLHttpRequest);

 var originalFetch = window.fetch;

 window.fetch = function(url, options) {
	 var fch = originalFetch(url, options);
	//  console.log ('url:', url );
	//  console.log ('options:', options);
	 fch.then(function(data) {
		 if(data.ok && data.status == 200 )  {
			 return data.clone().json();
		 }
	 }).then(function (a){
        // console.log('response:', a);
	 });
	 return fch;
 }