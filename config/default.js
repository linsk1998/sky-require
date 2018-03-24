
(function(){
	var paths={};
	Module.config(function(name,from){
		var module,url;
		if(name.match(/^(\/|\.|\w+:)/)){//模块名称是路径
			url=new URL(name,from && from.url || location);
			module=Module.getCache(url.href);
			if(module){
				return module;
			}
			module=new Module();
			Module.setCache(url.href,module);
			module.init(url.href);
		}else{
			module=Module.getCache(name);
			if(module){
				return module;
			}
			if(Object.prototype.hasOwnProperty.call(paths,name)){
				url=new URL(paths[name],Module.base);
			}else{
				url=new URL(name+".js",Module.base);
			}
			module=new Module(name);
			Module.setCache(name,module);
			Module.setCache(url.href,module);
			module.init(url.href);
		}
		return module;
	});
	Module.path=function(name,path){
		paths[name]=path;
	};
})();