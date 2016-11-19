exports.responseString = function(requestDataJSONObject, text) {
	var ToUserName   = requestDataJSONObject.fromUserName;
	var FromUserName = requestDataJSONObject.toUserName;
//	console.log('ToUserName   ' + ToUserName);
//	console.log('FromUserName ' + FromUserName);
//	console.log('text         ' + text);
	return "<xml><ToUserName><![CDATA[" + ToUserName + "]]></ToUserName><FromUserName><![CDATA[" + FromUserName + "]]></FromUserName><CreateTime>1461117293</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[" + text + "]]></Content></xml>";
}
