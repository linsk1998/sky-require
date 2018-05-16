define("animal/insect/Bee",
[],
function (){
	function Bee(){
		this.say=function(){
			alert("嗡嗡嗡");
		};
	}
	return Bee;
});
define("animal/insect/Fly",
[],
function (){
	function Fly(){
		this.say=function(){
			alert("嗡嗡嗡");
		};
	}
	return Fly;
});
define("animal/insect",
["exports","animal/insect/Bee","animal/insect/Fly"],
function(exports,Bee,Fly){
exports.Bee=Bee;
exports.Fly=Fly;
});