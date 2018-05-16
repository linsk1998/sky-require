var bundle=require("./bundle");
bundle(__dirname+"/animal","/animal");
var fs=require("fs");
var request=require("request");

var fileName=__dirname+'/sky-module.js';
new Promise(function(resolve, reject){
	var fos=fs.createWriteStream(fileName)
	request.get('http://raw.githack.com/linsk1998/skyjs/master/js/base.js').pipe(fos).on('close',function(){
		resolve();
	});
}).then(function(){
	return new Promise(function(resolve, reject){
		var fos=fs.createWriteStream(fileName,{'flags':'a'});
		request.get('http://raw.githack.com/linsk1998/skyjs/master/js/core.js').pipe(fos).on('close',function(){
			resolve();
		});
	});
}).then(function(){
	return new Promise(function(resolve, reject){
		var fos=fs.createWriteStream(fileName,{'flags':'a'});
		request.get('http://raw.githack.com/linsk1998/skyjs/master/js/extend.js').pipe(fos).on('close',function(){
			resolve();
		});
	});
}).then(function(){
	return new Promise(function(resolve, reject){
		var fos=fs.createWriteStream(fileName,{'flags':'a'});
		request.get('http://raw.githack.com/linsk1998/skyjs/master/js/promise.js').pipe(fos).on('close',function(){
			resolve();
		});
	});
}).then(function(fos){
	return new Promise(function(resolve, reject){
		var fos=fs.createWriteStream(fileName,{'flags':'a'});
		request.get('http://raw.githack.com/linsk1998/skyjs/master/js/url-read.js').pipe(fos).on('close',function(){
			resolve();
		});
	});
}).then(function(fos){
	return new Promise(function(resolve, reject){
		var fos=fs.createWriteStream(fileName,{'flags':'a'});
		request.get('http://raw.githack.com/linsk1998/skyjs/master/js/script.js').pipe(fos).on('close',function(){
			resolve();
		});
	});
}).then(function(fos){
	return new Promise(function(resolve, reject){
		var fos=fs.createWriteStream(fileName,{'flags':'a'});
		fs.createReadStream(__dirname+'/module.js').pipe(fos).on('close',function(){
			resolve();
		});
	});
});