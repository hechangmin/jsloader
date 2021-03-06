jsloader 是什么？
===========================

  jsloader 是javascript 模块加载器。


他最大的优点：简单
------------------------

* jsloader 不要求参数的id 必须是直接量;
* jsloader 我们对你要加载的模块形式几乎没限制。

接口少，对外暴露的接口只有3个：define、require、jsloader.config;

对外只暴露一个字段 jsloader.version ：用来判断下是否与官方最新版本一致。

推荐在jsloader.js 所在script增加：id='loader-node' data-main='js/demo5/index'， 会使逻辑更加清晰。

_注意:_
---------------------------

> * config 可以配置编码，是否开启调试模式，以及文件别名：


```js
var opts = {
    charset : 'utf-8',
    isDebug : false,
    alias : {}
};
jsloader.config(opts);
```


> * 可能会被大家诟病的一个点：
    var m = require('m'); 这种写法，不支持。
> 原因如下：我提倡：异步加载的结果，请在回调里使用。

> * 模块依赖关系中，定义不能延迟，这个需要举例说明，比如下面这两种写法：

```js
 define(["js/demo4/c","js/demo4/d"], function(c,d){
     return {m1 : c[0], m2 : d[0]};
 });
```



```js
require(["js/demo4/c","js/demo4/d"], function(c,d){
    //由于define放在了 require 回调里，执行时机要等待依赖先注入，这里的会出错。
    //请参考a的写法。
    define({m1 : c[0], m2 : d[0]});
});
```

辅助理解记忆：先定义再加载。(define 和 require 在一起的时候，让define在前面。)

更新日志:
---------------------------
* 2013.12.30
   * 由于代码真的很简单，所以将doc自动生成的文档删掉了；
   * 增加data-main 逻辑；
   * 增加 script.async = true；
   * node_modules 添加进忽略列表；
   * 使用grunt替换掉现在的ant；

* 2013.12.31
   * 为jsloader script 增加id=loader-node;
   * 增加配置项base ，所有的非协议头路径都将尝试加上这个路径。

```js
jsloader.config({
   base : 'js/demo5/',
   charset : 'utf-8',
   debug : true
});
```
* 2013.1.4 (2.0 发布)
   * 修复IE 6 下，刷新异常的问题；
   * define 中依赖参数调整为默认在第一个参数(此前是第二个)；
   * define 模块定义，使用函数或对象；

--------------------------------

如果有使用上的疑问，请参照demo0~5.html。

> 欢迎联系我 [hechangmin@gmail.com](mailto://hechangmin@gmail.com)
