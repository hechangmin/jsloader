/**
 * javascript 模块加载器
 * https://github.com/hechangmin/jsloader
 * @author  hechangmin
 * @version 2.0
 * @date    2014.1
 * Released under the MIT license
 */

(function(global, undefined) {
    var mods = {},
        fns = {},
        separator = '$$',
        curModIndex = [],
        arrModOrder = [],

        configs = {
            base    : '',
            charset : 'utf-8',
            isDebug : true,
            alias   : {}
        },

        head = document.head || document.getElementsByTagName('head')[0] || document.documentElement,
        base = head.getElementsByTagName("base")[0],

    /**
     * 适配返回值
     * @param  {Array} arrParam
     * @return 数组只有一个元素，则把元素直接返回
     */
    fitReturn = function(arrParam){
        if(isArray(arrParam) && 1 === arrParam.length){
            return arrParam[0];
        }else{
            return arrParam;
        }
    },

    checkAndFixUrl = function(urls) {
        var Ret = [];
        urls = 'string' === typeof urls ? [urls] : urls;

        for (var i = 0, url; url = urls[i++];) {
            url = configs['alias'][url] ? configs['alias'][url] : url;
            url = fillBasePath(url);
            url = fillExtension(url);
            url = getRealPath(url);
            Ret.push(url);
        }

        return Ret;
    },

    loadJS = function(url) {
        var script = document.createElement('script');
        script.charset = configs.charset;
        bindLoad(script);
        script.async = true;
        script.src = url;
        base ? head.insertBefore(script, base) : head.appendChild(script);
    },

    bindLoad = function(script) {
        script.onload = script.onreadystatechange = function() {
            if (!script.readyState || /loaded|complete/.test(script.readyState)) {

                script.onload = script.onreadystatechange = null;

                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                script = null;
            }
        };
    },

    getCurScript = function() {
        var stack, src, nodes;

        //firefox 4+
        if (document.currentScript) {
            return document.currentScript.src;
        }

        try {
            throw Error('');
        } catch (e) {
            stack = e.stack;

            if (!stack && window.opera) {
                stack = (String(e).match(/of linked script \S+/g) || []).join(' ');
            }

            if (stack) {
                stack = stack.split(/[@ ]/g).pop();
                stack = stack[0] === '(' ? stack.slice(1, -1) : stack.replace(/\s/, '');
                return stack.replace(/(:\d+)?:\d+$/i, '');
            }
        }

        try {
            nodes = document.getElementsByTagName('script');

            for (var i = 0, node; node = nodes[i++];) {
                if (node.readyState === 'interactive') {
                    src = document.querySelector ? node.src : node.getAttribute('src', 4);
                    return src;
                }
            }
        } catch (e) {
            debug('getCurScript is fail.\n')
        }
        return '';
    },

    getBaseUrl = function() {
        return document.location.href.substring(0, document.location.href.lastIndexOf('/'));
    },

    fillBasePath = function(path) {
        var pattern = /(^file:\/\/)|(^http:\/\/)|(^https:\/\/)/,
            pattern2 = /(^\/)/,
            pattern3 = /(\/$)/,
            dir_separator = '/',
            base = configs['base'];

        if (!pattern.test(path)) {

            if(pattern3.test(base)){
                if(pattern2.test(path)){
                    path = base + path.slice(1);
                }else{
                    path = base + path;
                }
            }else{
                if(pattern2.test(path)){
                    path = base + path;
                }else{
                    path = base + dir_separator + path;
                }
            }

            if (!pattern.test(base)) {
                path = getBaseUrl() + (pattern2.test(path) ? '' : dir_separator) + path;
            }
        }

        return path;
    },

    fillExtension = function(path) {
        var tempArrStr = [],
            pattern = /(\.js$)|(\.js\?)/;

        if (!pattern.test(path)) {

            if (path.indexOf('?') > -1 && path.indexOf('?') != path.length - 1) {
                tempArrStr = path.split('?');
                tempArrStr[0] += '.js?';
                path = tempArrStr.join('');
            } else {
                path += '.js';
            }
        }

        return path;
    },

    getRealPath = function(path) {
        var pattern1 = /\/\.\//g,
            pattern2 = /\/[^/]+\/\.\.\//;

        path = path.replace(pattern1, '/');

        while (path.match(pattern2)) {
            path = path.replace(pattern2, '/');
        }

        return path;
    },

    isType = function(type) {
        return function(obj) {
            return ({}).toString.call(obj) === "[object " + type + "]";
        }
    },

    isObject = isType("Object"),
    isString = isType("String"),
    isArray = Array.isArray || isType("Array"),
    isFunction = isType("Function"),

    debug = function(msg) {
        if (configs.isDebug) {
            if(global.console) {
                console.error(msg);
            } else {
                alert(msg);
            }
        }
    },

    callbackRouter = function(url) {
        var curFn, urls, args = [];

        for(var i in fns){
            if(i == url || i.indexOf(url) > -1){

                curFn = fns[i];

                if(isFunction(curFn)){

                    urls = i.split(separator);

                    for (var j = 0, item; item = urls[j++];) {
                        if (mods[item]
                            && mods[item].length
                            && (curModIndex[item] + 1) == mods[item].length)
                        {
                            args.push(fitReturn(sort(item)));
                        } else {
                            return;
                        }
                    }

                    curFn.apply(null, args);
                    delete fns[i];
                }
            }
        }
    },

    //记录依赖中的顺序
    logOrder = function(url, index) {

        if (undefined == arrModOrder[url]) {
            arrModOrder[url] = [index];
        } else {
            arrModOrder[url].push(index);
        }
    },

    //根据当初调用define的顺序，对模块排序
    sort = function(url) {

        var mod = mods[url],
            index = arrModOrder[url],
            arrRet = [];

        for (var i = 0, n = mod.length; i < n; i++) {
            arrRet[index[i]] = mod[i];
        }

        return arrRet;
    },

    /**
     * @description 配置
     * @param {array} opts  eg. {charset : 'utf-8', isDebug : false, alias : {}}
     */
    config = function(opts) {
        for (var opt in opts) {
            configs[opt] = opts[opt];
        }
    },

    /**
     * @description 模块定义
     * @param {array} deps 模块需要的依赖
     * @param  {Function} factory 模块构造工厂,函数则加载其执行结果，其他类型直接加载
     */
    define = function(deps, factory) {
        var url = getCurScript(), fn, urls, err = 'run the define fail. \n';

        try {
            if(isFunction(deps) || isObject(deps)){
                fn = deps;
            }else{
                urls = isString(deps) ? [deps.toString()] : deps;

                if (!isArray(urls)) {
                    throw 'define param[deps] error.\n';
                }

                if(isFunction(factory)){
                    fn = factory;
                }else{
                    throw 'define param[factory] is not function.\n';
                }
            }

            if (undefined == curModIndex[url]) {
                curModIndex[url] = 0;
            } else {
                curModIndex[url]++;
            }

            if (undefined == mods[url]) {
                mods[url] = [];
            }

            //有依赖的情况
            if (undefined != urls) {
                require(deps, function(url, index) {
                    return function() {
                        logOrder(url, index);
                        mods[url].push(fn.apply(null, arguments));
                        callbackRouter(url);
                    }
                }(url, curModIndex[url], fn));
            } else {
                logOrder(url, curModIndex[url]);
                mods[url].push(isFunction(fn) ? fn() : fn);
                callbackRouter(url);
            }
        } catch (e) {
            err += e;
            err += '\n';
            err += url;
            debug(err);
        }
    },

    /**
     * @description 模块引入
     * @param  {string or array} deps 单个或一组url
     * @param  {function} callback 加载完成后的回调函数
     */
    require = function(deps, callback) {
        var urls = checkAndFixUrl(deps),
            id = urls.join(separator);

        if ('function' === typeof callback) {
            fns[id] = callback;
        } else {
            debug('params[callback] error in require. \n' + id);
        }

        for (var i = 0, url; url = urls[i++];) {
            if (undefined === mods[url]) {
                loadJS(url);
            } else {
                callbackRouter(url);
            }
        }
    };

    //auto-run
    (function(){
        var el = document.getElementsByTagName("script"),
            loaderScript = document.getElementById("loader-node") || el[el.length - 1],
            dataMain = loaderScript.getAttribute("data-main");

        if (dataMain) {
            require(dataMain, function(){});
        }

        //export
        if(undefined === window.jsloader){
            window.jsloader = {
                version : '2.0',
                config  : config,
                define  : define,
                require : require
            };

            window.define  = jsloader.define;
            window.require = jsloader.require;
        }
    })();
})(window);