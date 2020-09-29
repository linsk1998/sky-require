(function () {

	function getCurrentScript(){
		var nodes=document.getElementsByTagName('SCRIPT');
		var i=nodes.length;
		while(i--){
			var node=nodes[i];
			if(node.readyState==="interactive"){
				return node;
			}
		}
		return null;
	}

	var supportStack;
	function getStackSupport(){
		try{
			throw new Error('get stack');
		}catch(e){
			var stackHandler={
				'stack':[
					/^@(.*):\d+$/,// Firefox
					/^\s+at (.*):\d+:\d+$/,//Chrome
					/^\s+at [^\(]*\((.*):\d+:\d+\)$/ //IE11
				],
				'stacktrace':[
					/\(\) in\s+(.*?\:\/\/\S+)/m//opera
				]
			};
			for(var name in stackHandler){
				var stacks=e[name];
				if(stacks){
					var patterns=stackHandler[name];
					var stack=getLastStack(stacks);
					var i=patterns.length;
					while(i--){
						var pattern=patterns[i];
						if(pattern.test(stack)){
							supportStack=true;
							return true;
						}
					}
				}
			}
		}
		return false;
	}
	function getCurrentPathByStack(){
		try{
			throw new Error('get stack');
		}catch(e){
			var arr=getLastStack(e[stackResult.name]).match(stackResult.pattern);
			if(arr){
				if(arr[1]!=location.href && arr[1]!=location.origin+location.pathname+location.search){
					return arr[1];
				}
			}
		}
	}
	function getLastStack(stack){
		var stacks=stack.trim().split("\n");	return stacks[stacks.length-1];
	}

	function getCurrentScriptByLast(){
		var path=supportStack?getCurrentPathByStack():null;
		var nodes=document.getElementsByTagName('SCRIPT');
		var arr=[];
		for(var i=0;i<nodes.length;i++){
			var node=nodes[i];
			if(node.readyState==="complete") {
				continue ;
			}
			if(node.src){
				if(path!==new URL(node.src,location).href){
					continue ;
				}
			}else if(path){
				continue ;
			}
			arr.push(node);
		}
		nodes=null;
		if(arr.length){
			return arr[arr.length-1];
		}
		return null;
	}

	var getCurrentScript$1,getCurrentPath;
	if('currentScript' in document){
		getCurrentScript$1=function(){
			return document.currentScript;
		};
	}else {
		if("readyState" in document.scripts[0]){
			getCurrentScript$1=getCurrentScript;
		}else {
			document.addEventListener('load',function(e){
				if(e.target.tagName==="SCRIPT"){
					e.target.readyState="complete";
				}
			},true);
			if(getStackSupport()){
				getCurrentPath=getCurrentPathByStack;
			}
			getCurrentScript$1=getCurrentScriptByLast;
		}
		Object.defineProperty(document,"currentScript",{
			enumerable:true,
			get:getCurrentScript$1
		});
	}
	if(!getCurrentPath){
		getCurrentPath=function(){
			var url=new URL(getCurrentScript$1().src,location);
			try{
				return url.href;
			}finally{
				url=null;
			}
		};
	}

	function getScript(src,func,charset){
		var script=document.createElement('script');
		script.charset=charset || "UTF-8";
		script.src=src;
		script.async=true;
		if(func){
			if('onafterscriptexecute' in script){
				script.onafterscriptexecute=func;
			}else {
				script.onload=func;
			}
		}
		document.head.appendChild(script);
		return script;
	}

	function forOwn(obj,fn,thisArg){
		if(obj){
			thisArg=thisArg || undefined;
			var keys=Object.keys(obj);
			for(var i=0;i<keys.length;i++){
				var key=keys[i];
				if(fn.call(thisArg,obj[key],key)===false){
					return false;
				}
			}
			return true;
		}
		return false;
	}

	var commentRegExp=/\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg;
	var cjsRequireRegExp=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
	var STATUS={
		INITED:0,//初始化
		LOADING:1,//正在加载script
		DEFINED:2,//已定义
		DEPENDING:3,//正在加载依赖
		COMPLETE:4//完成
	};
	var baseUrl=new URL(getCurrentPath(),location);
	/** 所有script标签，key:路径，value:script元素 */
	var bundles=new Map();
	/** 全局声明的模块,key:模块名，value:模块 */
	var cache=new Map();

	var nameHooks=[];
	var pathHooks=[];
	var loadHooks=[];
	var urlArgsHooks=[];
	var resolveHooks=[];


	function Module(name){
		this.status=STATUS.INITED;
		this.name=name;
		var me=this;
		this.promise=new Promise(function(resolve, reject){
			var delay=null;
			me.resolve=function(exports){
				if(exports!==void 0){
					me.exports=exports;
				}
				var pluginResolve=function(exports){
					me.status=STATUS.COMPLETE;
					resolve(exports);
				};
				var i=resolveHooks.length;
				while(i-->0){
					var r=resolveHooks[i].call(this,pluginResolve,reject);
					if(r===false){
						return ;
					}
				}
				if(delay){
					delay(pluginResolve, reject);
				}else {
					me.status=STATUS.COMPLETE;
					resolve(me.exports);
				}
			};
			me.reject=reject;
			me.delay=function(fn){
				delay=fn;
			};
		});
	}
	/*
	全局变量中的require
	*/
	window.require=function(deps,callback,onerror){
		var from;
		if(this===window || this===undefined){
			from=new Module(null);
			from.script=getCurrentScript$1();
		}else {
			from=this;
		}
		if(!from.dependencies){
			from.dependencies=new Array();
		}
		if(Array.isArray(deps)){
			var modules=new Array();//需要加载JS文件的模块
			var promises=new Array(deps.length);
			for(var i=0;i<deps.length;i++){
				var dep=deps[i];
				switch(dep){
					case 'require':
						promises[i]=Promise.resolve(require.bind(from));
						break;
					case 'exports':
						promises[i]=Promise.resolve(from.exports=new Object());
						break;
					case 'module':
						promises[i]=Promise.resolve(from);
						break;
					default:
						module=nameToModule(dep,from);
						promises[i]=module.promise;
						if(module.status<=STATUS.LOADING){
							modules.push(module);
						}else if(module.status==STATUS.DEFINED){
							module.load();//加载依赖
						}
						from.dependencies.push(module);
				}
			}
			Promise.all(promises).then(function(data){
				callback && callback.apply(from,data);
			},function(e){
				onerror && onerror.call(from,e);
			});
			loadModelesScript(modules);
			checkCircular(from);//检测循环依赖
			return from;
		}else {
			var name=deps;
			var module=nameToModule(name,from);
			if(module.status===STATUS.COMPLETE){
				return module.exports;
			}else if(module.status===STATUS.DEFINED){
				return module.loadSync();
			}
			throw new Error("module("+name+") must loaded before");
		}
	};
	/**
	 * 根据字符串查找模块
	 * */
	function nameToModule(name,from){
		var module,url;
		if(name.startsWith("//") || name.match(/^\w+:/) ){//模块名称是绝对路径
			url=new URL(name,baseUrl);
			return urlToModule(url.href,url);
		}
		if(name.startsWith(".")){//模块名称是相对路径
			if(from && from.src){
				name=new URL(name,"http://localhost/"+from.name).pathname.replace("/","");
			}else {//通过html中的script标签直接运行
				url=new URL(name,location);
				return urlToModule(url.href,url);
			}
		}
		var i=nameHooks.length;
		while(i-->0){
			var n=nameHooks[i](name,from);
			if(n){
				name=n;
			}
		}
		if(from.script){//优先查询同脚本模块
			if(from.script.modules){
				module=from.script.modules.find(findName,name);
				if(module){
					return module;
				}
			}
		}else {
			throw new Error("Not found current script");
		}
		//查询全局声明的模块
		module=cache.get(name);
		if(module){
			return module;
		}
		//根据配置获取
		url=nameToURL(name,from);
		if(!url){
			url=new URL(name,baseUrl);
		}
		try{
			return urlToModule(name,url,from);
		}catch(e){
			url=null;
		}
	}
	function urlToModule(name,url,from){
		var search=url.search;
		var j=urlArgsHooks.length;
		while(j-->0){
			urlArgsHooks[j](name,from,url);
		}
		var i=loadHooks.length;
		while(i-->0){
			var module=loadHooks[i](name,from,url);
			if(module){
				return module;
			}
		}
		//js模块
		if(!search){
			if(!url.pathname.endsWith(".js")){
				url.pathname+=".js";
			}
		}
		var path=url.origin+url.pathname+url.search;
		url=null;
		return getJsModule(name,path);
	}
	function getJsModule(name,path,from){
		var module;
		var script=bundles.get(path);
		if(script){//已经加载了js
			/** modules表示script中用define定义的模块 */
			var modules=script.modules;
			if(modules.length==1){//匿名模块文件
				return modules[0];
			}
			module=modules.find(findName,name);
			if(!module){
				/** requires表示用require创建的模块 */
				var requires=script.requires;
				if(!requires){
					throw new Error("module ["+name+"] not in js \""+path+"\"");
				}
				module=requires.find(findName,name);
				if(module){
					return module;
				}
				module=requires.find(findNoName,name);
				if(module){
					return module;
				}
				module=new Module(name);
				module.src=path;
				module.script=script;
				module.status=STATUS.LOADING;
				requires.push(module);
			}
		}else {//未加载js
			module=new Module(name);
			module.src=path;
		}
		if(name){
			cache.set(name,module);
		}
		cache.set(path,module);
		return module;
	}
	function nameToURL(name,from){
		var i=pathHooks.length;
		while(i--){
			var rule=pathHooks[i];
			var url=rule(name,from);
			if(url){
				return url;
			}
		}
		return new URL(name,baseUrl);
	}
	function findName(mod){
		return mod.name==this;
	}
	function findNoName(mod){
		return mod.name==null;
	}
	/**加载script */
	function loadModelesScript(modules){
		var libs=new Map();
		var i=modules.length;
		while(i-->0){
			var mod=modules[i];
			if(mod.status==STATUS.INITED){
				var lib=libs.get(mod.src);
				if(!lib){
					lib=new Array();
					libs.set(mod.src,lib);
				}
				lib.push(mod);
			}
		}
		libs.forEach(loadModelesScriptPath);
	}
	function loadModelesScriptPath(modules,src){
		var script=getScript(src,handleLast);
		bundles.set(src,script);
		/** requires表示通过require创建的模块 */
		script.requires=modules;
		/** modules表示通过define创建的模块 */
		script.modules=[];
		script.onerror=handleError;
		var i=modules.length;
		while(i-->0){
			var mod=modules[i];
			mod.status=STATUS.LOADING;
			mod.script=script;
		}
	}
	function handleError(message,url,line){
		var requires=this.requires;
		requires.forEach(function(module){
			module.reject({'message':message,'url':url,'line':line});
		});
	}
	function handleLast(){
		var requires=this.requires;
		this.requires=null;
		var i=requires.length;
		while(i-->0){
			var module=requires[i];
			if(module.status==STATUS.DEFINED){
				module.load();
			}
		}
	}
	Module.prototype.define=function(deps,initor){
		this.script.modules.push(this);
		if(typeof initor==="function"){
			this.initor=initor;
			this.deps=deps;
			this.status=STATUS.DEFINED;
		}else {
			this.resolve(initor);
		}
	};
	Module.prototype.config=function(){
		return null;
	};
	/*
	加载依赖
		*/
	Module.prototype.load=function(){
		if(this.deps && this.deps.length){
			this.status=STATUS.DEPENDING;//加载依赖
			require.call(this,this.deps,function(){
				try{
					this.resolve(this.initor.apply(this,arguments));
				}catch(e){
					console.error(e);
					this.reject(e);
				}
			},function(e){
				this.reject(e);
			});
		}else {
			this.resolve(this.initor());
		}
	};
	Module.prototype.loadSync=function(){
		var result;
		this.plugin=function(fn){
			throw "the module ["+this.name+"] has not been loaded yet";
		};
		if(this.deps && this.deps.length){
			var deps=this.deps.map(function(dep){
				return require.call(this,dep);
			},this);
			result=this.initor.apply(this,deps);
		}else {
			result=this.initor();
		}
		this.resolve(result);
		this.status=STATUS.COMPLETE;
		return this.exports;
	};
	Module.define=function(name,deps,initor){
		var module;
		var script=getCurrentScript$1();
		if(script.modules){
			var path=new URL(script.src,location).href;
			bundles.set(path,script);
		}else {
			script.modules=new Array();
		}
		if(script.requires){
			var i=script.requires.length;
			while(i-->0){
				module=script.requires[i];
				if(module.status<=STATUS.LOADING){
					if(name==null || module.name==name){
						module.define(deps,initor);
						return ;
					}
				}
			}
		}
		module=new Module(name);
		cache.set(name,module);
		module.script=script;
		module.define(deps,initor);
	};
	/*
		define(data);
		define(initor);
		define(deps,initor);
		define(name,deps,initor);
		*/
	window.define=function(arg1,arg2,arg3){
		switch(arguments.length){
			case 1:
				if(typeof arg1==="function"){
					var deps=new Array();
					switch(arg1.length){
						case 3:
							deps.unshift('module');
						case 2:
							deps.unshift('exports');
						case 1:
							deps.unshift('require');
							break ;
					}
					arg1.toString().replace(commentRegExp,commentReplace).replace(cjsRequireRegExp,function(match,dep){
						deps.push(dep);//CMD
					});
					Module.define(null,deps,arg1);
				}else {
					Module.define(null,null,arg1);
				}
				break;
			case 2:
				Module.define(null,arg1,arg2);
				break;
			case 3:
				Module.define(arg1,arg2,arg3);
		}
	};
	function checkCircular(module){
		if(module.dependencies.length){
			var stack=new Array();
			stack.push(module);
			return checkCircularSub(module,stack);
		}
	}
	function checkCircularSub(module,stack){
		var i=module.dependencies.length;
		stack.push(module);
		while(i-->0){
			var mod=module.dependencies[i];
			if(stack.includes(mod)){
				var j=stack.length;
				while(j-->0){
					m=stack[j];
					if('exports' in m){
						m.resolve(m.exports);
						m.status=STATUS.COMPLETE;
						return ;
					}
				}
				console.error("circular dependency found,should use exports");
				return ;
			}
			if(mod.dependencies && mod.STATUS!=STATUS.COMPLETE){
				stack.push(mod);
				checkCircularSub(mod,stack);
				stack.pop();
			}
		}
	}
	function commentReplace(match, singlePrefix) {
		return singlePrefix || '';
	}
	define.amd=true;



	require.setBaseUrl=function(url){
		baseUrl=url;
	};
	require.hook=function(option){
		if(option.name) nameHooks.push(option.name);
		if(option.path) pathHooks.push(option.path);
		if(option.load) loadHooks.push(option.load);
		if(option.urlArgs) urlArgsHooks.push(option.urlArgs);
		if(option.resolve) resolveHooks.push(option.resolve);
	};
	require.config=function(options){
		var bu=options.baseUrl;
		if(bu){
			if(!bu.endsWith("/")){
				bu+="/";
			}
			baseUrl=new URL(bu,baseUrl);
		}
		forOwn(options.paths,function(path,confName){
			require.hook({
				path:function(name,from){//返回URL
					if(name==confName){
						return new URL(path,baseUrl);
					}
				}
			});
		});
		if(options.paths){
			require.hook({
				path:function(name,from){//返回URL
					var path=options.path;
					if(Object.prototype.hasOwnProperty.call(path,name)){
						return new URL(path[name],baseUrl);
					}
				}
			});
		}
		forOwn(options.bundles,function(names,path){
			require.hook({
				path:function(name,from){//返回URL
					if(names.includes(name)){
						return new URL(path,baseUrl);
					}
				}
			});
		});
		if(options.map){
			require.hook({
				name:function(name,from){
					var fromName=from.name;
					var map=options.map;
					var path;
					if(Object.prototype.hasOwnProperty.call(map,fromName)){
						path=map[fromName];
					}else {
						path=map['*'];
						if(!path) return ;
					}
					if(Object.prototype.hasOwnProperty.call(path,name)){
						return new URL(path[name],baseUrl);
					}
				}
			});
		}
		forOwn(options.config,function(value,key){
			function getConfig(){
				return value;
			}
			require.hook({
				resolve:function(name,from){//返回URL
					if(name==key){
						this.config=getConfig;
					}
				}
			});
		});
		if(options.pkgs){
			pkgs.forEach(function(pkg){
				var pkgName=pkg.name;
				var location=pkg.location;
				var main=pkg.main;
				if(!location) throw new Error("no arg 'location' in pkg");
				if(!pkgName) throw new Error("no arg 'name' in pkg");
				if(!location.endsWith("/")) location+="/";
				location=new URL(location,baseUrl);
				require.hook({
					path:function(name,from){//返回URL
						if(pkgName==name){
							if(main){
								return new URL(pkgName+"/"+main,location);
							}else {
								return new URL(pkgName,location);
							}
						}else if(name.startsWith(pkgName+"/")){
							return new URL(pkgName,location);
						}
					}
				});
			});
		}
		var urlArgs=options.urlArgs;
		if(urlArgs){
			if(typeof urlArgs=="function"){
				require.hook({
					urlArgs:function(name,from,url){
						var search=urlArgs(name, url.href);
						if(search){
							var params=new URLSearchParams(search);
							params.forEach(function(value,key){
								url.search.append(key,value);
							});
						}
					}
				});
			}else {
				require.hook({
					urlArgs:function(name,from,url){
						var params=new URLSearchParams(urlArgs);
						params.forEach(function(value,key){
							url.search.append(key,value);
						});
					}
				});
			}
		}
		forOwn(options.shim,function(mod,name){
			define(name,mod.deps,mod.init?mod.init:function(){
				var paths=mod.exports.split(".");
				var obj=window;
				for(var i=0;i<paths.length;i++){
					obj=obj[paths[i]];
				}
				return obj;
			});
		});
	};
	require.hook({
		load:function(name,from,url){
			var arr=name.split("!");
			if(arr.length==2){
				var module=new Object();
				module.name=name;
				module.promise=new Promise(function(resolve, reject){
					require.call(module,arr,[arr[0]],function(plugin){
						plugin.load(arr[0], require.bind(this), resolve);
					}, reject);
				});
			}
		}
	});

}());
