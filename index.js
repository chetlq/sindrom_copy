'use strict';
const PSI_ROZA = {
 // LOGIN: "9882974166",
  LOGIN: "3554678395",
  HOST: "http://194.186.207.23",
  HOST_BLOCK: "http://194.186.207.23",
  SMS_PASS: "55098",
  // mGUID: "93d727547c5b97ae9dbc9a4bfc41f294",
  // token: "6abe40afbd29b0d2ac19f1f9052d0d4d",
  mGUID: "4856a406c200643f529efd6fe5e90fae",
  token: "59821587bc4405b466f4fc6e731efa16",
  PASS: "11223",
  PFMtoken: "b02ddd9811f476eebfbce27ca8f404b1"
};
const GLOBALS = {
  DEVID: "09D4B172-B264-419A-BFBE-6EA7E02B6239",
  VERSION: "9",
  SMS_PASS: "55098",
  operation: "register",
  login: "6435488876",
  version: "9.10",
  appType: "5.5.0",
  deviceName: "Simulator",
  devID: "08D4B172-B264-419A-BFBE-6EA7E00B6239",
  mGUID: "27e5264de6bd37ba4fe37bea592099d4"
}
var USE_IMAGES_FLAG = true;

function getCardTitle() { return "cardtitle";}
function getSuccess(value) {
  if(value) {  return "success";}
  else { return "unsuccess";}
}

var Quiche = require('quiche');
var pie = new Quiche('pie');

var iconv = require('iconv-lite');
var Alexa = require("alexa-sdk");
var parse = require('xml-parser');
const axios = require('axios');
const axios2 = require('axios');
var https = require('https');
var date = require('./calendar');
var calendar = new date();
var moment = require('moment');

var getDate = require('./getDate');

const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support');
const tough = require('tough-cookie');
var Cookie = tough.Cookie;
//
axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

var instance = axios.create({
  timeout: 45000,
  jar: cookieJar, // tough.CookieJar or boolean
  withCredentials: true,
  responseType:'stream',
  headers: {
    'Content-Language':'ru',
    'Accept-Language': 'ru;q=1',
    'Content-Type': 'text/xml;charset=windows-1251',
    'User-Agent': 'Mobile Device'

  }
});


var autpip = function(addr) {
  var self = this;
  var promise = new Promise(function(resolve, reject) {
    instance.get(addr).then(res => {
      res.data.pipe(iconv.decodeStream("win1251")).collect((err, body) => {
        resolve(body);
      });
    }).catch(err => {
        conn = null;
      self.emit(':tell', 'Connectiion error ');
      console.log('catch1'+err);
      reject(err)
    })
  });

  return promise.then(res => {
    return res
  }).catch(err => {
      conn = null;
    console.log('catch2'+err);
    self.emit(':tell', 'Connection error, restart the skill ');

  })
};
function isEmpty(obj,val) {
    if(obj[val]!==undefined){ return true;}else{ return false; }
};

function unique(arr) {
  var obj = {};
var count=0;
  for (var i = 0; i < arr.length; i++) {
    var str = arr[i].date;
    if (isEmpty(obj,arr[i].date)){count +=arr[i].amount;}else{count =arr[i].amount;}
    obj[str] = count; // запомнить строку в виде свойства объекта
  }

  return obj; // или собрать ключи перебором для IE8-
};

function unique2(arr) {
  var obj = {};
var count=0;
  //for (var i = 0; i < arr.length; i++) {
  for(var key in arr){
    var str = key;
    var str2 = str.substring(str.indexOf(".")+1,str.length);
    if (isEmpty(obj,str2)){count +=arr[key];}else{count =arr[key];}
    obj[str2] = count; // запомнить строку в виде свойства объекта
  }

  return obj; // или собрать ключи перебором для IE8-
};



var reg = function(){
  var self = this;
    try{
  return autpip.call(self,PSI_ROZA.HOST +
    '/CSAMAPI/registerApp.do?operation=register&login=' + PSI_ROZA.LOGIN +
    '&version=' + GLOBALS.VERSION +
    '.10&appType=iPhone&appVersion=5.5.0&deviceName=Simulator&devID=' +
    GLOBALS.DEVID).then(res=>{
      var obj = parse(res);
      var mGUID= obj['root']['children'][2]['children'][0]['content'];
      console.log("mguid = "+mGUID);
      return mGUID
    }).then(mGUID=>{
      return autpip.call(self,PSI_ROZA.HOST +
        "/CSAMAPI/registerApp.do?operation=confirm&mGUID=" +
        mGUID + "&smsPassword=" + PSI_ROZA.SMS_PASS + "&version=" + GLOBALS.VERSION +
        ".10&appType=iPhone").then(()=>{
          console.log("mguid = "+mGUID);
          return mGUID;
        }).catch(res => {
          console.log('catch3'+res);
          self.emit(':tell', 'Connection error, restart the skill ');

          });

    //  console.log(res);

  }).then(mGUID=>{

     return autpip.call(self,PSI_ROZA.HOST +
      "/CSAMAPI/registerApp.do?operation=createPIN&mGUID=" +
      mGUID + "&password=" + PSI_ROZA.PASS + "&version=" + GLOBALS.VERSION +
      ".10&appType=iPhone" +
      "&appVersion=5.5.0&deviceName=Simulator&isLightScheme=false&devID=" +
      GLOBALS.DEVID + "&mobileSdkData=1").then(res=>{
        var obj = parse(res);
        var token = obj['root']['children'][2]['children'][1]['content'];
        console.log("token = "+token);
        return token;
      }).catch(res => {
        console.log('catch4'+res);
        self.emit(':tell', 'Connection error, restart the skill ');

      return res;
                    // reject(0);
                    //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
                  });
  //  console.log(res);
}).then(token=>{

  return autpip.call(self,PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
    "/postCSALogin.do?token=" + token).then(res=>{
      var obj = parse(res);
      var status  = obj['root']['children'][0]['children'][0]['content'];
      console.log(obj['root']['children'][0]['children'][0]);
      console.log("status "+status);
      if(parseInt(status)!==0) throw new Error('Login error');
    }).catch(res => {
        conn = null;
      console.log('catch31'+res);
      this.emit(':tell', 'Connection error, restart the skill ');
    });


  //console.log(token);
}).catch(res => {
  console.log('catch5'+res);
  this.emit(':tell', 'Connection error, restart the skill ');

return res;
});

} catch (err) {
  this.emitWithState('NewSession');

console.log('catch30'+err);
  // обработка ошибки

}
};


var t = function(objroot,val,arr) {

         var myobj = {
           operations: []

         };
         (function k(obj) {

           if (Array.isArray(obj)) {

             obj.forEach(function(item, i) {
               k(item);
             });
           } else {

             if (obj.name == val) {
               var o = {};
               obj.children.forEach(function(item, i) {

                 if (item.name == 'operationAmount') {
                   item.children.forEach(function(item2, i2) {
                     if (item2.name == 'amount') {
                       o.amount = item2.content;
                     }
                     if (item2.name == 'currency') {
                       o.code = item2.children[0].content;
                     }
                   });
                 }else

                 for (var i = 0; i < arr.length; i++) {
                   if (item.name == arr[i] ) o[arr[i]]= item.content;

                 }
               });
               myobj.operations.push(o)
             } else {
               k(obj.children)
             }


           }
         })(objroot);
         return myobj;
       };

var c = function(){
  function rgb2hex(rgb){
   rgb = rgb.match(/^[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
   var c = (rgb && rgb.length === 4) ?
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
   return c.toUpperCase();
  }
  var v = function(){ return Math.round(Math.random()*255)};
  return rgb2hex('('+v()+', '+v()+', '+v()+')');
}


exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(newSessionHandlers,  startGameHandlers);
  alexa.execute();
};



var states = {
  GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
  STARTMODE: '_STARTMODE', // Prompt the user to start or restart the game.
  ENDMODE: '_ENDMODE'
};
//var conn =  connect();
var conn= null;

var newSessionHandlers = {
  'AMAZON.HelpIntent': function() {
    this.handler.state = states.STARTMODE;
var message = ' There are five actions, such as : 1st, get data for financial calendar  for date your date,'+
' second, get data for transaction history as list for interval from date to date , '+
'third, get data for transaction history for interval from date to date, fourth, show diagram of accounts, cards or imaccounts.'+
'For some queries navigation is possible. Using the phrase,  navigation next, last, first or previous';
this.emit(':ask', message, message);
},
 "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
          this.emitWithState('Exit');
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emitWithState('Exit');

    },
    'Exit': function(){
      this.handler.state = '';
      var response = {
        "version": "1.0",
        "response": {
          "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak> " + "Goodbye! The skill will be restarted " + "</speak>"
          },
          "card": {
            "content": "",
            "title": "Goodbye! The skill will be restarted ",
            "type": "Simple"
          },
          "speechletResponse": {

            "shouldEndSession": true
          }
        },
        "sessionAttributes": {

        }
      };
  console.log(response);
      this.context.succeed(response);
    },
  'NewSession': function() {
     conn=null;
     //this.attributes['status']=false;
      // conn = reg();
    this.handler.state = states.STARTMODE;
    var message = "Welcome to bank account checker. First, connect to the server by saying the word connect, and then say the call phrase for the desired action."
    this.emit(':ask', message,message);
    //'Say yes to start the game or no to quit.
  },

  'Unhandled': function () {
    //this.emitWithState('')
    this.emit('NewSession');
}
};




var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
  'AMAZON.HelpIntent': function() {
var message = ' There are five actions, such as : 1st, get data for financial calendar  for date your date,'+
' second, get data for transaction history as list for interval from date to date , '+
'third, get data for transaction history for interval from date to date, fourth, show diagram of accounts, cards or imaccounts.'+
'For some queries navigation is possible. Using the phrase,  navigation next, last, first or previous';
this.emit(':ask', message, message);
},
 "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
          this.emitWithState('Exit');
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emitWithState('Exit');

    },
    'Exit': function(){
      this.handler.state = '';
      var response = {
        "version": "1.0",
        "response": {
          "outputSpeech": {
            "type": "SSML",
            "ssml": "<speak> " + "Goodbye! The skill will be restarted " + "</speak>"
          },
          "card": {
            "content": "",
            "title": "Goodbye! The skill will be restarted ",
            "type": "Simple"
          },
          "speechletResponse": {

            "shouldEndSession": true
          }
        },
        "sessionAttributes": {

        }
      };
  console.log(response);
      this.context.succeed(response);
    },
      'NewSession': function() {
        this.handler.state = '';
        var response = {
          "version": "1.0",
          "response": {
            "outputSpeech": {
              "type": "SSML",
              "ssml": "<speak> " + "connecting error " + "</speak>"
            },
            "card": {
              "content": "",
              "title": "connecting error ",
              "type": "Simple"
            },
            "speechletResponse": {

              "shouldEndSession": true
            }
          },
          "sessionAttributes": {

          }
        };
    console.log(response);
        this.context.succeed(response);
      },



'Connector':function(){
  var slotValue = this.event.request.intent.slots.connect.value;
  if (slotValue!=="connect")this.emitWithState("Unhandled");
  var self = this;
  if(conn === null || conn === undefined){conn = reg.call(this);}
  conn.then((res) => {
    console.log("<><><><><><><><><><><><>");
console.log(res);
    //this.handler.state = states.STARTMODE;
    var response = {

    "version": "1.0",
    "response": {
      "outputSpeech": {
        "ssml": "<speak> success  </speak>",
        "type": "SSML"
      },
      "speechletResponse": {
        "outputSpeech": {
          "ssml": "<speak> success  </speak>"
        },
        "shouldEndSession": false
      }
    },
    "sessionAttributes": {
      "STATE": "_STARTMODE",
      "status":true
    }

    };
    self.context.succeed(response);



//this.emit(':ask', "ok ");
  }).catch((res) => {
    conn = null;
  //  self.attributes['status'] = false;
    console.log('connect error' + res);
    self.emit(':tell', "connection unsuccessful ");

  });
},


'DiagramBar': function() {
  var sentence=[];
   sentence.push("Each column corresponds to each translation") ;
   sentence.push("Each column corresponds to all translations in one day");
   sentence.push("Each column corresponds to all translations in one month");
  var phrase = sentence[0];



  function randomInteger(min, max) {
      var rand = min - 0.5 + Math.random() * (max - min + 1)
      rand = Math.round(rand);
      return rand;
    }



  var self = this;


console.log(this.attributes['status']);

if((this.attributes['request'] == '4117')||(this.attributes['request'] == '4118'))
this.emit(":ask", "Don't work for this request", "Don't work for this request");

if(!this.attributes['status'] && (conn === null))
this.emit(":ask", "First, connect to the server by saying the word connect", "First, connect to the server by saying the word connect");

var slotValuefrom = this.event.request.intent.slots.datefrom.value||this.attributes['slotValuefrom']||null;
var slotValueto = this.event.request.intent.slots.dateto.value||this.attributes['slotValueto']||null;
var slotDate = this.event.request.intent.slots.date.value || null;
var sortval = this.event.request.intent.slots.sort.value|| null;

console.log(">>> "+slotValuefrom+" : "+slotValueto+" : "+slotDate);
// console.log(slotValuefrom+" to "+slotValueto);

var arr = getDate.call(this,this.attributes['startstr'],this.attributes['endstr'],slotValuefrom,slotValueto,slotDate);


    this.attributes['startstr'] = arr[0];
    this.attributes['endstr'] = arr[1];



  this.attributes['slotValuefrom'] = undefined;
  this.attributes['slotValueto'] = undefined;

  if (this.attributes['startstr'] === undefined || this.attributes['endstr'] === undefined) { // Check if it's the first time the skill has been invoked
this.emit(":ask", "repeat the date", "repeat the date");
}


  var self = this;
try {
  conn.then(() => {


    return autpip.call(self, PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
        "/private/payments/list.do?from=" +
        this.attributes['startstr'] + "&to=" + this.attributes['endstr'] +
        //from + "&to=" + to +
        "&paginationSize=99999&paginationOffset=0"
      )
      .then((res) => {
        var obj = parse(res);
        console.log(obj.root);
        //console.log(obj.root);

        var shuffledMultipleChoiceList = [];
        var arr = ["type", "form", "date", "operationAmount"];
        var myobj = t(obj.root, 'operation', arr);
        var str = "";
        //var readstr = [];
        var j = 0;
        console.log("count myobj " + myobj.operations.length);
        // if (myobj.operations.length == 0) {
        //   console.log(res);
        //   this.emitWithState('NewSession');
        // }
        myobj.operations.forEach(function(item, i) {
          //if((parseInt(item.amount)!=0)&&(!isNaN(parseInt(item.amount)))){
          var type = item.type || "not type";
          type = type.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
          var form = item.form || "not type";
          form = form.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
          var date = item.date || "not date";
          date = date.split("T")[0] + "";
          date = date.replace(/[^\d\sA-Za-zА-Яа-я/.]/gi, "");
          var amount = item.amount || 0;
          amount = Math.round(parseInt(amount));
          var code = item.code || "not code";
          code = code.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
          if (amount !== 0) {
            j++;
            //console.log(j+" "+type+" "+ form + " | " + date+ " | " + amount + " | " + code+"<br/>");
            shuffledMultipleChoiceList.push({
              "date": date,
              "amount": amount
            })

          }
          //str +=i+1+" "+type+" "+ form + " | " + date+ " | " + amount + " | " + code+"<br/>";
        });

        shuffledMultipleChoiceList = (function() {
          if (shuffledMultipleChoiceList.length > 100 && self.attributes['startstr'] !== self.attributes['endstr']) {
             phrase = sentence[1];
            console.log(">100");
            var positive = shuffledMultipleChoiceList.filter(function(item) {
              return item.amount > 0;
            });
            var negative = shuffledMultipleChoiceList.filter(function(item) {
              return item.amount < 0;
            });
            console.log(positive.length);
            var sortNeg = unique(negative);
            //console.log(sortNeg.length);
            var sortPos = unique(positive);
            if ((Object.keys(sortNeg).length + Object.keys(sortPos).length) > 100) {
               phrase = sentence[2];
              console.log("2 >100");
              sortPos = unique2(sortPos);
              sortNeg = unique2(sortNeg);
              shuffledMultipleChoiceList = [];
              for (var variable in sortPos) {
                shuffledMultipleChoiceList.push({
                  "date": variable,
                  "amount": sortPos[variable]
                })
              };
              for (var variable in sortNeg) {
                shuffledMultipleChoiceList.push({
                  "date": variable,
                  "amount": sortNeg[variable]
                })
              }

              return shuffledMultipleChoiceList
            } else {
              shuffledMultipleChoiceList = [];
              for (var variable in sortPos) {
                shuffledMultipleChoiceList.push({
                  "date": variable,
                  "amount": sortPos[variable]
                })
              };
              for (var variable in sortNeg) {
                shuffledMultipleChoiceList.push({
                  "date": variable,
                  "amount": sortNeg[variable]
                })
              }

              return shuffledMultipleChoiceList
            }

          } else {
            //console.log(shuffledMultipleChoiceList);
            return shuffledMultipleChoiceList;
          }
        })();

        console.log(shuffledMultipleChoiceList);

        console.log(shuffledMultipleChoiceList.length);

        if(shuffledMultipleChoiceList.length ==0){
          this.emit(':ask', "no results for this date","no results for this date");
        };
        if ( (shuffledMultipleChoiceList[0].date.split(".").length - 1) == 2) {
          shuffledMultipleChoiceList.sort(function(a, b) {

            if (moment(a.date, "DD.MM.YYYY") > moment(b.date, "DD.MM.YYYY")) {
              return 1
            } else {
              return -1
            }

          });
        } else {
          console.log("else");
          shuffledMultipleChoiceList.sort(function(a, b) {

            if (moment("01." + a.date, "DD.MM.YYYY") > moment("01." + b.date, "DD.MM.YYYY")) {
              return 1
            } else {
              return -1
            }

          });
        };
        //console.log(shuffledMultipleChoiceList);
        //


        shuffledMultipleChoiceList.reduce(function(previousValue, currentItem, index) {

          if (previousValue.date.trim() == currentItem.date) {
            currentItem.date = previousValue.date + " ";
            //console.log("currentItem.date = "+currentItem.date+" previousValue.date = "+ previousValue.date);
          };
          return currentItem
        });
        if (sortval == "value"){
          shuffledMultipleChoiceList.sort(function(a, b) {

            if (a.amount > b.amount) {
              return 1
            } else {
              return -1
            }

          });
        };


        //
        // shuffledMultipleChoiceList.reduce(function(previousValue, currentItem, index) {
        //   if (previousValue.date == currentItem.date) {
        //     console.log("currentItem.date = "+currentItem.date+" previousValue.date = "+ previousValue.date);
        //   };
        // });




        console.log("///////////////////////////////////////////////");
        shuffledMultipleChoiceList.forEach(item => console.log(item));



        var self2 = this;



        axios2.post('https://google-chart.herokuapp.com/rr', shuffledMultipleChoiceList).then(function(res) {
          console.log("AxiosstatusCode: "+res.status); // <======= Here's the status code
          // console.log("headers: ", res.headers);

 if(res.status==200){

     console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
     console.log(res.data);
     var seconds = new Date().getTime();
     var imageUrl = 'https://google-chart.herokuapp.com/ff?'+seconds;

               var content = {
              "hasDisplaySpeechOutput": "The chart was built. "+phrase,
              "hasDisplayRepromptText": "The chart was built"+phrase,
              "simpleCardTitle": '',
              "simpleCardContent": '',
              "bodyTemplateTitle": '',
              "bodyTemplateContent": '',
              "templateToken": "factBodyTemplate",
              "askOrTell": ":ask",
              "imageUrl": imageUrl,
              "sessionAttributes": {
                "STATE": states.STARTMODE,
                "status":true,
                "startstr":self2.attributes['startstr'],
                "endstr":self2.attributes['endstr']

              }
            };


            renderTemplate2.call(self2, content);

}else{
  this.emit(':tell', "error error");
}

        }).catch((res) => {
          this.emit(':tell', "error ");

        });





      }).catch((res) => {
        console.log('catch10-1(sorry5)' + res);
        this.attributes['status'] = false;
        self.emit(":ask", "tell word connect first", "tell word connect first");

      });
  }).catch((res) => {
    console.log('catch12-2' + res);
    this.attributes['status'] = false;
    self.emit(":ask", "tell word connect first", "tell word connect first");

  });
} catch (e) {
  console.log(e);
  this.attributes['status'] = false;
  this.emit(":ask", "tell word connect first", "tell word connect first");
}



},




      'DiagramIntent': function() {
        var self = this;
        function compareNumeric(a, b) {
          var att = a.balance.replace(/\s/g, "");
          var btt = b.balance.replace(/\s/g, "");
          if (parseInt(att) > parseInt(btt)) return 1;
          if (parseInt(att) < parseInt(btt)) return -1;
        };
        var value = this.event.request.intent.slots.dg.value;
        console.log(" value  - "+ value);
        if(value === null)
        this.emit(':ask', value, "sorry7");

         var promise = new Promise(function(resolve, reject) {

           //var value = this.event.request.intent.slots.dg.value || null;

        if(conn === null || conn === undefined){conn = reg.call(self);}
        conn.then(() => {

          return autpip.call(self,PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                      "/private/graphics/finance.do"
            ).then((res) => {


              var obj = parse(res);

              var str = "";
              var s = "";
              var shuffledMultipleChoiceList = [];

              //var dg = true;

                if (typeof value == 'undefined') self.emit(':ask', "sorry8", "sorry8");
              switch (value) {
                case "imaccounts":
                  var dg = 'imaccount';
                break;
                case "accounts":
                  var dg = 'account';
                break;
                case "cards":
                  var dg = 'card';
                break;
                default:
                  var dg = false;
                  break;
              }
              console.log("dg = "+dg);
              if (!dg){reject("dgerror")}
                var arr = ["id", "balance"];
              var myobj = t(obj.root,dg, arr);
              //console.log(myobj.operations.length);
              var arr = [];

              var arr2 = [];
              pie.setTransparentBackground();
              pie.addPercent();

              myobj.operations.forEach(function(item, i) {
                var ttt = item.balance.replace(/\s/g, "");
                if (parseInt(ttt) > 0) {
                  arr2.push(item);

                  // pie.addData(parseInt(ttt), "id = " + item.id + " ", c());
                  // arr.push(parseInt(ttt));
                  //
                  // shuffledMultipleChoiceList.push(item.id + " | balance = " + item.balance + " ₽");
                  // console.log(item.id + " | balance = " + item.balance + " ₽");
                }
              });
              arr2.sort(compareNumeric);
              arr2.reverse() ;
              if (arr2.length<20){

              for (var i = 0; i < arr2.length; i++) {
                var ttt = arr2[i].balance.replace(/\s/g, "");
                console.log(ttt);
                pie.addData(parseInt(ttt), "id = " + arr2[i].id + " ", c());
                arr.push(parseInt(ttt));

                // shuffledMultipleChoiceList.push(arr2[i].id + " | balance = " + arr2[i].balance + " ₽");
                console.log(arr2[i].id + " | balance = " + arr2[i].balance + " ₽");
              };


              pie.setLabel(arr);
              var Url = pie.getUrl(true);
              pie =  new Quiche('pie');
              resolve(Url);
            }else{
              for (var i = 0; i < arr2.length; i++) {
                var ttt = arr2[i].balance.replace(/\s/g, "");
              shuffledMultipleChoiceList.push({
                "date": "id "+arr2[i].id,
                "amount": parseInt(ttt)
              });
            };

            axios2.post('https://google-chart.herokuapp.com/rr', shuffledMultipleChoiceList).then(function(res) {
              console.log("AxiosstatusCode: "+res.status); // <======= Here's the status code
              // console.log("headers: ", res.headers);

              if(res.status==200){
                var seconds = new Date().getTime();
                var imageUrl = 'https://google-chart.herokuapp.com/ff?'+seconds;
                resolve(imageUrl);

              }
            });


            }

              })
              .catch(res => {
                console.log('catch6'+res);

                  self.emitWithState('NewSession');

              // reject(0);
              //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
              });

              }).catch(res => {
                console.log('catch7'+res);

                  self.emitWithState('NewSession');
              reject(res)
              // reject(0);
              //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
              });
            });


               promise.then(res => {

                 var content = {
                   "hasDisplaySpeechOutput":  "The chart was built ",
                   "hasDisplayRepromptText": "The chart was built",
                   "simpleCardTitle": '',
                   "simpleCardContent": '',
                   "bodyTemplateTitle": '',
                   "bodyTemplateContent": '',
                   "templateToken": "factBodyTemplate",
                   "askOrTell": ":ask",
                   "imageUrl":res,
                   "sessionAttributes": {
                     "STATE": states.STARTMODE
                   }
                 };
                 renderTemplate2.call(this, content);


               }).catch(res => {
                 this.emitWithState('NewSession');
                 console.log('catch8'+res);

               });



             },




      'NavigationIntent': function() {

        var countitems = this.attributes['countitems'];
        var request = this.attributes['request'];
        if (typeof request == 'undefined') this.emit(':ask', "repeat please", "repeat please");

        if (typeof this.attributes['countitems'] == 'undefined') {
          this.emit(':ask', "The number of elements is zero ","The number of elements is zero ")
        }
        if (typeof this.attributes['currentpage'] == 'undefined') {
          var currentpage = 0;
        } else {
          var currentpage = this.attributes['currentpage']
        };
        var countpages = Math.ceil(parseInt(countitems) / 50);
console.log("countpages = "+countpages);

        var value = this.event.request.intent.slots.index.value;
        switch (value) {
          case "next":

            if (currentpage + 1 < countpages)
            currentpage = currentpage + 1
console.log("currentpage = "+currentpage);
              break;
          case "previous":

            if (currentpage - 1 != -1)
              currentpage = currentpage - 1;
console.log("currentpage = "+currentpage);
            break;
          case "last":
          if (countpages - 1 != -1)
            currentpage = countpages-1;
console.log("currentpage = "+currentpage);
            break;
          case "1st":
            currentpage = 0;
console.log("currentpage = "+currentpage);
            break;

          default:
            this.emit(':ask', "repeat navigation request", "repeat navigation request");
            break;
        }
        var str = "";


        switch (request) {
          case '412astext':
          if ((typeof this.attributes['startstr'] == 'undefined')||(typeof this.attributes['endstr'] == 'undefined')) {this.emit(':ask', "Repeat date", "Repeat date");}
          var reqstr = PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
            "/private/payments/list.do?from="+
            this.attributes['startstr']+"&to="+this.attributes['endstr']+
            "&paginationSize=100000&paginationOffset=0";
            var arr = ["type", "form", "date", "operationAmount"];
            var tvalue = 'operation';
            break;
            case '4118':
            if (typeof this.attributes['ondate'] == 'undefined') {this.emit(':ask', "sorry", "sorry");}
            var reqstr = PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                "/private/finances/financeCalendar/showSelected.do?onDate="+this.attributes['ondate']+"&selectedCardIds=552280";
                var arr = ["id", "description", "categoryName", "amount"];
                var tvalue = 'operation';
              break;
          default:
          this.emit(':ask', "dont work for this ", "dont work for this ");

        }

try{
                      if(conn === null || conn === undefined){conn = reg.call(this);}
                      conn.then(() => {
                      //  {{HOST_BLOCK}}/mobile{{VERSION}}/private/payments/list.do?from=08.11.2010&to=31.03.2018&paginationSize=200&paginationOffset=0
                        return autpip(reqstr).then((res) => {

                          var obj = parse(res);
                          //console.log(obj.root);

                          var shuffledMultipleChoiceList = [];

                          var myobj = t(obj.root,tvalue , arr);
                          var str = "";
                          //var readstr = [];


                            switch (request) {
                              case '412astext':
                              myobj.operations.forEach(function(item, i) {
                              var type = item.type || "not type";
                              type =type.replace(/[^\d\sA-Za-zА-Яа-я]/gi,"");
                              var form = item.form || "not type";
                              form = form.replace(/[^\d\sA-Za-zА-Яа-я]/gi,"");
                              var date =item.date || "not date T ";
                              date =date.split("T")[0]+"";
                              date = date.replace(/[^\d\sA-Za-zА-Яа-я/.]/gi,"");
                              var amount = item.amount || 0;
                              amount = Math.round(parseInt(amount))+"";
                              var code = item.code || "not code";
                              code =code.replace(/[^\d\sA-Za-zА-Яа-я]/gi,"");
                                if((i>=currentpage*50)&&(i<currentpage*50+50)){
                                  str +=i+1+" "+type+" "+ form + " | " + date+ " | " + amount + " | " + code+"<br/>";
                                };
                              });
                              var buf1 = currentpage*50;
                              var buf2 = currentpage*50+50;
                              var hasDisplaySpeechOutput =  getSuccess(countitems!=0)+", "+ 'Payments:'+buf1+'...'+buf2+' of '+  countitems+ " items";
                              var hasDisplayRepromptText = getSuccess(countitems!=0);
                              var simpleCardTitle = "History of operations";
                              var simpleCardContent = 'Payments:'+buf1+' to '+buf2+' of '+countitems+", from "+this.attributes['startstr']+" to "+ this.attributes['endstr'];
                              var bodyTemplateTitle = 'Payments:'+buf1+' to '+buf2+' of '+countitems+", from "+this.attributes['startstr']+" to "+ this.attributes['endstr'];

                                break;

                                case '4118':
                                myobj.operations.forEach(function(item, i) {
                                  var description = item.description.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
                                  var amount = item.amount.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
                                  var categoryName = item.categoryName.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
                                  if((i>=currentpage*50)&&(i<currentpage*50+50)){
                                  str += i+1+" "+categoryName+ " | "+ amount + " RUB | " + description + "<br/>";

                                }
                                });

                               var buf1 = currentpage*50;
                               var buf2 = currentpage*50+50;
                               var simpleCardTitle = "Receipt of a financial calendar statement for the day";
                                var hasDisplaySpeechOutput =  getSuccess(countitems!=0)+" Receipt of a financial calendar statement for the day "+", "+  myobj.operations.length+ " items for "+this.attributes['ondate'];

                                var hasDisplayRepromptText = getSuccess(countitems!=0);
                                var simpleCardContent = 'Payments:'+buf1+' to '+buf2+' of '+countitems+", for "+this.attributes['ondate'];
                                var bodyTemplateTitle = 'Payments:'+buf1+' to '+buf2+' of '+countitems+", for "+this.attributes['ondate'];


                                break;

                              default:
                                this.emit(':ask', "dont work for this", "dont work for this");
                            }
                          //  if((parseInt(item.amount)!=0)&&(!isNaN(parseInt(item.amount)))){




        console.log(countitems);

                          var content = {
                            "hasDisplaySpeechOutput" :  hasDisplaySpeechOutput,
                            "hasDisplayRepromptText" :hasDisplayRepromptText,
                            "simpleCardTitle" :simpleCardTitle,
                           "simpleCardContent" : simpleCardContent,
                           "bodyTemplateTitle" : bodyTemplateTitle,
                           "bodyTemplateContent" : str,
                           "templateToken" : "factBodyTemplate",
                           "askOrTell" : ":ask",
                           "sessionAttributes": {
                             "STATE": states.STARTMODE,
                             "request":this.attributes['request'],
                             "countitems":countitems,
                             //"myobj":shuffledMultipleChoiceList,
                             "startstr":this.attributes['startstr'],
                             "endstr":this.attributes['endstr'],
                             'ondate':this.attributes['ondate'],
                             'onmonth':this.attributes['onmonth'],
                             'currentpage':currentpage//,
                             //'readstr':readstr                     //'bodyTemplateContent':str
                           }
                        };

                          renderTemplate.call(this, content);



                          // console.log(shuffledMultipleChoiceList);
                          // this.emit(':ask', value + "1", value);
                          //  resolve(shuffledMultipleChoiceList)
                          //resolve(shuffledMultipleChoiceList);
                        })
                        .catch((res) => {
                          this.emit(':tell', 'some error, sorry ');
        console.log('catch13'+res);
                          // reject(0);
                          //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
                        });
                      }).catch((res) => {
                        this.emit(':tell', 'some error, sorry ');
                      console.log('catch1'+res);
                    });

                  } catch (err) {
                    this.attributes['status']=false;
                    this.emitWithState('NewSession');

            console.log('catch20'+err);
                    // обработка ошибки

                  }



      },
      'SayIntent': function() {

        var str= " ";
        var str2= "";
        var currentpage = this.attributes['currentpage'];
        var request = this.attributes['request'];
        var countitems = this.attributes['countitems'];
        if (typeof request == 'undefined') this.emit(':ask', "repeat please", "repeat please");
//
// function currency(val){
//   switch (val) {
//     case "RUB":
//       return "ruble"
//
//       break;
//     default:
//     return val;
// break;
//   }
// }
switch (request) {
  case '412astext':


  if ((typeof this.attributes['startstr'] == 'undefined')||(typeof this.attributes['endstr'] == 'undefined')) {this.emit(':ask', "sorry", "sorry");}
  var reqstr = PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
    "/private/payments/list.do?from="+
    this.attributes['startstr']+"&to="+this.attributes['endstr']+
    "&paginationSize=100000&paginationOffset=0";
    var arr = ["type", "form", "date", "operationAmount"];
    var tvalue = 'operation';
    break;
    case '4118':
      if (typeof this.attributes['ondate'] == 'undefined') {
        this.emit(':ask', "sorry", "sorry");
      }
      var reqstr = PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
        "/private/finances/financeCalendar/showSelected.do?onDate=" + this.attributes['ondate'] + "&selectedCardIds=552280";
      var arr = ["id", "description", "categoryName", "amount"];
      var tvalue = 'operation';
      break;

  default:
  this.emit(':ask', "dont work for this", "dont work for this");

}
var tc = currentpage*50+50;



try{
  if(conn === null || conn === undefined){conn = reg.call(this);}
conn.then(() => {
//  {{HOST_BLOCK}}/mobile{{VERSION}}/private/payments/list.do?from=08.11.2010&to=31.03.2018&paginationSize=200&paginationOffset=0
  return autpip(reqstr).then((res) => {

    var obj = parse(res);
    //console.log(obj.root);

    var shuffledMultipleChoiceList = [];

    var myobj = t(obj.root,tvalue , arr);
    var str = "";
    var str2 = "";
    //var readstr = [];


      switch (request) {
        case '412astext':
          myobj.operations.forEach(function(item, i) {
            var type = item.type || "not type";
            type = type.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
            var form = item.form || "not type";
            form = form.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
            var date = item.date || "not date T ";
            date = date.split("T")[0] + "";
            date = date.replace(/[^\d\sA-Za-zА-Яа-я/.]/gi, "");
            var amount = item.amount || 0;
            amount = Math.round(parseInt(amount)) + "";
            var code = item.code || "not code";
            code = code.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
            if ((i >= currentpage * 50) && (i < currentpage * 50 + 50)) {
              str += i + 1 + " " + type + " " + form + " | " + date + " | " + amount + " | " + code + "<br/>";

              str2 += i + 1 + ", " + type + ", " + form + ", " + date + ", " + amount + " " + code + ", next,";

            };
          });
          var hasDisplaySpeechOutput = getSuccess(countitems != 0) + ", " + 'Payments:' + buf1 + '...' + buf2 + ' of ' + countitems + " items";
          var hasDisplayRepromptText = getSuccess(countitems != 0);
          var simpleCardTitle = "History of operations";
          var simpleCardContent = 'Payments:' + buf1 + ' to ' + buf2 + ' of ' + countitems + ", from " + this.attributes['startstr'] + " to " + this.attributes['endstr'];
          var bodyTemplateTitle = 'Payments:' + buf1 + ' to ' + buf2 + ' of ' + countitems + ", from " + this.attributes['startstr'] + " to " + this.attributes['endstr'];
          break;
        case '4118':
          myobj.operations.forEach(function(item, i) {
            var description = item.description.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
            var amount = item.amount.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
            var categoryName = item.categoryName.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
            if ((i >= currentpage * 50) && (i < currentpage * 50 + 50)) {
              str += i + 1 + " " + categoryName + " | " + amount + " RUB | " + description + "<br/>";
              str2 += i + 1 + ", " + categoryName + ", " + amount + " RUB , " + description + ", next,";

            }
          });

          var buf1 = currentpage * 50;
          var buf2 = currentpage * 50 + 50;
          var simpleCardTitle = "Receipt of a financial calendar statement for the day";
          var hasDisplaySpeechOutput = getSuccess(countitems != 0) + " Receipt of a financial calendar statement for the day " + ", " + myobj.operations.length + " items for " + this.attributes['ondate'];

          var hasDisplayRepromptText = getSuccess(countitems != 0);
          var simpleCardContent = 'Payments:' + buf1 + ' to ' + buf2 + ' of ' + countitems + ", for " + this.attributes['ondate'];
          var bodyTemplateTitle = 'Payments:' + buf1 + ' to ' + buf2 + ' of ' + countitems + ", for " + this.attributes['ondate'];


          break;


        default:
          this.emit(':ask', "dont work for this", "dont work for this");
      }
    //  if((parseInt(item.amount)!=0)&&(!isNaN(parseInt(item.amount)))){






console.log(countitems);

    var content = {
      "hasDisplaySpeechOutput" :  str2,
      "hasDisplayRepromptText" :hasDisplayRepromptText,
      "simpleCardTitle" :simpleCardTitle,
     "simpleCardContent" : simpleCardContent,
     "bodyTemplateTitle" : bodyTemplateTitle,
     "bodyTemplateContent" : str,
     "templateToken" : "factBodyTemplate",
     "askOrTell" : ":ask",
     "sessionAttributes": {
       "STATE": states.STARTMODE,
       "countitems":countitems,
       //"myobj":shuffledMultipleChoiceList,
       "startstr":this.attributes['startstr'],
       "endstr":this.attributes['endstr'],
       'ondate':this.attributes['ondate'],
       'onmonth':this.attributes['onmonth'],
       'currentpage':currentpage,
       'request':this.attributes['request'],
       'status':this.attributes['status']
       //,
       //'readstr':readstr                     //'bodyTemplateContent':str
     }
  };

    renderTemplate.call(this, content);



    // console.log(shuffledMultipleChoiceList);
    // this.emit(':ask', value + "1", value);
    //  resolve(shuffledMultipleChoiceList)
    //resolve(shuffledMultipleChoiceList);
  })
  .catch((res) => {
    this.emit(':tell', 'some error, sorry ');
console.log('catch13'+res);
    // reject(0);
    //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
  });
}).catch((res) => {
  this.emit(':tell', 'some error, sorry ');
console.log('catch1'+res);
});


                  } catch (err) {
                    this.attributes['status']=false;
                            this.emitWithState('NewSession');

                    console.log('catch20'+err);
                    // обработка ошибки

                  }


      },

      'HelloWorldIntent': function() {
        if(conn === null || conn === undefined){this.emit(":ask", "tell word connect first", "tell word connect first");}


        var value = this.event.request.intent.slots.hi.value;
        var slotValuefrom = this.event.request.intent.slots.datefrom.value||this.attributes['slotValuefrom']||null;
        var slotValueto = this.event.request.intent.slots.dateto.value||this.attributes['slotValueto']||null;
        var slotDate = this.event.request.intent.slots.date.value || null;
        // console.log(slotValuefrom+" to "+slotValueto);
        var arr = getDate.call(this,this.attributes['startstr'],this.attributes['endstr'],slotValuefrom,slotValueto,slotDate);


            this.attributes['startstr'] = arr[0];
            this.attributes['endstr'] = arr[1];
            if (slotDate){
              this.attributes['onmonth'] = arr[2];
              this.attributes['ondate'] = arr[1];
            } else {
              this.attributes['onmonth'] = undefined;
              this.attributes['ondate'] = undefined;
            }


          this.attributes['slotValuefrom'] = undefined;
          this.attributes['slotValueto'] = undefined;



        switch (value) {

          case "financial calendar"://"request 4.11.7":
          if (typeof this.attributes['onmonth'] == 'undefined') { // Check if it's the first time the skill has been invoked
          this.emit(":ask", "repeat the single date", "repeat the single date");
            //this.attributes['onmonth'] = "03.2017";
          }

          try{

          conn.then(() => {

            return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
              "/private/finances/financeCalendar/show.do?operation=filter&onDate="+this.attributes['onmonth']+
              "&showCash=false&showCashPayments=false"
            ).then((res) => {


              var obj = parse(res);

              var str = "";
              var s = "";
              var shuffledMultipleChoiceList = [];


              var arr = ["date", "outcome", "income"];
              var myobj = t(obj.root, 'calendarDay', arr);
              console.log(myobj.operations.length);
              myobj.operations.forEach(function(item, i) {
                if (( parseInt(item.outcome)!=0) || ( parseInt(item.income)!=0))
                  shuffledMultipleChoiceList.push(item.date+" | outcome = "+item.outcome+" ₽, income = "+item.income+" ₽");

              });


              //.console.log(shuffledMultipleChoiceList);
              var str = "";
              shuffledMultipleChoiceList.forEach(function(item, i) {
              str+=item+"<br/>";
              });
              console.log(str);
              var content = {
               "hasDisplaySpeechOutput" : getSuccess(shuffledMultipleChoiceList.length!=0)+", "+ shuffledMultipleChoiceList.length +", "+ "items",
               "hasDisplayRepromptText" :getSuccess(shuffledMultipleChoiceList.length!=0),
               "simpleCardTitle" :value,
               "simpleCardContent" : this.attributes['onmonth'],
               "bodyTemplateTitle" : 'Payments'+this.attributes['onmonth'],
               "bodyTemplateContent" : str,
               "templateToken" : "factBodyTemplate",
               "askOrTell" : ":tell",
               "sessionAttributes": {
                 "STATE": states.STARTMODE,
                 'onmonth':this.attributes['onmonth'],
                 "countitems":shuffledMultipleChoiceList.length,
                 'currentpage':0,
                 'request':'4117',
                 'status':this.attributes['status']
               }
            };

              renderTemplate.call(this, content);



              // console.log(shuffledMultipleChoiceList);
              // this.emit(':ask', value + "1", value);
              //  resolve(shuffledMultipleChoiceList)
              //resolve(shuffledMultipleChoiceList);
            })
            .catch(res => {
              this.emit(':tell', 'some error, sorry ');
console.log('catch9'+res);
              // reject(0);
              //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
            });
          }).catch(res => {
            this.emitWithState('NewSession');
console.log('catch10'+res);
});
} catch (err) {
  this.attributes['status']=false;
  this.emitWithState('NewSession');

console.log('catch21'+err);
  // обработка ошибки

}
          break;



          case "financial calendar of day"://"request 4.11.8":
          if (typeof this.attributes['ondate'] == 'undefined') { // Check if it's the first time the skill has been invoked
          this.emit(":ask", "repeat the single date", "repeat the single date");
            //this.attributes['ondate'] = "03.03.2017";
          }
          try{

          conn.then(() => {

            return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                "/private/finances/financeCalendar/showSelected.do?onDate="+this.attributes['ondate']+"&selectedCardIds=552280"
              ).then((res) => {

              var obj = parse(res);

              var str = "";

              var arr = ["id", "description", "categoryName", "amount"];
              var myobj = t(obj.root, 'operation', arr);

              myobj.operations.forEach(function(item, i) {
                var description = item.description.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
                var amount = item.amount.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
                var categoryName = item.categoryName.replace(/[^\d\sA-Za-zА-Яа-я]/gi, "");
                if(i<50){
                  str += i+1+" "+categoryName+ " | "+ amount + " RUB | " + description + "<br/>";
                //str + =  i+1+ " " +categoryName + " | "+ amount + " RUB | "  + description + "<br/>";
              }
              });



              var content = {
                "hasDisplaySpeechOutput" :  getSuccess(myobj.operations.length!=0)+" Receipt of a financial calendar statement for the day"+", "+  myobj.operations.length+ " items for "+this.attributes['ondate'],
                "hasDisplayRepromptText" :getSuccess(myobj.operations.length!=0),
                "simpleCardTitle" :"Receipt of a financial calendar statement for the day",
               "simpleCardContent" : 'Payments: 0...50 of '+myobj.operations.length+", for "+this.attributes['ondate'],
               "bodyTemplateTitle" : 'Payments: 0...50 of '+myobj.operations.length+", for "+this.attributes['ondate'],
               "bodyTemplateContent" : str,
               "templateToken" : "factBodyTemplate",
               "askOrTell" : ":ask",
               "sessionAttributes": {
                 "STATE": states.STARTMODE,
                 "countitems":myobj.operations.length,
                 'ondate':this.attributes['ondate'],
                 'currentpage':0,
                 'request':'4118',
                 'status':this.attributes['status']
                 //'readstr':readstr                     //'bodyTemplateContent':str
               }
            };

              renderTemplate.call(this, content);



              // console.log(shuffledMultipleChoiceList);
              // this.emit(':ask', value + "1", value);
              //  resolve(shuffledMultipleChoiceList)
              //resolve(shuffledMultipleChoiceList);
            })
            .catch(res => {
              this.emit(':tell', 'some error, sorry ');
console.log('catch11'+res);
              // reject(0);
              //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
            });
          }).catch(res => {
                        this.emitWithState('NewSession');
          console.log('catch32'+res);
                        // reject(0);
                        //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
                      });
        } catch (err) {
          this.attributes['status']=false;
          this.emitWithState('NewSession');

  console.log('catch22'+err);
          // обработка ошибки

        }
            break;
          case "transaction history as list"://"request 4.12 as list":
          // if ((typeof this.attributes['startstr'] == 'undefined') || (typeof this.attributes['endstr'] == 'undefined')) { // Check if it's the first time the skill has been invoked
          //   this.attributes['startstr'] = "8.11.2015";
          //   this.attributes['endstr'] = "31.3.2018";
          // }
          try{

            conn.then(() => {


                return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                  "/private/payments/list.do?from="+this.attributes['startstr']+"&to="+this.attributes['endstr']+"&paginationSize=100&paginationOffset=0"
                ).then((res) => {

                var obj = parse(res);

                var shuffledMultipleChoiceList = [];
                var arr = ["type", "form", "date", "operationAmount"];
                var myobj = t(obj.root, 'operation', arr);

                myobj.operations.forEach(function(item, i) {
                  if (i<50){
                    var str = "<b>"+item.type+"</b>" + " | " + item.form + " | " + item.date.split("T")[0] +
                      " | " + item.amount + " | " + item.code ;
                    shuffledMultipleChoiceList.push(str);
                  }
                });

                let listItems = shuffledMultipleChoiceList.map((name,i) => {
                  return {
                    "token": i+"tok",

                    "textContent": {
                      "primaryText": {
                        "type": "RichText",
                        "text": "<font size='2'>" + name + "</font> "
                      }

                    }
                  }
                });



                let content = {
                      "hasDisplaySpeechOutput" :  getSuccess(shuffledMultipleChoiceList.length!=0)+", "+ value+", "+  shuffledMultipleChoiceList.length+ " items",
                      "hasDisplayRepromptText" : getSuccess(shuffledMultipleChoiceList.length!=0),//+"<break time=\'1s\'\/>"+value+"<break time=\'1s\'\/>"+,//+"<break time=\'1s\'\/> "+value+"<break time=\'1s\'\/> "++shuffledMultipleChoiceList.length +"<break time=\'1s\'\/> "+ "items",
                      "noDisplaySpeechOutput" : "",//getSuccess(shuffledMultipleChoiceList.length!=0),
                      "noDisplayRepromptText" : value,
                      "simpleCardTitle" : value,
                      "simpleCardContent" : "from "+this.attributes['startstr']+" to "+ this.attributes['endstr']+" "+shuffledMultipleChoiceList.length + " items",
                      "listTemplateTitle" : "from "+this.attributes['startstr']+" to "+ this.attributes['endstr'],
                      //"listTemplateContent" : getTextDescription(item),
                      "templateToken" : "MultipleChoiceListView",
                      "askOrTell": ":ask",
                      "listItems" : listItems,
                      "hint" : "Add a hint here",
                      "sessionAttributes": {
                        "STATE": states.STARTMODE,
                        "countitems":myobj.operations.length,
                        "startstr":this.attributes['startstr'],
                        "endstr":this.attributes['endstr'],
                        'currentpage':0,
                        'request':'412astext',
                        'status':this.attributes['status']
                      }
                  };

                renderTemplate.call(this, content);

              })
              .catch((res) => {
                this.emit(':tell', 'some error, sorry ');
console.log('catch12'+res);
                // reject(0);
                //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
              });
            }).catch((res) => {
              this.attributes['status']=false;
              this.emitWithState('NewSession');
console.log('catch33'+res);
              // reject(0);
              //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
            });;
          } catch (err) {
            this.attributes['status']=false;
            this.emitWithState('NewSession');

    console.log('catch23'+err);
            // обработка ошибки

          }
            break;
            case "transaction history"://"request 4.12 as text":
try {
              conn.then(() => {
              //  {{HOST_BLOCK}}/mobile{{VERSION}}/private/payments/list.do?from=08.11.2010&to=31.03.2018&paginationSize=200&paginationOffset=0
                return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                  "/private/payments/list.do?from="+
                  this.attributes['startstr']+"&to="+this.attributes['endstr']+
                  "&paginationSize=1000000&paginationOffset=0"
                ).then((res) => {

                  var obj = parse(res);
                  //console.log(obj.root);

                  var shuffledMultipleChoiceList = [];
                  var arr = ["type", "form", "date", "operationAmount"];
                  var myobj = t(obj.root, 'operation', arr);
                  var str = "";
                  //var readstr = [];
                  myobj.operations.forEach(function(item, i) {
                    //if((parseInt(item.amount)!=0)&&(!isNaN(parseInt(item.amount)))){
                      var type = item.type || "not type";
                      type =type.replace(/[^\d\sA-Za-zА-Яа-я]/gi,"");
                      var form = item.form || "not type";
                      form = form.replace(/[^\d\sA-Za-zА-Яа-я]/gi,"");
                      var date =item.date || "npt date T ";
                      date =date.split("T")[0]+"";
                      date = date.replace(/[^\d\sA-Za-zА-Яа-я/.]/gi,"");
                      var amount = item.amount || 0;
                      amount = Math.round(parseInt(amount))+"";
                      var code = item.code || "not code";
                      code =code.replace(/[^\d\sA-Za-zА-Яа-я]/gi,"");
                    if(i<50){
                    str +=i+1+" "+type+" "+ form + " | " + date+ " | " + amount + " | " + code+"<br/>";
                                };


                  //}

                  });



                  var content = {
                    "hasDisplaySpeechOutput" :  getSuccess(myobj.operations.length!=0)+", "+ value+", "+  myobj.operations.length+ " items",
                    "hasDisplayRepromptText" :getSuccess(myobj.operations.length!=0),
                    "simpleCardTitle" :value,
                   "simpleCardContent" : 'Payments: 0...50 of '+myobj.operations.length+", from "+this.attributes['startstr']+" to "+ this.attributes['endstr'],
                   "bodyTemplateTitle" : 'Payments: 0...50 of '+myobj.operations.length+", from "+this.attributes['startstr']+" to "+ this.attributes['endstr'],
                   "bodyTemplateContent" : str,
                   "templateToken" : "factBodyTemplate",
                   "askOrTell" : ":ask",
                   "sessionAttributes": {
                     "STATE": states.STARTMODE,
                     "countitems":myobj.operations.length,
                     "startstr":this.attributes['startstr'],
                     "endstr":this.attributes['endstr'],
                     'currentpage':0,
                     'request':'412astext',
                     'status':this.attributes['status']
                     //'readstr':readstr                     //'bodyTemplateContent':str
                   }
                };

                  renderTemplate.call(this, content);



                  // console.log(shuffledMultipleChoiceList);
                  // this.emit(':ask', value + "1", value);
                  //  resolve(shuffledMultipleChoiceList)
                  //resolve(shuffledMultipleChoiceList);
                })
                .catch((res) => {
                  this.emit(':tell', 'some error, sorry ');
console.log('catch13-2'+res);
                  // reject(0);
                  //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
                });
              }).catch((res) => {
                this.emit(':tell', 'some error, sorry ');
              console.log('catch1'+res);
            });
          } catch (err) {
            this.attributes['status']=false;
            this.emitWithState('NewSession');

    console.log('catch24'+err);
            // обработка ошибки

          }
              break;
          default:
            this.emit(':ask', "repeat this request", "repeat this request");
            break;
        }



      },

  'Unhandled': function() {
    var message = 'Repeat the name of the recipient.';
    this.emit(':ask', message, message);
    console.log("UNHANDLED2");

  }
});




// var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
//   'NewSession': function() {
//
//     this.handler.state = '';
//     this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
//   },
//   'HelloWorldIntent': function() {
//     this.emit(':ask', 111, 222);
//   },
//   'Unhandled': function() {
//     //  this.handler.state = states.GUESSMODE;
//     this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
//   },
//   'NotANum': function() {
//     this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
//   }
// });





function supportsDisplay() {
  var hasDisplay =
    this.event.context &&
    this.event.context.System &&
    this.event.context.System.device &&
    this.event.context.System.device.supportedInterfaces &&
    this.event.context.System.device.supportedInterfaces.Display

  return hasDisplay;
}

function isSimulator() {
  var isSimulator = !this.event.context; //simulator doesn't send context
  return false;
}

function renderTemplate (content) {
   console.log("renderTemplate" + content.templateToken);
   //learn about the various templates
   //https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/display-interface-reference#display-template-reference
   //

   switch(content.templateToken) {
      //  case "WelcomeScreenView":
      //    //Send the response to Alexa
      //    this.context.succeed(response);
      //    break;
       case "factBodyTemplate":
       //this.emit(':tellWithCard',"res", "cardTitle",content.templateToken);

           var response = {
             "version": "1.0",
             "response": {
               "directives": [
                 {
                   "type": "Display.RenderTemplate",
                   "template": {
                     "type": "BodyTemplate1",
                     "title": content.bodyTemplateTitle,
                     "token": content.templateToken,
                     "textContent": {
                       "primaryText": {
                         "type": "RichText",
                         "text": "<font size = '3'>"+content.bodyTemplateContent+"</font>"
                       }
                     },
                     "backButton": "HIDDEN"
                   }
                 }
               ],
               "outputSpeech": {
                 "type": "SSML",
                 "ssml": "<speak>"+content.hasDisplaySpeechOutput+"</speak>"
               },
               "reprompt": {
                 "outputSpeech": {
                   "type": "SSML",
                   "ssml": "<speak>"+content.hasDisplayRepromptText+"</speak>"
                 }
               },
               "shouldEndSession": content.askOrTell==":tell",
               "card": {
                 "type": "Simple",
                 "title": content.simpleCardTitle,
                 "content": content.simpleCardContent
               }
             },
             "sessionAttributes": content.sessionAttributes
           }
           this.context.succeed(response);
           break;

       case "MultipleChoiceListView":
       console.log ("listItems "+JSON.stringify(content.listItems));
       var response = {
          "version": "1.0",
          "response": {
            "directives": [
              {
                "type": "Display.RenderTemplate",
                "template": {
                  "type": "ListTemplate1",
                  "title": content.listTemplateTitle,
                  "token": content.templateToken,
                  "listItems":content.listItems,
                  "backButton": "HIDDEN"
                }
              }
            ],
            "outputSpeech": {
              "type": "SSML",
              "ssml": "<speak>"+content.hasDisplaySpeechOutput+"</speak>"
            },
            "reprompt": {
              "outputSpeech": {
                "type": "SSML",
                "ssml": "<speak>"+content.hasDisplayRepromptText+"</speak>"
              }
            },
            "shouldEndSession": content.askOrTell== ":tell",
            "card": {
              "type": "Simple",
              "title": content.simpleCardTitle,
              "content": content.simpleCardContent
            }
          },
            "sessionAttributes": content.sessionAttributes

       }
       this.context.succeed(response);

           break;
       default:
           this.emit(':tell', "Thanks for playing, goodbye");
   }

}

function isSimulator() {
  var isSimulator = !this.event.context; //simulator doesn't send context
  return isSimulator;
}

function renderTemplate2(content) {

  var response = {
    "version": "1.0",
    "response": {
      "directives": [{
        "type": "Display.RenderTemplate",
        "template": {
          "type": "BodyTemplate1",
          "title": content.bodyTemplateTitle,
          "token": content.templateToken,

          "textContent": {
            "primaryText": {
              "type": "RichText",
              "text": "<font size = '2'>" + content.bodyTemplateContent + "</font>"
            }
          },

          "backButton": "HIDDEN"
        }
      }],
      "outputSpeech": {
        "type": "SSML",
        "ssml": "<speak>" + content.hasDisplaySpeechOutput + "</speak>"
      },
      "reprompt": {
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>" + content.hasDisplayRepromptText + "</speak>"
        }
      },
      "shouldEndSession": content.askOrTell == ":tell",
      "card": {
        "type": "Simple",
        "title": content.simpleCardTitle,
        "content": content.simpleCardContent
      }
    },
    "sessionAttributes": content.sessionAttributes
  }
  ;

 // First param controls http vs. https
  console.log(content.imageUrl);

  let  sources= [{
                  "size": "SMALL",
                  "url":content.imageUrl//"https://imgs.xkcd.com/comics/standards.png"
                },
                {
                  "size": "LARGE",
                  "url": content.imageUrl//"https://imgs.xkcd.com/comics/standards.png"
                }
              ];
              response["response"]["directives"][0]["template"]["backgroundImage"]={};
              response["response"]["directives"][0]["template"]["backgroundImage"]["sources"]=sources;
  this.context.succeed(response);
}
