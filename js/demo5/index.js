
jsloader.config({
   base : 'js/demo5/',
   charset : 'utf-8',
   debug : true
});

define(["a"], function(a){
    document.getElementById('a').innerHTML = a[0].name;
    document.getElementById('b').innerHTML = a[0].val;
    document.getElementById('c').innerHTML = a[1].val;
});
