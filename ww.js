function rgb2hex(rgb){
 rgb = rgb.match(/^[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 var c = (rgb && rgb.length === 4) ?
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
 return c.toUpperCase();
}
var c = function(){
  var v = function(){ return Math.round(Math.random()*255)};
  return rgb2hex('('+v()+', '+v()+', '+v()+')');
}
var str = '12 34 56'.replace( /\s/g, "" ); // будем искать в этой строке

var regexp = "/\s/g";

console.log(parseInt('825 459 \n '));
console.log();
