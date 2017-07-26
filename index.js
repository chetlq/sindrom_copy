'use strict';
const PSI_ROZA = {
  LOGIN: "3554678395",
  HOST: "http://194.186.207.23",
  HOST_BLOCK: "http://194.186.207.23",
  SMS_PASS: "55098",
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

var iconv = require('iconv-lite');
var Alexa = require("alexa-sdk");
var parse = require('xml-parser');
const axios = require('axios');

var date = require('./calendar');
var calendar = new date();

const axiosCookieJarSupport = require('@3846masa/axios-cookiejar-support');
const tough = require('tough-cookie');
var Cookie = tough.Cookie;
//
axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

var instance = axios.create({
  timeout: 300000,
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
  var promise = new Promise(function(resolve, reject) {
    instance.get(addr).then(res => {
      res.data.pipe(iconv.decodeStream("win1251")).collect((err, body) => {
        resolve(body);
      });
    }).catch(err => {
      console.log(err);
      reject(err)
    })
  });

  return promise.then(res => {
    return res
  }).catch(err => {
    console.log(err);
    reject(err)
  })
};


var reg = function(){return autpip(PSI_ROZA.HOST +
    '/CSAMAPI/registerApp.do?operation=register&login=' + PSI_ROZA.LOGIN +
    '&version=' + GLOBALS.VERSION +
    '.10&appType=iPhone&appVersion=5.5.0&deviceName=Simulator&devID=' +
    GLOBALS.DEVID).then(res=>{
      var obj = parse(res);
      var mGUID= obj['root']['children'][2]['children'][0]['content'];
      console.log(mGUID);
      return mGUID
    }).then(mGUID=>{
      return autpip(PSI_ROZA.HOST +
        "/CSAMAPI/registerApp.do?operation=confirm&mGUID=" +
        mGUID + "&smsPassword=" + PSI_ROZA.SMS_PASS + "&version=" + GLOBALS.VERSION +
        ".10&appType=iPhone").then(()=>{
          console.log(mGUID);
          return mGUID;
        })

    //  console.log(res);

  }).then(mGUID=>{

     return autpip(PSI_ROZA.HOST +
      "/CSAMAPI/registerApp.do?operation=createPIN&mGUID=" +
      mGUID + "&password=" + PSI_ROZA.PASS + "&version=" + GLOBALS.VERSION +
      ".10&appType=iPhone" +
      "&appVersion=5.5.0&deviceName=Simulator&isLightScheme=false&devID=" +
      GLOBALS.DEVID + "&mobileSdkData=1").then(res=>{
        var obj = parse(res);
        var token = obj['root']['children'][2]['children'][1]['content'];
        console.log(token);
        return token;
      }).catch(res => {
        console.log(res);
      return res;
                    // reject(0);
                    //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
                  });
  //  console.log(res);
}).then(token=>{

  return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
    "/postCSALogin.do?token=" + token)


  //console.log(token);
}).catch(res => {
  console.log(res);
return res;
});
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

var mydate = function(slotValuefrom,slotValueto){
  var data = new Array();

  if ((slotValuefrom != undefined) && (slotValueto != undefined)) {

    var eventDatefrom =  calendar.getDateFromSlot(slotValuefrom);
    var eventDateto =  calendar.getDateFromSlot(slotValueto);

    var start = {
      year:new Date(eventDatefrom.startDate).getFullYear(),
      month : (new Date(eventDatefrom.startDate).getMonth())+1,
      day :new Date(eventDatefrom.startDate).getDate(),
    };
    var end = {
      year:new Date(eventDateto.endDate).getFullYear(),
      month : (new Date(eventDateto.endDate).getMonth())+1,
      day :new Date(eventDateto.endDate).getDate(),
    };
    var startstr = start.day+"."+start.month+"."+start.year ;
    var endstr = end.day+"."+end.month+"."+end.year ;
    var onmonth = start.month+"."+start.year ;
    data.push(startstr);
    data.push(endstr);
    data.push(onmonth);
    return data;
}else{return null}};
var conn = reg();


exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers);
  alexa.execute();
};



var states = {
  GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
  STARTMODE: '_STARTMODE', // Prompt the user to start or restart the game.
  ENDMODE: '_ENDMODE'
};
//var conn =  connect();

var newSessionHandlers = {

  'NewSession': function() {
    this.handler.state = states.STARTMODE;
    this.emit(':ask', 'Welcome1 ');
    //'Say yes to start the game or no to quit.
  }
};




var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
      'NewSession': function() {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
      },
      'eventIntent': function() {
        this.handler.state = states.STARTMODE;

        var slotValuefrom = this.event.request.intent.slots.datefrom.value;
        var slotValueto = this.event.request.intent.slots.dateto.value;

         var arr = mydate(slotValuefrom,slotValueto);
         if (arr !== null){
          this.attributes['startstr'] = arr[0];
          this.attributes['endstr'] = arr[1];
          var str = "start: "+arr[0]+" - end: " + arr[1];
          this.emit(':askWithCard', 123, "haveEventsRepromt", "cardTitle", str);
          //  this.emit(':ask', "start: "+new Date(eventDate.startDate)+" - end: " + new Date(eventDate.endDate), HelpMessage);
        } else {
          this.emit(":ask", "I'm sorry.  What day did you want me to look for events?", "I'm sorry.  What day did you want me to look for events?");
        }

      },

      'searchIntent': function () {
              this.handler.state = states.STARTMODE;

              var slotValue = this.event.request.intent.slots.date.value;

              var arr = mydate(slotValue,slotValue);
              if (arr !== null){
                 this.attributes['startstr'] = arr[0];
                 this.attributes['endstr'] = arr[1];
                this.attributes['ondate'] = arr[0];
                this.attributes['onmonth'] = arr[2];
                this.attributes['arr']  = arr;
                this.emit(':askWithCard', "123:"+this.attributes['arr'][0], "haveEventsRepromt", "cardTitle", this.attributes['ondate']);

              }
              else {
                  this.emit(":ask", "I'm sorry.  What day did you want me to look for events?", "I'm sorry.  What day did you want me to look for events?");
              }
          },

      'SayHello': function(){
        //this.handler.state = states.STARTMODE;

        var response = {
          "version": "1.0",
          "response": {
            "outputSpeech": {
              "type": "SSML",
              "ssml": "<speak>"+this.attributes['startstr'] +" : "+this.attributes['endstr']+"  </speak>"
            },
            "speechletResponse": {
              "outputSpeech": {
                "ssml": "<speak> 123321  </speak>"
              },
              "shouldEndSession": false
            }
          },
          "sessionAttributes": {
            "STATE": "_STARTMODE"
          }
        };

        this.context.succeed(response);
      },

      'NavigationIntent': function() {
        console.log(this.attributes['myobj']);

        if (typeof this.attributes['myobj'] == 'undefined') {
          this.emit(':tell', "sorryan")
        }
        if (typeof this.attributes['currentpage'] == 'undefined') {
          var currentpage = 0;
        } else {
          var currentpage = this.attributes['currentpage']
        };
        var countpages = Math.ceil(this.attributes['myobj'].length / 50);


        var value = this.event.request.intent.slots.index.value;
        switch (value) {
          case "next":

            if (currentpage + 1 < countpages)
            currentpage = currentpage + 1
console.log(currentpage);
              break;
          case "previous":

            if (currentpage - 1 != -1)
              currentpage = currentpage - 1;

            break;
          case "last":
          if (countpages - 1 != -1)
            currentpage = countpages-1;

            break;
          case "1st":
            currentpage = 0;

            break;

          default:
            this.emit(':ask', "repeat", "repeat");
            break;
        }
        var str = "";
        for (var i = currentpage*50; i < currentpage*50 + 50; i++) {
          if (typeof this.attributes['myobj'][i] != 'undefined')
            str += this.attributes['myobj'][i];
        }

        //this.attributes['myobj'] = myobj.operations;
var tc = currentpage*50+50;
        var content = {
          "hasDisplaySpeechOutput": "speechOutput",
          "hasDisplayRepromptText": "randomFact1",
          "simpleCardTitle": 'SKILL_NAME',
          "simpleCardContent": "res1",
          "bodyTemplateTitle": 'Payments: '+currentpage*50+"..."+tc+" of "+this.attributes['myobj'].length,
          "bodyTemplateContent": str,
          "templateToken": "factBodyTemplate",
          "askOrTell": ":ask",
          "sessionAttributes": {
            "STATE": states.STARTMODE,
            "myobj": this.attributes['myobj'],
            "currentpage": currentpage
          }
        };

        renderTemplate.call(this, content);



      },

      'HelloWorldIntent': function() {


        var value = this.event.request.intent.slots.hi.value;

        switch (value) {
          case "calendar on month":
          if (typeof this.attributes['onmonth'] == 'undefined') { // Check if it's the first time the skill has been invoked
            this.attributes['onmonth'] = "03.2017";
          }


          conn.then(() => {

            return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
              "/private/finances/financeCalendar/show.do?operation=filter&onDate="+
              "03.2017&showCash=false&showCashPayments=false"
            ).then((res) => {


              var obj = parse(res);

              var str = "";
              var s = "";
              var shuffledMultipleChoiceList = [];


              var arr = ["date", "outcome", "income"];
              var myobj = t(obj.root, 'calendarDay', arr);
              console.log(myobj.operations.length);
              myobj.operations.forEach(function(item, i) {
                if ( parseInt(item.outcome)!=0)
                  shuffledMultipleChoiceList.push(item.date+" | outcome = "+item.outcome+" ₽, income = "+item.income+" ₽");

              });


              //.console.log(shuffledMultipleChoiceList);
              var str = "";
              shuffledMultipleChoiceList.forEach(function(item, i) {
              str+=item+"<br/>";
              });
              console.log(str);
              var content = {
               "hasDisplaySpeechOutput" : "speechOutput",
               "hasDisplayRepromptText" : "randomFact1",
               "simpleCardTitle" :'SKILL_NAME',
               "simpleCardContent" : "res",
               "bodyTemplateTitle" : 'Payments:',
               "bodyTemplateContent" : str,
               "templateToken" : "factBodyTemplate",
               "askOrTell" : ":tell",
               "sessionAttributes": {
                 "STATE": states.STARTMODE
               }
            };

              renderTemplate.call(this, content);



              // console.log(shuffledMultipleChoiceList);
              // this.emit(':ask', value + "1", value);
              //  resolve(shuffledMultipleChoiceList)
              //resolve(shuffledMultipleChoiceList);
            })
            .catch(res => {
console.log(res);
              // reject(0);
              //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
            });
          }).catch(res => {
console.log(res);
});
          break;
          case "calendar on date":
          if (typeof this.attributes['ondate'] == 'undefined') { // Check if it's the first time the skill has been invoked
            this.attributes['ondate'] = "03.03.2017";
          }
          conn.then(() => {

            return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                "/private/finances/financeCalendar/showSelected.do?onDate="+this.attributes['ondate']+"&selectedCardIds=552280"
              ).then((res) => {

              var obj = parse(res);

              var str = "";
              var s = "";
              var shuffledMultipleChoiceList = [];


              var arr = ["id", "description", "categoryName", "amount"];
              var myobj = t(obj.root, 'operation', arr);

              myobj.operations.forEach(function(item, i) {
              str=item.description.replace(/[^\d\sA-Za-zА-Яа-я]/gi,"") ;
                  shuffledMultipleChoiceList.push(item.amount+" ₽!| "+item.categoryName+" | "+str);

              });


              //.console.log(shuffledMultipleChoiceList);
              var str = "";
              shuffledMultipleChoiceList.forEach(function(item, i) {
              str+=item+"<br/>";
              });
              console.log(str);
              var content = {
               "hasDisplaySpeechOutput" : "speechOutput",
               "hasDisplayRepromptText" : "randomFact1",
               "simpleCardTitle" :'SKILL_NAME',
               "simpleCardContent" : "res",
               "bodyTemplateTitle" : 'Payments:',
               "bodyTemplateContent" : str,
               "templateToken" : "factBodyTemplate",
               "askOrTell" : ":tell",
               "sessionAttributes": {
                 "STATE": states.STARTMODE
               }
            };

              renderTemplate.call(this, content);



              // console.log(shuffledMultipleChoiceList);
              // this.emit(':ask', value + "1", value);
              //  resolve(shuffledMultipleChoiceList)
              //resolve(shuffledMultipleChoiceList);
            })
            .catch(res => {
console.log(res);
              // reject(0);
              //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
            });
          });
            break;
          case "diagram":
            this.emit(':ask', value, value);
            break;
          case "history as list":
          if ((typeof this.attributes['startstr'] == 'undefined') || (typeof this.attributes['endstr'] == 'undefined')) { // Check if it's the first time the skill has been invoked
            this.attributes['startstr'] = "8.11.2015";
            this.attributes['endstr'] = "31.3.2018";
          }

            conn.then(() => {


                return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                  "/private/payments/list.do?from="+this.attributes['startstr']+"&to="+this.attributes['endstr']+"&paginationSize=100&paginationOffset=0"
                ).then((res) => {

                var obj = parse(res);

                var shuffledMultipleChoiceList = [];
                var arr = ["type", "form", "date", "operationAmount"];
                var myobj = t(obj.root, 'operation', arr);

                myobj.operations.forEach(function(item, i) {
                  var str = "<b>"+item.type+"</b>" + " | " + item.form + " | " + item.date.split("T")[0] +
                    " | " + item.amount + " | " + item.code ;
                  shuffledMultipleChoiceList.push(str);

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
                      "hasDisplaySpeechOutput" : value,
                      "hasDisplayRepromptText" : "question",
                      "noDisplaySpeechOutput" : value,
                      "noDisplayRepromptText" : "question",
                      "simpleCardTitle" : getCardTitle(),
                      "simpleCardContent" : "getTextDescription",
                      "listTemplateTitle" : getCardTitle(),
                      //"listTemplateContent" : getTextDescription(item),
                      "templateToken" : "MultipleChoiceListView",
                      "askOrTell": ":ask",
                      "listItems" : listItems,
                      "hint" : "Add a hint here",
                      "sessionAttributes": {
                        "STATE": states.STARTMODE
                      }
                  };

                renderTemplate.call(this, content);



                // console.log(shuffledMultipleChoiceList);
                // this.emit(':ask', value + "1", value);
                //  resolve(shuffledMultipleChoiceList)
                //resolve(shuffledMultipleChoiceList);
              })
              .catch((res) => {
console.log(res);
                // reject(0);
                //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
              });
            });
            break;
            case "history as text":
            if ((typeof this.attributes['startstr'] == 'undefined') || (typeof this.attributes['endstr'] == 'undefined')) { // Check if it's the first time the skill has been invoked
              this.attributes['startstr'] = "8.11.2010";
              this.attributes['endstr'] = "31.3.2018";
            }


              conn.then(() => {
              //  {{HOST_BLOCK}}/mobile{{VERSION}}/private/payments/list.do?from=08.11.2010&to=31.03.2018&paginationSize=200&paginationOffset=0
                return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                  "/private/payments/list.do?from=8.11.2010&to="+
                  "31.3.2018&paginationSize=1000000&paginationOffset=0"
                ).then((res) => {

//                         var reqcount;
//                         var countpages ;
//
//
//                     if ((typeof this.attributes['reqcount']=='undefined') || (typeof this.attributes['countpages']=='undefined'))
//                     { count().then((res)=>{console.log("count = "+res); });
//                     this.attributes['reqcount'] = reqcount;
//                     this.attributes['countpages'] =  Math.ceil(reqcount / 100);
//                   }
//
//
//                     this.attributes['currentpage'] = currentpage;
//
// console.log("reqcount"+this.attributes['reqcount']);
// console.log("countpages"+this.attributes['countpages']);

                  var obj = parse(res);
                  console.log(obj.root);

                  var shuffledMultipleChoiceList = [];
                  var arr = ["type", "form", "date", "operationAmount"];
                  var myobj = t(obj.root, 'operation', arr);
                  var str = "";
                  myobj.operations.forEach(function(item, i) {
                    if(i<50)
                    str +=i+1+" "+item.type+" "+ item.form + " | " + item.date.split("T")[0]+ " | " + item.amount + " | " + item.code+"<br/>";
                    //i+1+") <b>"+item.type+"</b>" + " | " + item.form + " | " + item.date.split("T")[0]+ " | " + item.amount + " | " + item.code +"<br/>" ;
                    var str1 =i+1+") <b>"+item.type+"</b>" + " | " + item.form + " | " + item.date.split("T")[0]+ " | " + item.amount + " | " + item.code +"<br/>" ;
shuffledMultipleChoiceList.push(str1);
//console.log(str1);
                  });

                  //this.attributes['myobj'] = myobj.operations;
console.log(myobj.operations.length);
                  var content = {
                   "hasDisplaySpeechOutput" : "speechOutput",
                   "hasDisplayRepromptText" : "randomFact1",
                   "simpleCardTitle" :'SKILL_NAME',
                   "simpleCardContent" : "res1",
                   "bodyTemplateTitle" : 'Payments: 0...50 of '+myobj.operations.length,
                   "bodyTemplateContent" : str,
                   "templateToken" : "factBodyTemplate",
                   "askOrTell" : ":ask",
                   "sessionAttributes": {
                     "STATE": states.STARTMODE,
                     "myobj":shuffledMultipleChoiceList
                   }
                };

                  renderTemplate.call(this, content);



                  // console.log(shuffledMultipleChoiceList);
                  // this.emit(':ask', value + "1", value);
                  //  resolve(shuffledMultipleChoiceList)
                  //resolve(shuffledMultipleChoiceList);
                })
                .catch((res) => {
console.log(res);
                  // reject(0);
                  //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
                });
              }).catch((res) => {
              console.log(res);
            });

              break;

          case "calendar for day":
            this.emit(':ask', value, value);
            break;
          default:
            this.emit(':ask', "nothing", "nothing");
        }



      },




  travelintent: function()  {



  },

  'Unhandled': function() {
    console.log("UNHANDLED");
    var message = 'Repeat the name of the recipient.';
    this.emit(':ask', message, message);
  }
});




var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
  'NewSession': function() {

    this.handler.state = '';
    this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
  },
  'HelloWorldIntent': function() {
    this.emit(':ask', 111, 222);
  },
  'Unhandled': function() {
    //  this.handler.state = states.GUESSMODE;
    this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
  },
  'NotANum': function() {
    this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
  }
});





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
