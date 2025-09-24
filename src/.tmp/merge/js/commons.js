define(function(require, exports, module) {

	var confStats = require('conf/statistics');
	var stats = require('statistics');
	var sim_nav = require('sim_nav');
	var core = require('core/core_library');
	var beOnButton = require('beOnButton');
	var Fixed = require('Fixed');
    var $ = require('vendor/jquery');
	var pfPath = $('body').data('app');
	var playerfactory = require('playerfactory');
    
	exports.Fixed = Fixed;
	exports.stats = stats;
	exports.sim_nav = sim_nav;
	exports.mediator = new core.ProJS.Mediator();
	exports.history = window.history;
	exports.pfPath = pfPath ? pfPath : '';
	exports.playerfactory = playerfactory;
});