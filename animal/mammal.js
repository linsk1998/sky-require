define("animal/mammal/Cat",
[],
function (){
	function Cat(){
		this.say=function(){
			alert("喵");
		};
	}
	return Cat;
});
define("animal/mammal/Dog",
[],
function (){
	function Dog(){
		this.say=function(){
			alert("汪");
		};
	}
	return Dog;
});
define("animal/mammal",
["exports","animal/mammal/Cat","animal/mammal/Dog"],
function(exports,Cat,Dog){
exports.Cat=Cat;
exports.Dog=Dog;
});