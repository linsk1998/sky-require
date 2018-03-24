
define([new Promise(function(resolve, reject){
	setTimeout(function(){
		resolve('200 OK');
	},1000);
})],function(msg){
	return msg;
});