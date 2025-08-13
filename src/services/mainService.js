/* jshint esversion: 6 */

const rtveLogger = require('rtve-module-logger'),
    common = require('rtve-module-common')('pf-fosas'),
    properties = require('rtve-module-properties')(process.env.NODE_ENV),
    logger = rtveLogger.getLogger('rtve.pf-fosas.mainService');


    function getHome(req, res, callback){
        let data = {};
        //Construir objeto data con la información que se necesite
        return callback(null, data);
    }

    function getFosa(req, res, callback){
        let data = {
            title: req.params.title,
            id: req.params.id
        };
        return callback(null, data);
    }

    function filterByLoc(req, res, callback){
        let data = {};
        return callback(null, data);
    }

module.exports = {
    getHome: getHome,
    getFosa: getFosa,
    filterByLoc: filterByLoc
};

