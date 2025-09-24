/**
 * Coloca una capa flotante 'fixed'. 
 * El componente a dejar fijo se debe pasar como parametro así como el className que aplicará el estilo de fijación:
 *      init: function (capaFixed, className)
 * Se calcula la pocision inicial del componente y al llegar a dicha altura el componente quedará de nuevo integrado dentro del HTML.
 * El componenete puede estar tanto en la parte superior inferior o intermedia de la vista en un principio. 
 * En la parte de la pantalla que se fije (superior/inferior) dependerá de los estilos aplicados y no de la programación
 * 
 * @module Fixed
 */
define(['vendor/jquery', 'core/core_library'], function ($, core) {

    /**
     * @function Fixed
     * @param  {String} capaFixed Clase del HTML del slider.
     * @return Devuelve el objeto Fixed con sus funcionalidades inicializadas.
     */
    var Fixed = core.ProJS.Class.extend({

        altura: 0,
        capaFixed: '',
        domContainer: '',
        elementPositionTop: 0,
        elementPositionBottom: 0,
        topMenu: false,

        /**
         * Iniciamos y ejecutamos toda la funcionalidad, recibiendo de entrada la class de la capa que queremos fijar.
         * @function init
         * @param  {String} capaFixed Clase del HTML del slider.
         * @return Devuelve el objeto Fixed con sus funcionalidades inicializadas.
         */
        init: function (capaFixed, className) {
            this.fixedElement = $(capaFixed);
            this.className = className;
            if (this.fixedElement) {
                this.elementPositionTop = this.fixedElement.offset().top;
                this.elementPositionBottom = this.elementPositionTop + this.fixedElement.height();
            }

            if (this.elementPositionBottom <= window.innerHeight) {
                this.topMenu = true;
            }

            if (!this.topMenu && this.elementPositionTop > 0) {
                this.fixedElement.addClass(this.className);
            } else if (this.topMenu && $(window).scrollTop() > window.innerHeight) {
                this.fixedElement.addClass(this.className);
            }
        },

        /**
         * Iniciamos la funcionalidad de calcular la altura en la que se encuentra, posicionamiento y comprobación de la capa.
         * @function run
         */
        run: function () {

            this.posicionarMenu();
            var _this = this;

            $(window).scroll(function () {
                _this.posicionarMenu();
            });

            $(window).resize(function () {
                _this.posicionarMenu();
            });
        },

        /**
         * Ponemos o quitamos la clase pada dejar fija la capa.
         * @function posicionarMenu
         */
        posicionarMenu: function () {
            if (!this.topMenu && (((window.innerHeight + $(window).scrollTop()) <= this.elementPositionBottom ) || ((window.innerHeight + $(window).scrollTop()) > window.innerHeight + this.elementPositionTop))) {
                this.fixedElement.addClass(this.className);
            } else if (this.topMenu && ( window.innerHeight+ $(window).scrollTop()) > (window.innerHeight + this.elementPositionTop)) {
                this.fixedElement.addClass(this.className);
            } else {
                this.fixedElement.removeClass(this.className);
            }
        }
    });

    Fixed.mixin(core.ProJS.Mediable);
    return Fixed;
});