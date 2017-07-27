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
  timeout: 30000,
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

var slotValue =   "2017-07-27";
var arr = mydate(slotValue,slotValue);
var arr = mydate(slotValue,slotValue);
if ((arr !== null)&&(isNaN(arr[0]))){
console.log(arr[0]);
}
//console.log(arr[0]);
// var count = function(start,stop){
//   console.log(Number.MAX_VALUE);
//    return conn.then(() => {
//     return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
//       "/private/payments/list.do?from="+start+"&to="+stop+"&paginationSize=1000000000&paginationOffset=0"
//     ).then((res) => {
//
//     var obj = parse(res);
//
//     var shuffledMultipleChoiceList = [];
//     var arr = ["type", "form", "date", "operationAmount"];
//     var myobj = t(obj.root, 'operation', arr);
//     myobj.operations.forEach(function(item, i) {
//       var str = i+1+")<b>"+item.type+"</b>" + " | " + item.form + " | " + item.date.split("T")[0] +
//         " | " + item.amount + " | " + item.code ;
//       console.log(str);
//
//     });
//     console.log("11111111="+myobj.operations.length);
//     return myobj.length;
//   }).catch((err)=>{console.log(err);return 0})
// }).catch((err)=>{console.log(err);return err})
// };
// function getDecimal(num) {
//   return num > 0 ? num - Math.floor(num) : Math.ceil(num) - num;
// }
//
// var conn = reg();
// count("8.11.2010","31.3.2018").then((res)=>{console.log("count = "+res); });
