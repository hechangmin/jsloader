// define(function(a){
//     document.getElementById('a').innerHTML = a[0];
// },["js/demo/a.js"]);

require("js/demo/a.js",function(a){
    document.getElementById('a').innerHTML = a;
});