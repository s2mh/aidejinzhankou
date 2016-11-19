var http = require('http');
var requestDataJSONObject = require('./wechat_request.js');
var responseStringObject = require('./wechat_response.js');
var conductor = require('./conductor.js');

http.createServer(function (req, res) {
    // 设置接收数据编码格式为 UTF-8
    req.setEncoding('utf-8');
    var postData = ""; //POST & GET ： name=zzl&email=zzl@sina.com
    // 数据块接收中
    req.on("data", function (postDataChunk) {
        postData += postDataChunk;
    });

    // 数据接收完毕，执行回调函数
    req.on("end", function () {
        requestDataJSONObject.setRequestData(postData, function(){
            if (requestDataJSONObject.fromUserName.length < 1) {
                return;
            }
            console.log(requestDataJSONObject.fromUserName);
            function conductorAnswers(openId, answer) {
                // 让参数openId打酱油，说不定以后有用
                res.writeHead(200, {
                    "Content-Type": "text/plain;charset=utf-8"
                });
                res.write(responseStringObject.responseString(requestDataJSONObject, answer));
                res.end("");
            }
            conductor.handleInfo(requestDataJSONObject, conductorAnswers);
        });        
    });

}).listen(80);


