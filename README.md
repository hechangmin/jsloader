这是啥？

这是一个JS 文件及模块加载器，同时也是模块定义管理。

跟requirejs ，seajs 比较有什么优点。

简单！

1. jsloader 不会要求参数的id 必须是直接量。
2. jsloader 我们对你要加载的模块形式几乎没限制。

接口少，你需要用到的，只有两个define 及require 。

一句话，你可以很自由的使用！

===========================

如果对加载的JS 编码有要求，可以使用 jsloader({charset:***});
如果你要加载的JS 中并非都是一种编码，可以在 url 加参数 ：

比如 ：require('static/js/lib/c?charset=utf-8',function(){...});

如果还有疑问，可以参考demo.html 以及 doc 目录下的代码文档。

