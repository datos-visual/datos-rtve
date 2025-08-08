/* jshint esversion: 6 */

const express = require('express');

// SERVICIOS LOCALES
const mainService = require('../services/mainService.js');

const rtveLogger = require('rtve-module-logger'),
    logger = rtveLogger.getLogger('rtve.pf-fosas.mainController'),
    properties = require('rtve-module-properties')(process.env.NODE_ENV);


const homeController = (req, res) => {
    logger.debug(`Principal Controller Request...`);
    mainService.getHome(req, res, function (err, data) {
        if (err) {
            res.status(500).send('Unhandled error: ' + err);
        } else {
            res.render('VISTA_HOME', {
                params: data
            });
        }
    });
};

const filterController = (req, res) => {
    logger.debug(`Filter By Location Controller Request...`);
    mainService.filterByLoc(req, res, function (err, data) {
        if (err) {
            res.status(500).send('Unhandled error: ' + err);
        } else {
            res.render('VISTA_LOC', {
                params: data
            });
        }
    });
};

const fosaController = (req, res) => {
    logger.debug(`Fosa Controller Request...`);
    mainService.getFosa(req, res, function (err, data) {
        if (err) {
            res.status(500).send('Unhandled error: ' + err);
        } else {
            res.render('VISTA_FOSA', {
                params: data
            });
        }
    });
};

// ROUTING
module.exports = express.Router()
    .get(`/`, homeController)
    .get(`/fosa/:title/:id`, fosaController)
    .get(`/:ccaa/`, filterController)
    .get(`/:ccaa/:prov/`, filterController)
    .get(`/:ccaa/:prov/:mun/`, filterController);

