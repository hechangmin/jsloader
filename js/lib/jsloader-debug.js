/**
 * @fileoverview javascript 模块加载器
 * @author     hechangmin@gmail.com
 * @version 1.0.0
 * @date    2013.12
 * Released under the MIT license
 */

(function(global, undefined) {
    var modsCache = {},
        fnsCache = {},
        head = document.head || document.getElementsByTagName('head')[0] || document.documentElement,
        separator = '@_@',
        curModIndex = [],
        modIndex = [],
        setting = {
            charset: 'utf-8',
            debug: false,
            alias: {}
        };

    /**
     * @name     jsloader
     * @constructor
     * @class  模块定义及文件模块加载
     * @param  {json} options 配置文件 可以设置编码，也可以配置别名
     * @example jsloader({charset : 'gbk', debug : false, alias : {a : 'js/abc.js'}});
     */
    var jsloader = function(options) {
        if (undefined !== options) {
            for (var option in options) {
                setting[option] = options[option];
            }
        }
    };

    /**
     * @description {Sting} 版本
     * @field
     */
    jsloader.version = '1.0.0';

    if (global.jsloader) {
        return;
    } else {
        global.jsloader = jsloader;
    }

    //记录依赖中的顺序
    var logIndex = function(url, index) {

        if (undefined == modIndex[url]) {
            modIndex[url] = [index];
        } else {
            modIndex[url].push(index);
        }
    };

    //根据当初调用define的顺序，对模块排序
    var sortMod = function(url) {

        var mod = modsCache[url],
            index = modIndex[url],
            arrRet = [];

        for (var i = 0, n = mod.length; i < n; i++) {
            arrRet[index[i]] = mod[i];
        }

        return arrRet;
    };

    /**
     * @description 模块定义[暴露给外部直接可用]
     * @param  {Function} factory 模块构造工厂,在被加载的时候，如果是函数，则会加载函数的执行结果，其他类型直接加载。
     * @param {array} deps 模块需要的依赖
     * @return global.define  = jsloader.define;
     */
    jsloader.define = function(factory, deps) {
        var url = getCurScript();

        if (undefined == curModIndex[url]) {
            //记录同一个url中,当前是第几次调用define函数
            curModIndex[url] = 0;
        } else {
            curModIndex[url]++;
        }

        if (undefined === modsCache[url]) {
            //一个url下对应的模块都缓存起来
            //简单点理解调用了几次define 就有多少个模块
            //最后加载完，应有 ：modsCache[url].length == curModIndex[url] + 1
            modsCache[url] = [];
        }

        try {
            //有依赖的情况
            if (undefined !== deps && 'function' === typeof factory) {
                deps = 'string' == typeof deps ? [deps] : deps;

                if (!isArray(deps)) {
                    debug('param[deps] is error . \n' + url);
                    throw Error('');
                }

                require(deps, function(index) {
                    return function() {
                        logIndex(url, index);
                        modsCache[url].push(factory.apply(null, arguments));
                    }
                }(curModIndex[url]));
                //无依赖的情况
            } else {
                logIndex(url, curModIndex[url]);
                modsCache[url].push(typeof factory === 'function' ? factory() : factory);
            }
        } catch (e) {
            debug('run the define error. \n' + url);
        }
    };

    /**
     * @description 模块加载[暴露给外部直接可用]
     * @param  {string or array} urls 单个或一组url
     * @param  {function} callback  加载完成后的回调函数
     * @return global.require = jsloader.require;
     */
    jsloader.require = function(urls, callback) {
        var id, callBackWrapper;

        urls = checkAndFixUrl(urls);
        id = urls.join(separator);

        if ('function' === typeof callback) {
            fnsCache[id] = callback;
        } else {
            debug('require params error.\n' + id);
        }

        callBackWrapper = callbackRouter(id);

        for (var i = 0, url; url = urls[i++];) {
            if (undefined === modsCache[url]) {
                loadJS(url, callBackWrapper);
            } else {
                callBackWrapper();
            }
        }
    };

    var callbackRouter = function(id) {
        return function() {
            var url,
                urls = id.split(separator),
                args = [],
                callback = fnsCache[id];

            for (var i = 0, nLength = urls.length; i < nLength; i++) {
                url = urls[i];
                if (modsCache[url] && modsCache[url].length
                    // url 所有模块都加载完
                    && (curModIndex[url] + 1) == modsCache[url].length) {
                    args.push(sortMod(url));
                } else {
                    setTimeout(arguments.callee, 20);
                    return;
                }
            }

            // 模块数量 不能少于 回调函数的形参个数
            if (callback.length > args.length) {
                setTimeout(arguments.callee, 20);
                return;
            }

            callback.apply(null, args);
        };
    };

    var checkAndFixUrl = function(urls) {
        var Ret = [];
        urls = 'string' === typeof urls ? [urls] : urls;

        for (var i = 0, url; url = urls[i++];) {
            url = setting['alias'][url] ? setting['alias'][url] : url;
            url = fillBasePath(url);
            url = fillExtension(url);
            url = getRealPath(url);
            Ret.push(url);
        }

        return Ret;
    };

    var loadJS = function(url, fnCallBack) {
        var script = document.createElement('script');
        script.charset = getUrlParam('charset', url) || setting.charset;
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

    var isArray = function(obj) {
        if (Array.isArray) {
            return Array.isArray(obj)
        }

        if ('object' === typeof obj) {
            if (Array === obj.constructor) {
                return true;
            }
        }

        return false;
    };

    var debug = function(msg) {
        if (setting.debug) {
            if ('undefined' !== typeof console) {
                console.error(msg);
            } else {
                alert(msg);
            }
        }
    };

    global.define = jsloader.define;
    global.require = jsloader.require;
})(window);