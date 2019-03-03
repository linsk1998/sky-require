var fs=require("fs");
var out=[];
out.push(fs.readFileSync(__dirname+'/../skyjs/js/overload.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/support.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/data.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/enum-object.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/inherits-object.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/function.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/collection.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../url-polyfill/URLSearchParams.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../url-polyfill/URL.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/setImmediate.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/promise.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/document.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/currentScript.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/console.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/utils-script.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/../skyjs/js/utils-ready.js', 'utf-8'));
out.push(fs.readFileSync(__dirname+'/loader.js', 'utf-8'));
fs.writeFileSync(__dirname+'/sky-loader.js', out.join("\n"), 'utf-8');
var bundle=require("./bundle");
bundle(__dirname+"/animal","/animal");