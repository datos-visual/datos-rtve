var polyModules = [];

if (!window.Array.prototype.forEach && !window.Array.prototype.reduce) {
    polyModules.push('core/polyfill/array');
}
if(!window.JSON) {
    polyModules.push('core/polyfill/json3');
}
if(!Object.keys) {
    polyModules.push('core/polyfill/keys');
}
if(!Function.prototype.bind) {
    polyModules.push('core/polyfill/bind');
}
if(!window.history || !window.history.pushState) {
    polyModules.push('core/polyfill/history');
}

define(polyModules,function(){
  return true;
});
