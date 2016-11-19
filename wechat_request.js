// <xml>
// <ToUserName><![CDATA[oyv03s-EYFou2xtf3p4u5eJ5UnIA]]></ToUserName>
// <FromUserName><![CDATA[gh_505f314a419e]]></FromUserName>
// <CreateTime>1461117293</CreateTime>
// <MsgType><![CDATA[text11]]></MsgType>
// <Content><![CDATA[你好11]]></Content>
// </xml>

var querystring = require('querystring');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

function RequestDataJSONObject() {
    this.fromUserName = '';
    this.toUserName   = '';
    this.createTime   = '';
    this.msgType      = '';
    this.content      = '';
    this.event        = '';
    this.eventKey     = '';
}

var requestDataJSONObject = new RequestDataJSONObject();

requestDataJSONObject.setRequestData = function(requestData, didParseXML) {
    var params = querystring.parse(requestData);//GET & POST  ////解释表单数据部分{name="zzl",email="zzl@sina.com"}
    var json = JSON.stringify(params);
    console.log('JSON' + json);
    var xml = json.substr(2, (json.length - 7));

    if (xml.length) {
        parser.parseString(xml, function(err, result) {
            if (result.xml) {
                requestDataJSONObject.fromUserName = result.xml.FromUserName[0]; // openId
                requestDataJSONObject.toUserName   = result.xml.ToUserName[0];
                requestDataJSONObject.createTime   = result.xml.CreateTime[0];
                requestDataJSONObject.msgType      = result.xml.MsgType[0];

                if (requestDataJSONObject.msgType == 'text') {                
                    requestDataJSONObject.content = result.xml.Content[0];
                } else if (requestDataJSONObject.msgType == 'event') {
                    requestDataJSONObject.event    = result.xml.Event[0];
                    requestDataJSONObject.eventKey = result.xml.EventKey[0];
                }
                
                didParseXML();
            }
        });
    } 
}

module.exports = requestDataJSONObject;

// <xml>
//   <ToUserName><![CDATA[gh_b46c5ba0be82]]></ToUserName>\n
//   <FromUserName><![CDATA[oeOfyv1OSwKJAvwGLgnEmBokCB7w]]></FromUserName>\n
//   <CreateTime>1464078495</CreateTime>\n
//   <MsgType><![CDATA[event]]></MsgType>\n
//   <Event><![CDATA[subscribe]]></Event>\n
//   <EventKey><![CDATA[]]></EventKey>\n
// </xml>

