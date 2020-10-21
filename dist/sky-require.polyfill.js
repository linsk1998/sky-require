(function () {
	'use strict';

	if(!Array.prototype.filter){
		Array.prototype.filter = function(fn, context) {
			var arr = [];
			for (var k = 0, length = this.length; k < length; k++) {
				fn.call(context, this[k], k, this) && arr.push(this[k]);
			}
			return arr;
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

	var hasEnumBug$1 = !{toString: null}.propertyIsEnumerable('toString');

	if(!globalThis.Symbol || !Symbol.sham){
		if(hasEnumBug$1){
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
			var url=new URL(getCurrentScript$1().src,location);
			try{
				return url.href;
			}finally{
				url=null;
			}
		};
	}

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

	function attachEvent(ele, evt, func){
		ele.attachEvent( 'on'+evt, func);
	}

	function attachEvent$1(ele, evt, func, useCapture){
		ele.addEventListener(evt, func, !!useCapture);
	}

	var attachEvent$2=document.addEventListener?attachEvent$1:attachEvent;

	var STATUS_DEFINED = 2; //已定义
	var STATUS_DEPENDING = 3; //正在加载依赖
	var STATUS_COMPLETE = 4; //完成
	var requirementMap = new Map();
	var moduleMap = new Map();
	var timerMap = new Map();
	/** 全局声明的模块,key:模块名，value:模块 */
	var cache = new Map();
	var baseUrl = location;
	var waitSeconds = Number.MAX_VALUE;
	function getGlobalModule() {
	    return {
	        src: location.origin + location.pathname + location.search,
	        status: STATUS_COMPLETE,
	        require: require,
	        exports: window,
	        dependencies: new Set()
	    };
	}
	var pathHooks = [];
	var loadHooks = [];
	var nameHooks = [];
	var urlArgsHooks = [];
	var resolveHooks = [];
	globalThis.require = function (deps, onsuccess, onerror) {
	    var from;
	    if (this === undefined || this === window) {
	        from = getGlobalModule();
	    }
	    else {
	        from = this;
	    }
	    if (Array.isArray(deps)) {
	        var promises = new Array(deps.length);
	        for (var i = 0; i < deps.length; i++) {
	            var dep = deps[i];
	            promises[i] = nameToPromise(dep, from);
	        }
	        var p = Promise.all(promises);
	        if (onsuccess)
	            p.then(function (data) {
	                onsuccess.apply(from, data);
	            });
	        if (onerror)
	            p["catch"](function (data) {
	                onerror.call(from, data);
	            });
	        return p;
	    }
	    else {
	        return nameToExports(deps, from);
	    }
	};
	function nameToExports(name, from) {
	    switch (name) {
	        case 'require':
	            return require.bind(from);
	        case 'exports':
	            return from.exports = new Object();
	        case 'module':
	            return from;
	    }
	    var url = srcToUrl(name, from);
	    if (url) {
	        return urlToExports(url, from);
	    }
	    //优先查询同脚本同名字模块
	    var module = pathToModule(from.src, from, name);
	    if (module) {
	        return moduleToExports(module);
	    }
	    //根据配置获取URL
	    var url = nameToUrl(name, from);
	    if (!url) {
	        var m = cache.get(name);
	        if (m && m !== from) { //从全局缓存获取同名模块
	            from.dependencies.add(m);
	            return moduleToExports(m);
	        }
	        url = new URL(name, baseUrl);
	    }
	    try {
	        return urlToExports(url, from, name);
	    }
	    finally {
	        url = null;
	    }
	}
	function srcToUrl(path, from) {
	    if (path.startsWith("//") || path.match(/^\w+:/)) { //模块名称是绝对路径
	        return new URL(path, baseUrl);
	    }
	    if (path.startsWith(".")) { //模块名称是相对路径
	        if (from) {
	            if (from.name) {
	                path = new URL(path, "http://localhost/" + from.name).pathname.replace("/", "");
	            }
	            else {
	                return new URL(path, from.src);
	            }
	        }
	        else { //通过html中的script标签直接运行
	            return new URL(path, location);
	        }
	    }
	}
	function nameToUrl(name, from) {
	    //根据配置获取URL
	    var i = pathHooks.length;
	    while (i--) {
	        var rule = pathHooks[i];
	        var url = rule(name, from);
	        if (url) {
	            try {
	                return url;
	            }
	            finally {
	                url = null;
	            }
	        }
	    }
	    return null;
	}
	function urlToExports(url, from, name) {
	    addUrlArgs(url, from, name);
	    //js模块
	    var search = url.search;
	    if (!search) {
	        if (!url.pathname.endsWith(".js")) {
	            url.pathname += ".js";
	        }
	    }
	    var path = url.origin + url.pathname + url.search;
	    url = null;
	    var module = pathToModule(path, from, name);
	    if (module) {
	        return moduleToExports(module);
	    }
	    throw new Error("not found module [" + name + "] in \"" + path + "\"");
	}
	function moduleToExports(module, from) {
	    if (module.status === STATUS_COMPLETE) {
	        return module.exports;
	    }
	    else if (module.status === STATUS_DEFINED) {
	        var exports;
	        if (module.deps && module.deps.length) {
	            var deps = module.deps.map(require, module);
	            exports = module.initor.apply(module, deps);
	        }
	        else {
	            var exports = module.initor();
	            if (exports !== undefined) {
	                module.exports = exports;
	            }
	        }
	        return exports;
	    }
	    throw new Error("module(" + name + ") must loaded before");
	}
	function addUrlArgs(url, from, name) {
	    var j = urlArgsHooks.length;
	    while (j-- > 0) {
	        urlArgsHooks[j](url, from, name);
	    }
	    url = null;
	}
	function pathToModule(path, from, name) {
	    var modules = moduleMap.get(path); //如果已经加载相关JS
	    if (modules) { //已经加载过JS
	        var module = findModule(modules, path, from, name);
	        if (module) {
	            from.dependencies.add(module);
	            return module;
	        }
	    }
	}
	function nameToPromise(name, from) {
	    switch (name) {
	        case 'require':
	            return Promise.resolve(require.bind(from));
	        case 'exports':
	            return Promise.resolve(from.exports = new Object());
	        case 'module':
	            return Promise.resolve(from);
	    }
	    var url = srcToUrl(name, from);
	    if (url) {
	        return urlToPromise(new URL(name, from.src), from);
	    }
	    //优先查询同脚本同名字模块
	    var module = pathToModule(from.src, from, name);
	    if (module) {
	        return moduleToPromise(module, from);
	    }
	    //根据配置获取URL
	    var url = nameToUrl(name, from);
	    if (!url) {
	        var m = cache.get(name);
	        if (m && m !== from) { //从全局缓存获取同名模块
	            from.dependencies.add(m);
	            return moduleToPromise(m, from);
	        }
	        url = new URL(name, baseUrl);
	    }
	    try {
	        return urlToPromise(url, from, name);
	    }
	    finally {
	        url = null;
	    }
	}
	function urlToPromise(url, from, name) {
	    addUrlArgs(url, from, name);
	    var i = loadHooks.length;
	    while (i-- > 0) {
	        var p = loadHooks[i](url, from, name);
	        if (p) {
	            return p;
	        }
	    }
	    //js模块
	    var search = url.search;
	    if (!search) {
	        if (!url.pathname.endsWith(".js")) {
	            url.pathname += ".js";
	        }
	    }
	    var path = url.origin + url.pathname + url.search;
	    url = null;
	    var module = pathToModule(path, from, name);
	    if (module) {
	        return moduleToPromise(module, from);
	    }
	    //未曾加载过js
	    var requirements = requirementMap.get(path);
	    if (!requirements) {
	        requirements = new Array();
	        requirementMap.set(path, requirements);
	        var script = findScript(path);
	        if (script) {
	            attachEvent$2(script, 'load', handleLast);
	        }
	        else {
	            script = getScript$2(path, handleLast);
	        }
	        if (waitSeconds <= 60) {
	            setRequireTimeout(path);
	        }
	        script.onerror = handleError;
	    }
	    var requirement = createRequirement(path, from, name);
	    requirements.push(requirement);
	    return requirement.promise;
	}
	function setRequireTimeout(path) {
	    var timer = setTimeout(function () {
	        var requirements = requirementMap.get(path);
	        var i = requirements.length;
	        while (i-- > 0) {
	            requirements[i].reject({ message: "timeout" });
	        }
	    }, waitSeconds * 1000);
	    timerMap.set(path, timer);
	}
	function findScript(path) {
	    var scripts = document.getElementsByTagName("SCRIPT");
	    var i = scripts.length;
	    while (i-- > 0) {
	        var script = scripts[i];
	        var src = script.src;
	        if (src) {
	            var url = new URL(src, location);
	            if (url.origin + url.pathname + url.search == path) {
	                url = null;
	                return script;
	            }
	        }
	    }
	}
	function createRequirement(path, from, name) {
	    var r = {
	        'src': path,
	        'name': name,
	        'from': from
	    };
	    r.promise = new Promise(function (resolve, reject) {
	        r.resolve = function (data) {
	            resolve(data);
	        };
	        r.reject = function (data) {
	            reject(data);
	        };
	    });
	    return r;
	}
	function handleLast() {
	    var url = this.src ? new URL(this.src, location) : location;
	    var path = url.origin + url.pathname + url.search;
	    url = null;
	    var requirements = requirementMap.get(path);
	    if (requirements) {
	        var modules = moduleMap.get(path);
	        var i = requirements.length;
	        if (modules) {
	            while (i-- > 0) {
	                var requirement = requirements[i];
	                var from = requirement.from;
	                var module = findModule(modules, requirement.src, from, requirement.name); //包括匿名模块
	                if (!module) {
	                    module = findAnonymousModule(modules, requirement.src, from);
	                    if (!module) {
	                        throw new Error("not found module [" + requirement.name + "] not in js \"" + path + "\"");
	                    }
	                }
	                from.dependencies.add(module);
	                var promise = moduleToPromise(module, from);
	                promise.then(requirement.resolve, requirement.reject);
	            }
	        }
	    }
	}
	function handleError() {
	    var url = this.src ? new URL(this.src, location) : location;
	    var path = url.origin + url.pathname + url.search;
	    var requirements = requirementMap.get(path);
	    if (requirements) {
	        var i = requirements.length;
	        while (i-- > 0) {
	            var requirement = requirements[i];
	            requirement.reject(new Error("Script Error At " + path));
	        }
	    }
	}
	function findModule(modules, path, from, name) {
	    var i, module;
	    if (!name) {
	        module = findAnonymousModule(modules, path, from);
	        if (module) {
	            return module;
	        }
	    }
	    var alias = new Array();
	    alias.push(name);
	    i = nameHooks.length;
	    while (i-- > 0) {
	        var alia = nameHooks[i](name, from);
	        if (alia) {
	            alias.push(alia);
	        }
	    }
	    i = modules.length;
	    while (i-- > 0) {
	        module = modules[i];
	        if (module === from) {
	            continue;
	        }
	        var modName = module.name;
	        if (alias.includes(modName)) {
	            return module;
	        }
	    }
	}
	function findAnonymousModule(modules, path, from) {
	    var i = modules.length;
	    while (i-- > 0) {
	        var module = modules[i];
	        if (module === from) {
	            continue;
	        }
	        if (!module.name) {
	            return module;
	        }
	    }
	}
	function moduleToPromise(module, from) {
	    if (from.deps && from.deps.includes("exports")) {
	        if (checkCircular(module, from)) {
	            return Promise.resolve(module.exports);
	        }
	    }
	    switch (module.status) {
	        case STATUS_COMPLETE:
	            return Promise.resolve(module.exports);
	        case STATUS_DEFINED:
	            module.init();
	        default:
	            return module.promise;
	    }
	}
	var commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/mg;
	var cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
	function commentReplace(match, singlePrefix) {
	    return singlePrefix || '';
	}
	/**
	define(data);
	define(initor);
	define(deps,initor);
	define(name,deps,initor);
	*/
	globalThis.define = function () {
	    var arg1 = arguments[0];
	    switch (arguments.length) {
	        case 1:
	            if (typeof arg1 === "function") {
	                var deps = new Array();
	                switch (arg1.length) {
	                    case 3:
	                        deps.unshift('module');
	                    case 2:
	                        deps.unshift('exports');
	                    case 1:
	                        deps.unshift('require');
	                        break;
	                }
	                arg1.toString().replace(commentRegExp, commentReplace).replace(cjsRequireRegExp, function (match, dep) {
	                    deps.push(dep); //CMD
	                });
	                defineModule(null, deps, arg1);
	            }
	            else {
	                defineModule(null, null, arg1);
	            }
	            break;
	        case 2:
	            defineModule(null, arg1, arguments[1]);
	            break;
	        case 3:
	            var module = defineModule(arg1, arguments[1], arguments[2]);
	            cache.set(arg1, module);
	    }
	};
	function defineModule(name, deps, initor) {
	    var url = new URL(getCurrentPath(), location);
	    var path = url.origin + url.pathname + url.search;
	    url = null;
	    var module;
	    if (typeof initor === "function") {
	        if (deps && deps.length) {
	            module = createModule(path, deps, initor, name);
	        }
	        else {
	            module = createNoDepsModule(path, initor, name);
	        }
	    }
	    else {
	        module = createJsonModule(path, initor, name);
	    }
	    var modules = moduleMap.get(path);
	    if (!modules) {
	        modules = new Array();
	        moduleMap.set(path, modules);
	    }
	    modules.push(module);
	    return module;
	}
	function createJsonModule(path, exports, name) {
	    return {
	        'name': name,
	        'src': path,
	        'status': STATUS_DEFINED,
	        'require': require,
	        'exports': exports,
	        'init': initJsonModule,
	        'dependencies': new Set()
	    };
	}
	function initJsonModule() {
	    this.promise = Promise.resolve(this.exports);
	    this.status = STATUS_COMPLETE;
	}
	function createNoDepsModule(path, initor, name) {
	    return {
	        'name': name,
	        'src': path,
	        'status': STATUS_DEFINED,
	        'require': require,
	        'initor': initor,
	        'init': initNoDepModule,
	        'dependencies': new Set()
	    };
	}
	function initNoDepModule() {
	    var me = this;
	    this.promise = new Promise(function (resolve, reject) {
	        var exports = me.initor();
	        if (exports !== undefined) {
	            me.exports = exports;
	        }
	        resolveModule(me, resolve, reject);
	    });
	}
	function createModule(path, deps, initor, name) {
	    return {
	        'name': name,
	        'src': path,
	        'deps': deps,
	        'status': STATUS_DEFINED,
	        'require': require,
	        'init': initModule,
	        'initor': initor,
	        'dependencies': new Set()
	    };
	}
	function initModule() {
	    var me = this;
	    this.status = STATUS_DEPENDING;
	    this.promise = new Promise(function (resolve, reject) {
	        me.require(me.deps, function () {
	            var exports = me.initor.apply(me, arguments);
	            if (exports !== undefined) {
	                me.exports = exports;
	            }
	            resolveModule(me, resolve, reject);
	        });
	    });
	}
	function resolveModule(module, resolve, reject) {
	    module.resolve = function (exports) {
	        module.status = STATUS_COMPLETE;
	        resolve(exports);
	    };
	    module.reject = reject;
	    var i = resolveHooks.length;
	    while (i-- > 0) {
	        var r = resolveHooks[i].call(module, module.resolve, module.reject);
	        if (r === false) {
	            return;
	        }
	    }
	    module.resolve(module.exports);
	}
	function checkCircular(module, from) {
	    var i = module.dependencies.size;
	    if (i) {
	        var dependencies = Array.from(module.dependencies);
	        while (i-- > 0) {
	            var mod = dependencies[i];
	            if (mod === from) {
	                return true;
	            }
	            return checkCircular(mod, from);
	        }
	    }
	    return false;
	}
	define.amd = true;
	require.setBaseUrl = function (url) {
	    baseUrl = url;
	};
	require.hook = function (option) {
	    if (option.name)
	        nameHooks.push(option.name);
	    if (option.path)
	        pathHooks.push(option.path);
	    if (option.load)
	        loadHooks.push(option.load);
	    if (option.urlArgs)
	        urlArgsHooks.push(option.urlArgs);
	    if (option.resolve)
	        resolveHooks.push(option.resolve);
	};
	require.config = function (options) {
	    var bu = options.baseUrl;
	    if (bu) {
	        if (!bu.endsWith("/")) {
	            bu += "/";
	        }
	        baseUrl = new URL(bu, baseUrl);
	    }
	    forOwn(options.paths, function (value, key) {
	        require.hook({
	            path: function (name, from) {
	                if (name == key) {
	                    return new URL(value, baseUrl);
	                }
	                else if (name.startsWith(key + "/")) {
	                    return new URL(value + name.substring(key.length, name.length), baseUrl);
	                }
	            }
	        });
	    });
	    forOwn(options.bundles, function (names, path) {
	        var pkgs = [];
	        names = names.filter(function (name) {
	            if (name.endsWith("*")) {
	                pkgs.push(name.substr(0, name.length - 1));
	                return false;
	            }
	            return true;
	        });
	        require.hook({
	            path: function (name, from) {
	                if (names.includes(name)) {
	                    return new URL(path, baseUrl);
	                }
	                var i = pkgs.length;
	                while (i-- > 0) {
	                    if (name.startsWith(pkgs[i])) {
	                        return new URL(path, baseUrl);
	                    }
	                }
	            }
	        });
	    });
	    if (options.map) {
	        require.hook({
	            path: function (name, from) {
	                var fromName = from.name;
	                var map = options.map;
	                var path;
	                if (Object.prototype.hasOwnProperty.call(map, fromName)) {
	                    path = map[fromName];
	                }
	                else {
	                    path = map['*'];
	                    if (!path)
	                        return;
	                }
	                if (Object.prototype.hasOwnProperty.call(path, name)) {
	                    return new URL(path[name], baseUrl);
	                }
	            }
	        });
	    }
	    forOwn(options.config, function (value, key) {
	        function getConfig() {
	            return value;
	        }
	        require.hook({
	            resolve: function (resolve, reject) {
	                if (this.name == key) {
	                    this.config = getConfig;
	                }
	            }
	        });
	    });
	    var packages = options.packages;
	    if (packages)
	        packages.forEach(function (config) {
	            var main = config.main || "main";
	            var name = config.name;
	            require.hook({
	                name: function (modName, from) {
	                    if (name == modName) {
	                        return name + "/" + main;
	                    }
	                }
	            });
	            var location = config.location;
	            if (!location) {
	                location = name;
	            }
	            require.hook({
	                path: function (modName, from) {
	                    if (modName == name) {
	                        return new URL(location + "/" + main, baseUrl);
	                    }
	                    else if (modName.startsWith(name + "/")) {
	                        return new URL(location + modName.substring(name.length, modName.length), baseUrl);
	                    }
	                }
	            });
	        });
	    var urlArgs = options.urlArgs;
	    if (urlArgs) {
	        if (typeof urlArgs === "function") {
	            require.hook({
	                urlArgs: function (url, from, name) {
	                    var search = urlArgs(name, url.href);
	                    if (search) {
	                        var params = new URLSearchParams(search);
	                        params.forEach(function (value, key) {
	                            url.searchParams.append(key, value);
	                        });
	                    }
	                }
	            });
	        }
	        else {
	            require.hook({
	                urlArgs: function (url, from, name) {
	                    var params = new URLSearchParams(urlArgs);
	                    params.forEach(function (value, key) {
	                        url.searchParams.append(key, value);
	                    });
	                }
	            });
	        }
	    }
	    forOwn(options.shim, function (mod, name) {
	        define(name, mod.deps, mod.init ? mod.init : function () {
	            var paths = mod.exports.split(".");
	            var obj = window;
	            for (var i = 0; i < paths.length; i++) {
	                obj = obj[paths[i]];
	            }
	            return obj;
	        });
	    });
	};

}());
