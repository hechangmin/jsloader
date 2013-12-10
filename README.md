jsloader 是什么？

jsloader 是javascript 模块加载器。

跟其他模块加载程序比较有什么优点?

简单。

===========================

1. jsloader 不要求参数的id 必须是直接量;
2. jsloader 我们对你要加载的模块形式几乎没限制。

接口少，你需要用到的，只有define 及require 。

一句话，你可以很自由的使用！

===========================

对加载的JS 编码有要求，可以使用 jsloader({charset:***});

如果你要加载的JS 中并非都是一种编码，可以在 url 加参数 ：
比如 ：require(['static/js/lib/c?charset=utf-8'],function(){...});

如果还有疑问，可以参考demo.html 以及 doc 目录下的代码文档。

==========================

注意：

1 .模块定义不能延迟定义，比如下面这两种写法：

a.

 define(function(c,d){
     return {m1 : c[0], m2 : d[0]};
 },["js/demo4/c","js/demo4/d"]);

 b.

require(["js/demo4/c","js/demo4/d"], function(c,d){
    define({m1 : c[0], m2 : d[0]}); //由于定义放在了回调里，执行时机要等待依赖先注入，所以这里的定义会出错。请参考a的写法。
});
