
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