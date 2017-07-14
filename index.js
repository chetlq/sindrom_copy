'use strict';
const PSI_ROZA = {
  LOGIN: "3554678395",
  HOST: "http://194.186.207.23",
  HOST_BLOCK: "http://194.186.207.23:9999",
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
  timeout: 30000,
  jar: cookieJar, // tough.CookieJar or boolean
  withCredentials: true,
  headers: {
    'Accept-Language': 'ru;q=1',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mobile Device'

  }
});


var aut = function(addr) {
  return instance.post(addr)
};


var connect = function(){
  return aut(PSI_ROZA.HOST +
      '/CSAMAPI/registerApp.do?operation=register&login=' + PSI_ROZA.LOGIN +
      '&version=' + GLOBALS.VERSION +
      '.10&appType=iPhone&appVersion=5.5.0&deviceName=Simulator&devID=' +
      GLOBALS.DEVID).then(res => {
      var obj = parse(res.data);
      //console.log(obj);
      //console.log(obj['root']['children'][0]['children'][0]['content']);
      return obj['root']['children'][2]['children'][0]['content'];

    }).then(mGUID => {
      return aut(PSI_ROZA.HOST +
        "/CSAMAPI/registerApp.do?operation=confirm&mGUID=" +
        mGUID + "&smsPassword=" + PSI_ROZA.SMS_PASS + "&version=" + GLOBALS.VERSION +
        ".10&appType=iPhone").then(() => {
        return mGUID;
      })

    }).then(mGUID => {

      return aut(PSI_ROZA.HOST +
        "/CSAMAPI/registerApp.do?operation=createPIN&mGUID=" +
        mGUID + "&password=" + PSI_ROZA.PASS + "&version=" + GLOBALS.VERSION +
        ".10&appType=iPhone" +
        "&appVersion=5.5.0&deviceName=Simulator&isLightScheme=false&devID=" +
        GLOBALS.DEVID + "&mobileSdkData=1").then(res => {
        var obj = parse(res.data);
        //console.log(res.data);
        var v2 = obj['root']['children'][2]['children'][1]['content'];

        return v2;
      })

    }).then(token => {

      return aut(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
        "/postCSALogin.do?token=" + token).then(res => {})

    });
}


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
var conn =  connect();
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
        var eventList = new Array();
        var slotValuefrom = this.event.request.intent.slots.datefrom.value;
        var slotValueto = this.event.request.intent.slots.dateto.value;

        if ((slotValuefrom != undefined) && (slotValueto != undefined)) {
          var parent = this;

          var eventDatefrom =  calendar.getDateFromSlot(slotValuefrom);
          var eventDateto =  calendar.getDateFromSlot(slotValueto);

          var start = {
            year:new Date(eventDatefrom.startDate).getFullYear(),
            month : new Date(eventDatefrom.startDate).getMonth(),
            day :new Date(eventDatefrom.startDate).getDate(),
          };
          var end = {
            year:new Date(eventDateto.endDate).getFullYear(),
            month : new Date(eventDateto.endDate).getMonth(),
            day :new Date(eventDateto.endDate).getDate(),
          };
          var startstr = start.day+"."+start.month+"."+start.year ;
          var endstr = end.day+"."+end.month+"."+end.year ;
          var str = "start: "+startstr+" - end: " + endstr;
          this.emit(':askWithCard', 123, "haveEventsRepromt", "cardTitle", str);
          //  this.emit(':ask', "start: "+new Date(eventDate.startDate)+" - end: " + new Date(eventDate.endDate), HelpMessage);
        } else {
          this.emit(":ask", "I'm sorry.  What day did you want me to look for events?", "I'm sorry.  What day did you want me to look for events?");
        }

      },

      'searchIntent': function () {
              this.handler.state = states.STARTMODE;
            var eventList = new Array();
              var slotValue = this.event.request.intent.slots.date.value;
              if (slotValue != undefined)
              {


                  var eventDate = calendar.getDateFromSlot(slotValue);

                //  this.emit(':ask', "start: "+new Date(eventDate.startDate)+" - end: " + new Date(eventDate.endDate), HelpMessage);
                var start = {
                  year:new Date(eventDate.startDate).getFullYear(),
                  month : new Date(eventDate.startDate).getMonth(),
                  day :new Date(eventDate.startDate).getDate(),
                };
                var end = {
                  year:new Date(eventDate.endDate).getFullYear(),
                  month : new Date(eventDate.endDate).getMonth(),
                  day :new Date(eventDate.endDate).getDate(),
                };
                var startstr = start.day+"."+start.month+"."+start.year;
                var endstr = end.day+"."+end.month+"."+end.year;
                var str = "start: "+startstr+" - end: " + endstr;
                this.emit(':askWithCard', eventDate.res, "haveEventsRepromt", "cardTitle", str);

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
              "ssml": "<speak>3333  </speak>"
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

      'HelloWorldIntent': function() {


        var promise = new Promise(function(resolve, reject) {

            conn.then(() => {
              return aut(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                "/private/payments/list.do?from=8.11.2015&to=31.3.2018&paginationSize=20&paginationOffset=0"
              ).then(res => {
                return res
              });


            }).then((res) => {

              var obj = parse(res.data);





              var arr2 = [];
              var myobj = {};
              var k = function(obj) {

                if (Array.isArray(obj)) {

                  obj.forEach(function(item, i) {
                    k(item);
                  });
                } else {
                  if (obj.name == 'operation') {
                    //console.log(obj.children[1]);
                    arr2.push(obj.children)
                  } else {
                    k(obj.children)
                  }
                }
              };


              //console.log(obj.root);
              k(obj.root);

              //console.log(arr2[0][0]);


              var arr3 = [];
                   arr2.forEach(function(item, i) {
                     var ob = {};
                     item.forEach(function(item2, i2) {
                       if (item2.name == 'type') {
                         ob.type = item2.content
                       }
                       if (item2.name == 'form') {
                         ob.form = item2.content
                       }
                       if (item2.name == 'date') {
                         ob.date = item2.content
                       }
                       if (item2.name == 'operationAmount') {
                         item2.children.forEach(function(item3, i3) {
                           if (item3.name == 'amount') {
                             ob.amount = item3.content;
                           }
                           if (item3.name == 'currency') {
                             ob.code = item3.children[0].content;
                           }
                         });
                       }
                     });
                     arr3.push(ob)
                       //console.log(item[0]);
                   });
                   var str = "";
                   var shuffledMultipleChoiceList = [];

                   arr3.forEach(function(item, i) {

                    //  var date2 =  new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    //.split(T)[0]

                     var str = "<b>"+item.type+"</b>" + " | " + item.form + " | " + item.date.split("T")[0] +
                       " | " + item.amount + " | " + item.code ;
                       shuffledMultipleChoiceList.push(str);
                   });

                   //console.log(str);
                   resolve(shuffledMultipleChoiceList)
              //resolve(shuffledMultipleChoiceList);
            })
            .catch(res => {
              reject(0);
              // reject(0);
              //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
            });

        });

        promise.then(res => {

          let listItems = res.map((x) => {
            return {
              "token": x,

              "textContent": {
                "primaryText": {
                  "type": "RichText",
                  "text": "<font size='2'>" + x + "</font> "
                }

              }
            }
          });



          let content = {
                "hasDisplaySpeechOutput" : "speech",
                "hasDisplayRepromptText" : "question",
                "noDisplaySpeechOutput" : "speech",
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


  //this.emit(':tellWithCard',"res", "cardTitle","res");
}).catch(res => {
          //this.emit(':tellWithCard',res, cardTitle,res, imageObj);
        });




      },




  travelintent: function()  {


    var promise = new Promise(function(resolve, reject) {

        conn.then(() => {
          return aut(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
            "/private/payments/list.do?from=08.11.2015&to=31.03.2018&paginationSize=20&paginationOffset=0"
          ).then(res => {
            return res
          });


        }).then((res) => {

          var obj = parse(res.data);





          var arr2 = [];
          var myobj = {};
          var k = function(obj) {

            if (Array.isArray(obj)) {

              obj.forEach(function(item, i) {
                k(item);
              });
            } else {
              if (obj.name == 'operation') {
                //console.log(obj.children[1]);
                arr2.push(obj.children)
              } else {
                k(obj.children)
              }
            }
          };


          //console.log(obj.root);
          k(obj.root);

          //console.log(arr2[0][0]);


          var arr3 = [];
               arr2.forEach(function(item, i) {
                 var ob = {};
                 item.forEach(function(item2, i2) {
                   if (item2.name == 'type') {
                     ob.type = item2.content
                   }
                   if (item2.name == 'form') {
                     ob.form = item2.content
                   }
                   if (item2.name == 'date') {
                     ob.date = item2.content
                   }
                   if (item2.name == 'operationAmount') {
                     item2.children.forEach(function(item3, i3) {
                       if (item3.name == 'amount') {
                         ob.amount = item3.content;
                       }
                       if (item3.name == 'currency') {
                         ob.code = item3.children[0].content;
                       }
                     });
                   }
                 });
                 arr3.push(ob)
                   //console.log(item[0]);
               });
               var str = "";


               arr3.forEach(function(item, i) {

                //  var date2 =  new Date(date.getFullYear(), date.getMonth(), date.getDate())
                //.split(T)[0]
                //"<b>"+item.type+"</b>" + " | " + item.form + " | " + item.date.split("T")[0] +
                //  " | " + item.amount + " | " + item.code
                 str +="<b>"+item.type+"</b>" + " | " + item.form + " | " + item.date.split("T")[0]+ " | " + item.amount + " | " + item.code +"<br/>" ;
               });
console.log(str);

resolve(str);
               //console.log(str);


          //resolve(shuffledMultipleChoiceList);
        })
          .catch(res => {
          reject(0);
          // reject(0);
          //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
        });

    });

    promise.then(res => {


//this.emit(':tellWithCard',"res", "cardTitle",res);

      // if(supportsDisplay.call(this)||isSimulator.call(this)) {
        var content = {
         "hasDisplaySpeechOutput" : "speechOutput",
         "hasDisplayRepromptText" : "randomFact1",
         "simpleCardTitle" :'SKILL_NAME',
         "simpleCardContent" : "res",
         "bodyTemplateTitle" : 'Payments:',
         "bodyTemplateContent" : res,
         "templateToken" : "factBodyTemplate",
         "askOrTell" : ":tell",
         "sessionAttributes": {
           "STATE": states.STARTMODE
         }
      };
      renderTemplate.call(this, content);
    // } else {
    //   this.emit(':tellWithCard',"res", "cardTitle","res");
    // }


//this.emit(':tellWithCard',"res", "cardTitle","res");
}).catch(res => {
     this.emit(':tellWithCard',"res", "cardTitle","error");
    });




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
