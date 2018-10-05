var Sky=function(){
	return Sky.overload(arguments,this);
};
this.$=this.$ || Sky;
(function(){
	var rules=[];
	function ckeck(ckeckFunc,index){
		return ckeckFunc(this[index]);
	}
	function compare(x, y){//比较函数
		return x.checks.length-y.checks.length;
	}
	Sky.overload=function(checks,func,target){
		if(target){
			rules.push({
				'checks':checks,
				'func':func,
				'target':target
			});
			rules.sort(compare);
		}else{
			var args=checks;
			var thisVal=func;
			var i=rules.length;
			while(i--){
				var rule=rules[i];
				if(args.callee===rule.func){
					if(rule.checks.length>=args.length){
						if(rule.checks.every(ckeck,args)){
							return rule.target.apply(thisVal,args);
						}
					}
				}
			}
			return Sky;
		}
	};
})();
Sky.isArray=function(a){
	return Array.isArray(a);
};
Sky.isDate=function(obj){
	return Object.prototype.toString.call(obj)==='[object Date]';
};
Sky.isRegExp=function(obj){
	return Object.prototype.toString.call(obj)==='[object RegExp]';
};
Sky.isString=function(obj){
	return Object.prototype.toString.call(obj)==='[object String]';
};
Sky.isFunction=function(obj){
	return Object.prototype.toString.call(obj)==='[object Function]';
};
Sky.isNumber=function(obj){
	return Object.prototype.toString.call(obj)==='[object Number]';
};
Sky.is=function(obj,Clazz){
	obj=Object(obj);
	return obj instanceof Clazz;
};
Sky.isObject=function(obj){
	var type=typeof obj;
	if(type!=="object"){
		return false;
	}
	type=Object.prototype.toString.call(obj);
	switch(type){
		case '[object String]':
		case '[object Number]':
		case '[object Function]':
		case '[object Boolean]':
			return false;
	}
	return true;
};
Sky.isDefined=function(obj){
	return obj!==void 0;
};
Sky.isWindow=function(obj){
	return obj && typeof obj === "object" && "setInterval" in obj;
};
Sky.isPlainObject=function(obj){
	if(typeof obj!=="object" || obj.nodeType || Sky.isWindow(obj)){
		return false;
	}
	return obj.constructor===Object;
};
Sky.isArrayLike=function(obj){
	var length=obj.length;
	if(typeof length !="number" || length<0 || isNaN(length) || Math.ceil(length)!=length){
		return false;
	}
	return true;
};
Sky.isNumeric=function(obj){
	var n=parseFloat(obj);
	return !isNaN(n);
};
if(this.HTMLElement){
	Sky.isElement=function(obj){
		return obj instanceof HTMLElement;
	};
}else{
	Sky.isElement=function(obj){
		return obj?obj.nodeType===1:false;
	};
}
Sky.isEmpty=function(obj){
	if(obj==null) return true;
	if(Sky.isNumber(obj.length)){
		return !obj.length;
	}
	if(Sky.isNumber(obj.size)){
		return !obj.size;
	}
	if(Sky.isFunction(obj.size)){
		return !obj.size();
	}
	if(Sky.isFunction(obj.toArray)){
		return !obj.toArray().length;
	}
	return false;
};
Sky.isArrayLike=function(obj){
	var length=obj.length;
	if(typeof length !="number" || length<0 || isNaN(length) || Math.ceil(length)!=length){
		return false;
	}
	return true;
};
Sky.isNumeric=function(obj){
	var n=parseFloat(obj);
	return !isNaN(n);
};
Sky.isDocument=function(obj){
	return obj===document;
};

Sky.support={};
(function(){
	var userAgent = navigator.userAgent.toLowerCase();
	Sky.browser={
		version:(userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
		webkit:/webkit/.test( userAgent ),
		opera:/opera/.test( userAgent ),
		msie:/msie/.test( userAgent ) && !/opera/.test( userAgent ),
		firefox:/firefox/.test( userAgent ),
		safari:/safari/.test( userAgent ),
		chrome:/chrome/.test( userAgent ),
		android:/android/.test( userAgent ),
		ios:/(iphone|ipad|ipod)/.test( userAgent ),
		mobile:/mobile/.test( userAgent ),
		quirks:(document.compatMode == 'BackCompat')
	};
	var ie="ActiveXObject" in window;
	Sky.browser.ie5=ie&&!document.compatMode;//ie5及以下
	Sky.browser.ie6=ie&&!!document.compatMode&&!window.XMLHttpRequest;
	Sky.browser.ie7=ie&&!!window.XMLHttpRequest&&!document.querySelector;
	Sky.browser.ie8=ie&&!!document.querySelector&&!document.addEventListener;
	Sky.browser.ie9=ie&&!!document.addEventListener&&!window.atob;
	Sky.browser.ie10=ie&&!!window.atob&&!!window.attachEvent;
	Sky.browser.ie11=ie&&!!window.atob&&!window.attachEvent;
	if(Sky.browser.ie11){
		Sky.browser.ie=11;
	}else if(ie){
		Sky.browser.ie=parseInt(Sky.browser.version);
	}
})();
Sky.noop=function(){};
Sky.toString=null;
if(!Sky.propertyIsEnumerable('toString')){
	Sky.dontEnums=["toString","toLocaleString","valueOf","hasOwnProperty", "isPrototypeOf","propertyIsEnumerable"];
	Sky.forIn=function(obj,fn,thisArg){
		thisArg=thisArg || window;
		for(var key in obj) {
			if(!(obj instanceof Object)){
				if(key.startsWith("__") || key=="constructor"){
					continue ;
				}
			}
			if(fn.call(thisArg,obj[key],key)===false){
				return false;
			}
		}
		var nonEnumIdx=Sky.dontEnums.length;
		var proto=Object.getPrototypeOf(obj);
		//遍历nonEnumerableProps数组
		while(nonEnumIdx--){
			var prop=Sky.dontEnums[nonEnumIdx];
			if(prop in obj && obj[prop]!==proto[prop]){
				if(fn.call(thisArg,obj[prop],prop)===false){
					return false;
				}
			}
		}
		return true;
	};
	Sky.forOwn=function(obj,fn,thisArg){
		thisArg=thisArg || window;
		var type=typeof obj;
		if(type=="unknow"){
			return true;
		}
		if(type!="object"){
			obj=Object(obj);
		}
		for(var key in obj) {
			if(!(obj instanceof Object)){
				if(key.startsWith("__") || key=="constructor"){
					continue ;
				}
			}
			if(Sky.hasOwn(obj,key)){
				if(fn.call(thisArg,obj[key],key)===false){
					return false;
				}
			}
		}
		for(var i=0;i<Sky.dontEnums.length;i++){
			var prop=Sky.dontEnums[i];
			if(Sky.hasOwn(obj,prop)){
				if(fn.call(thisArg,obj[prop],prop)===false){
					return false;
				}
			}
		}
		return true;
	};
	Sky.hasOwn=function(obj,key){
		if(!(key in obj)){
			return false;
		}
		var value=obj[key];
		if(typeof obj=="object" && !(obj instanceof Object)){
			if(Sky.isFunction(value)){
				return true;
			}
			return false;
		}
		return Object.prototype.hasOwnProperty.call(obj,key);
	};
}else{
	Sky.forIn=function(obj,fn,thisArg){
		thisArg=thisArg || window;
		for(var key in obj) {
			if(fn.call(thisArg,obj[key],key)===false){
				return false;
			}
		}
		return true;
	};
	Sky.forOwn=function(obj,fn,thisArg){
		thisArg=thisArg || window;
		for(var key in obj) {
			if(Object.prototype.hasOwnProperty.call(obj,key)){
				if(fn.call(thisArg,obj[key],key)===false){
					return false;
				}
			}
		}
		return true;
	};
	Sky.hasOwn=function(obj,key){
		return Object.prototype.hasOwnProperty.call(obj,key);
	};
}
Sky.support.VBScript=false;
if(window.execScript){
	try{
		window.execScript([
			'Function alert(msg)',
			'msgbox msg',
			'End Function' //去除弹窗的图标
		].join('\n'), 'VBScript');
		if(typeof alert=="unknown"){
			Sky.support.VBScript=true;
		}
	}catch(e){}
}
//数字开头补零
Sky.pad=function(value,width,chars){
	if(!chars){chars=" ";}
	if(Sky.isNumber(value)){
		chars="0";
	}
	value+='';
	return value.padStart(width,chars);
};
//清除HTML代码
Sky.escapeHtml=function(str) {
	return str.replace(/&/g,'&amp;')
		.replace(/</g,'&lt;')
		.replace(/>/g,'&gt;');
};
Sky.escapeAttribute=function(str,quot){
	var esc=Sky.escapeHtml(str);
	if(!quot || quot=='"'){
		return esc.replace(/"/g,'&quot;');
	}else{
		return esc.replaceAll(quot.charAt(0),'&#'+quot.charCodeAt(0)+";");
	}
};
(function(){
	var div=document.createElement('div');
	var htmlEscapes={
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'`': '&#96;'
	};
	Sky.escape=function(text){
		return text.replace(/[&<>"'`]/g,function(i){
			return htmlEscapes[i];
		});
	};
	Sky.unescape=function(html){
		div.innerHTML=html;
		return div.innerText || div.textContent ;
	};
})();
Sky.escapeString=function(str) {//from lodash
	var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	rx_escapable.lastIndex = 0;
	return rx_escapable.test(str)
		? str.replace(rx_escapable, function(a) {
		var meta = {
			"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r": "\\r",	"\"": "\\\"","\\": "\\\\"
		};
		var c = meta[a];
		return typeof c === "string"
			? c
			: "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
	}): str;
};
Sky.escapeRegExp=function(str){//from lodash
	if(str){
		var reRegExpChars = /^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g;
		reRegExpChars.lastIndex = 0;
		return (reRegExpChars.test(str))
			? str.replace(reRegExpChars, function(chr, leadingChar, whitespaceChar) {
			if (leadingChar) {
				var regexpEscapes = {
					'0': 'x30', '1': 'x31', '2': 'x32', '3': 'x33', '4': 'x34',
					'5': 'x35', '6': 'x36', '7': 'x37', '8': 'x38', '9': 'x39',
					'A': 'x41', 'B': 'x42', 'C': 'x43', 'D': 'x44', 'E': 'x45', 'F': 'x46',
					'a': 'x61', 'b': 'x62', 'c': 'x63', 'd': 'x64', 'e': 'x65', 'f': 'x66',
					'n': 'x6e', 'r': 'x72', 't': 'x74', 'u': 'x75', 'v': 'x76', 'x': 'x78'
				};
				chr = regexpEscapes[chr];
			} else if (whitespaceChar) {
				var stringEscapes = {
					'\\': '\\',
					"'": "'",
					'\n': 'n',
					'\r': 'r',
					'\u2028': 'u2028',
					'\u2029': 'u2029'
				};
				chr = stringEscapes[chr];
			}
			return '\\' + chr;
		})
			: str;
	}
	return "(?:)";
};

if(!Object.create){
	Object.create=function(proto){
		function F(){}
		F.prototype = proto;
		return new F();
	};
}
if(!Object.values){
	Object.values=function(obj){
		var result=[];
		Sky.forOwn(obj,function(value,key){
			result.push(obj[key]);
		});
		return result;
	};
}
if(!Object.keys){
	Object.keys=function(obj){
		var result=[];
		Sky.forOwn(obj,function(value,key){
			result.push(key);
		});
		return result;
	};
}
if(!Object.assign){
	Object.assign=function(target, varArgs){
		if(target==null){
			throw 'Cannot convert undefined or null to object';
		}
		var to=Object(target);
		for(var i=1;i<arguments.length;i++){
			var obj=arguments[i];
			if(obj!=null){
				Sky.forOwn(obj,function(v,k){
					to[k]=v;
				});
			}
		}
	};
}
if(!Object.getPrototypeOf){
	if('__proto__' in Sky){
		Object.getPrototypeOf=function(object){
			return object.__proto__;
		};
	}else{
		Object.getPrototypeOf=function(object){
			var constructor=object.constructor;
			if(Sky.isFunction(constructor)){
				if(object!=constructor.prototype){
					return constructor.prototype;
				}else if('superclass' in constructor){
					return constructor.superclass.prototype;
				}
			}
			console.warn("cannot find Prototype");
			return Object.prototype;
		};
	}
}
//上面的Object.getPrototypeOf有局限性，必须按照下面方式继承类才能使用
function __extends(clazz, superClazz) {
	Object.assign(clazz,superClazz);
	clazz.prototype=Object.create(superClazz.prototype);
	clazz.superclass=superClazz;//为了其他程序的代码方便获取父类
	clazz.prototype.constructor=clazz;
}
Sky.support.defineProperty=!!Object.defineProperty && !!document.addEventListener;
if(Sky.support.__defineSetter__){
	Sky.support.defineProperty=true;
	if (!Object.defineProperty) {
		Object.defineProperty=function(obj, prop, descriptor){
			if(descriptor.get) obj.__defineGetter__(prop,descriptor.get);
			if(descriptor.set) obj.__defineSetter__(prop,descriptor.set);
		};
	}
}
if(!Array.from){
	Array.from=function(arrayLike, mapFn, thisArg){
		var arr;
		try{
			arr=Array.prototype.slice.call(arrayLike);
		}catch(e){
			arr=new Array();
			for(var i=0;i<arrayLike.length;i++){
				arr.push(arrayLike[i]);
			}
		}
		if(mapFn){
			arr=arr.map( mapFn, thisArg);
		}
		return arr;
	};
}
if(!Array.isArray){
	Array.isArray=function(obj){
		return Object.prototype.toString.call(obj)==='[object Array]';
	};
}
//判断一个元素在数组中的位置
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
if(!Array.prototype.lastIndexOf){
	Array.prototype.lastIndexOf = function(e, fromIndex) {
		fromIndex=isNaN(fromIndex)?this.length-1:fromIndex;
		for (var i=fromIndex,j; i<this.length; i--) {
			j=this[i];
			if(j===e){return i;}
		}
		return -1;
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
//遍历数组
if(!Array.prototype.forEach){
	Array.prototype.forEach =function(callback, thisArg){
		var len=this.length;
		for(var i=0,j;i<len && i<this.length; i++){
			j=this[i];
			callback.call(thisArg,j,i,this);
		}
	};
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
if(!Array.prototype.every){
	Array.prototype.every = function(fn, context) {
		var passed = true;
		for (var k = 0, length = this.length; k < length; k++) {
			if (passed === false) break;
			passed = !!fn.call(context, this[k], k, this);
		}
		return passed;
	};
}
(function(){
	function Iterator(arr){
		this.array=arr;
		this.i=0;
	}
	Iterator.prototype.next=function(){
		var result={};
		result.done=this.array.length>this.i;
		result.value=this.array[this.i];
		if(!result.done){
			this.i++;
		}
		return result;
	};
	Array.prototype.entries=function(){
		return new Iterator(this);
	};
})();
(function(){
	/** 时间对象的格式化; **/
	/* eg:format="%Y-%m-%d %H:%M:%S"; */
	function pad2(number) {
		if(number<10){
			return '0'+number;
		}
		return number;
	}
	if (!Date.prototype.toLocaleFormat) {//部分浏览器支持
		Date.prototype.toLocaleFormat = function(format) {
			var Y=this.getFullYear();
			var M=pad2(this.getMonth()+1);
			var D=pad2(this.getDate());
			var h=pad2(this.getHours());
			var m=pad2(this.getMinutes());
			var s=pad2(this.getSeconds());
			var o={
				"%x":Y+"/"+M+"/"+D,
				"%X":h+":"+m+":"+s,
				"%Y":Y,
				"%y":Sky.pad(this.getYear()%100,2),
				"%m":M,
				"%e":this.getDate(),
				"%d":D,
				"%H":h,
				"%i":Sky.pad(this.getHours()%12,2),
				"%M":m,
				"%S":s,
				"%p":this.getHours()%12>1?"PM":"AM",
				"%%":"%"
			};
			o["%T"]=o["%X"];
			return format.replace(/%[xXTYymedHiMSp%]/g,function(word){
				for(var k in o){
					if(k==word){
						return o[k];
					}
				}
				return word;
			});
		};
	}
	if (!Date.prototype.toISOString){//部分浏览器支持
		Date.prototype.toISOString = function() {
			return this.getUTCFullYear()+
				'-'+pad2(this.getUTCMonth()+1)+
				'-'+pad2( this.getUTCDate() ) +
				'T'+pad2( this.getUTCHours() ) +
				':'+pad2( this.getUTCMinutes() ) +
				':'+pad2( this.getUTCSeconds() ) +
				'.'+Sky.pad(this.getUTCMilliseconds(),3)+'Z';
		};
	}
})();
if(!Date.prototype.toJSON){
	Date.prototype.toJSON=Date.prototype.toISOString;
}
if(new Date().toLocaleString().match(/[a-z]/i)){//谷歌浏览器，360用谷歌内核，会显示成英文(未考虑语言环境)
	Date.prototype.toLocaleString = function() {
		return this.toLocaleFormat("%Y-%m-%d %H:%M:%S");
	};
	Date.prototype.toLocaleDateString = function() {
		return this.toLocaleFormat("%Y-%m-%d");
	};
	Date.prototype.toLocaleTimeString = function() {
		return this.toLocaleFormat("%H:%M:%S");
	};
}
if(!Date.now){
	Date.now=function(){
		return new Date().getTime();
	};
}
//删除左右两端的空格
if(!String.prototype.trim){
	String.prototype.trim=function() {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'');
	};
}
if(!String.prototype.trimLeft){
	String.prototype.trimLeft=function() {
		return this.replace(/^[\s\uFEFF\xA0]+/g,'');
	};
}
if(!String.prototype.trimRight){
	String.prototype.trimRight=function() {
		return this.replace(/[\s\uFEFF\xA0]+$/g,'');
	};
}
if(!String.prototype.startsWith){
	String.prototype.startsWith=function(prefix,position){
		position=position?position:0;
		return this.slice(position, prefix.length) === prefix;
	};
}
if(!String.prototype.endsWith){
	String.prototype.endsWith=function(prefix,position){
		var length=prefix.length;
		position=position<length?position:this.length;
		return this.slice(position-length, position) === prefix;
	};
}
if(!String.prototype.includes) {
	String.prototype.includes = function(search, start) {
		if(typeof start!=='number'){
			start=0;
		}
		if(start+search.length>this.length){
			return false;
		}else{
			return this.indexOf(search, start)!==-1;
		}
	};
}
if(!String.prototype.repeat){
	String.prototype.repeat=function(count){
		if(count<0){
			throw 'RangeError repeat count must be non-negative';
		}
		if(count==Number.POSITIVE_INFINITY){
			throw 'RangeError repeat count must be less than infinity';
		}
		return new Array(count+1).join(this);
	};
}
if(!String.prototype.padStart){
	String.prototype.padStart=function(targetLength,padString){
		var x=targetLength-this.length;
		if(x<0) return this+"";
		if(!padString) padString=" ";
		return padString.repeat(Math.ceil(x/padString.length)).substr(0,x)+this;
	};
}
if(!String.prototype.padEnd){
	String.prototype.padEnd=function(targetLength,padString){
		var x=targetLength-this.length;
		if(x<0) return this+"";
		if(!padString) padString=" ";
		return this+padString.repeat(Math.ceil(x/padString.length)).substr(0,x);
	};
}
String.prototype.replaceAll=function(reallyDo, replaceWith, ignoreCase) {
	return this.replace(new RegExp(Sky.escapeRegExp(reallyDo), (ignoreCase ? "gi": "g")), replaceWith);
};
Math.log2 = Math.log2 || function(n){ return Math.log(n) / Math.log(2); };
Number.isNaN=Number.isNaN || function(value){
	return typeof value === "number" && isNaN(value);
};
Number.isInteger=Number.isInteger || function(value){
	return typeof value === "number" &&	isFinite(value) &&	Math.floor(value) === value;
};
if(!Function.prototype.bind){
	Function.prototype.bind=function(context){
		var self=this,args=Array.prototype.slice.call(arguments,1);
		return function(){
			return self.apply(context,args.concat(Array.from(arguments)));
		};
	};
}
if(!this.Map){
	Map=function(){
		this.items=[];
		this.size=0;
	};
	Map.prototype.entries=function(){
		return this.items.entries();
	};
	Map.prototype.clear=function(){
		this.items.splice(0,this.items.length);
		this.size=0;
	};
	Map.prototype["delete"]=function(key){
		var i=this.items.findIndex(function(item){
			return item[0]===key;
		});
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
				callbackfn.call(thisArg,j[1],j[0],i,this);
			}
		}
	};
	Map.prototype.get=function(key){
		var r=this.items.find(function(item){
			return item[0]===key;
		});
		if(r){
			return r[1];
		}
	};
	Map.prototype.has=function(key){
		return this.items.some(function(item){
			return item[0]===key;
		});
	};
	Map.prototype.set=function(key,value){
		var r=this.items.find(function(item){
			return item[0]===key;
		});
		if(r){
			r[1]=value;
		}else{
			this.items.push([key,value]);
		}
		this.size=this.items.length;
		return this;
	};
}
if(!Map.prototype.remove){
	Map.prototype.remove=Map.prototype['delete'];
}
if(!this.Set){
	Set=function(){
		this.items=[];
		this.size=0;
	};
	Set.prototype.has=function(value){
		return this.items.indexOf(value)>=0;
	};
	Set.prototype.add=function(value){
		if(!this.has(value)){
			this.items.push(value);
			this.size=this.items.length;
		}
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
	Set.prototype.toArray=function(){
		return this.items.slice(0);
	};
}
if(!Set.prototype.remove){
	Set.prototype.remove=Set.prototype['delete'];
}
if(!Set.prototype.toArray){
	Set.prototype.toArray=function(){
		var a=[];
		this.forEach(function(item){
			a.push(item);
		});
		return a;
	};
}
if(!Set.prototype.addAll){
	Set.prototype.addAll=function(data){
		if(data.forEach){
			data.forEach(function(item){
				this.add(item);
			},this);
		}
		return this;
	};
}
if(!Set.prototype.removeAll){
	Set.prototype.removeAll=function(data){
		if(data.forEach){
			data.forEach(function(item){
				this.remove(item);
			},this);
		}
		return this;
	};
}
if(!Set.prototype.retainAll){
	Set.prototype.retainAll=function(data){
		this.forEach(function(item){
			if(data.has){
				if(!data.has(item)) this.remove(item);
			}else if(data.indexOf){
				if(data.indexOf(item)<0) this.remove(item);
			}
		},this);
		return this;
	};
}
if(!Set.prototype.toArray){
	Set.prototype.toArray=function(){
		var r=[];
		this.forEach(function(item){
			r.push(item);
		});
		return r;
	};
}
if(!this.console){
	console={};
	if(this.Debug){
		console.log=console.info=console.error=console.warn=function(data){
			window.status=data;
			Debug.writeln(data);
		};
	}else{
		console.log=console.info=console.error=console.warn=function(data){
			window.status=data;
		};
	}
}
Sky.support.JSON=true;
if(!this.JSON){
	Sky.support.JSON=false;
	JSON={
		'stringify':function(obj){
			switch(obj){
				case null:
					return "null";
				case false:
				case true:
					return obj;
					break;
				default:
					var type=Object.prototype.toString.call(obj);
					switch(type){
						case '[object String]':
							return '"'+Sky.escapeString(obj)+'"';
						case '[object Number]':
							return isNaN(obj)?"null":obj.toString();
						case '[object Array]':
							return "["+obj.map(JSON.stringify).join(",")+"]";
						default:
							if(Sky.isFunction(obj.toJSON)){
								return JSON.stringify(obj.toJSON());
							}
							var items=[];
							Sky.forOwn(function(value,key){
								if(value!==void 0){
									if(!Sky.isFunction(value)){
										items.push('"'+Sky.escapeString(k)+'":'+JSON.stringify(value));
									}
								}
							});
							return "{"+items.join(",")+"}";
					}
			}
		},
		'parse':function(str){
			return eval('('+str+')');
		}
	};
}
Sky.support.DOMParser=true;
if(!this.DOMParser){
	Sky.support.DOMParser=false;
	DOMParser=function(){};
	DOMParser.prototype.parseFromString=function(xmlStr){
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = "false";
		xmlDoc.loadXML(xmlStr);
		return xmlDoc;
	};
}
Sky.support.XMLHttpRequest=true;
if(!this.XMLHttpRequest){
	Sky.support.XMLHttpRequest=false;
	XMLHttpRequest=function(){
		if(XMLHttpRequest.progid){
			return new ActiveXObject(XMLHttpRequest.progid);
		}
		var versions=["Microsoft.XMLHTTP","MSXML2.XMLHTTP","Msxml2.XMLHTTP.5.0"];
		var i=versions.length;
		while(i--){
			try{
				var progid=versions[i];
				var request=new ActiveXObject(progid);
				if(request){
					XMLHttpRequest.progid=progid;
					return request;
				}
			}catch(e){}
		}
	};
}
if(!this.URLSearchParams){
	URLSearchParams=function(paramsString){
		this._data=new Array();
		if(paramsString){
			if(paramsString.indexOf("?")==0){
				paramsString=paramsString.substr(1,paramsString.length-1);
			}
			var pairs=paramsString.split("&");
			for(var i=0;i<pairs.length;i++){
				var arr=pairs[i].split("=");
				if(arr.length==2){
					this._data.push([arr[0],arr[1]]);
				}else if(arr.length>2){
					var key=arr[0];
					arr.shift();
					this._data.push(key,arr.join("="));
				}
			}
		}
	};
	URLSearchParams.prototype.append=function(key,value){
		this._data.push([key,value]);
	};
	URLSearchParams.prototype.get=function(key){
		var item=this._data.find(function(item){
			return item[0]==key;
		});
		if(item) return item[1];
		return null;
	};
	URLSearchParams.prototype.getAll=function(key){
		return this._data.filter(function(item){
			return item[0]==key;
		}).map(function(item){
			return item[1];
		});
	};
	URLSearchParams.prototype.set=function(key,value){
		var item=this._data.find(function(item){
			return item[0]==key;
		});
		if(item){
			item[1]=value;
		}else{
			this.append(key,value);
		}
	};
	URLSearchParams.prototype['delete']=function(key){
		this._data=this._data.filter(function(item){
			return item[0]!=key;
		});
	};
	URLSearchParams.prototype.has=function(key){
		return this._data.some(function(item){
			return item[0]==key;
		});
	};
	URLSearchParams.prototype.toString=function(key){
		return this._data.map(function(item){
			return encodeURIComponent(item[0])+"="+encodeURIComponent(item[1]);
		}).join("&");
	};
}
if(!URLSearchParams.prototype.remove){
	URLSearchParams.prototype.remove=URLSearchParams.prototype['delete'];
}
if(!URLSearchParams.prototype.sort){
	URLSearchParams.prototype.sort=function(key){
		return this._data.sort(function(a,b){
			return a[0] > b[0];
		});
	};
}
document.head=document.head || document.getElementsByTagName("head")[0];
/** 判断一个节点后代是否包含另一个节点 **/
if(this.Node && Node.prototype && !Node.prototype.contains){
	Node.prototype.contains=function(arg){
		return !!(this.compareDocumentPosition(arg) & 16);
	}
}
if(!document.contains){
	document.contains=function(ele){
		var i,arr=document.all;
		for(i=0;i<arr.length;i++){
			if(arr[i]===ele){
				return true;
			}
		}
		return false;
	};
}
if(this.HTMLElement) {
	if(!document.head.children){
		HTMLElement.prototype.__defineGetter__("children", function() {
			var a=[];
			for(var i=0; i<this.childNodes.length; i++){
				var n=this.childNodes[i];
				if(n.nodeType==1){
					a.push(n);
				}
			}
			return a;
		});
	}
	if(!('innerText' in document.head)){
		(function(){
			HTMLElement.prototype.__defineGetter__( "innerText", function(){
				var anyString = "";
				var childS = this.childNodes;
				for(var i=0; i<childS.length; i++){
					var node=childS[i];
					if(node.nodeType==1){
						switch(node.tagName){
							case "BR":
								anyString+='\n';
								break ;
							case "SCRIPT":
							case "STYLE":
							case "TEMPLATE":
								break ;
							default :
								anyString+=node.innerText;
						}
					}else if(node.nodeType==3){
						var nodeValue=node.nodeValue;
						if(i==0)
							nodeValue=nodeValue.trimLeft();
						if(i==childS.length-1)
							nodeValue=nodeValue.trimRight();
						if(i>0 && i<childS.length-1){
							if(nodeValue.match(/^\s+$/)){
								if(checkBlock(childS[i-1]) || checkBlock(childS[i+1])){
									nodeValue="\n";
								}
							}
						}
						anyString+=nodeValue;
					}
				}
				return anyString.trim();
			});
			function checkBlock(node){
				switch(node.tagName){
					case "BR":
					case "SPAN":
					case "I":
					case "U":
					case "B":
					case "FONT":
						return false;
				}
				return true;
			}
		})();
		HTMLElement.prototype.__defineSetter__( "innerText", function(sText){
			this.textContent=sText;
		});
	}
}
if(!window.execScript){
	window.execScript=function(script,lang) {
		if(lang && lang.toUpperCase().indexOf("VB")>=0){
			return ;
		}
		window["eval"].call( window,script);
	};
}
//坑
var StringBuilder;
if(!-[1,]){//ie6-8
	StringBuilder=function() {
		this._source=new Array();
	};
	StringBuilder.prototype.append = function(str){
		this._source.push(str);
	}
	StringBuilder.prototype.toString = function(){
		return this._source.join("");
	}
}else{
	StringBuilder=function() {
		this._source="";
	};
	StringBuilder.prototype.append = function(str){
		this._source+=str;
	}
	StringBuilder.prototype.toString = function(){
		return this._source;
	}
}
//坑
function Duration(dt){
	this.value=dt;
}
Duration.prototype.valueOf=function(){
	return this.value;
};
Duration.prototype.getYear=function(){
	return this.value/8765813;
};
Duration.prototype.getMonth=function(){
	return this.value/8765813*12;
};
Duration.prototype.getDay=function(){
	return this.value/1000/60/60/24;
};
Duration.prototype.getMin=function(){
	return this.value/1000/60/60;
};
Duration.prototype.getMinute=function(){
	return this.value/1000/60;
};
Duration.prototype.getSecond=function(){
	return this.value/1000;
};
function DateFormat(pattern){
	this.pattern=pattern;
}
DateFormat.prototype.toString=function(){
	return this.pattern;
};
DateFormat.prototype.format=function(date){
	return this.pattern.replace(/yyyy/g,date.getFullYear())
		.replace(/yy/g,Sky.pad(date.getYear()%100,2))
		.replace(/MM/g,Sky.pad(date.getMonth()+1,2))
		.replace(/M/g,date.getMonth()+1)
		.replace(/dd/g,Sky.pad(date.getDate(),2))
		.replace(/d/g,date.getDate())
		.replace(/HH/g,Sky.pad(date.getHours(),2))
		.replace(/H/g,date.getHours())
		.replace(/hh/g,date.getHours()<13?date.getHours():Sky.pad(date.getHours()%12,2))
		.replace(/h/g,date.getHours()<13?date.getHours():(date.getHours()%12))
		.replace(/mm/g,Sky.pad(date.getMinutes(),2))
		.replace(/m/g,date.getMinutes())
		.replace(/ss/g,Sky.pad(date.getSeconds(),2))
		.replace(/s/g,date.getSeconds())
		.replace(/a{1,3}/g,date.getHours()%12>1?"PM":"AM")
		.replace(/S{3}/g,Sky.pad(date.getMilliseconds(),3));
};
DateFormat.prototype.parse=function(dateString){
	var reg1=/(yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s|aaa|a|SSS)/g;
	var keys=this.pattern.match(reg1);
	if(!keys){
		return dateString;
	}
	var reg2Text=Sky.escapeRegExp(this.pattern).replace(reg1,function(word){
		if(word=="a"){
			return "(PM|AM)";
		}
		return "(\\d{"+word.length+"})";
	});
	reg2Text="^"+reg2Text+"$";
	var reg2=new RegExp(reg2Text);
	var values=dateString.match(reg2);
	if(!values) throw "ParseException";
	var date=new Date();
	var a12=false;
	var h12=false;
	for(var i=0;i<keys.length;i++){
		var key=keys[i];
		var value;
		if(!key.startsWith("a")){
			value=parseInt(values[i+1]);
			switch(key){
				case "yyyy":
					date.setFullYear(value);
					break;
				case "yy":
					date.setYear(value+Math.floor(date.getYear()/100)*100);
					break;
				case "MM":
				case "M":
					date.setMonth(value-1);
					break;
				case "dd":
				case "d":
					date.setDate(value);
					break;
				case "HH":
				case "H":
					date.setHours(value);
					h12=false;
					break;
				case "hh":
				case "h":
					h12=true;
					if(a12 && value<12){
						date.setHours(value+12);
					}else{
						date.setHours(value);
					}
					break;
				case "mm":
				case "m":
					date.setMinutes(value);
					break;
				case "ss":
				case "s":
					date.setSeconds(value);
					break;
				case "SSS":
					date.setMilliseconds(value);
					break;
				default:
			}
		}else{
			value=values[i+1];
			if(value=="PM" || value=="下午"){
				a12=true;
				if(h12){
					var h=date.getHours();
					if(h<12){
						date.setHours(h+12);
					}
				}
			}
		}
	}
	return date;
};
DateFormat.format=function(date){
	return date.toLocaleFormat("%Y/%m/%d %H:%M:%S");
};
DateFormat.parse=function(str){
	var d=new Date(str);
	if(isNaN(d)){
		d=new Date(str.replace(/\-/g,"/"));
		if(isNaN(d)){
			throw "ParseException";
		}
	}
	return d;
};
//setImmediate在setTimeout之前执行
if(!this.setImmediate){
	(function(global){
		var index=0;
		var handles=new Map();
		if(this.Promise){
			global.setImmediate=function(fn){
				index++;
				var args=Array.from(arguments);
				args.shift();
				var p=Promise.resolve(index);
				handles.set(index,args);
				p.then(function(id){
					var args=handles.get(id);
					if(args){
						fn.apply(global,args);
						clearImmediate(id);
					}
				});
				return index;
			};
		}else{
			var setTimeoutN=setTimeout;
			var ticks=null;
			global.setImmediate=function(fn){
				index++;
				if(!ticks){
					ticks=new Array();
					setTimeoutN(nextTick);
				}
				ticks.push(index);
				handles.set(index,arguments);
				return index;
			};
			var setTimeoutN=setImmediate.setTimeout=setTimeout;
			if(document.addEventListener){
				global.setTimeout=function(fn,time){
					time=time || 11;
					return setTimeoutN(fn,time);
				};
			}else{
				window.execScript('function setTimeout(fn,time){time=time || 54;var setTimeout=setImmediate.setTimeout;return setTimeout(fn,time);}');
			}
			function nextTick(){
				for(var i=0;i<ticks.length;i++){
					var id=ticks[i];
					var args=handles.get(id);
					if(args){
						var fn=args[0];
						args=Array.from(args);
						args.shift();
						try{
							fn.apply(global,args);
						}catch(e){
							console.error(e);
						}
					}
				}
				ticks=null;
				handles.clear();
			}
		}
		global.clearImmediate=function(id){
			handles['delete'](id);
		};
	})(this);
}
(function(global){
	function Deferred(){
		this._resolveds=[];
		this._rejecteds=[];
		this._state="pending";//resolved | rejected
	}
	Deferred.prototype.state=function(){
		return this._state;
	};
	Deferred.prototype.done=function(fn){
		if(this._state=="resolved"){
			fn.call(this,this.data);
		}else if(this._state=="pending"){
			this._resolveds.push(fn);
		}
		return this;
	};
	Deferred.prototype.fail=function(fn){
		if(this._state=="rejected"){
			fn.call(this,this.data);
		}else if(this._state=="pending"){
			this._rejecteds.push(fn);
		}
		return this;
	};
	Deferred.prototype.always=function(fn){
		if(this._state=="pending"){
			this._resolveds.push(fn);
			this._rejecteds.push(fn);
		}else{
			fn.call(this,this.data);
		}
	};
	Deferred.prototype.resolve=function(d){
		if(this._state=="pending"){
			this.data=d;
			this._state="resolved";
			this._resolveds.forEach(callAll,this);
			this._resolveds=null;
		}
		return this;
	};
	Deferred.prototype.reject=function(d){
		if(this._state=="pending"){
			this.data=d;
			this._state="rejected";
			this._rejecteds.forEach(callAll,this);
			this._rejecteds=null;
		}
		return this;
	};
	function callAll(fn){
		fn.call(this,this.data);
	}
	if(!this.Promise){
		function Promise(executor){
			Deferred.call(this);
			var me=this;
			function resolve(value) {
				setImmediate(function(){
					me.resolve(value);
				});
			}
			function reject(reason) {
				setImmediate(function(){
					me.reject(reason);
				});
			}
			try{
				executor(resolve, reject);
			}catch(e){
				reject(e);
			}
		}
		Promise.prototype=Object.create(Deferred.prototype);
		Promise.prototype.constructor=Promise;
		function nextPromise(before,after,resolve,reject){
			return function(value){
				try{
					var x=before(value);
					if(typeof x.then==="function"){
						x.then(resolve, reject);
					}else{
						after(x);
					}
				}catch(r){
					reject(r);
				}
			};
		}
		Promise.prototype.then=function(onResolved, onRejected){
			var me=this;
			onResolved=onResolved || Sky.noop;
			onRejected=onRejected || Sky.noop;
			return new Promise(function(resolve,reject){
				switch(me.state()){
					case "resolved":
						setImmediate(nextPromise(onResolved,resolve,resolve,reject),me.data);
						break ;
					case "rejected":
						setImmediate(nextPromise(onRejected,reject,resolve,reject),me.data);
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
			if (!Sky.isArray(promises)) {
				throw new TypeError('You must pass an array to all.');
			}
			return new Promise(function(resolve,reject){
				if(promises.length==0) return resolve(new Array());
				var result=new Array(promises.length);
				var c=0;
				promises.forEach(function(one,index){
					if(one instanceof Promise){
						one.then(function(data){
							c++;
							result[index]=data;
							if(c>=promises.length){
								resolve(result);
							}
						},function(data){
							reject(data);
						});
					}else{
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
				resolve(arg)
			});
		};
		Promise.reject=function(arg){
			return Promise(function(resolve,reject){
				reject(arg)
			});
		};
		global.Promise=Promise;
		global.Deferred=Deferred;
	}
	Sky.Deferred=function(){
		return new Deferred();
	};
})(this);

Sky.when=function(subordinate){
	if(arguments.length==1){
		return arguments[0];
	}
	var resolveValues=Array.from(arguments);
	var dfd=Sky.Deferred();
	var i=0;
	resolveValues.forEach(function(item){
		item.done(function(){
			i++;
			if(i==resolveValues.length){
				dfd.resolve();
			}
		});
	});
	return dfd;
};
/* 这个polyfill只适合解析URL，
 * URL对象创建后，属性修改，其他属性不会变化
 * 如果需要的话，用URL.js
  * */
try{
	if(new URL(location.href).href){
		Sky.support.URL=true;
	}else{
		Sky.support.URL=false;
	}
}catch(e){
	Sky.support.URL=false;
}
if(!Sky.support.URL){
	URL=function(relativePath, absolutePath){
		var path,arr;
		var pattern=/^[a-zA-Z]+:/;
		if(arr=relativePath.match(pattern)){
			this.href=relativePath;
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
				}else{
					this.username=arr[0];
				}
			}else{
				this.username="";
				this.password="";
				this.host=host;
			}
		}else if(absolutePath){
			var absInfo=absolutePath.indexOf?new URL(absolutePath):absolutePath;
			this.protocol=absInfo.protocol;
			this.hostname=absInfo.hostname;
			this.host=absInfo.host;
			this.origin=absInfo.origin;
			this.port=absInfo.port;
			this.username=absInfo.username || "";
			this.password=absInfo.password || "";
			this.pathname=absInfo.pathname;
			if(relativePath.startsWith("/")){
				path=relativePath;
			}else if(relativePath.startsWith("../")){
				path=absInfo.pathname.replace(/\/[^\/]*$/,"/")+relativePath;
				pattern=/[^\/]+\/\.\.\//;
				while(pattern.test(path)){
					path=path.replace(pattern,"");
				}
				path=path.replace(/^(\/\.\.)+/,"");
			}else{
				if(relativePath.startsWith("#")){
					this.search=absInfo.search;
					this.hash=relativePath;
					this.href=absInfo.href.replace(/#.*$/,this.hash);
					return ;
				}else if(relativePath.startsWith("?")){
					path=absInfo.pathname+relativePath;
				}else{
					path=absInfo.pathname.replace(/[^\/]*$/,"")+relativePath.replace(/^\.\//,"");
				}
			}
		}else{
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

		pattern=/(.*):(\d+)$/;
		arr=this.host.match(pattern);
		this.port="";
		if(arr){
			this.hostname=arr[1];
			if(arr[2]!="80"){
				this.port=arr[2];
			}
		}else{
			this.hostname=this.host;
		}
		this.origin=this.protocol+"//"+this.host;
		var user=this.username;
		if(user){
			if(this.password){
				user+=":"+this.password;
			}
			user+="@";
		}
		this.href=this.protocol+"//"+user+this.host+this.pathname+this.search+this.hash;
	};
}

Sky.getScript=function(src,func,charset){
	var script=document.createElement('script');
	if(!charset){charset="UTF-8"};
	script.charset=charset;
	script.src=src;
	script.async=true;
	if(func){
		var event='onreadystatechange';
		if(event in script){
			script.attachEvent(event,function(){
				if(script.readyState=='loaded'){
					document.head.appendChild(script);
				}else if(script.readyState=='complete'){
					script.detachEvent(event,arguments.callee);
					var evt=window.event;
					//evt.target=evt.currentTarget=evt.srcElement;
					func.call(script,evt);
				}
			});
		}else{
			if('onafterscriptexecute' in script){
				script.onafterscriptexecute=func;
			}else{
				script.onload=func;
			}
			document.head.appendChild(script);
		}
	}else{
		document.head.appendChild(script);
	}
	return script;
};
(function(){
	Sky.support.getCurrentPath=true;
	Sky.support.getCurrentScript=true;
	if("currentScript" in document){//最新浏览器
		Sky.getCurrentScript=function(){
			return document.currentScript;
		};
	}else{
		var currentScript;
		Sky.getCurrentScript=function(){//IE
			var nodes=document.getElementsByTagName('SCRIPT');
			var i=nodes.length;
			while(i--){
				var node=nodes[i];
				if(node.readyState==="interactive") {
					return node;
				}
			}
		};
		currentScript=Sky.getCurrentScript();
		if(!currentScript){//非IE的低版本
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
				var stackResult=handleStack(e,stackHandler);
				if(stackResult){
					Sky.getCurrentPath=function(){
						try{
							throw new Error('get stack');
						}catch(e){
							var arr=getLastStack(e[stackResult.name]).match(stackResult.pattern);
							if(arr && arr[1]!=location.href){
								return arr[1];
							}
						}
					};
					//同时加载多个相同的js会有问题
					Sky.support.getCurrentScript=false;
					Sky.getCurrentScript=function(){
						var nodes=(Sky.isReady?document.head:document).getElementsByTagName('SCRIPT');
						var i=nodes.length;
						var currentPath=Sky.getCurrentPath();
						if(currentPath){
							while(i--){
								var node=nodes[i];
								if(new URL(node.src,location).href==currentPath) {
									return node;
								}
							}
						}else{
							return nodes[nodes.length-1];
						}
					};
				}else{//同时加载多个js会有问题
					Sky.support.getCurrentScript=false;
					Sky.support.getCurrentPath=false;
					Sky.getCurrentScript=function(){
						var nodes=(Sky.isReady?document.head:document).getElementsByTagName('SCRIPT');
						return nodes[nodes.length-1];
					};
				}
			}
		}
	}
	if(!Sky.getCurrentPath){
		Sky.getCurrentPath=function(){
			var currentScript=Sky.getCurrentScript();
			return new URL(currentScript.src,location).href;
		};
	}
	function getLastStack(stack){
		var stacks=stack.trim().split("\n");;
		return stacks[stacks.length-1];
	}
	function handleStack(e,stackHandler){
		for(var name in stackHandler){
			var stacks=e[name];
			if(stacks){
				var patterns=stackHandler[name];
				var stack=getLastStack(stacks);
				var i=patterns.length;
				while(i--){
					var pattern=patterns[i];
					if(pattern.test(stack)){
						return {'name':name,'pattern':pattern};
					}
				}
			}
		}
	}
})();

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
		if(Array.isArray(deps)){
			var promises=deps.map(getDepsPromise,null);
			Promise.all(promises).then(function(data){
				callback.apply(this,data);
			},onerror);
		}else{
			var name=deps;
			switch(name){
				case 'require':
					return this.require || (this.require=require.bind(this));
				case 'exports':
					return this.exports || (this.exports=new Object());
				case 'module':
					return this;
			}
			var module=nameToModule(name,this);
			if(module.status===Status.COMPLETE){
				return module.exports;
			}else if(module.status===Status.DEFINED){
				return module.loadSync();
			}
			throw new Error("module("+name+") must loaded before");
		}
	};
	function getDepsPromise(dep){
		switch(dep){
			case 'require':
				return this.require || (this.require=require.bind(this));
			case 'exports':
				return this.exports || (this.exports=new Object());
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
	Module.prototype.loadSync=function(){
		var result;
		this.delay=function(fn){
			throw "the module ["+this.name+"] has not been loaded yet";
		};
		if(this.deps && this.deps.length){
			var deps=this.deps.map(function(dep){
				return require.call(this,dep);
			},this);
			result=this.initor.apply(this,deps);
		}else{
			result=this.initor();
		}
		this.resolve(result);
		this.status=Status.COMPLETE;
		return this.exports;
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

(function(){
	var paths={};
	Module.config(function(name,from){
		var module,url,href;
		if(!name.startsWith("//") && name.match(/^(\/|\.|\w+:)/) ){//模块名称是相对路径
			url=new URL(name,from && from.url || location);
			module=Module.getCache(url.href);
			if(module){
				return module;
			}
			module=new Module();
			href=url.href;
			Module.setCache(href,module);
			module.init(href);
		}else{
			module=Module.getCache(name);
			if(module){
				return module;
			}
			if(Object.prototype.hasOwnProperty.call(paths,name)){
				url=new URL(paths[name],Module.base);
			}else{
				url=new URL(name,Module.base);
			}
			href=url.href;
			module=new Module(name);
			Module.setCache(name,module);
			Module.setCache(href,module);
			var path=url.href;
			if(path.match(/.*\/[^\/\.]+$/)){//没有扩展名
				path+=".js";
			}
			module.init(path);
		}
		return module;
	});
	Module.path=function(name,path){
		paths[name]=path;
	};
})();