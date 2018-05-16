(function(){
	var cache=[];
	Module.config(function(name,from){
		if(name.endsWith(".*")){
			var module=Module.getCache(name);
			if(module){
				return module;
			}
			var package=name.substr(0,name.length-2);
			var url=new URL(package.replace(/\./g,'/')+".js",Module.base);
			module=new Module(name);
			Module.setCache(name,module);
			Module.setCache(url.href,module);
			package+=".";
			if(cache.indexOf(package)<0){
				cache.push(package);
			}
			module.init(url.href);
			return module;
		}
	});
	Module.config(function(name,from){
		if(name.match(/^[^\.]+[a-z0-9_\$\.]*$/i)){
			var module=Module.getCache(name);
			if(module){
				return module;
			}
			var package=cache.find(queryCache,name);
			if(package){
				var packMod=Module.getCache(package+"*");
				module=new Module(name);
				Module.setCache(name,module);
				module.define([packMod],initor);
			}else{
				var url=new URL(name.replace(/\./g,'/')+".js",Module.base);
				module=new Module(name);
				Module.setCache(name,module);
				Module.setCache(url.href,module);
				module.init(url.href);
			}
			return module;
		}
	});
	function initor(exports){
		var package=this.deps[0].name;
		var paths=this.name.substring(package.length-1,this.name.length).split(".");
		for(var i=0;i<paths.length;i++){
			exports=exports[paths[i]];
		}
		return exports;
	}
	function queryCache(package){
		return this.startsWith(package);
	}
})();