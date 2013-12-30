jsloader.config({
   charset : 'gbk',
   debug : true,
   alias : {
        a : 'js/demo5/a.js',
        c : 'js/demo5/c.js',
        d : 'js/demo5/d.js',
   }
});

define(function(a){
    document.getElementById('a').innerHTML = a[0]['m1'];
    document.getElementById('b').innerHTML = a[0]['m2'];
    document.getElementById('c').innerHTML = a[1];
},["a"]);