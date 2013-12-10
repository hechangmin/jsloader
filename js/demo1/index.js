// define(function(a,b,c){
//     document.getElementById('a').innerHTML = a[0];
//     document.getElementById('b').innerHTML = b[0];
//     document.getElementById('c').innerHTML = c[0];
// },["js/demo1/a","js/demo1/b","js/demo1/c"]);

require(["js/demo1/a","js/demo1/b","js/demo1/c"], function(a,b,c){
    document.getElementById('a').innerHTML = a;
    document.getElementById('b').innerHTML = b;
    document.getElementById('c').innerHTML = c;
});