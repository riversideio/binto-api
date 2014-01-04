var dotenv = require('dotenv');
dotenv.load();

var request = require('request');
var e       = module.exports;
var router  = require( './routes' );
	
var parse_app_id        = process.env.PARSE_APP_ID;	
var parse_rest_api_key  = process.env.PARSE_REST_API_KEY;	
var stripe_secret_key   = process.env.STRIPE_SECRET_KEY;	

var port    = process.env.PORT || 3000;
var Hapi    = require('hapi');
var server  = new Hapi.Server(+port, '0.0.0.0', { cors: true });

STRIPE_PLAN_ID = process.env.STRIPE_PLAN_ID;

router( function ( err, routes ) {
	if ( err ) {
		Hapi.error.internal( 'Failed to fetch routes', err );
	}else{
		server.route( routes ); 
	}
});

server.start( function () {
  console.log('Victori-Club.js server started at: ' + server.info.uri);
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
					data.method + ' ' +
					data.url + ' ' + 
					data.agent 
				)
			}
		}
	}
});
