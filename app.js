var request     = require('request');
var nconf       = require('nconf');
nconf.argv().env().file({ file: "config.json" });


var e           = module.exports;
e.ENV           = process.env.NODE_ENV || 'development';


STRIPE_PLAN_ID            = process.env.STRIPE_PLAN_ID || nconf.get("STRIPE_PLAN_ID");
var parse_app_id          = process.env.PARSE_APP_ID || nconf.get("PARSE_APP_ID");
var parse_rest_api_key    = process.env.PARSE_REST_API_KEY || nconf.get("PARSE_REST_API_KEY");
var stripe_secret_key     = process.env.STRIPE_SECRET_KEY || nconf.get("STRIPE_SECRET_KEY");


Parse   = require('./lib/parse')(parse_app_id, parse_rest_api_key);
Stripe  = require('stripe')(stripe_secret_key);

var port        = parseInt(process.env.PORT) || 3000;
var Hapi        = require('hapi');
server          = new Hapi.Server(+port, '0.0.0.0', { cors: true });
require('./routes');
server.start();