
define(["c","d"], function(c,d){
    return {name : 'aaa', val : (c.val + d.val)};
});

define(function(){
    return { name : 'bbb', val : 'bbbval'};
});
