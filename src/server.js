/* jshint esversion: 6 */

const rtveLogger       = require('rtve-module-logger'),
    logger             = rtveLogger.initialize('pf-fosas').getLogger('rtve.pf-fosas.server'),
    properties         = require('rtve-module-properties')(process.env.NODE_ENV),
    path               = require('path'),
    pkg                 = require(path.join(__dirname,'../package.json')),
    common              = require('rtve-module-common')(pkg.distName),
    content_middleware = require('rtve-module-content-negotiator').middleware,
    express            = require('express'),
    Url                = require('url'),
    bodyParser         = require('body-parser'),
    cookieParser       = require('cookie-parser');


let app = express();
const fosas = require(path.join(__dirname, baseFolder, 'app.js'));

// formatea respuestas según lo que se envía
app.use(content_middleware.expressNegocaitor);
app.use(content_middleware.characterIsoEncoding);

app.use(bodyParser.urlencoded({ extended: false }));

app
  .use(bodyParser.json())
  .use(rtveLogger.getExpressLogger()); //configuracion del access log

app.use(cookieParser());

app.use(fosas);
app.use('/healthz', (req, res) => res.status(200).end('ok'));
app.use(common.middlewares.errorStatus, common.middlewares.errorRequest); // redirige errores

const server = app.listen(properties.nodePort, () => {
  logger.info(`Server listening http://localhost:${server.address().port}/${properties.server_path}/`);
});

process.on('uncaughtException', (err) => {
    const loggerException = rtveLogger.getLogger('rtve.mySuperPf.uncaughtException');
    loggerException.fatal('Uncaught Exception: ' + err.message);
    loggerException.fatal('stack trace: ' + err.stack);
    process.exit(1);
});

module.exports = app;