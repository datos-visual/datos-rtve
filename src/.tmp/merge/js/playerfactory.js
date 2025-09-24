// Inicializador del módulo
define(['vendor/jquery'], function ($) {

    var deferred = $.Deferred();

    /**
     * @description Prototipo para includes debido a que String.includes no está soportado por IE11
     */
    if (!String.prototype.includes) {
        Object.defineProperty(String.prototype, 'includes', {
            value: function (search, start) {
                if (typeof start !== 'number') {
                    start = 0;
                }
                if (start + search.length > this.length) {
                    return false;
                } else {
                    return this.indexOf(search, start) !== -1;
                }
            }
        });
    }

    /**
     * @description Usa el valor dado por la pagina para obtener la version y dominio del player segun contexto
     * @param {String} ctx Contexto de la página [portadilla, infantil, media...]
     * @returns {String} ruta del fallback
     */
    function getFallbackPlayerPath(ctx) {
        if (ctx === 'infantil') {
            var infantilPlayerPath = typeof rtveUrl !== 'undefined' && typeof playerVersion !== 'undefined' ? rtveUrl + playerVersion : '';
            if (infantilPlayerPath && !infantilPlayerPath.includes('://')) {
                infantilPlayerPath = '//' + infantilPlayerPath;
            }
            return infantilPlayerPath;
        }

        var jsdomain = $('html').data('jsdomain') || $('#footer').data('jsdomain') || $('#rtveDomain').text() || document.location.host;
        if (jsdomain && !jsdomain.includes('://')) {
            jsdomain = '//' + jsdomain;
        }

        var vsp = $('#vsp').attr('value') || $('html').attr('data-vsp');

        var playerPath = $('#playerVersion').text();
        if (!playerPath && vsp) {
            playerPath = '/pages/rtve-player-app/' + vsp + '/js';
        }

        return jsdomain + playerPath;
    }

    /**
     * @description funcion que devolvera un objeto con la version del player y el dominio JS playerversion
     * @param {String} context Contexto de la página [portadilla, infantil, media...]
     */
    function playerfactory(context) {
        // URL PARA ACCEDER AL NUEVO PLAYER VERSION LOCATOR
        var rtvedomain = $('#rtveDomain').text() || $('html').attr('data-embeddomain') || document.location.host;
        if (rtvedomain && !rtvedomain.includes('://')) {
            rtvedomain = '//' + rtvedomain;
        }
        // ruta para el servicio player version locator
        var playerLocatorUrl = rtvedomain + '/servicios/player/version/',
            objPath = {};

        $.ajax({ type: 'GET', url: playerLocatorUrl, timeout: 500, data: { 'context': context } })
            .then(function (result) {
                var playerConfig = JSON.parse(result),
                    jsdomain = playerConfig.jsdomain || rtvedomain;
                if (!jsdomain.includes('://')) {
                    jsdomain = '//' + jsdomain;
                }
                objPath = {
                    'rtveplayer': jsdomain + '/pages/rtve-player-app/' + playerConfig.version + '/js/rtveplayer',
                    'vendor/videojs': jsdomain + '/pages/rtve-player-app/' + playerConfig.version + '/js/vendor/videojs'
                };
            }, function () {
                var ruta = getFallbackPlayerPath(context);
                objPath = {
                    'rtveplayer': ruta + '/rtveplayer',
                    'vendor/videojs': ruta + '/vendor/videojs'
                };
            }).always(function () {
                require.config({
                    paths: objPath
                });
                require(['rtveplayer/RtvePlayerBoxFactory'], function (RtvePlayerBoxFactory) {
                    deferred.resolveWith(this, [RtvePlayerBoxFactory]);
                });
            });
        return deferred.promise();
    }

    return playerfactory;
});