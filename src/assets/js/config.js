/*var elem    = document.getElementsByTagName('html')[0],
    vsp     = elem.getAttribute('data-vsp'),
    jsdomain = elem.getAttribute('data-jsdomain'),
    imgdomain = elem.getAttribute('data-imgdomain'),
    body =  document.getElementsByTagName('body')[0];*/

//window.imgdomain = imgdomain ;
var config = {
    'paths': {
        'polyfill': [
            'core/polyfill-none'
        ],
        'polyfill-launcher': [
            'core/polyfill-launcher'
        ],
        "ajaxify":"ajaxify",
        "jquery":"vendor/jquery",
        "chosen":"vendor/chosen/chosen.jquery.min",
        "rangeslider":"vendor/rangeslider/rangeslider"
    },
    map: {
        '*': {
            'vendor/jquery': 'vendor/noconflict_jquery'
        },
        'vendor/noconflict_jquery': {
            'vendor/jquery': 'vendor/jquery'
        }
    },
    shim: {
        'ajaxify': {
            deps: ['vendor/jquery']
        },
        'rangeslider': {
            deps: ['vendor/jquery']
        }

    },
    deps: ['index']
}
require.config(config);

