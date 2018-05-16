(function(){
	var package=new Map();
	Module.package=function(packname,uri){
		package.set(packname,uri);
	};
	var isLoad={};
	Module.config(function(name,from){
		Module.config(function(name,from){
			package.forEach(handlePackage,name);
		});
	});
	function handlePackage(uri,packname){
		var name=this.toString();
		if(name==packname || name.startsWith(packname+"/")){
			var module=Module.getCache(name);
			if(module){
				return module;
			}
			module=new Module(name);
			Module.setCache(name,module);
			if(isLoad[uri]!==true){
				var url=new URL(name+".js",new URL(uri,Module.base));
				module.init(url.href);
				isLoad[uri]=true;
			}
			return module;
		}
	}
})();