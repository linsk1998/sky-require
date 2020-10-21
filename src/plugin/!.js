(function(){
	require.hook({
		load:function(url,from,name){
			if(!name) name=url.href;
			var arr=name.split("!");
			if(arr.length==2){
				return pluginToPromise(name,arr[0],from);
			}
			url=null;
		}
	});
	function pluginToPromise(name,pluginName,from){
		return new Promise(function(resolve, reject){
			function modResolve(exports){
				resolve(exports);
			}
			var modRequire=require.bind(from);
			from.require([pluginName],function(plugin){
				plugin.load(name, modRequire, modResolve);
			}, reject);
		});
	}
})();