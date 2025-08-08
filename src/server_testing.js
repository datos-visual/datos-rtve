const logger            = require('rtve-module-logger').getLogger('rtve.pf-fosas.testing'),
    properties          = require('rtve-module-properties')(process.env.NODE_ENV),
    path                = require('path'),
    pkg                 = require(path.join(__dirname,'../package.json')),
    common              = require('rtve-module-common')(pkg.distName),
    content_middleware  = require('rtve-module-content-negotiator').middleware,
    express             = require('express'),
    swig                = require('swig'),
    Url                 = require('url'),
    cookieParser        = require('cookie-parser'),
    pf_path             = common.getPfPath('/noticias'),
    ssi_pattern         = new RegExp('^' + pf_path + '\/((?!\/modulos).)*$'),
    ssi_r               = require('rtve-module-ssi')('http://localhost:' + properties.nodePort, ssi_pattern, '/template', '');

// content-negotiator settings
content_middleware.addMapExtension('html', 'text/html');
content_middleware.setDefaultType('text/html');

// Configuración para simular entorno de producción  (grunt pro)
var isDevMode = process.argv.slice(2).includes('nobuild'),
    baseFolder = isDevMode ? '.' : '../dist',
    buildTarget = isDevMode ? '/.tmp/merge' : '.';

// Configuraciones iniciales
const appwrapper = express(),
    app = require('./app.js');
app.set('views', path.join(__dirname, baseFolder, 'views'));

swig.setDefaults({
    locals: {
      jsUrl:  properties.js2Domain,
      cssUrl: properties.css2Domain,
      imgUrl: properties.img2Domain
    }
  });

appwrapper
    .engine('html', swig.renderFile)
    .set('view engine', 'html')
    .use(express.static(path.join(__dirname, baseFolder, buildTarget))) // archivos estáticos
    .use('/css', (req, res) => res.redirect(properties.css2Domain + req.originalUrl)) // Proxy to http://css2.rtve.es CSS files
    .use('/api', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.apiUrl + req.originalUrl}))
    .use('/odin/loki', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.mediaUrl + req.originalUrl})) // Proxy to RTVE media server
    .use('/ztnr/movil/thumbnail', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.ztnrUrl + req.originalUrl})) // Proxy to RTVE
    .use('/resources/vtt', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.subtitleUrl + req.originalUrl})) // Proxy to RTVE subtitle server
    .use('/resources/thumbnailer', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.img2Domain + req.originalUrl})) // Proxy to RTVE img server
    .use('/ztnr/res', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.ztnrUrl + req.originalUrl})) // Proxy to RTVE img server
    .use('/js', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.js2Domain + req.originalUrl}))
    .use('/drmn', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.drmnUrl + req.originalUrl})) // Proxy to RTVE img server
    .use('/favicon.ico', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl})) // Proxy to favicon
    .use('/buscador', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl}))
    .use('/swf', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl}))
    .use('/pages/rtve-player-app', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl}))
    .use('/su/services', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl}))
    .use('/usuarios', (req, res) => common.middlewares.proxyRequest(req, res, {
        'rejectUnauthorized': false,
        'url': properties.globalURL + req.originalUrl
    })) // Proxy to Usuarios
    .use('/comunes', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl}))
	.use('/modulos', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl}))
    .use('/aplicaciones', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl}))
    .use('/rtve', (req, res) => common.middlewares.proxyRequest(req,res, {'url': properties.globalURL + req.originalUrl}))
    .use('/pages', express.static(path.join(__dirname, baseFolder + '/js', buildTarget)))
    .use('/servicios', (req, res) => common.middlewares.proxyRequest(req, res, {'url': properties.globalURL + req.originalUrl})) // Proxy to node-services

    .use(content_middleware.expressNegocaitor) // formatea respuestas según lo que se envía
    .use(content_middleware.characterIsoEncoding)

    .use(cookieParser())

    .use('/template', rmExtensionName, app)
    .use(ssi_r)

    // Procesa output y resuelve los Includes virtuales
    .use(common.middlewares.errorStatus, common.middlewares.errorRequest); // redirige errores

var server = appwrapper.listen(properties.nodePort, serve); // Lanza el servidor

module.exports = appwrapper;

// MIDDLEWARES
function rmExtensionName(req, res, next) {
    var pathname = Url.parse(req.url).pathname;
    var extname = path.extname(pathname);
    req.url = req.url.replace(extname, '');
    next();
}
// CALLBACKS
function serve() {
    logger.info('Server testing listening on: http://localhost:' + server.address().port + pf_path);
}