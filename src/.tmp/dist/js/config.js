var vsp = document.getElementsByTagName('html')[0].getAttribute('data-vsp');
var urlJsPlayer = '/pages/rtve-player-app/'+vsp;
require.config({
  'paths': {
    'polyfill': [
      'core/polyfill-none'
    ],
    'polyfill-launcher': [
      'core/polyfill-launcher'
    ],
    'rtveplayer': urlJsPlayer+'/js/rtveplayer',
    'vendor/videojs':urlJsPlayer+'/js/vendor/videojs'
  },
  map: {
    '*': {
      'vendor/jquery': 'vendor/noconflict_jquery'
    },
    'vendor/noconflict_jquery': {
      'vendor/jquery': 'vendor/jquery'
    }
  }
});

// If IE8...
if (!Function.prototype.bind || !Object.keys || !window.JSON || (!window.Array.prototype.forEach && !window.Array.prototype.reduce)) {
  require.config({
    map: {
      '*': {
        'polyfill': 'polyfill-launcher'
      }
    }
  });
}