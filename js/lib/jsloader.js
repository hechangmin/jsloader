/**
 * javascript loader
 * @author hechangmin@gmail.com
 * @date	2013.12
 */

(function(global, undefined) {
	var modsCache 	= {},
		fnsCache 	= {},
		head 		= document.head || document.getElementsByTagName('head')[0] || document.documentElement,
		separator 	= '@_@',
		setting 	= {
			charset : 'utf-8',
			debug	: false,
			alias 	: {}
		};

	var jsloader = function (params) {
	    if(undefined != params){
	    	for(var option in params){
				setting[option] = params[option];
			}
	    }
	};

	jsloader.version = '1.0.0';

	if(global.jsloader){
		return;
	}else{
		global.jsloader = jsloader;
	}

	global.define = jsloader.define = function(factory) {
		var url = getCurScript();

		if (undefined === modsCache[url]) {
			modsCache[url] = [];
		}

		try{
			modsCache[url].push(typeof factory === 'function' ? factory() : factory);
		}catch(e){
			debug('run the define error. \n' + url);
		}
	};

	global.require = jsloader.require = function(url, callback) {
		var checkRet = checkAndFixUrl(url), key, script;

		if (checkRet.hadChange) {
			require(checkRet.urls, callback);
			return;
		}

		if (isArray(url)) {
			key = url.join(separator);
			for (var i = 0, item; item = url[i++];) {
				require(item, callBackWrapper(key, callback), !0);
			}
			return;

		} else if ('string' === typeof url) {

			if ('function' === typeof callback) {
				fnsCache[url] = callback;
			}

			if (undefined === modsCache[url]) {
				script = document.createElement('script');
				script.charset = getUrlParam('charset', url) || setting.charset;
				script.src = url;
				bindLoad(script, arguments[2] ? callback : callbackRouter(url));
				head.insertBefore(script, head.firstChild);
				modsCache[url] = [];
			} else if (modsCache[url].length > 0) {
				arguments[2] ? callback() : callbackRouter(url)();
			}

		} else {
			debug('require params error.');
		}
	};

	var debug = function(msg){
		if(setting.debug){
			if(undefined !== typeof console){
				console.error(msg);
			}else{
				alert(msg);
			}
		}
	};

	var checkAndFixUrl = function(urls) {
		var originalParam = '',
			temp = [],
			oRet = {
				hadChange: false,
				urls: ''
			};

		urls = 'string' === typeof urls ? [urls] : urls;

		for (var i = 0, url; url = urls[i++];) {

			originalParam = url;
			url = setting['alias'][url] ? setting['alias'][url] : url;
			url = fillBasePath(url);
			url = fillExtension(url);
			url = getRealPath(url);

			if(!oRet.hadChange){
				oRet.hadChange = originalParam != url;
			}

			temp.push(url);
		}

		if (1 === temp.length) {
			oRet.urls = temp[0];
		} else {
			oRet.urls = temp;
		}

		return oRet;
	};

	var getBaseUrl = function() {
		return document.location.href.substring(0, document.location.href.lastIndexOf('/'));
	};

	var fillBasePath = function(path){
		var	pattern       = /(^file:\/\/)|(^http:\/\/)|(^https:\/\/)/,
			pattern2      = /(^\/)/,
			dir_separator = '/';

		if (!pattern.test(path)) {
			path = getBaseUrl() + (pattern2.test(path) ? '' : dir_separator) + path;
		}

		return path;
	};

	var fillExtension = function(path){
		var tempArrStr = [],
			pattern = /(\.js$)|(\.js\?)/;

		if (!pattern.test(path)) {

			if(path.indexOf('?') > -1 && path.indexOf('?') != path.length - 1){
				tempArrStr = path.split('?');
				tempArrStr[0] += '.js?';
				path = tempArrStr.join('');
			}else{
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

	var callbackRouter = function(url) {
		return function() {
			if ('function' === typeof fnsCache[url]) {
				setTimeout(function() {
					fnsCache[url].apply(arnull, modsCache[url]);
				});
			}
		};
	};

	var callBackWrapper = function(url, callback) {
		return function() {
			if ('function' === typeof callback) {

				var arrUrl = url.split(separator),
					args = [];

				for (var i = 0, item; item = arrUrl[i++];) {
					if (modsCache[item] && modsCache[item].length) {
						args = args.concat(modsCache[item]);
					} else {
						return;
					}
				}

				setTimeout(function() {
					callback.apply(null, args);
				});
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

	var bindLoad = function(script, callback) {
		script.onload = script.onreadystatechange = function() {
			if (!script.readyState || /loaded|complete/.test(script.readyState)) {
				script.onload = script.onreadystatechange = null;
				if (script.parentNode) {
					script.parentNode.removeChild(script);
				}
				script = null;

				if ('function' === typeof callback) {
					callback();
				}
			}
		};
	};
})(this);