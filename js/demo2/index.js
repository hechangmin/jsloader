define(function(){
	require(["js/demo2/a","js/demo2/c"],function(a,b,c){
        document.getElementById('a').innerHTML = a;
        document.getElementById('b').innerHTML = b;
        document.getElementById('c').innerHTML = c;
    });
});