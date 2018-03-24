define("animal.insect.Bee",
[],
function (){
	function Bee(){
		this.say=function(){
			alert("嗡嗡嗡");
		};
	}
	return Bee;
});
define("animal.insect.Fly",
[],
function (){
	function Fly(){
		this.say=function(){
			alert("嗡嗡嗡");
		};
	}
	return Fly;
});
define("animal.insect.*",
["exports","animal.insect.Bee","animal.insect.Fly"],
function(exports,Bee,Fly){
exports.Bee=Bee;
exports.Fly=Fly;
});
define("animal.insect.Bee",
[],
function (){
	function Bee(){
		this.say=function(){
			alert("嗡嗡嗡");
		};
	}
	return Bee;
});
define("animal.insect.Fly",
[],
function (){
	function Fly(){
		this.say=function(){
			alert("嗡嗡嗡");
		};
	}
	return Fly;
});
define("animal.insect.*",
["exports","animal.insect.Bee","animal.insect.Fly"],
function(exports,Bee,Fly){
exports.Bee=Bee;
exports.Fly=Fly;
});
define("animal.mammal.Cat",
[],
function (){
	function Cat(){
		this.say=function(){
			alert("喵");
		};
	}
	return Cat;
});
define("animal.mammal.Dog",
[],
function (){
	function Dog(){
		this.say=function(){
			alert("汪");
		};
	}
	return Dog;
});
define("animal.mammal.*",
["exports","animal.mammal.Cat","animal.mammal.Dog"],
function(exports,Cat,Dog){
exports.Cat=Cat;
exports.Dog=Dog;
});
define("animal.mammal.Cat",
[],
function (){
	function Cat(){
		this.say=function(){
			alert("喵");
		};
	}
	return Cat;
});
define("animal.mammal.Dog",
[],
function (){
	function Dog(){
		this.say=function(){
			alert("汪");
		};
	}
	return Dog;
});
define("animal.mammal.*",
["exports","animal.mammal.Cat","animal.mammal.Dog"],
function(exports,Cat,Dog){
exports.Cat=Cat;
exports.Dog=Dog;
});
define("animal.*",
["exports","animal.insect.*","animal.mammal.*"],
function(exports,insect,mammal){
exports.insect=insect;
exports.mammal=mammal;
});