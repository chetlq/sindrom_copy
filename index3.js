'use strict';
var getDate = require('./getDate');
"use strict"

function CoffeeMachine(power) {

  this.waterAmount = 0;

  // физическая константа - удельная теплоёмкость воды для getBoilTime
  var WATER_HEAT_CAPACITY = 4200;



};

var coffeeMachine = new CoffeeMachine(1000);
coffeeMachine.waterAmount = 200;


var myfunc2 = function(qqq){
  console.log(this.ttt);
  console.log(qqq);
}

  function myfunc(){
  var startstr = "2010-11-10";
  var endstr = "2010-11-11";
  var slotValuefrom = "2010-11-12";
  var slotValueto = "2010-11-13";
  var slotDate = "2010-11-14";
   this.rrr = "111";
   this.ttt = "222";
   var t = getDate.call(this,null,null,slotValuefrom,null,null);
   console.log(t);
   //console.log(this.rrr);
}
var k   = new myfunc();


// //myfunc2();

// var getDate =  myfunc2.call(this);    //,startstr,endstr,slotValuefrom,slotValueto,slotDate);
// console.log(getDate);



//var r = getDate(this.attributes['startstr'],this.attributes['endstr'],slotValuefrom,slotValueto,slotDate);
