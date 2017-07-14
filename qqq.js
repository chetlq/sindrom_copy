const util = require('util');


var deepCopy = function (obj) {
    if (typeof obj != "object") {
        return obj;
    }

    var copy = {};//obj.constructor();
    for (var key in obj) {
        if (typeof obj[key] == "object") {
            copy[key] = deepCopy(obj[key]);
        } else {
            copy[key] = obj[key];
        }
    }
    return copy;
};




function deepPrintObj(obj,text){
  if (text === undefined) {
  text = '';
}else {
  text=text+" -> ";
}

  for(var key in obj)
  {
      if (!util.isObject(obj[key])) {print(obj[key],text+key+" : ");}
     else
     {deepPrintObj(obj[key],text+key)}
  }
}

function print(obj,text){
  if (text === undefined) {
  text = '';
}
  if (!util.isObject(obj)) {console.log( text + obj);}
  else {
    for (var key in obj) {
      if (util.isObject(obj[key])) {
        deepPrintObj(obj[key],key)
      } else {
        print(obj[key]);
      }

    }
  }
}

var myobj = {
  p:{
    x:{
      x2:"-p-x-x2",
      x3:{x4:"-p-x-x3-x4"},
      x5: "-p-x-x5",
    },
    y:"-p-y",
    o:"-p-o"
  },
  t:"-t",
  u:{
    u1:"-u-u1",
    x:{
      x2:"-p-x-x2",
      x3:{x4:"-p-x-x3-x4"},
      x5: "-p-x-x5",
    },
  }
}
let  source= [{
                "size": "SMALL",
                "url":"https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/1200x800/AL._TTH_.png"
              },
              {
                "size": "LARGE",
                "url": "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/1200x800/AL._TTH_.png"
              }
            ];
// var t = deepCopy(myobj);
// deepPrintObj(myobj);
// console.log("\n\n");
// deepPrintObj(t);
// for(var key in t)
// {
//     if (typeof t[key] == "object") {console.log(key+" : ");}
//     else
//     console.log(key+" : "+t[key]+"\n");
// }
