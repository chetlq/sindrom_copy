'use strict';
var date = require('./calendar');
var calendar = new date();

function mydate(slotValuefrom,slotValueto){
  var data = new Array();
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
    if (startstr == "NaN.NaN.NaN")  startstr = null;
    if(endstr == "NaN.NaN.NaN")  endstr = null;
    if(onmonth == "NaN.NaN")  onmonth = null;

    data.push(startstr);
    data.push(endstr);
    data.push(onmonth);
    return data;
  };


function getDate(startstr,endstr,slotValuefrom,slotValueto,slotDate){
var arr = [];
if (!slotDate) {
  if (!slotValuefrom && !slotValueto) {
    if ((endstr == undefined)||(startstr == undefined)){
    this.emit(":ask", "repeat date", "repeat date");
  } else{
    arr[0]=startstr ;
    arr[1]=endstr ;
  }
} else if (slotValuefrom === null) {
    var response = {
      "version": "1.0",
      "response": {
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak> End date is " + slotValueto + ", please repeat start date</speak>"
        },
        "card": {
          "content": "",
          "title": "End date is " + slotValueto + ", please repeat start date",
          "type": "Simple"
        },
        "speechletResponse": {

          "shouldEndSession": false
        }
      },
      "sessionAttributes": {
        "slotValueto": slotValueto,
        "STATE": "_STARTMODE"
      }
    };
console.log(response);
    this.context.succeed(response);

  } else if (slotValueto === null){

    var response = {
      "version": "1.0",
      "response": {
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak> start date is " + slotValuefrom + ", please repeat end date</speak>"
        },
        "card": {
          "content": "",
          "title": "start date is " + slotValuefrom + ", please repeat end date",
          "type": "Simple"
        },
        "speechletResponse": {

          "shouldEndSession": false
        }
      },
      "sessionAttributes": {
        "slotValuefrom": slotValuefrom,
        "STATE": "_STARTMODE"
      }
    };



    this.context.succeed(response);
  } else {
    arr = mydate(slotValuefrom,slotValueto);
    arr[0] = arr[0] || startstr;
    arr[1] = arr[1] || endstr;
    arr[2] = null;
  }
} else {
  arr = mydate(slotDate,slotDate);
}

return arr;
}

module.exports = getDate;
