/**
 * javascript 模块加载器
 * https://github.com/hechangmin/jsloader
 * @author  hechangmin
 * @version 1.1.0
 * @date    2013.12
 * Released under the MIT license
 */

(function(global, undefined) {
    var mods = {},
        fns = {},
        separator = '@_@',
        curModIndex = [],
        modIndex = [],
        timer = {},
        configs = {
            charset : 'utf-8',
            debug : false,
            alias : {}
        };

    /**
     * @description 配置
     * @param {array} opts  eg. {charset : 'utf-8', debug : false, alias : {}}
     */
    var config = function(opts) {
        for (var opt in opts) {
            configs[opt] = opts[opt];
        }
    };

    /**
     * @description 模块定义
     * @param  {Function} factory 模块构造工厂,函数则加载其执行结果，其他类型直接加载。
     * @param {array} deps 模块需要的依赖
     */
    var define = function(factory, deps) {
        var url = getCurScript();

        if (undefined == curModIndex[url]) {
            //记录同一个url中,当前是第几次调用define函数
            curModIndex[url] = 0;
        } else {
            curModIndex[url]++;
        }

        if (undefined === mods[url]) {
            //缓存url对应模块
            //简单点理解调用了几次define 就有多少个模块
            //最后加载完，应有 ：mods[url].length == curModIndex[url] + 1
            mods[url] = [];
        }

        try {
            //有依赖的情况
            if (undefined !== deps && 'function' === typeof factory) {

                deps = 'string' == typeof deps ? [deps] : deps;

                if (!isArray(deps)) {
                    debug('param[deps] is error . \n');
                    throw Error('');
                }

                require(deps, function(index) {
                    return function() {
                        logIndex(url, index);
                        mods[url].push(factory.apply(null, arguments));
                    }
                }(curModIndex[url]));

            //无依赖的情况
            } else {
                logIndex(url, curModIndex[url]);
                mods[url].push(typeof factory === 'function' ? factory() : factory);
            }
        } catch (e) {
            debug('run the define error. \n' + url);
        }
    };

    /**
     * @description 模块引入
     * @param  {string or array} urls 单个或一组url
     * @param  {function} callback 加载完成后的回调函数
     */
    var require = function(urls, callback) {
        var id, callBackWrapper;

        urls = checkAndFixUrl(urls);
        id = urls.join(separator);

        if ('function' === typeof callback) {
            fns[id] = callback;
        } else {
            debug('params[callback] error in require. \n' + id);
        }

        callBackWrapper = callbackRouter(id);

        for (var i = 0, url; url = urls[i++];) {
            if (undefined === mods[url]) {
                loadJS(url, callBackWrapper);
            } else {
                callBackWrapper();
            }
        }
    };

    var init = function(){
        var scripts = document.getElementsByTagName("script"),
            loaderScript = scripts[scripts.length - 1],
            dataMain = loaderScript.getAttribute("data-main");

        if (dataMain) {
            require(dataMain);
        }
    };
    var callbackRouter = function(id) {
        return function() {
            var urls = id.split(separator),
                args = [],
                mod,
                callback = fns[id];
            try{
                for (var i = 0, url; url = urls[i++];) {
                    if (mods[url] && mods[url].length && (curModIndex[url] + 1) == mods[url].length) {
                        mod = sort(url);

                        if(1 == mod.length){
                            args.push(mod[0]);
                        }else{
                            args.push(mod);
                        }
                    } else {
                        throw {};
                    }
                }
                // 模块数量 不能少于 回调函数的形参个数
                if (callback.length > args.length) {
                    throw {};
                }
            }catch(e){
                clearTimeout(timer[id]);
                timer[id] = setTimeout(arguments.callee, 20);
                return;
            }
            clearTimeout(timer[id]);
            callback.apply(null, args);
        };
    };

    //记录依赖中的顺序
    var logIndex = function(url, index) {

        if (undefined == modIndex[url]) {
            modIndex[url] = [index];
        } else {
            modIndex[url].push(index);
        }
    };

    //根据当初调用define的顺序，对模块排序
    var sort = function(url) {

        var mod = mods[url],
            index = modIndex[url],
            arrRet = [];

        for (var i = 0, n = mod.length; i < n; i++) {
            arrRet[index[i]] = mod[i];
        }

        return arrRet;
    };

    var checkAndFixUrl = function(urls) {
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
    };

    var loadJS = function(url, fnCallBack) {
        var q,
            c='?',
            script = document.createElement('script'),
            head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;

        script.charset = getUrlParam('charset', url) || configs.charset;

        script.async = true;
        script.src = url;
        bindLoad(script, fnCallBack);
        head.insertBefore(script, head.firstChild);
    };

    var bindLoad = function(script, callback) {
        script.onload = script.onreadystatechange = function() {
            if (!script.readyState || /loaded|complete/.test(script.readyState)) {
                script.onload = script.onreadystatechange = null;
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
                script = null;
                callback();
            }
        };
    };

    var getCurScript = function() {
        var stack, src, nodes;

        if (document.currentScript) { //firefox 4+
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
            debug('getCurScript is fail.')
        }
        return '';
    };

    var getBaseUrl = function() {
        return document.location.href.substring(0, document.location.href.lastIndexOf('/'));
    };

    var fillBasePath = function(path) {
        var pattern = /(^file:\/\/)|(^http:\/\/)|(^https:\/\/)/,
            pattern2 = /(^\/)/,
            dir_separator = '/';

        if (!pattern.test(path)) {
            path = getBaseUrl() + (pattern2.test(path) ? '' : dir_separator) + path;
        }

        return path;
    };

    var fillExtension = function(path) {
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
    };

    var getRealPath = function(path) {
        var pattern1 = /\/\.\//g,
            pattern2 = /\/[^/]+\/\.\.\//;

        path = path.replace(pattern1, '/');

        while (path.match(pattern2)) {
            path = path.replace(pattern2, '/');
        }

        return path;
    };

    var getUrlParam = function(name, url) {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);

        if (results == null) {
            return null;
        } else {
            return results[1] || 0;
        }
    };

    var isArray = Array.isArray || function (obj) {
        return ({}).toString.call(obj) === '[object Array]';
    };

    var debug = function(msg) {
        if (configs.debug) {
            if(global.console) {
                console.error(msg);
            } else {
                alert(msg);
            }
        }
    };

    init();

    //public
    if(undefined === window.jsloader)
    {
        window.jsloader = {
            version : '1.1.0',
            config : config,
            define : define,
            require : require
        };

        window.define = jsloader.define;
        window.require = jsloader.require;
    }

})(window);