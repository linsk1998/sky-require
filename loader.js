
var define,require,Module;
(function(window){
	window.Module=Module;
	Module.base=Sky.getCurrentPath();
	var commentRegExp=/\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg;
	var cjsRequireRegExp=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
	var Status={
		LOADING:0,//正在加载script
		DEFINED:1,//已定义
		DEPENDING:2,//正在加载依赖
		COMPLETE:3//完成
	};
	var cache={};
	var rules=[];
	var shim={};
	var queue=[];
	function Module(name){
		this.status=Status.LOADING;
		this.name=name;
		var me=this;
		this.promise=new Promise(function(resolve, reject){
			var delay=null;
			me.resolve=function(exports){
				if(exports!==void 0){
					me.exports=exports;
				}
				if(delay){
					delay(resolve, reject);
				}else{
					resolve(me.exports);
				}
			};
			me.reject=reject;
			me.delay=function(fn){
				delay=fn;
			};
		});
		this.promise.then(function(){
			me.status=Status.COMPLETE;
		});
	}
	/*
	全局变量中的require
	 */
	require=function(deps,callback,onerror){
		var promises=deps.map(getDepsPromise,false);
		Promise.all(promises).then(function(data){
			callback.apply(this,data);
		},onerror);
	};
	function getDepsPromise(dep){
		switch(dep){
			case 'require':
				return this.require || (this.require=getRequire.bind(this));
			case 'exports':
				return this.exports=new Object();
			case 'module':
				return this;
		}
		if(dep instanceof Promise){
			return dep;
		}else if(dep instanceof Module){
			return dep.promise;
		}else{
			var module=nameToModule(dep,this);
			if(module.status==Status.DEFINED){
				module.load();
			}
			return module.promise;
		}
	}
	function getRequire(dep){
		var module=nameToModule(dep,this);
		if(module.status==Status.COMPLETE){
			return module.exports;
		}
		throw new Error("unsupport sync, module("+dep+") must loaded before");
	}
	/**
	 * 根据字符串查找模块
	 * */
	function nameToModule(name,from){
		var module;
		var i=rules.length;
		while(i--){
			var rule=rules[i];
			module=rule(name,from);
			if(module){
				break ;
			}
		}
		return module;
	}
	Module.prototype.init=function(src){
		var me=this;
		this.url=new URL(src,location);
		if(Sky.support.getCurrentScript){
			this.script=Sky.getScript(src,handleLast);
		}else{
			this.script=Sky.getScript(src,handleQueue);
		}
		this.script.amd=this;
		this.script.onerror=handleError;
	};
	function handleError(message,url,line){
		var module=this.amd;
		module.reject({'message':message,'url':url,'line':line});
	};
	function handleQueue(){
		var module=this.amd;
		if(queue.length){
			var i=queue.length;
			while(i--){
				var mod=queue[i];
				if(mod.name==module.name){
					module.define(mod.deps,mod.initor);
					queue.length=0;
					return ;
				}
			}
			var lastModule=queue[queue.length-1];
			module.define(lastModule.deps,lastModule.initor);
			queue.length=0;
		}else{
			useShim(module);
		}
	}
	function handleLast(){
		var module=this.amd;
		if(module.status==Status.LOADING){
			useShim(module);
		}else if(module.status<Status.DEPENDING){
			module.define(module.deps,module.initor);
		}
	}
	function useShim(module){
		if(Object.prototype.hasOwnProperty.call(shim,module.name)){
			module.resolve(window[shim[module.name]]);
		}else{
			console.error("No module found in script");
		}
	}
	Module.prototype.define=function(deps,initor){
		if(Sky.isFunction(initor)){
			this.initor=initor;
			this.deps=deps;
			this.load();
		}else{
			this.resolve(initor);
		}
	};
	/*
	加载依赖
	 */
	Module.prototype.load=function(){
		var me=this;
		if(this.deps && this.deps.length){
			me.status=Status.DEPENDING;//加载依赖
			var promises=this.deps.map(getDepsPromise,this);
			Promise.all(promises).then(function(data){
				me.resolve(me.initor.apply(me,data));
			});
		}else{
			me.resolve(me.initor());
		}
	};
	Module.define=function(name,deps,initor){
		var module;
		if(name){
			module=Module.getCache(name);
			var selfIndex=-1;
			if(module && deps){
				selfIndex=deps.indexOf(name);
				if(selfIndex>=0){
					deps[selfIndex]=module;
				}
			}
			if(!module || selfIndex>=0 || module.status>=Status.DEPENDING){
				module=new Module(name);
				module.deps=deps;
				module.initor=initor;
				module.status=Status.DEFINED;
				Module.setCache(name,module);
			}else if(module.status==Status.LOADING){
				module.deps=deps;
				module.initor=initor;
				module.define(module.deps,module.initor);
			}else{
				module.deps=deps;
				module.initor=initor;
			}
		}
		if(Sky.support.getCurrentScript){
			var script=Sky.getCurrentScript();
			if(script.amd){
				module=script.amd;
				if(module.status<=Status.DEFINED){
					module.deps=deps;
					module.initor=initor;
					module.status=Status.DEFINED;
					if(module.name==name){
						module.define(deps,initor);
					}
				}
			}
		}else{
			var lastModule=new Object();
			lastModule.deps=deps;
			lastModule.initor=initor;
			queue.push(lastModule);
		}
	};
	/*
	 define(data);
	 define(initor);
	 define(deps,initor);
	 define(name,deps,initor);
	 */
	define=function(arg1,arg2,arg3){
		switch(arguments.length){
			case 1:
				if(Sky.isFunction(arg1)){
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
				}else{
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
	Module.getCache=function(key){
		if(Object.prototype.hasOwnProperty.call(cache,key)){
			return cache[key];
		}
		return null;
	};
	Module.setCache=function(key,value){
		cache[key]=value;
	};
	Module.config=function(rule){
		rules.push(rule);
	};
	Module.shim=function(key,value){
		shim[key]=value;
	};
	function commentReplace(match, singlePrefix) {
		return singlePrefix || '';
	}
})(this);