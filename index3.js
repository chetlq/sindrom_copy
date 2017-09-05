'use strict';

var arr = [ { date: '28.08.2017', amount: 8105 },
  { date: '26.08.2017', amount: 173008 },
  { date: '28.08.2017', amount: -48990274 },
  { date: '26.08.2017', amount: -8773 } ];

var promise = new Promise(function(resolve, reject) {});
console.log(123);
var logBackup = console.log;
var logMessages = [];

console.log = function() {
    logMessages.push.apply(logMessages, arguments);
    logBackup.apply(console, arguments);
};

console.log(promise);

console.log(logMessages+"");


// console.log(JSON.stringify(arr));
