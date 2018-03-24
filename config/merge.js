(function(){
	var isLoad=false;
	Module.config(function(name,from){
		if(name=="animal" || name.startsWith("animal.")){
			var module=Module.getCache(name);
			if(module){
				return module;
			}
			if(isLoad){
				module=new Module(name);
				Module.setCache(name,module);
			}else{
				module=new Module(name);
				Module.setCache(name,module);
				var url=new URL("animal.js",Module.base);
				module.init(url.href);
				isLoad=true;
			}
			return module;
		}
	});
})();