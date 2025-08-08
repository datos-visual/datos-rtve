module.exports = function(grunt) {
  'use strict';

  // CONFIGURACIÓN Y TAREAS GLOBALES
  // OBTENEMOS CONFIGURACIONES DE CORE Y LAS EXTENDEMOS CON LA INFORMACIÓN DE ESTE MÓDULO
  var configs = require('grunt-ci-manager')(grunt);
  configs.pkg = grunt.file.readJSON('package.json'); // necesario para grunt

  // CONFIGURACIONES LOCALES PARA GRUNT
  //...
  configs.packgrInstall.js.options.finalName = 'index'; // empaquetado de js cliente
  configs.jshint.dev.options.globals.requirejs = true; // Activa
  configs.forceCompileTemplates = true;

  // una vez hechos los cambios locales, lo iniciamos
  grunt.initConfig(configs);
};
