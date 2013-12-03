define(function(){
	require(["js/demo/a","js/demo/c"],function(a,b,c,d){
		document.getElementById('a').innerHTML = a;
		document.getElementById('b').innerHTML = b;
		document.getElementById('c').innerHTML = d.name;
	});
});