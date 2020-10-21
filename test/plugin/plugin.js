
		define([],function(){
			console.log('plugin');
			return {
				load:function(path,require,resolve,config){
					setTimeout(function(){
						resolve("hhh");
					},5000);
				}
			};
		});