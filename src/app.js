/* jshint esversion: 6 */
const rtveLogger    = require('rtve-module-logger'),
    logger          = rtveLogger.getLogger('rtve.pf-fosas.app'),
    properties      = require('rtve-module-properties')(process.env.NODE_ENV),
    mainController  = require('./routes/mainController'),
//    { normalizeText } = require('./lib/utils'),
    swig            = require('swig'),
    mainService     = require('./services/mainService'),
    path            = require('path'),
    pkg             = require(path.join(__dirname,'../package.json')),
    common          = require('rtve-module-common')(pkg.distName),
    bodyParser      = require('body-parser'),
    express         = require('express');


/* swig.setFilter('link', mainService.getLink);
swig.setFilter('int', mainService.formatInt);
swig.setFilter('number', mainService.formatNumber);
swig.setFilter('replaceUrlParam', mainService.replaceUrlParam);
swig.setFilter('normalizeText', normalizeText); */

logger.debug(`Principal APP Request...`);

let app = express();

// Configurar pfPath según arquitectura RTVE (requerido para módulos)
app.locals.pfPath = common.getPfPath('/' + properties.server_path.split('/')[0]); // '/noticias'

app.engine('html', swig.renderFile)
    .set('view engine', 'html')
    .set('views', path.join(__dirname, 'views'))
    .set('view cache', properties.view_cache);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/css", express.static(__dirname + '/../dist/css'));
app.use("/js", express.static(__dirname + '/../dist/js'));
app.use('/' + properties.server_path, mainController);

swig.setDefaults({
    cache: properties.swig_view_cache,
    locals: {
        envType: '',
        cssUrl:  properties.css2Domain,
        cssdomain:  properties.css2Domain,
        jsUrl: properties.js2Domain,
        imgUrl: properties.img2Domain,
        imgdomain: properties.img2Domain,
        vsp: properties.videos_version_player,
        apidomain: properties.api2Domain,
        jsdomain: properties.js2Domain,
        pfPath: app.locals.pfPath,
        globalURL: properties.globalURL

    }
});

module.exports = app;