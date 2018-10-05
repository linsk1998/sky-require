
Module.config(function(name,from){
	var module,url;
	if(name.endsWith(".xml")){
		module=Module.getCache(name);
		if(module){
			return module;
		}
		module=new Module(name);
		url=new URL(name,Module.base);
		Module.setCache(name,module);
		Module.setCache(url.href,module);
		Sky.ajax({
			url:url.href,
			dataType:"xml",
			success:function(xml){
				module.resolve(xml);
			},
			error:function(){
				module.reject();
			}
		});
	}
	return module;
});