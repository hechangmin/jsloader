
jsloader.config({
   base : 'js/demo5/',
   charset : 'utf-8',
   debug : true
});

define(function(a){
    document.getElementById('a').innerHTML = a[0]['m1'];
    document.getElementById('b').innerHTML = a[0]['m2'];
    document.getElementById('c').innerHTML = a[1];
},["a"]);
