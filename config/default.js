
(function(){
	var paths={};
	Module.config(function(name,from){
		var module,url;
		if(!name.startsWith("//") && name.match(/^(\/|\.|\w+:)/) ){//模块名称是相对路径
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
				url=new URL(name,Module.base);
			}
			module=new Module(name);
			Module.setCache(name,module);
			Module.setCache(url.href,module);
			var path=url.href;
			if(path.match(/.*\/[^\/\.]$]/)){//没有扩展名
				path+=".js";
			}
			module.init(url.href);
		}
		return module;
	});
	Module.path=function(name,path){
		paths[name]=path;
	};
})();