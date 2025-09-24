define(function(require) {

	var $ = require('vendor/jquery');

	function fallback() {
		var h = window.location.host;
		if ((h.match(/(.+)(rtve\.es)$/) || h.match(/(.+)(rtve\.int)$/) || h.match(/(.+)(playz\.es)$/)) && h !== 'www.pre.rtve.es' && h !== 'prewww.rtve.es') {
			return 'GTM-XGJJ'; // pro;
		} else {
			return 'GTM-W3SQPS'; // pre;
		}
	}

	function env() {
		var tagManagerUid = $('body').attr('data-uidtm');

		if (tagManagerUid) return tagManagerUid;
		
		return fallback();
	}

	return env();

});