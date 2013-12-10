// define(function(a,c){
//     document.getElementById('a').innerHTML = a[0];
//     document.getElementById('b').innerHTML = a[1];
//     document.getElementById('c').innerHTML = c[0];
// },["js/demo2/a","js/demo2/c"]);

require(["js/demo2/a","js/demo2/c"], function(a,c){
    document.getElementById('a').innerHTML = a[0];
    document.getElementById('b').innerHTML = a[1];
    document.getElementById('c').innerHTML = c;
});