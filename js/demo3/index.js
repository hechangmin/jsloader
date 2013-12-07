define(function(){
	require("js/demo3/a",function(a,b){
        document.getElementById('a').innerHTML = a;
        document.getElementById('b').innerHTML = b;
    });
});