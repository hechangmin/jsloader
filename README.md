jsloader 是什么？
===========================

  jsloader 是javascript 模块加载器。


他最大的优点：简单
------------------------

* jsloader 不要求参数的id 必须是直接量;
* jsloader 我们对你要加载的模块形式几乎没限制。

接口少，你需要用到的，只有define 及require 。

---------------------------

    对加载的JS 编码有要求，可以使用 jsloader({charset:***});
    如果你要加载的JS 中并非都是一种编码，可以在 url 加参数 ：
    比如 ：require(['static/js/lib/c?charset=utf-8'],function(){...});

-注意-
---------------------------
> * 模块定义不能延迟定义，这个需要举例说明，比如下面这两种写法：

```js
 define(function(c,d){
     return {m1 : c[0], m2 : d[0]};
 },["js/demo4/c","js/demo4/d"]);
```

```js
require(["js/demo4/c","js/demo4/d"], function(c,d){
    //由于define放在了 require 回调里，执行时机要等待依赖先注入，这里的会出错。
    //请参考a的写法。
    define({m1 : c[0], m2 : d[0]});
});
```

--------------------------------

如果有使用上的疑问，请参照demo.html。

> 欢迎联系我 [hechangmin@gmail.com](mailto://hechangmin@gmail.com)
