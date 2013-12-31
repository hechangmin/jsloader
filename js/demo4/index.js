jsloader.config({
   charset : 'utf-8',
   debug : true,
   alias : {
        a : 'js/demo4/a.js',
        c : 'js/demo4/c.js',
        d : 'js/demo4/d.js'
   }
});

require(["a"], function(a){
    document.getElementById('a').innerHTML = a[0]['m1'];
    document.getElementById('b').innerHTML = a[0]['m2'];
    document.getElementById('c').innerHTML = a[1];
});
