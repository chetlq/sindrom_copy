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

var Alexa = require("alexa-sdk");
var parse = require('xml-parser');
const axios = require('axios');


var Quiche = require('quiche');
var pie = new Quiche('pie');


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


exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers);
  alexa.execute();
};

// var handlers = {
// 'LaunchRequest': function() {
//   this.emit('SayHello');
// },
//
// SayHello: function() {
//   this.emit(':ask', 999, 222);
// },
//   travelintent: function() {
//     this.emit(':ask', "from handlers", 222);
//   }
// };

var states = {
  GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
  STARTMODE: '_STARTMODE', // Prompt the user to start or restart the game.
  ENDMODE: '_ENDMODE'
};

var newSessionHandlers = {
  'NewSession': function() {
    this.handler.state = states.STARTMODE;
    this.emit(':ask', 'Welcome1 ');
    //'Say yes to start the game or no to quit.
  },
  'Unhandled': function () {
    //this.emitWithState('')
    this.emit(':ask', 'HelpMessage', 'HelpMessage');
}
};

// var newSessionHandlers = {
//     'LaunchRequest': function () {
//         this.handler.state = states.STARTMODE;
//         this.emit(':ask',  'Welcome1 ',  'Welcome1 ');
//     },
// 	'Unhandled': function() {
// this.emit(':ask', 'Sorry I didnt understand that. Say help for assistance.');
// },
// };



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

var t = function(objroot) {
   var myobj = {
     cards: [],
     accounts: []

   };
   (function k(obj) {

     if (Array.isArray(obj)) {

       obj.forEach(function(item, i) {
         k(item);
       });
     } else {

       if (obj.name == 'card') {
         var o = {};
         obj.children.forEach(function(item, i) {
           if (item.name == "id") o.id = item.content;
           if (item.name == "balance") o.balance =
             item.content;
         });
         myobj.cards.push(o)
       } else if (obj.name == 'account') {
         var o = {};
         obj.children.forEach(function(item, i) {
           if (item.name == "id") o.id = item.content;
           if (item.name == "balance") o.balance =
             item.content;
           if (item.name == "maxSumWrite") o.maxSumWrite =
             item.content;
         });
         //console.log(obj.children[1]);
         myobj.accounts.push(o)
       } else {
         k(obj.children)
       }


     }
   })(objroot);
   return myobj;
 };

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
  // 'NewSession': function() {
  //   this.emit('NewSession'); // Uses the handler in newSessionHandlers
  // },

  'DiagramIntent': function() {



    var promise = new Promise(function(resolve, reject) {




                  aut(PSI_ROZA.HOST +
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

                    }).then(() => {


                      // return aut(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                      //   "/private/payments/list.do?from=08.11.2015&to=31.03.2018&paginationSize=20&paginationOffset=0"
                      return aut(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                      "/private/graphics/finance.do"
                      ).then(res => {
                        return res
                      });


                    }).then((res) => {

                      var obj = parse(res.data);




         var myobj = t(obj.root);

        var str = "";
        var arr = [];
        pie.setTransparentBackground();
        pie.addPercent();
         myobj.cards.forEach(function(item, i) {

           var ttt = item.balance.replace( /\s/g, "" );
            pie.addData(parseInt(ttt), "id = "+item.id+" ", c());
            arr.push(parseInt(ttt)+'');
           str = "id = " + item.id + " balance = " + arr[i]+"<br/>";
           console.log(str);
         });
console.log(arr);
          pie.setLabel(arr);
         // Make background transparent
        //  myobj.accounts.forEach(function(item, i) {
        //    console.log("balance: "+item.balance+ "id = " + item.id+" : "+c());
        //     //pie.addData(item.balance, "id = " + item.id, c());
         //
        //  });


         //pie.addData(123, '123', c());


var Url = pie.getUrl(true);
pie =  new Quiche('pie');
        resolve(Url);
      })
      .catch(res => {
        reject(0);
        // reject(0);
        //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
        });

      });

    promise.then(res => {



      // if (supportsDisplay.call(this) || isSimulator.call(this)) {
        var content = {
          "hasDisplaySpeechOutput": "speechOutput",
          "hasDisplayRepromptText": "randomFact1",
          "simpleCardTitle": 'SKILL_NAME',
          "simpleCardContent": "res",
          "bodyTemplateTitle": '',
          "bodyTemplateContent": "",
          "templateToken": "factBodyTemplate",
          "askOrTell": ":ask",
          "imageUrl":res,
          "sessionAttributes": {
            "STATE": states.STARTMODE
          }
        };
        renderTemplate.call(this, content);
      // } else {
      //   // Just use a card if the device doesn't support a card.
      //   this.emit(':tellWithCard', "speechOutput", "777", "randomFact");
      // }

      // var cardTitle = 'Hello World Card';
      // var cardContent = res;
      //
      // var imageObj = {
      //   smallImageUrl: 'https://imgs.xkcd.com/comics/standards.png',
      //   largeImageUrl: 'https://imgs.xkcd.com/comics/standards.png'
      // };
      //
      // var permissionArray = ['read::alexa:device:all:address'];
      //
      // var updatedIntent = this.event.request.intent;
      //
      // var slotToElicit = "Slot to elicit";
      //
      // var slotToConfirm = "Slot to confirm";
      //
      // //this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, imageObj);
      //
      // this.emit(':tellWithCard', "cardContent", cardTitle, cardContent);

    }).catch(res => {
      //this.emit(':tellWithCard',res, cardTitle,res, imageObj);
    });




  },




  travelintent: function() {
    var self = this;
    this.handler.state = states.GUESSMODE;
    //this.attributes['name'] = this.event.request.intent.slots.MySlot.value;
    //this.emit(':ask', 'Myitem', 'Try saying a number.');
    //var e = this.event.request.intent.slots.About.value.toLowerCase();
    this.emit(':ask', 'startGameHandlers', 'Try saying a number.');
  },

  // 'Unhandled': function() {
  //   console.log("UNHANDLED");
  //   var message = 'Repeat the name of the recipient.';
  //   this.emit(':ask', message, message);
  // }
});




var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
  'NewSession': function() {

    this.handler.state = '';
    this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
  },
  'HelloWorldIntent': function() {
    this.emit(':ask', 111, 222);
  },
  // 'Unhandled': function() {
  //   //  this.handler.state = states.GUESSMODE;
  //   this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
  // },
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
  return isSimulator;
}

function renderTemplate(content) {

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
