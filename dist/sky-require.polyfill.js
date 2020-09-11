(function () {
	'use strict';

	if(!String.prototype.endsWith){
		String.prototype.endsWith=function endsWith(prefix,position){
			var length=prefix.length;
			position=position<length?position:this.length;
			return this.slice(position-length, position) === prefix;
		};
	}

	if(!String.prototype.startsWith){
		String.prototype.startsWith=function startsWith(prefix,position){
			if(prefix===null){ return false;}
			position=position?position:0;
			return this.slice(position, prefix.length) === prefix;
		};
	}

	function isString(obj){
		return Object.prototype.toString.call(obj)==='[object String]';
	}

	function isArrayLike(obj){
		var length=obj.length;
		if(typeof length !="number" || length<0 || isNaN(length) || Math.ceil(length)!=length){
			return false;
		}
		return true;
	}

	if(!Array.from){
		Array.from=function(arrayLike, mapFn, thisArg){
			var arr;
			if((arrayLike instanceof Map )||(arrayLike instanceof Set)){
				if(arrayLike.items){
					arrayLike=arrayLike.items;
				}
			}
			if(isString(arrayLike)){
				arr=new Array();
				for(var i=0;i<arrayLike.length;i++){
					arr.push(arrayLike.charAt(i));
				}
			}else if(isArrayLike(arrayLike)){
				try{
					arr=Array.prototype.slice.call(arrayLike);
				}catch(e){
					arr=new Array();
					for(var i=0;i<arrayLike.length;i++){
						arr.push(arrayLike[i]);
					}
				}
			}else {
				arr=new Array();
				var entries=arrayLike[Symbol.iterator];
				if(entries){
					var it=entries.call(arrayLike);
					while(true){
						var next=it.next();
						if(next.done) break ;
						arr.push(next.value);
					}
				}
			}
			if(mapFn){
				arr=arr.map( mapFn, thisArg);
			}
			return arr;
		};
	}

	if(!Function.prototype.bind){
		Function.prototype.bind=function(context){
			var self=this,args=Array.prototype.slice.call(arguments,1);
			return function(){
				return self.apply(context,args.concat(Array.from(arguments)));
			};
		};
	}

	if(!Array.prototype.indexOf){
		Array.prototype.indexOf=function(e,fromIndex){
			fromIndex=isNaN(fromIndex)?0:fromIndex;
			for(var i=fromIndex,j;i<this.length; i++){
				j=this[i];
				if(j===e){return i;}
			}
			return -1;
		};
	}

	if(!Array.prototype.includes){
		Array.prototype.includes=function(search,start){
			return this.indexOf(search, start)!==-1;
		};
	}

	if(typeof globalThis==="undefined"){
		window.globalThis=window;
	}

	if(!globalThis.Symbol){
		globalThis.Symbol=(function(){
			var sqe=0;
			var all={};
			function Symbol(desc){
				this.__name__="@@"+desc+":"+sqe;
				sqe++;
				all[this.__name__]=this;
			}
			Symbol.prototype.toString=function(){
				return this.__name__;
			};
			Object.getOwnPropertySymbols=function(obj){
				var arr=[];
				for(var key in obj){
					if(key.startsWith("@@")){
						if(Object.prototype.hasOwnProperty.call(obj,key)){
							arr.push(all[key]);
						}
					}
				}
				return arr;
			};
			return function(desc){
				return new Symbol(desc);
			};
		})();
		Symbol.sham=true;
		Symbol.iterator="@@iterator";
	}

	if(!Symbol.iterator){
		Symbol.iterator=Symbol("iterator");
	}

	function Iterator(arr){
		this.array=arr;
		this.i=0;
	}
	Iterator.prototype.next=function(){
		var result={};
		result.done=this.array.length<=this.i;
		if(!result.done){
			result.value=this.array[this.i];
			this.i++;
		}
		return result;
	};
	if(!Array.prototype.entries){
		Array.prototype.entries=function(){
			return new Iterator(this);
		};
	}
	if(!Array.prototype[Symbol.iterator]){
		Array.prototype[Symbol.iterator]=Array.prototype.entries;
	}

	var dontEnums=["toString","toLocaleString","valueOf","hasOwnProperty", "isPrototypeOf","propertyIsEnumerable"];
	function hasOwn(obj,key){
		if(typeof obj!=="object"){
			return false;
		}
		if(!(key in obj)){
			return false;
		}
		var value=obj[key];
		if(!(obj instanceof Object)){
			var constructor=obj.constructor;
			if(constructor){
				var proto=constructor.prototype;
				return proto[key]!==value;
			}
		}
		return Object.prototype.hasOwnProperty.call(obj,key);
	}
	function compat_keys$1(obj){
		var result=[],key;
		var isJsObject=obj instanceof Object;
		if(!isJsObject){
			var proto=Object.getPrototypeOf(obj);
			if(proto){
				for(key in obj){
					if(!key.startsWith("@@") && !key.startsWith("__") && proto[key]!==obj[key]){
						result.push(key);
					}
				}
				return result;
			}
		}
		for(key in obj){
			if(Object.prototype.hasOwnProperty.call(obj,key) && !key.startsWith("@@") && !key.startsWith("__")){
				result.push(key);
			}
		}
		var i=dontEnums.length;
		while(i-->0){
			key=dontEnums[i];
			if(hasOwn(obj,key)){
				result.push(key);
			}
		}
		return result;
	}

	var native_keys=Object.keys;
	function nie_keys(obj){
		return native_keys.call(Object,obj).filter(checkSymbolKey);
	}function checkSymbolKey(key){
		return !key.startsWith("@@");
	}
	function ie_keys(obj){
		var result=[];
		for(var key in obj){
			if(!key.startsWith("@@") && Object.prototype.hasOwnProperty.call(obj,key)){
				result.push(key);
			}
		}
		return result;
	}

	var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');

	if(!Object.keys){
		if(hasEnumBug){
			Object.keys=compat_keys$1;
		}else {
			Object.keys=ie_keys;
		}
	}else if(globalThis.Symbol && Symbol.sham){
		Object.keys=nie_keys;
	}

	if(!Object.assign){
		Object.assign=function(target, varArgs){
			if(target===null){
				throw 'Cannot convert undefined or null to object';
			}
			var to=target;
			for(var i=1;i<arguments.length;i++){
				var obj=arguments[i];
				if(obj!=null){
					var keys=Object.keys(obj);
					for(var j=0;j<keys.length;j++){
						var key=keys[j];
						to[key]=obj[key];
					}
				}
			}
			return target;
		};
	}

	function compat_createObject(proto){
		function F(){}
		F.prototype = proto;
		return new F();
	}function compat_getPrototypeOf(obj){
		if(typeof obj!=="object"){
			obj=Object(obj);
		}
		if(!('constructor' in obj)){
			return null;
		}
		if(Object.prototype.hasOwnProperty.call(obj,'constructor')){
			if('__proto__' in obj.constructor){
				return obj.constructor.__proto__.prototype;
			}
		}
		return obj.constructor.prototype;
	}

	function modern_createObject(proto){
		function F(){}
		F.prototype = proto;
		return new F();
	}function modern_getPrototypeOf(object){
		return object.__proto__;
	}function modern_setPrototypeOf(obj,proto){
		obj.__proto__=proto;
		return obj; 
	}

	if(!Object.getPrototypeOf){
		if('__proto__' in Object.prototype){
			Object.getPrototypeOf=modern_getPrototypeOf;
		}else {
			Object.getPrototypeOf=compat_getPrototypeOf;
		}
	}

	if(!Object.setPrototypeOf){
		if('__proto__' in Object.prototype){
			Object.setPrototypeOf=modern_setPrototypeOf;
		}
	}

	function modern_defineProperty(obj, prop, descriptor){
		if('value' in descriptor){
			delete obj[prop];
			obj[prop]=descriptor.value;
		}else {
			if(descriptor.get) obj.__defineGetter__(prop,descriptor.get);
			if(descriptor.set) obj.__defineSetter__(prop,descriptor.set);
		}
	}function modern_getOwnPropertyDescriptor(obj,key){
		if(Object.prototype.hasOwnProperty.call(obj,key)){
			var r={
				enumerable:true,
				configurable:true
			};
			r.set=obj.__lookupSetter__(key);
			r.get=obj.__lookupGetter__(key);
			return r;
		}
	}

	var DESC_KEY=Symbol("descriptor");
	function compat_defineProperty(obj, prop, descriptor){
		if('value' in descriptor){
			obj[prop]=descriptor.value;
		}else {
			console.warn("ES3 do NOT support accessor.");
		}
		if(!obj[DESC_KEY]){
			obj[DESC_KEY]=new Object();
		}
		obj[DESC_KEY][prop]=descriptor;
	}
	var native_defineProperty=Object.defineProperty;
	function ie8_defineProperty(obj, prop, descriptor){
		if(obj instanceof Object){
			compat_defineProperty.apply(Object,arguments);
		}else {
			delete descriptor.enumerable;
			native_defineProperty.apply(Object,arguments);
		}
	}function compat_getOwnPropertyDescriptor(obj,prop){
		var descriptor=obj[DESC_KEY];
		if(descriptor) return descriptor[prop];
		if(prop in obj){
			return {value: obj[prop], writable: true, enumerable: true, configurable: true};
		}
	}

	if(!Object.defineProperty) {
		if(Object.prototype.__defineSetter__){
			Object.defineProperty=modern_defineProperty;
		}else {
			Object.defineProperty=compat_defineProperty;
		}
	}else if(!Object.defineProperties){
		Object.defineProperty=ie8_defineProperty;
	}

	if(!Object.getOwnPropertyDescriptor){
		if(Object.prototype.__defineSetter__){
			Object.getOwnPropertyDescriptor=modern_getOwnPropertyDescriptor;
		}else {
			Object.getOwnPropertyDescriptor=compat_getOwnPropertyDescriptor;
		}
	}

	if(!Object.create){
		if('__proto__' in Object.prototype){
			Object.create=modern_createObject;
		}else {
			Object.create=compat_createObject;
		}
	}

	function ES6Iterator(it){
		this.iterator=it;
	}
	ES6Iterator.prototype.next=function(){
		var r={};
		try{
			r.value=this.iterator.next();
			r.done=false;
		}catch(e){
			r.done=true;
		}
		return r;
	};
	ES6Iterator.prototype[Symbol.iterator]=function(){
		return this;
	};
	function toES6Iterator(it){
		return new ES6Iterator(it);
	}

	function fixMap(){
		var GMap=globalThis.Map;
		globalThis.Map=function(args){
			var map=new GMap(args);
			Object.setPrototypeOf(map,Object.getPrototypeOf(this));
			if(args && map.size===0){
				args=Array.from(args);
				args.forEach(setEach,map);
			}
			return map;
		};
		function setEach(item){
			GMap.prototype.set.apply(this,item);
		}
		Map.prototype=Object.create(GMap.prototype);
		if(!Object.getOwnPropertyDescriptor(GMap.prototype,'size') && typeof GMap.prototype.size==="function"){
			Object.defineProperty(Map.prototype,'size',{
				get:function(){
					return GMap.prototype.size.call(this);
				},
				enumerable:true
			});
		}
		var testMap=new GMap();
		if(testMap!==testMap.set(1,1)){
			Map.prototype.set=function(key,value){
				GMap.prototype.set.call(this,key,value);
				return this;
			};
		}
		if(Map.prototype.iterator){
			if(!Map.prototype[Symbol.iterator]){
				Map.prototype[Symbol.iterator]=function(){
					return toES6Iterator(this.iterator());
				};
			}
			if(!Map.prototype.forEach){
				Map.prototype.forEach=function(callbackfn,thisArg){
					var it=this.iterator();
					while(true){
						try{
							var next=it.next();
						}catch(e){
							break ;
						}
						callbackfn.call(thisArg,next[1],next[0],this);
					}
				};
			}
		}
		if(!Map.prototype[Symbol.iterator]){
			if(Map.prototype.forEach){
				Map.prototype[Symbol.iterator]=function(){
					var arr=[];
					this.forEach(pushEach,arr);
					return arr.entries();
				};
			}
		}
		function pushEach(value,key){
			this.push([key,value]);
		}
	}

	function find(arr,key,value){
		for(var i=0; i<arr.length; i++){
			if(arr[i][key]===value){return arr[i];}
		}
	}

	function findIndex(arr,key,value){
		for(var i=0; i<arr.length; i++){
			if(arr[i][key]===value){return i;}
		}
		return -1;
	}

	function createMap(){
		globalThis.Map=function(arr){
			this.items=new Array();
			if(arr){
				var entries=arr[Symbol.iterator];
				if(entries){
					var it=entries.call(arr);
					while(true){
						var next=it.next();
						if(next.done) break ;
						this.set(next.value[0],next.value[1]);
					}
				}
			}
			this.size=this.items.length;
		};
		Map.prototype.entries=function(){
			return this.items.entries();
		};
		Map.prototype.clear=function(){
			this.items.splice(0,this.items.length);
			this.size=0;
		};
		Map.prototype["delete"]=function(key){
			var i=findIndex(this.items,0,key);
			if(i>=0){
				var r=this.items[i];
				this.items.splice(i,1);
				this.size=this.items.length;
				return r;
			}
			return false;
		};
		Map.prototype.forEach=function(callbackfn,thisArg){
			var len=this.size;
			for(var i=0,j;i<len; i++){
				j=this.items[i];
				if(j){
					callbackfn.call(thisArg,j[1],j[0],this);
				}
			}
		};
		Map.prototype.get=function(key){
			var r=find(this.items,0,key);
			if(r){
				return r[1];
			}
		};
		Map.prototype.has=function(key){
			return findIndex(this.items,0,key)>=0;
		};
		Map.prototype.set=function(key,value){
			var r=find(this.items,0,key);
			if(r){
				r[1]=value;
			}else {
				this.items.push([key,value]);
			}
			this.size=this.items.length;
			return this;
		};
		Map.prototype[Symbol.iterator]=Map.prototype.entries;
	}

	if(globalThis.Map){
		fixMap();
		if(!Map.prototype[Symbol.iterator]){
			createMap();
		}
	}else {
		createMap();
	}

	if(!Array.isArray){
		Array.isArray=function(obj){
			return Object.prototype.toString.call(obj)==='[object Array]';
		};
	}

	if(!Array.prototype.forEach){
		Array.prototype.forEach =function(callback, thisArg){
			var len=this.length;
			for(var i=0,j;i<len && i<this.length; i++){
				j=this[i];
				callback.call(thisArg,j,i,this);
			}
		};
	}

	if(!globalThis.queueMicrotask){
		globalThis.queueMicrotask=(function(setTimeout){
			var ticks=null;
			function nextTick(fn){
				if(!ticks){
					ticks=new Array();
					setTimeout(next);
				}
				ticks.push(fn);
			}		function next(){
				if(ticks && ticks.length){
					for(var i=0;i<ticks.length;i++){
						var fn=ticks[i];
						try{
							fn();
						}catch(e){
							console.error(e);
						}
					}
					ticks=null;
				}
			}
			return nextTick;
		})(window.Promise?Promise.prototype.then.bind(Promise.resolve(1)):(window.setImmediate?window.setImmediate:setTimeout));
	}

	function noop(){}

	var PENDING=Symbol("pending");
	var RESOLVED=Symbol("resolved");
	var REJECTED=Symbol("rejected");
	if(!globalThis.Promise){
		globalThis.Promise=(function(){
			function Promise(executor){
				this._resolveds=[];
				this._rejecteds=[];
				this._state=PENDING;//resolved | rejected
				
				var me=this;
				function resolve(value) {
					queueMicrotask(function(){
						if(me._state===PENDING){
							me.data=value;
							me._state=RESOLVED;
							me._resolveds.forEach(callAll,me);
							me._resolveds=null;
						}
					});
				}
				function reject(reason) {
					queueMicrotask(function(){
						if(me._state===PENDING){
							me.data=reason;
							me._state=REJECTED;
							me._rejecteds.forEach(callAll,me);
							me._rejecteds=null;
						}
					});
				}
				try{
					executor(resolve, reject);
				}catch(e){
					reject(e);
				}
			}
			function callAll(fn){
				fn.call(this,this.data);
			}
			function nextPromise(before,after,resolve,reject){
				return function(value){
					try{
						var x=before(value);
						if(x && (typeof x.then==="function")){
							x.then(resolve, reject);
						}else {
							after(x);
						}
					}catch(r){
						reject(r);
					}
				};
			}
			Promise.prototype.then=function(onResolved, onRejected){
				var me=this;
				onResolved=onResolved || noop;
				onRejected=onRejected || noop;
				return new Promise(function(resolve,reject){
					switch(me._state){
						case RESOLVED:
							queueMicrotask(nextPromise(onResolved,resolve,resolve,reject),me.data);
							break ;
						case REJECTED:
							queueMicrotask(nextPromise(onRejected,reject,resolve,reject),me.data);
							break ;
						default:
							me._resolveds.push(nextPromise(onResolved,resolve,resolve,reject));
							me._rejecteds.push(nextPromise(onRejected,reject,resolve,reject));
					}
				});
			};
			Promise.prototype['catch']=function(onRejected){
				return this.then(undefined,onRejected);
			};
			Promise.all=function(promises){
				if (!Array.isArray(promises)) {
					throw new TypeError('You must pass an array to all.');
				}
				return new Promise(function(resolve,reject){
					if(promises.length==0) return resolve(new Array());
					var result=new Array(promises.length);
					var c=0;
					promises.forEach(function(one,index){
						if(typeof one.then==="function"){
							one.then(function(data){
								c++;
								result[index]=data;
								if(c>=promises.length){
									resolve(result);
								}
							},function(data){
								reject(data);
							});
						}else {
							c++;
							result[index]=one;
							if(c>=promises.length){
								resolve(result);
							}
						}
					});
				});
			};
			Promise.race=function(promises){
				if (!Array.isArray(promises)) {
					throw new TypeError('You must pass an array to all.');
				}
				return new Promise(function(resolve,reject){
					promises.forEach(function(one){
						one.then(function(){
							resolve();
						},function(){
							reject();
						});
					});
				});
			};
			Promise.resolve=function(arg){
				return new Promise(function(resolve,reject){
					resolve(arg);
				});
			};
			Promise.reject=function(arg){
				return Promise(function(resolve,reject){
					reject(arg);
				});
			};
			return Promise;
		})();
	}

	if(!Array.prototype.map){
		Array.prototype.map = function(fn, context) {
			var arr = [];
			for (var k = 0, length = this.length; k < length; k++) {
				arr.push(fn.call(context, this[k], k, this));
			}
			return arr;
		};
	}

	if(!Array.prototype.findIndex){
		Array.prototype.findIndex = function(callback, thisArg) {
			for(var i=0,j; i<this.length; i++){
				j=this[i];
				var r=callback.call(thisArg,j,i,this);
				if(r){
					return i;
				}
			}
			return -1;
		};
	}

	if(!Array.prototype.find){
		Array.prototype.find = function(callback, thisArg) {
			var i=this.findIndex(callback, thisArg);
			if(i>=0){
				return this[i];
			}
		};
	}

	if(!Array.prototype.filter){
		Array.prototype.filter = function(fn, context) {
			var arr = [];
			for (var k = 0, length = this.length; k < length; k++) {
				fn.call(context, this[k], k, this) && arr.push(this[k]);
			}
			return arr;
		};
	}

	if(!Array.prototype.some){
		Array.prototype.some = function(fn, context) {
			var passed = false;
			for (var k = 0, length = this.length; k < length; k++) {
				if (passed === true) break;
				passed = !!fn.call(context, this[k], k, this);
			}
			return passed;
		};
	}

	if(!globalThis.URLSearchParams){
		globalThis.URLSearchParams=function(paramsString){
			this._data=new Array();
			if(paramsString){
				var i,pair;
				if(Array.isArray(paramsString)){
					i=this._data.length=paramsString.length;
					while(i-->0){
						pair=paramsString[i];
						this._data[i]=new Array(pairs[1],pairs[0]);
					}
				}else {
					var pairs=paramsString.split("&");
					i=this._data.length=pairs.length;
					while(i-->0){
						pair=pairs[i];
						if(pair){
							var id=pair.indexOf("=");
							this._data[i]=new Array(decodeURIComponent(pair.substring(id+1,pair.length)),decodeURIComponent(pair.substring(0,id)));
						}
					}
				}
			}
		};
		URLSearchParams.prototype.append=function(key,value){
			this._data.push([value,key]);
		};
		URLSearchParams.prototype.get=function(key){
			var item=this._data.find(function(item){
				return item[1]==key;
			});
			if(item) return item[0];
			return null;
		};
		URLSearchParams.prototype.getAll=function(key){
			return this._data.filter(function(item){
				return item[1]==key;
			}).map(function(item){
				return item[0];
			});
		};
		URLSearchParams.prototype.set=function(key,value){
			var item=this._data.find(function(item){
				return item[1]==key;
			});
			if(item){
				item[0]=value;
			}else {
				this.append(key,value);
			}
		};
		URLSearchParams.prototype['delete']=function(key){
			this._data=this._data.filter(function(item){
				return item[1]!=key;
			});
		};
		URLSearchParams.prototype.has=function(key){
			return this._data.some(function(item){
				return item[1]==key;
			});
		};
		URLSearchParams.prototype.toString=function(){
			return this._data.map(function(item){
				return encodeURIComponent(item[1])+"="+encodeURIComponent(item[0]);
			}).join("&");
		};
		URLSearchParams.prototype.sort=function(){
			return this._data.sort(function(a,b){
				return a[1] > b[1];
			});
		};
		URLSearchParams.prototype.forEach=function(fn,thisArg){
			this._data.forEach.apply(this._data,arguments);
		};
	}

	function SearchParams(url){
		this.url=url;
	}SearchParams.prototype=Object.create(URLSearchParams.prototype);
	["append","set","delete"].forEach(function(method){
		SearchParams.prototype[method]=function(key,value){
			var searchParams=new URLSearchParams(this.url.search.replace(/^\?/,""));
			searchParams[method].apply(searchParams,arguments);
			this.url.search="?"+searchParams.toString();
		};
	});
	["getAll","get","has","toString","forEach"].forEach(function(method){
		SearchParams.prototype[method]=function(key,value){
			var searchParams=new URLSearchParams(this.url.search.replace(/^\?/,""));
			return searchParams[method].apply(searchParams,arguments);
		};
	});

	if(-[1,]){
		var url=null;
		try{
			url=new URL(location.href);
		}catch(e){
		}
		var properties={
			host:{
				enumerable:true,
				get:function(){
					if(this.port){
						return this.hostname+":"+this.port;
					}
					return this.hostname;
				},
				set:function(value){
					var pattern=/(.*):(\d+)$/;
					var arr=value.match(pattern);
					this.port="";
					if(arr){
						this.hostname=arr[1];
						this.port=arr[2];
					}else {
						this.hostname=value;
					}
				}
			},
			origin:{
				enumerable:true,
				get:function(){
					return this.protocol+"//"+this.host;
				}
			},
			href:{
				enumerable:true,
				get:function(){
					var user=this.username;
					if(user){
						if(this.password){
							user+=":"+this.password;
						}
						user+="@";
					}
					return this.protocol+"//"+user+this.host+this.pathname+this.search+this.hash;
				},
				set:function(value){
					var url=new URL(value);
					this.protocol=url.protocol;
					this.hostname=url.hostname;
					this.pathname=url.pathname;
					this.port=url.port;
					this.search=url.search;
					this.hash=url.hash;
					this.username=url.username;
					this.password=url.password;
				}
			}
		};
		if(!url || !('href' in url)){
			globalThis.URL=function(relativePath, absolutePath){
				var path,arr;
				this.port=this.search=this.hash=this.username=this.password="";
				this.searchParams=new SearchParams(this);
				var pattern=/^[a-zA-Z]+:/;
				if(arr=relativePath.match(pattern)){
					this.protocol=arr[0];
					path=relativePath.replace(pattern,"");
					pattern=/^\/*([^\/]+)/;
					var host=path.match(pattern)[1];
					path=path.replace(pattern,"");
					arr=host.split("@");
					if(arr.length>1){
						this.host=arr[1];
						arr=arr[0].split(":");
						if(arr.length>1){
							this.username=arr[0];
							this.password=arr[1];
						}else {
							this.username=arr[0];
						}
					}else {
						this.host=host;
					}
				}else if(absolutePath){
					var absInfo=absolutePath.indexOf?new URL(absolutePath):absolutePath;
					this.protocol=absInfo.protocol;
					this.hostname=absInfo.hostname;
					this.port=absInfo.port;
					if(absInfo.username) this.username=absInfo.username;
					if(absInfo.password) this.password=absInfo.password;
					this.pathname=absInfo.pathname;
					if(relativePath.startsWith("#")){
						this.search=absInfo.search;
						this.hash=relativePath;
						return this;
					}else if(relativePath.startsWith("?")){
						var a=relativePath.indexOf("#");
						if(a<0){
							this.search=relativePath;
							this.hash="";
						}else {
							this.search=relativePath.substr(0,a);
							this.hash=relativePath.substring(a,relativePath.length);
						}
						return this;
					}else if(relativePath.startsWith("/")){
						path=relativePath;
					}else if(relativePath.startsWith("../")){
						path=absInfo.pathname.replace(/\/[^\/]*$/,"/")+relativePath;
						pattern=/[^\/]+\/\.\.\//;
						while(pattern.test(path)){
							path=path.replace(pattern,"");
						}
						path=path.replace(/^(\/\.\.)+/,"");
					}else {
						path=absInfo.pathname.replace(/[^\/]*$/,"")+relativePath.replace(/^\.\//,"");
					}
				}else {
					throw "SYNTAX_ERROR";
				}
				pattern=/^[^#]*/;
				this.hash=path.replace(pattern,"");
				arr=path.match(pattern);
				path=arr[0];
				pattern=/^[^\?]*/;
				this.search=path.replace(pattern,"");
				arr=path.match(pattern);
				this.pathname=arr[0];
				return this;
			};
			Object.defineProperties(URL.prototype,properties);
		}else {
			if(!('origin' in url)){
				Object.defineProperty(URL.prototype,"origin",properties.origin);
			}
			if(!('searchParams' in url)){
				Object.defineProperty(URL.prototype,"searchParams",{
					enumerable:true,configurable:true,
					get:function(){
						var searchParams=new SearchParams(this);
						Object.defineProperty(this,"searchParams",{
							enumerable:true,
							value:searchParams
						});
						return searchParams;
					}
				});
			}
		}
	}

	if(!-[1,]){
		window.VBURLDescs={
			host:{
				enumerable:true,
				get:function(){
					if(this.port){
						return this.hostname+":"+this.port;
					}
					return this.hostname;
				},
				set:function(value){
					var pattern=/(.*):(\d+)$/;
					var arr=value.match(pattern);
					this.port="";
					if(arr){
						this.hostname=arr[1];
						this.port=arr[2];
					}else {
						this.hostname=value;
					}
				}
			},
			origin:{
				enumerable:true,
				get:function(){
					return this.protocol+"//"+this.host;
				}
			},
			href:{
				enumerable:true,
				get:function(){
					var user=this.username;
					if(user){
						if(this.password){
							user+=":"+this.password;
						}
						user+="@";
					}
					return this.protocol+"//"+user+this.host+this.pathname+this.search+this.hash;
				},
				set:function(value){
					var url=new URL(value);
					this.protocol=url.protocol;
					this.hostname=url.hostname;
					this.pathname=url.pathname;
					this.port=url.port;
					this.search=url.search;
					this.hash=url.hash;
					this.username=url.username;
					this.password=url.password;
					url=null;
				}
			}
		};
		window.URL=function(relativePath, absolutePath){
			var path,arr;
			this.port=this.search=this.hash=this.username=this.password="";
			this.searchParams=new SearchParams(this);
			var pattern=/^[a-zA-Z]+:/;
			if(arr=relativePath.match(pattern)){
				this.protocol=arr[0];
				path=relativePath.replace(pattern,"");
				pattern=/^\/*([^\/]+)/;
				var host=path.match(pattern)[1];
				path=path.replace(pattern,"");
				arr=host.split("@");
				if(arr.length>1){
					this.host=arr[1];
					arr=arr[0].split(":");
					if(arr.length>1){
						this.username=arr[0];
						this.password=arr[1];
					}else {
						this.username=arr[0];
					}
				}else {
					this.host=host;
				}
			}else if(absolutePath){
				var absInfo=absolutePath.indexOf?new URL(absolutePath):absolutePath;
				this.protocol=absInfo.protocol;
				this.hostname=absInfo.hostname;
				this.port=absInfo.port;
				if(absInfo.username) this.username=absInfo.username;
				if(absInfo.password) this.password=absInfo.password;
				this.pathname=absInfo.pathname;
				if(relativePath.startsWith("#")){
					this.search=absInfo.search;
					this.hash=relativePath;
					return VBUrlFactory(this);
				}else if(relativePath.startsWith("?")){
					var a=relativePath.indexOf("#");
					if(a<0){
						this.search=relativePath;
						this.hash="";
					}else {
						this.search=relativePath.substr(0,a);
						this.hash=relativePath.substring(a,relativePath.length);
					}
					return VBUrlFactory(this);
				}else if(relativePath.startsWith("/")){
					path=relativePath;
				}else if(relativePath.startsWith("../")){
					path=absInfo.pathname.replace(/\/[^\/]*$/,"/")+relativePath;
					pattern=/[^\/]+\/\.\.\//;
					while(pattern.test(path)){
						path=path.replace(pattern,"");
					}
					path=path.replace(/^(\/\.\.)+/,"");
				}else {
					path=absInfo.pathname.replace(/[^\/]*$/,"")+relativePath.replace(/^\.\//,"");
				}
				absInfo=null;
			}else {
				throw "SYNTAX_ERROR";
			}
			pattern=/^[^#]*/;
			this.hash=path.replace(pattern,"");
			arr=path.match(pattern);
			path=arr[0];
			pattern=/^[^\?]*/;
			this.search=path.replace(pattern,"");
			arr=path.match(pattern);
			this.pathname=arr[0];
			return VBUrlFactory(this);
		};
		try{
			window.execScript([
				'Class VBURL',
				'	Public [constructor]',
				'	Public [protocol]',
				'	Public [hostname]',
				'	Public [pathname]',
				'	Public [port]',
				'	Public [search]',
				'	Public [searchParams]',
				'	Public [hash]',
				'	Public [username]',
				'	Public [password]',
				'	Public Property Let [host](var)',
				'		Call VBURLDescs.host.set.call(Me,var)',
				'	End Property',
				'	Public Property Get [host]',
				'		[host]=VBURLDescs.host.get.call(Me)',
				'	End Property',
				'	Public Property Get [origin]',
				'		[origin]=VBURLDescs.origin.get.call(Me)',
				'	End Property',
				'	Public Property Let [href](var)',
				'		Call VBURLDescs.href.set.call(Me,var)',
				'	End Property',
				'	Public Property Get [href]',
				'		[href]=VBURLDescs.href.get.call(Me)',
				'	End Property',
				'End Class',
				'Function VBUrlFactory(url)',
				'	Dim o',
				'	Set o = New VBURL',
				'	Call Object.assign(o,url)',
				'	Set o.searchParams.url = o',
				'	Set o.constructor = URL',
				'	Set VBUrlFactory = o',
				'End Function'
			].join('\n'), 'VBScript');
		}catch(e){
			window.VBUrlFactory=function(url){
				if(url.host){
					VBURLDescs.host.set.call(url,url.host);
				}else {
					url.host=VBURLDescs.host.get.call(url);
				}
				url.href=VBURLDescs.href.get.call(url);
				url.origin=VBURLDescs.origin.get.call(url);
				return url;
			};
		}
		window.URL=URL;
	}

	var div=document.createElement('div');

	function fixSet(){
		var GSet=globalThis.Set;
		globalThis.Set=function(args){
			var set=new GSet(args);
			Object.setPrototypeOf(set,Object.getPrototypeOf(this));
			if(args && set.size===0){
				args=Array.from(args);
				args.forEach(GSet.prototype.add,set);
			}
			return set;
		};
		Set.prototype=Object.create(GSet.prototype);	if(!Object.getOwnPropertyDescriptor(GSet.prototype,'size') && typeof GSet.prototype.size==="function"){
			Object.defineProperty(Set.prototype,'size',{
				get:function(){
					return GSet.prototype.size.call(this);
				},
				enumerable:true
			});
		}
		var m=new GSet();
		if(m!==m.add(1)){
			Set.prototype.add=function(value){
				GSet.prototype.add.call(this,value);
				return this;
			};
		}
		if(Set.prototype.iterator){
			if(!Set.prototype[Symbol.iterator]){
				Set.prototype[Symbol.iterator]=function(){
					return toES6Iterator(this.iterator());
				};
			}
			if(!Set.prototype.forEach){
				Set.prototype.forEach=function(callbackfn,thisArg){
					var it=this.iterator();
					while(true){
						try{
							var next=it.next();
						}catch(e){
							break ;
						}
						callbackfn.call(thisArg,next,next,this);
					}
				};
			}
		}
		if(!Set.prototype[Symbol.iterator]){
			if(Set.prototype.forEach){
				Set.prototype[Symbol.iterator]=function(){
					var arr=[];
					this.forEach(pushEach,arr);
					return arr.entries();
				};
			}
		}
		function pushEach(value){
			this.push(value);
		}
	}

	function createSet(){
		globalThis.Set=function(arr){
			this.items=new Array();
			if(arr){
				var entries=arr[Symbol.iterator];
				if(entries){
					var it=entries.call(arr);
					while(true){
						var next=it.next();
						if(next.done) break ;
						this.add(next.value);
					}
				}
			}
			this.size=this.items.length;
		};
		Set.prototype.has=function(value){
			return this.items.indexOf(value)>=0;
		};
		Set.prototype.add=function(value){
			if(!this.has(value)){
				this.items.push(value);
				this.size=this.items.length;
			}
			return this;
		};
		Set.prototype['delete']=function(value){
			var i=this.items.indexOf(value);
			if(i>=0){
				this.items.splice(i,1);
				this.size=this.items.length;
				return true;
			}
			return false;
		};
		Set.prototype.clear=function(){
			this.items.splice(0,this.items.length);
			this.size=0;
		};
		Set.prototype.forEach=function(callback,thisArg){
			for(var i=0,j;i<this.size; i++){
				j=this.items[i];
				callback.call(thisArg,j,j,this);
			}
		};
		Set.prototype.values=function(){
			return this.items.entries();
		};
		Set.prototype[Symbol.iterator]=Set.prototype.values;
	}

	if(globalThis.Set){
		fixSet();
		if(!Set.prototype[Symbol.iterator]){
			createSet();
		}
	}else {
		createSet();
	}

	function forOwn(obj,fn,thisArg){
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

	if(!globalThis.Symbol || !Symbol.sham){
		if(hasEnumBug){
			Object.keys=compat_keys;
		}
	}

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
			var url=new URL(getCurrentPath().src,location);
			try{
				return url.href;
			}finally{
				url=null;
			}
		};
	}
	var getCurrentScript$1;
	var getCurrentPath;

	if(!document.scripts){
		document.scripts=document.scripts=document.getElementsByTagName("script");
	}

	function getScript(src,func,charset){
		var script=document.createElement('script');
		script.charset=charset || "UTF-8";
		script.src=src;
		script.async=true;
		if(func){
			var event='onreadystatechange';
			script.attachEvent(event,function(){
				if(script.readyState==='loaded'){
					document.head.appendChild(script);
				}else if(script.readyState==='complete'){
					script.detachEvent(event,arguments.callee);
					var evt=window.event;
					func.call(script,evt);
				}
			});
		}else {
			document.head.appendChild(script);
		}
		try{
			return script;
		}finally{
			script=null;
		}
	}

	function getScript$1(src,func,charset){
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

	var getScript$2=("onload" in document.scripts[document.scripts.length-1])?getScript$1:getScript;

	var commentRegExp=/\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg;
	var cjsRequireRegExp=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
	var STATUS={
		INITED:0,//初始化
		LOADING:1,//正在加载script
		DEFINED:2,//已定义
		DEPENDING:3,//正在加载依赖
		COMPLETE:4//完成
	};
	var libs=new Map();
	var cache=new Map();
	var config=new Map();

	var paths=new Map();
	var map=new Map();
	var baseUrl=new URL(getCurrentPath(),location);
	var urlArgs="";
	var pkgs=[];
	var rules=[];
	var hooks=[];
	var shim={};
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
				var i=hooks.length;
				while(i-->0){
					var hook=hooks[i];
					var r=hook.call(this,pluginResolve,reject);
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
						var module;
						var arr=dep.split("!");
						if(arr.length==2){
							module=nameToModule(arr[0],from);
							promises[i]=module.promise.then(function(plugin){
								return new Promise(function(resolve, reject){
									plugin.load(arr[0], require.bind(module), resolve);
								});
							});
						}else {
							module=nameToModule(dep,from);
							promises[i]=module.promise;
						}
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
		var pkg=checkPkgs(name);
		if(pkg){
			url=new URL(pkg,baseUrl);
		}else {
			//根据配置获取
			url=nameToURL(name,from);
			if(!url){
				url=new URL(name,baseUrl);
			}
		}
		return urlToModule(name,url);
	}
	function urlToModule(name,url){
		var module;
		//TODO 非js模块
		//js模块
		if(!url.search){
			if(!url.pathname.endsWith(".js")){
				url.pathname+=".js";
			}
			if(urlArgs){
				url.search+="?"+urlArgs;
			}
		}else {
			if(urlArgs){
				url.search+="&"+urlArgs;
			}
		}
		var path=url.origin+url.pathname+url.search;
		var script=libs.get(path);
		if(script){//已经加载了js
			var lib=script.modules;
			if(lib.length==1){//匿名模块文件
				return lib[0];
			}
			module=lib.find(findName,name);
			if(module){
				cache.set(name,module);
				return module;
			}else {
				var requires=script.requires;
				if(requires){
					module=requires.find(findName,name);
					if(module){
						return module;
					}
					module=lib.find(findNoName,name);
					if(module){
						return module;
					}
					module=new Module(name);
					cache.set(name,module);
					module.src=path;
					module.script=script;
					module.status=STATUS.LOADING;
					requires.push(module);
					return module;
				}
				throw new Error("module ["+name+"] not in js \""+path+"\"");
			}
		}else {//未加载js
			module=new Module(name);
			cache.set(name,module);
			module.src=path;
			return module;
		}
	}
	function checkPkgs(name){
		var i=pkgs.length;
		while(i-->0){
			var pkg=pkgs[i];
			if(pkg==name){
				return pkg;
			}
			if(name.startsWith(pkg+"/")){
				return pkg;
			}
		}
		return false;
	}
	function nameToURL(name,from){
		var i=rules.length;
		while(i--){
			var rule=rules[i];
			var url=rule(name,from);
			if(url){
				return url;
			}
		}
		var path=paths.get(name);
		if(path){
			return new URL(path,baseUrl);
		}
		var fromPaths=map.get(from.name);
		if(fromPaths){
			path=fromPaths.get(name);
			if(path){
				return new URL(path,baseUrl);
			}
		}
		return null;
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
		var script=getScript$2(src,handleLast);
		libs.set(src,script);
		script.requires=modules;
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
			if(module.status<=STATUS.LOADING){
				useShim.call(this,module);
			}else if(module.status==STATUS.DEFINED){
				module.load();
			}
		}
	}
	function useShim(module){
		if(Object.prototype.hasOwnProperty.call(shim,module.name)){
			module.resolve(window[shim[module.name]]);
		}else {
			console.warn("No module found in script:"+this.src);
		}
	}
	Module.prototype.define=function(deps,initor){
		if(this.name){
			if(checkPkgs(this.name)){
				cache.set(this.name,this);
			}
		}
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
		return config.get(this.name);
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
			libs.set(path,script);
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
	require.path=function(rule){
		rules.push(rule);
	};
	require.complete=function(hook){
		hooks.push(hook);
	};
	require.config=function(options){
		forOwn(options.paths,function(value,key){
			paths.set(key,value);
		});
		forOwn(options.bundles,function(names,path){
			if(names.forEach){
				names.forEach(function(name){
					paths.set(name,path);
				});
			}
		});
		forOwn(options.map,function(paths,formPath){
			var pathMap=map.get(formPath);
			if(!pathMap){
				pathMap=new Map();
				map.set(formPath,pathMap);
			}
			paths.forEach(function(path,name){
				pathMap.set(name,path);
			});
		});
		forOwn(options.config,function(value,key){
			config.set(key,value);
		});
		var bu=options.baseUrl;
		if(bu){
			if(!bu.endsWith("/")){
				bu+="/";
			}
			baseUrl=new URL(bu,baseUrl);
		}
		if(options.urlArgs){
			urlArgs=options.urlArgs;
		}
		if(options.pkgs){
			var i=options.pkgs.length;
			while(i-->0){
				var pkg=options.pkgs[i];
				if(!pkgs.includes(pkg)){
					pkgs.push(pkg);
				}
			}
		}
	};
	define.amd=true;

}());
