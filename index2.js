'use strict';

var moment = require('moment');
const PSI_ROZA = {
  LOGIN: "9882974166",//"3554678395",
  HOST: "http://194.186.207.23",
  HOST_BLOCK: "http://194.186.207.23",
  SMS_PASS: "55098",
  mGUID: "93d727547c5b97ae9dbc9a4bfc41f294",//"4856a406c200643f529efd6fe5e90fae",
  token: "6abe40afbd29b0d2ac19f1f9052d0d4d",//"59821587bc4405b466f4fc6e731efa16",
  PASS: "11223",
  PFMtoken: "b02ddd9811f476eebfbce27ca8f404b1"
};
// const PSI_ROZA = {
//   LOGIN: "3554678395",
//   HOST: "http://194.186.207.23",
//   HOST_BLOCK: "http://194.186.207.23",
//   SMS_PASS: "55098",
//   mGUID: "4856a406c200643f529efd6fe5e90fae",
//   token: "59821587bc4405b466f4fc6e731efa16",
//   PASS: "11223",
//   PFMtoken: "b02ddd9811f476eebfbce27ca8f404b1"
// };
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
function cardTitle() { return "cardtitle";}



var iconv = require('iconv-lite');

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
    console.log("err2");
  })
};


var reg = function(){return autpip(PSI_ROZA.HOST +
    '/CSAMAPI/registerApp.do?operation=register&login=' + PSI_ROZA.LOGIN +
    '&version=' + GLOBALS.VERSION +
    '.10&appType=iPhone&appVersion=5.5.0&deviceName=Simulator&devID=' +
    GLOBALS.DEVID).then(res=>{
      var obj = parse(res);
      var mGUID= obj['root']['children'][2]['children'][0]['content'];
      console.log("mguid = "+mGUID);
      return mGUID
    }).then(mGUID=>{
      return autpip(PSI_ROZA.HOST +
        "/CSAMAPI/registerApp.do?operation=confirm&mGUID=" +
        mGUID + "&smsPassword=" + PSI_ROZA.SMS_PASS + "&version=" + GLOBALS.VERSION +
        ".10&appType=iPhone").then(()=>{
          console.log("mguid = "+mGUID);
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
        console.log("token = "+token);
        return token;
      }).catch(res => {
        console.log("res1");
      return res;
                    // reject(0);
                    //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
                  });
  //  console.log(res);
}).then(token=>{
console.log("ttt "+token);
  return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
    "/postCSALogin.do?token=" + token).then(res=>{
      var obj = parse(res);
      var status  = obj['root']['children'][0]['children'][0]['content'];
      if(status!==0) throw new Error('123'); 
    }).catch(res => {
      console.log('catch31'+res);
      this.emit(':tell', 'Connection error, restart the skill ');
    });



}).catch(res => {
  console.log("res2");
return res;
});
};

// {{HOST_BLOCK}}/mobile{{VERSION}}/private/payments/list.do?
// from=08.11.2000&to=01.03.2018&paginationSize=20&paginationOffset=0
var conn = reg();


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
    if((startstr == "NaN.NaN.NaN") || (endstr == "NaN.NaN.NaN")) {return null;}
    else  {return data;}
}else{return null}};




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


conn.then((res) => {
  console.log('catch12'+"res");
}).catch((res) => {
console.log('catch12'+"res");
});;/*
  return autpip(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
    "/private/payments/list.do?from="+
    from+"&to="+to+
    "&paginationSize=99999&paginationOffset=0"
  )
  .then((res) => {
        var obj = parse(res);
        //console.log(obj.root);

        var shuffledMultipleChoiceList = [];
        var arr = ["type", "form", "date", "operationAmount"];
        var myobj = t(obj.root, 'operation', arr);
        var str = "";
        //var readstr = [];
        var j=0;
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
            amount = Math.round(parseInt(amount));
            var code = item.code || "not code";
            code =code.replace(/[^\d\sA-Za-zА-Яа-я]/gi,"");
            if (amount!==0){
              j++;
              //console.log(j+" "+type+" "+ form + " | " + date+ " | " + amount + " | " + code+"<br/>");
              shuffledMultipleChoiceList.push({"date":date,"amount":amount})

            }
                          //str +=i+1+" "+type+" "+ form + " | " + date+ " | " + amount + " | " + code+"<br/>";
      });

shuffledMultipleChoiceList = (function(){
if (shuffledMultipleChoiceList.length > 100 && from!==to) {
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
  if ((Object.keys(sortNeg).length+Object.keys(sortPos).length) > 100) {
    console.log("2 >100");
    sortPos = unique2(sortPos);
    sortNeg = unique2(sortNeg);
    shuffledMultipleChoiceList = [];
    for (var variable in sortPos) {
      shuffledMultipleChoiceList.push({"date":variable,"amount":sortPos[variable]})
    };
    for (var variable in sortNeg) {
      shuffledMultipleChoiceList.push({"date":variable,"amount":sortNeg[variable]})
    }

    return shuffledMultipleChoiceList
  }
  else {
    shuffledMultipleChoiceList = [];
    for (var variable in sortPos) {
      shuffledMultipleChoiceList.push({"date":variable,"amount":sortPos[variable]})
    };
    for (var variable in sortNeg) {
      shuffledMultipleChoiceList.push({"date":variable,"amount":sortNeg[variable]})
    }

    return shuffledMultipleChoiceList
  }

}

else{
  //console.log(shuffledMultipleChoiceList);
  return shuffledMultipleChoiceList;
}
})();

console.log(shuffledMultipleChoiceList);

console.log(shuffledMultipleChoiceList.length);

//
if(shuffledMultipleChoiceList.length>0 && (shuffledMultipleChoiceList[0].date.split(".").length - 1)==2){
shuffledMultipleChoiceList.sort(function(a,b){

if (moment(a.date, "DD.MM.YYYY")>moment(b.date, "DD.MM.YYYY")) {return 1}
else{return -1}

});
}else{
  console.log("else");
  shuffledMultipleChoiceList.sort(function(a,b){

  if (moment("01."+a.date, "DD.MM.YYYY")>moment("01."+b.date, "DD.MM.YYYY")) {return 1}
  else{return -1}

  });
};
//console.log(shuffledMultipleChoiceList);
//


shuffledMultipleChoiceList.reduce(function(previousValue, currentItem, index) {
  if (previousValue.date.trim()==currentItem.date) {
   currentItem.date=previousValue.date+" ";
 };
     return currentItem
});
console.log("///////////////////////////////////////////////");
shuffledMultipleChoiceList.forEach(item => console.log(item));


    }).catch((res) => {
    console.log('catch10'+res);
    });
    }).catch((res) => {
    console.log('catch12'+"res");
    });
*/
