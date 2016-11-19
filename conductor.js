var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {auto_reconnect:true});
var db = new mongodb.Db('waiterdb', server, {safe:true});

function Waiter() {
  this.openId = '';
  this.status = 0;  // 0:default 1:no name 2:has name, but otherName
  this.name = '';
  this.otherName = '';
  this.startTime = 0;
}

var namePrefix = '@';
var resetSignal = '%reset';

var bonjour = '万一你等的那个Ta，也在等你呢？';
var bonjour2 = 'Welcome back！';

var answer0 = '请告诉我你的名字。如果你叫小明，请回复' + namePrefix + '小明。';
var answer1 = '请告诉我你在等的人的名字。如果Ta叫小美，请回复' + namePrefix + '小美。';

var answer_notFound = '很遗憾，Ta没有在这里等你。回复' + resetSignal + '可重置你们的名字。';
var answer_found = 'Ta在等你。';

var conductor = new Object();

conductor.handleInfo = function (msgObject, answerAfterDBOperation) {
  // msgObject 类型是 RequestDataJSONObject
  var msgContent    = msgObject.content;
  var msgOpenId     = msgObject.fromUserName;
  var msgCreateTime = msgObject.createTime;
  var msgType       = msgObject.msgType;
  var msgEvent      = msgObject.event;

  db.open(function(err, db) {
      if(!err) {
        db.createCollection('waiterCollection', {safe:true}, function(err, collection) {
          if(err) {
            console.log(err);
          } else {
            collection.findOne({openId:msgOpenId}, function(err,doc) {
              console.log('findOne');
              console.log(doc);
              if (msgType == 'event') {
                if (msgEvent == 'subscribe') {
                  if (doc == null) {
                    answerAfterDBOperation(msgOpenId, bonjour);
                  } else {
                    answerAfterDBOperation(msgOpenId, bonjour2);
                  }
                  return;
                }
              }

              var theWaiter;
              if (doc == null) {
                theWaiter = new Waiter();
              } else {
                theWaiter = doc;
              }

              if ((theWaiter.status != 0) && (msgContent.indexOf(resetSignal) == 0)) {                    
                resetWaiterData(collection, theWaiter, db, answerAfterDBOperation);
                return;
              }

              var answer;
              switch(theWaiter.status) {
                case 0: {
                  if (msgContent.indexOf(namePrefix) == 0) {
                    var waiterName = msgContent.substr(1, msgContent.length - 1);
                    if (doc == null) {
                      theWaiter.status = 1;
                      theWaiter.openId = msgOpenId;
                      theWaiter.name = waiterName;
                      collection.insertOne(theWaiter);
                    } else {
                      collection.updateOne({openId:msgOpenId}, {$set:{status:1, name:waiterName}});
                    }
                    answer = answer1;
                  } else {
                    answer = answer0;
                  }
                  closeDBBforeAnswer(msgOpenId, answer, db, answerAfterDBOperation);
                }
                break;
                case 1: {
                  if (msgContent.indexOf(namePrefix) == 0) {
                    var otherName = msgContent.substr(1, msgContent.length - 1);
                    collection.updateOne({openId:msgOpenId}, {$set:{status:2, otherName:otherName}});
                    answer = '你是' + theWaiter.name +'，你在等' + otherName + '。请回复是/否。';;
                  } else {
                    answer = answer1;
                  }
                  closeDBBforeAnswer(msgOpenId, answer, db, answerAfterDBOperation);
                }
                break;
                case 2: {
                  if (msgContent == '是') {
                    collection.updateOne({openId:msgOpenId}, {$set:{status:3, startTime:msgCreateTime}});
                    findOtherOne(collection, theWaiter, db, answerAfterDBOperation);
                  } else if (msgContent == '否') {
                    resetWaiterData(collection, theWaiter, db, answerAfterDBOperation);
                  } else {
                    answer = '你是' + theWaiter.name +'，你在等' + theWaiter.otherName + '。请回复是/否。';;
                    closeDBBforeAnswer(msgOpenId, answer, db, answerAfterDBOperation);
                  }
                }
                break;

                case 3: {
                  findOtherOne(collection, theWaiter, db, answerAfterDBOperation);
                }
                break;
              }
            });
          }
        });
      } else {
        console.log(err);
      }
  }); 
};

function closeDBBforeAnswer(openId, answer, db, answerAfterDBOperation) {
  db.close();
  answerAfterDBOperation(openId, answer);
}

function findOtherOne(collection, theWaiter, db, answerAfterDBOperation) {
  collection.findOne({name:theWaiter.otherName, otherName:theWaiter.name}, function(err,doc) {
    if (doc == null) {
        closeDBBforeAnswer(theWaiter.openId, answer_notFound, db, answerAfterDBOperation);                        
      } else {                        
        closeDBBforeAnswer(theWaiter.openId, answer_found, db, answerAfterDBOperation); 
      }
  });
}

function resetWaiterData(collection, theWaiter, db, answerAfterDBOperation) {
  theWaiter.status = 0;
  theWaiter.name = '';
  theWaiter.otherName = '';;
  theWaiter.startTime = 0;
  collection.updateOne({openId:theWaiter.openId}, theWaiter);
  closeDBBforeAnswer(theWaiter.openId, answer0, db, answerAfterDBOperation);
}

module.exports = conductor;
