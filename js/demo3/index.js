define(function(a){
    document.getElementById('a').innerHTML = a[0];
    document.getElementById('b').innerHTML = a[1];
},["js/demo3/a"]);

// require(["js/demo3/a"], function(a){
//     document.getElementById('a').innerHTML = a[0];
//     document.getElementById('b').innerHTML = a[1];
// });