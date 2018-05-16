(function(){
	var bundle=new Map();
	Module.bundle=function(uri,names){
		bundle.set(uri,names);
	};
	var isLoad={};
	Module.config(function(name,from){
		bundle.forEach(handleBundle,name);
	});
	function handleBundle(names,uri){
		var name=this.toString();
		var i=names.length;
		while(i--){
			var cname=names[i];
			if(name==cname || name.startsWith(cname+"/")){
				var module=Module.getCache(name);
				if(module){
					return module;
				}
				module=new Module(name);
				Module.setCache(name,module);
				if(isLoad[uri]!==true){
					var url=new URL(uri,Module.base);
					module.init(url.href);
					isLoad[uri]=true;
				}
				return module;
			}
		}
	}
})();