var request     = require('request');
var nconf       = require('nconf');
nconf.argv().env().file({ file: "config.json" });


var e           = module.exports;
e.ENV           = process.env.NODE_ENV || 'development';


var app_id      = process.env.PARSE_APP_ID || nconf.get("PARSE_APP_ID");
var rest_key    = process.env.PARSE_REST_API_KEY || nconf.get("PARSE_REST_API_KEY");
Parse = require('./lib/parse')(app_id, rest_key);


var port        = parseInt(process.env.PORT) || 3000;
var Hapi        = require('hapi');
server          = new Hapi.Server(+port, '0.0.0.0', { cors: true });
require('./routes');
server.start();