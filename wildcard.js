
var fs=require('fs');
function wildcard(dirPath,parent){
	var dirList=fs.readdirSync(dirPath);
	var content=[];
	var modules=[];
	var packages=[];
	dirList.forEach(function(file){
		var path=dirPath+"/"+file;
		var stat=fs.statSync(path);
		if(stat.isDirectory()){
			content.push(wildcard(path,parent+"/"+file));
		}else{
			var r=file.match(/([a-z0-9_\$]+).js$/i);
			if(r){
				var script=fs.readFileSync(path,'utf-8');
				var module=eval(script);
				if(module.name){
					content.push(script);
					packages.push(r[1]);
				}else{
					module.name=checkPath.call(parent,r[1]);
					content.push('define("'+module.name+'",');
					content.push(JSON.stringify(module.deps.map(checkPath,parent))+",");
					content.push(module.initor+');');
					modules.push(r[1]);
				}
			}
		}
	});
	content.push('define("'+checkPath.call(parent,'*')+'",');
	content.push(JSON.stringify(['exports'].concat(
		packages.map(checkPackage,parent),
		modules.map(checkPath,parent)
	))+",");
	content.push('function('+['exports'].concat(
		packages,
		modules
	).join(',')+'){');
	packages.forEach(function(name){
		content.push('exports.'+name+'='+name+';');
	});
	modules.forEach(function(name){
		content.push('exports.'+name+'='+name+';');
	});
	content.push('});');
	var fileContent=content.join("\n");
	fs.writeFileSync(dirPath+'.js', fileContent, 'utf-8');
	return fileContent;
}
function define(arg1,arg2,arg3){
	var module={};
	if(arg3){
		module.initor=arg3;
		module.deps=arg2;
		module.name=arg1;
	}else if(arg2){
		module.initor=arg2;
		module.deps=arg1;
	}else if(typeof arg1=="function"){
		module.deps=[];
		module.initor=arg1.toString();
	}else{
		module.deps=[];
		module.initor=JSON.stringify(arg1);
	}
	return module;
}
function checkPath(to){
	var from=this.toString();
	var path;
	if(to.startsWith("/")){
		path=to;
	}else if(to.startsWith("./")){
		path=from+'/'+to.substr(2);
	}else{
		path=from+'/'+to;
		var pattern=/[^\/]+\/\.\.\//;
		while(pattern.test(path)){
			path=path.replace(pattern,"");
		}
		path=path.replace(/^(\/\.\.)+/,"");
	}
	return transformPath(path);
}
function transformPath(path){
	path=path.replace(/\//g,".");
	return path.substr(1);
}
function checkPackage(to){
	return checkPath.call(this,to+"/*");
}
module.exports=wildcard;