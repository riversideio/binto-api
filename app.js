var request = require('request'),
	nconf = require('nconf')
		.argv()
		.env()
		.file({ file: "config.json" }),
	e = module.exports,
	router = require( './routes' ),
	parse_app_id  = process.env.PARSE_APP_ID || 
		nconf.get("PARSE_APP_ID"),
	parse_rest_api_key = process.env.PARSE_REST_API_KEY || 
		nconf.get("PARSE_REST_API_KEY"),
	stripe_secret_key = process.env.STRIPE_SECRET_KEY || 
		nconf.get("STRIPE_SECRET_KEY"),
	port = process.env.PORT || 3000,
	Hapi = require('hapi'),
	blue = "\033[34m",
	cyan = "\033[36m",
	green = "\033[32m",
	reset = "\033[0m",
	server = new Hapi.Server(+port, '0.0.0.0', { cors: true });

STRIPE_PLAN_ID = process.env.STRIPE_PLAN_ID || nconf.get("STRIPE_PLAN_ID");

router( function ( err, routes ) {
	if ( err ) {
		Hapi.error.internal( 'Failed to fetch routes', err );
	}else{
		server.route( routes ); 
	}
})
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
// server extension / middlewarish stuff
// https://github.com/spumko/hapi/blob/master/docs/Reference.md#serverextevent-method-options
server.ext('onRequest', function (request, next) {
	// this.attachs stuff to request object
	// to help avoid globals
	request.Parse = require('./lib/parse')(parse_app_id, parse_rest_api_key);
	request.Stripe = require('stripe')(stripe_secret_key);
    next();
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
