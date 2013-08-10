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

var port        = process.env.PORT || 3000;
var Hapi        = require('hapi');
var blue 		= "\033[34m";
var cyan		= "\033[36m";
var green 		= "\033[32m";
server          = new Hapi.Server(+port, '0.0.0.0', { cors: true });
require('./routes');
server.start();
// some feedback that the server started
console.log( 
	blue + 'Server process ' + 
	cyan + 'id:' + process.pid + 
	blue + ' started at ' + 
	green + '0.0.0.0:' + 
	port + "\033[0m" 
);