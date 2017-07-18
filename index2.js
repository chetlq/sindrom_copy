'use strict';
const PSI_ROZA = {
  LOGIN: "3554678395",
  HOST: "http://194.186.207.23",
  HOST_BLOCK: "http://194.186.207.23",
  SMS_PASS: "55098",
  mGUID: "2ba47444ac8c7bf8c8aabc967aaa097f",
  token: "349e2e4c3c15f1dead54e2d68a263099",
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
var inspect = require('util').inspect;

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
};
var conn =  connect();



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



       //var promise = new Promise(function(resolve, reject) {

           conn.then(() => {
             return aut(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
                 "/private/finances/financeCalendar/showSelected.do?onDate=03.03.2017&selectedCardIds=552280"
             ).then(res => {
               return res
             });


           }).then((res) => {

             var obj = parse(res.data);

                  var str = "";
                  var shuffledMultipleChoiceList = [];
                  var arr = ["id", "description", "categoryName", "amount"];
                  var myobj = t(obj.root, 'operation', arr);

                  myobj.operations.forEach(function(item, i) {
                  str="id = " + item.id + " description = " +
                      item.description + " categoryName = " + item.categoryName +
                      " amount = " + item.amount;
                      shuffledMultipleChoiceList.push(str);

                  });



                  console.log(shuffledMultipleChoiceList);
                //  resolve(shuffledMultipleChoiceList)
             //resolve(shuffledMultipleChoiceList);
           })
           .catch(res => {

             // reject(0);
             //this.emit(':tellWithCard', "success", cardTitle, res + cardContent, imageObj);
           });

//        });
//
//        promise.then(res => {
//
// console.log(res);
//
//
//
//      }).catch(res => {
//
//        });





/*
conn.then(() => {

  return aut(PSI_ROZA.HOST_BLOCK + "/mobile" + GLOBALS.VERSION +
      "/private/finances/financeCalendar/showSelected.do?onDate=03.03.2017&selectedCardIds=552280"

    ).then(res => {

      var promise = new Promise(function(resolve, reject) {
        var obj = parse(res.data);
        //
        // console.log(inspect(obj.root, {
        //   colors: true,
        //   depth: Infinity
        // }));



        //console.log(myobj.arr[0]);


        var myobj = t(obj.root);


        myobj.operations.forEach(function(item, i) {
          console.log("id = " + item.id + " description = " +
            item.description + " categoryName = " + item.categoryName +
            " amount = " + item.amount);

        });



        resolve(1);
        reject(0);


      });

      return promise.then(res => {
        return res
      }).catch(res => {
        return res
      });


    }).then(res => {
      //res.forEach(function(item, i) {
      //  console.log(item)
    })
    .catch(function(error) {

      console.log("error" + error)
    });


}).catch(err => {
  console.log(err);
})
*/
