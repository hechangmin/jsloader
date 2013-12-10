// define(function(a){
//     document.getElementById('a').innerHTML = a[0]['m1'];
//     document.getElementById('b').innerHTML = a[0]['m2'];
//     document.getElementById('c').innerHTML = a[1][0];
// },["js/demo4/a"]);

require(["js/demo4/a"], function(a){
    document.getElementById('a').innerHTML = a[0]['m1'];
    document.getElementById('b').innerHTML = a[0]['m2'];
    document.getElementById('c').innerHTML = a[1][0];
});