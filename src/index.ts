
import {getScript,getCurrentPath,forOwn,attachEvent } from "sky-core";
interface Requirement{
	name?:string;
	promise?:Promise<any>;
	resolve?:Function;
	reject?:Function;
	src:string;
	from:Module;
}
interface Module{
	name?:string;
	deps?:string[];
	dependencies:Set<Module>;
	init?:Function;
	initor?:Function;
	exports?:any;
	require:Function;
	src:string;
	status:2|3|4;
	promise?:Promise<any>;
	resolve?:Function;
	reject?:Function;
	config?:Function;
}
declare global{
	interface Require{
		(deps:string[],onsuccess?:Function,onerror?:Function):Promise<any>;
		(deps:string):Promise<any>;
		setBaseUrl?:(url:URL)=>void;
		hook?:(options:{
			name?:(name:string,from:Module)=>string|void;
			path?:(name:string,from:Module)=>URL|void;
			load?:(url:URL,from:Module,name?:string)=>Promise<any>|void;
			urlArgs?:(url:URL,from:Module,name?:string)=>void;
			resolve?:(this:Module,resolve:(data:any)=>void|Function,reject:(data:any)=>void|Function)=>void;
		})=>void;
		config?:(options:{
			baseUrl?:string;
			paths?:Record<string,string>;
			bundles?:Record<string,string[]>;
			map?:Record<string,Record<string,string>>;
			packages?:Array<{
				main:string,
				name:string,
				location?:string
			}>;
			urlArgs?:string|((id:string, url:string)=>string);
			config?:Record<string,any>;
			shim?:Record<string,{
				deps?:string[],
				exports?:string,
				init?:(this:any,...deps:any[])=>any
			}>;
		})=>void;
	}
	interface Define{
		(data:Object):void;
		(initor?:Function):void;
		(deps:string[],initor:Function):void;
		(name:string,deps:string[],initor:Function):void;
		amd?:boolean;
	}
	export var require:Require;
	export var define:Define;
}

const STATUS_DEFINED=2;//已定义
const STATUS_DEPENDING=3;//正在加载依赖
const STATUS_COMPLETE=4;//完成

var requirementMap:Map<string,Array<Requirement>>=new Map();
var moduleMap:Map<string,Array<Module>>=new Map();
var timerMap:Map<string,number>=new Map();
/** 全局声明的模块,key:模块名，value:模块 */
var cache:Map<string,Module>=new Map();
var baseUrl:URL=location as any;
var waitSeconds=Number.MAX_VALUE;

function getGlobalModule():Module{
	return {
		src:location.origin+location.pathname+location.search,
		status:STATUS_COMPLETE,
		require:require,
		exports:window,
		dependencies:new Set()
	};
}

var pathHooks=[];
var loadHooks=[];
var nameHooks=[];
var urlArgsHooks=[];
var resolveHooks=[];

globalThis.require=function(this:Module,deps,onsuccess?:Function,onerror?:Function):Promise<any[]>{
	var from:Module;
	if(this===undefined || this===window as any){
		from=getGlobalModule();
	}else{
		from=this;
	}
	if(Array.isArray(deps)){
		var promises=new Array(deps.length);
		for(var i=0;i<deps.length;i++){
			var dep=deps[i];
			promises[i]=nameToPromise(dep,from);
		}
		var p=Promise.all(promises);
		if(onsuccess) p.then(function(data){
			onsuccess.apply(from,data);
		});
		if(onerror) p.catch(function(data){
			onerror.call(from,data);
		});
		return p;
	}else{
		return nameToExports(deps,from);
	}
};
function nameToExports(name:string,from:Module){
	switch(name){
		case 'require':
			return require.bind(from);
		case 'exports':
			return from.exports=new Object();
		case 'module':
			return from;
	}
	var url=srcToUrl(name,from);
	if(url){
		return urlToExports(url,from);
	}
	//优先查询同脚本同名字模块
	var module=pathToModule(from.src,from,name);
	if(module){
		return moduleToExports(module,from);
	}
	//根据配置获取URL
	var url=nameToUrl(name,from);
	if(!url){
		var m=cache.get(name);
		if(m && m!==from){//从全局缓存获取同名模块
			from.dependencies.add(m);
			return moduleToExports(m,from);
		}
		url=new URL(name,baseUrl);
	}
	try{
		return urlToExports(url,from,name);
	}finally{
		url=null;
	}
}
function srcToUrl(path:string,from:Module):URL{
	if(path.startsWith("//") || path.match(/^\w+:/) ){//模块名称是绝对路径
		return new URL(path,baseUrl);
	}
	if(path.startsWith(".")){//模块名称是相对路径
		if(from){
			if(from.name){
				path=new URL(path,"http://localhost/"+from.name).pathname.replace("/","");
			}else{
				return new URL(path,from.src);
			}
		}else{//通过html中的script标签直接运行
			return new URL(path,location as any);
		}
	}
}
function nameToUrl(name:string,from:Module):URL{
	//根据配置获取URL
	var i=pathHooks.length;
	while(i--){
		var rule=pathHooks[i];
		var url=rule(name,from);
		if(url){
			try{
				return url;
			}finally{
				url=null;
			}
		}
	}
	return null;
}
function urlToExports(url:URL,from:Module,name?:string){
	addUrlArgs(url,from,name);
	//js模块
	var search=url.search;
	if(!search){
		if(!url.pathname.endsWith(".js")){
			url.pathname+=".js";
		}
	}
	var path=url.origin+url.pathname+url.search;
	url=null;
	var module=pathToModule(path,from,name);
	if(module){
		return moduleToExports(module,from);
	}
	throw new Error("not found module ["+name+"] in \""+path+"\"");
}
function moduleToExports(module:Module,from:Module){
	if(module.status===STATUS_COMPLETE){
		return module.exports;
	}else if(module.status===STATUS_DEFINED){
		var exports:any;
		if(module.deps && module.deps.length){
			var deps=module.deps.map(require,module);
			exports=module.initor.apply(module,deps);
		}else{
			var exports=module.initor();
			if(exports!==undefined){
				module.exports=exports;
			}
		}
		return exports;
	}
	throw new Error("module("+name+") must loaded before");
}
function addUrlArgs(url:URL,from:Module,name?:string){
	var j=urlArgsHooks.length;
	while(j-->0){
		urlArgsHooks[j](url,from,name);
	}
	url=null;
}
function pathToModule(path:string,from:Module,name?:string):Module{
	var modules=moduleMap.get(path);//如果已经加载相关JS
	if(modules){//已经加载过JS
		var module=findModule(modules,path,from,name);
		if(module){
			from.dependencies.add(module);
			return module;
		}
	}
}
function nameToPromise(name:string,from:Module):Promise<any>{
	switch(name){
		case 'require':
			return Promise.resolve(require.bind(from));
		case 'exports':
			return Promise.resolve(from.exports=new Object());
		case 'module':
			return Promise.resolve(from);
	}
	var url:URL=srcToUrl(name,from);
	if(url){
		return urlToPromise(new URL(name,from.src),from);
	}
	//优先查询同脚本同名字模块
	var module=pathToModule(from.src,from,name);
	if(module){
		return moduleToPromise(module,from);
	}
	//根据配置获取URL
	var url=nameToUrl(name,from);
	if(!url){
		var m=cache.get(name);
		if(m && m!==from){//从全局缓存获取同名模块
			from.dependencies.add(m);
			return moduleToPromise(m,from);
		}
		url=new URL(name,baseUrl);
	}
	try{
		return urlToPromise(url,from,name);
	}finally{
		url=null;
	}
}
function urlToPromise(url:URL,from:Module,name?:string):Promise<any>{
	addUrlArgs(url,from,name);
	var i=loadHooks.length;
	while(i-->0){
		var p:Promise<any>=loadHooks[i](url,from,name);
		if(p){
			return p;
		}
	}
	//js模块
	var search=url.search;
	if(!search){
		if(!url.pathname.endsWith(".js")){
			url.pathname+=".js";
		}
	}
	var path=url.origin+url.pathname+url.search;
	url=null;
	var module=pathToModule(path,from,name);
	if(module){
		return moduleToPromise(module,from);
	}
	//未曾加载过js
	var requirements=requirementMap.get(path);
	if(!requirements){
		requirements=new Array();
		requirementMap.set(path,requirements);
		var script:HTMLScriptElement=findScript(path);
		if(script){
			attachEvent(script,'load',handleLast);
		}else{
			script=getScript(path,handleLast);
		}
		if(waitSeconds<=60){
			setRequireTimeout(path);
		}
		script.onerror=handleError;
	}
	var requirement:Requirement=createRequirement(path,from,name);
	requirements.push(requirement);
	return requirement.promise;
}
function setRequireTimeout(path:string){
	var timer=setTimeout(function(){
		var requirements=requirementMap.get(path);
		var i=requirements.length;
		while(i-->0){
			requirements[i].reject({message:"timeout"});
		}
	},waitSeconds*1000);
	timerMap.set(path,timer);
}
function findScript(path:string){
	var scripts:HTMLCollectionOf<HTMLScriptElement>=document.getElementsByTagName("SCRIPT") as any;
	var i=scripts.length;
	while(i-->0){
		var script=scripts[i];
		var src=script.src;
		if(src){
			var url=new URL(src,location as any);
			if(url.origin+url.pathname+url.search==path){
				url=null;
				return script;
			}
		}
	}
}
function createRequirement(path:string,from:Module,name?:string):Requirement{
	var r:Requirement={
		'src':path,
		'name':name,
		'from':from
	};
	r.promise=new Promise(function(resolve,reject){
		r.resolve=function(data:any){
			resolve(data);
		};
		r.reject=function(data:any){
			reject(data);
		};
	})
	return r;
}
function handleLast(){
	var url:URL=this.src?new URL(this.src,location as any):location as any;
	var path=url.origin+url.pathname+url.search;
	url=null;
	var requirements=requirementMap.get(path);
	if(requirements){
		var modules=moduleMap.get(path);
		var i=requirements.length;
		if(modules){
			while(i-->0){
				var requirement=requirements[i];
				var from=requirement.from;
				var module=findModule(modules,requirement.src,from,requirement.name);//包括匿名模块
				if(!module){
					module=findAnonymousModule(modules,requirement.src,from);
					if(!module){
						throw new Error("not found module ["+requirement.name+"] not in js \""+path+"\"");
					}
				}
				from.dependencies.add(module);
				var promise=moduleToPromise(module,from);
				promise.then(requirement.resolve as any,requirement.reject as any);
			}
		}
	}
}
function handleError(){
	var url:URL=this.src?new URL(this.src,location as any):location as any;
	var path=url.origin+url.pathname+url.search;
	var requirements=requirementMap.get(path);
	if(requirements){
		var i=requirements.length;
		while(i-->0){
			var requirement=requirements[i];
			requirement.reject(new Error("Script Error At "+path));
		}
	}
}
function findModule(modules:Module[],path:string,from:Module,name?:string):Module{
	var i:number,module:Module;
	if(!name){
		module=findAnonymousModule(modules,path,from);
		if(module){
			return module;
		}
	}
	var alias=new Array();
	alias.push(name);
	i=nameHooks.length;
	while(i-->0){
		var alia=nameHooks[i](name,from);
		if(alia){
			alias.push(alia);
		}
	}
	i=modules.length;
	while(i-->0){
		module=modules[i];
		if(module===from){
			continue ;
		}
		var modName=module.name;
		if(alias.includes(modName)){
			return module;
		}
	}
}
function findAnonymousModule(modules:Module[],path:string,from:Module):Module{
	var i=modules.length;
	while(i-->0){
		var module=modules[i];
		if(module===from){
			continue ;
		}
		if(!module.name){
			return module;
		}
	}
}
function moduleToPromise(module:Module,from:Module):Promise<any>{
	if(from.deps && from.deps.includes("exports")){
		if(checkCircular(module,from)){
			return Promise.resolve(module.exports);
		}
	}
	switch(module.status){
		case STATUS_COMPLETE:
			return Promise.resolve(module.exports);
		case STATUS_DEFINED:
			module.init();
		default :
			return module.promise;
	}
}


var commentRegExp=/\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg;
var cjsRequireRegExp=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
function commentReplace(match, singlePrefix) {
	return singlePrefix || '';
}
/**
define(data);
define(initor);
define(deps,initor);
define(name,deps,initor);
*/
globalThis.define=function(){
	var arg1=arguments[0];
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
				defineModule(null,deps,arg1);
			}else{
				defineModule(null,null,arg1);
			}
			break;
		case 2:
			defineModule(null,arg1,arguments[1]);
			break;
		case 3:
			var module=defineModule(arg1,arguments[1],arguments[2]);
			cache.set(arg1,module);
	}
};
function defineModule(name:string,deps:string[],initor:Object|Function){
	var url=new URL(getCurrentPath(),location as any);
	var path=url.origin+url.pathname+url.search;
	url=null;
	var module:Module;
	if(typeof initor==="function"){
		if(deps && deps.length){
			module=createModule(path,deps,initor,name);
		}else{
			module=createNoDepsModule(path,initor,name);
		}
	}else{
		module=createJsonModule(path,initor,name);
	}
	var modules=moduleMap.get(path);
	if(!modules){
		modules=new Array();
		moduleMap.set(path,modules);
	}
	modules.push(module);
	return module;
}
function createJsonModule(path:string,exports:Object,name?:string):Module{
	return {
		'name':name,
		'src':path,
		'status':STATUS_DEFINED,
		'require':require,
		'exports':exports,
		'init':initJsonModule,
		'dependencies':new Set()
	};
}
function initJsonModule(this:Module){
	this.promise=Promise.resolve(this.exports);
	this.status=STATUS_COMPLETE;
}
function createNoDepsModule(path:string,initor:Function,name?:string):Module{
	return {
		'name':name,
		'src':path,
		'status':STATUS_DEFINED,
		'require':require,
		'initor':initor,
		'init':initNoDepModule,
		'dependencies':new Set()
	};
}
function initNoDepModule(this:Module){
	var me=this;
	this.promise=new Promise(function(resolve:Function,reject:Function){
		var exports=me.initor();
		if(exports!==undefined){
			me.exports=exports;
		}
		resolveModule(me,resolve,reject);
	});
}
function createModule(path:string,deps:string[],initor:Function,name?:string):Module{
	return {
		'name':name,
		'src':path,
		'deps':deps,
		'status':STATUS_DEFINED,
		'require':require,
		'init':initModule,
		'initor':initor,
		'dependencies':new Set()
	};
}
function initModule(this:Module){
	var me=this;
	this.status=STATUS_DEPENDING;
	this.promise=new Promise(function(resolve:Function,reject:Function){
		me.require(me.deps,function(){
			var exports=me.initor.apply(me,arguments);
			if(exports!==undefined){
				me.exports=exports;
			}
			resolveModule(me,resolve,reject);
		});
	});
}
function resolveModule(module:Module,resolve:Function,reject:Function){
	module.resolve=function(exports:any){
		module.status=STATUS_COMPLETE;
		resolve(exports);
	}
	module.reject=reject;
	var i=resolveHooks.length;
	while(i-->0){
		var r=resolveHooks[i].call(module,module.resolve,module.reject);
		if(r===false){
			return ;
		}
	}
	module.resolve(module.exports);
}
function checkCircular(module:Module,from:Module):boolean{
	var i=module.dependencies.size;
	if(i){
		var dependencies=Array.from<Module>(module.dependencies as any);
		while(i-->0){
			var mod=dependencies[i];
			if(mod===from){
				return true;
			}
			return checkCircular(mod,from);
		}
	}
	return false;
}
define.amd=true;
require.setBaseUrl=function(url:URL){
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
	forOwn(options.paths,function(value,key){
		require.hook({
			path:function(name,from){//返回URL
				if(name==key){
					return new URL(value,baseUrl);
				}else if(name.startsWith(key+"/")){
					return new URL(value+name.substring(key.length,name.length),baseUrl);
				}
			}
		});
	});
	forOwn(options.bundles,function(names,path){
		var pkgs=[];
		names=names.filter(function(name){
			if(name.endsWith("*")){
				pkgs.push(name.substr(0,name.length-1));
				return false;
			}
			return true;
		});
		require.hook({
			path:function(name,from){//返回URL
				if(names.includes(name)){
					return new URL(path,baseUrl);
				}
				var i=pkgs.length;
				while(i-->0){
					if(name.startsWith(pkgs[i])){
						return new URL(path,baseUrl);
					}
				}
			}
		});
	});
	if(options.map){
		require.hook({
			path:function(name,from){
				var fromName=from.name;
				var map=options.map;
				var path;
				if(Object.prototype.hasOwnProperty.call(map,fromName)){
					path=map[fromName];
				}else{
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
			resolve:function(resolve, reject){//返回URL
				if(this.name==key){
					this.config=getConfig;
				}
			}
		});
	});
	var packages=options.packages;
	if(packages) packages.forEach(function(config){
		var main=config.main || "main";
		var name=config.name;
		require.hook({
			name:function(modName,from){
				if(name==modName){
					return name+"/"+main;
				}
			}
		});
		var location=config.location;
		if(!location){
			location=name;
		}
		require.hook({
			path:function(modName,from){
				if(modName==name){
					return new URL(location+"/"+main,baseUrl);
				}else if(modName.startsWith(name+"/")){
					return new URL(location+modName.substring(name.length,modName.length),baseUrl);
				}
			}
		});
	});
	var urlArgs=options.urlArgs;
	if(urlArgs){
		if(typeof urlArgs==="function"){
			require.hook({
				urlArgs:function(url,from,name){
					var search=(urlArgs as any)(name, url.href);
					if(search){
						var params=new URLSearchParams(search);
						params.forEach(function(value,key){
							url.searchParams.append(key,value);
						});
					}
				}
			});
		}else{
			require.hook({
				urlArgs:function(url,from,name){
					var params=new URLSearchParams(urlArgs as any);
					params.forEach(function(value,key){
						url.searchParams.append(key,value);
					});
				}
			});
		}
	}
	forOwn(options.shim,function(mod,name){
		define(name,mod.deps,mod.init?mod.init:function(){
			var paths=mod.exports.split(".");
			var obj=window as any;
			for(var i=0;i<paths.length;i++){
				obj=obj[paths[i]];
			}
			return obj;
		});
	});
};
