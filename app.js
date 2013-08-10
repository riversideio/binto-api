var request     = require('request');
var nconf       = require('nconf');
nconf.argv().env().file({ file: "config.json" });


var e           = module.exports;
var router 		= require( './routes' );	
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
var reset 		= "\033[0m";
var server      = new Hapi.Server(+port, '0.0.0.0', { cors: true });

router( function ( err, routes ) {
	if ( err ) {
		Hapi.error.internal( 'Failed to fetch routes', err );
	}else{
		server.route( routes ); 
	}
})

// require( './routes' )( server );

server.start( function () {
	// some feedback that the server started
	console.log( 
		blue + 'Server process ' + 
		cyan + 'id:' + process.pid + 
		blue + ' started at ' + 
		green + '0.0.0.0:' + 
		port + reset
	);
});

// request logging
server.on('request', function (request, event, tags) {
	if ( event ) {
		if( !!~event.tags.indexOf( 'received' ) ){
			var data = event.data;
			if ( /api/.test( data.url ) ) {
				console.log(
					green + data.method + ' ' +
					blue + data.url + ' ' + 
					cyan + data.agent + 
					reset
				)
			}
		}
	}
});
