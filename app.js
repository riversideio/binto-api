var dotenv = require('dotenv');
dotenv.load();

var request = require('request');
var chalk = require('chalk');
var e = module.exports;
var router = require( './routes' );
	
var parse_app_id = process.env.PARSE_APP_ID;	
var parse_rest_api_key = process.env.PARSE_REST_API_KEY;	
var stripe_secret_key = process.env.STRIPE_SECRET_KEY;
var google_key = decodeURIComponent(process.env.GOOGLE_KEY);
var google_calendar = process.env.GOOGLE_CALENDAR;
var google_email = process.env.GOOGLE_EMAIL;
var smtp_username = process.env.SMTP_USERNAME || process.env.SENDGRID_USERNAME;
var smtp_password = process.env.SMTP_PASSWORD || process.env.SENDGRID_PASSWORD;
var smtp_host = process.env.SMTP_HOST || 'smtp.sendgrid.net';
var smtp_port = process.env.SMTP_PORT || '587';
var from = process.env.FROM;

var port = process.env.PORT || 3000;
var Hapi = require('hapi');
var server = new Hapi.Server(+port, '0.0.0.0', { cors: true });

STRIPE_PLAN_ID = process.env.STRIPE_PLAN_ID;

router( function ( err, routes ) {
	if ( err ) {
		Hapi.error.internal( 'Failed to fetch routes', err );
	}else{
		server.route( routes ); 
	}
});

server.start( function () {
  console.log(chalk.grey('binto-api server started at: '), 
  		chalk.green.bgBlack(server.info.uri));
});

// server extension / middlewarish stuff
// https://github.com/spumko/hapi/blob/master/docs/Reference.md#serverextevent-method-options
server.ext('onRequest', function (request, next) {
	// this.attachs stuff to request object
	// to help avoid globals
	request.Parse = require('./lib/parse')(parse_app_id, parse_rest_api_key);
	request.Stripe = require('stripe')(stripe_secret_key);
	request.Events = new ( require('./lib/events') )(google_key, {
		accountEmail : google_email,
		calendarId : google_calendar
	});
  request.messengerEmail = require('./lib/messenger/email')({smtp_username: smtp_username, smtp_password: smtp_password, smtp_host: smtp_host, smtp_port: smtp_port, from: from});
  next();
});

// request logging
server.on('request', function (request, event, tags) {
	if ( event ) {
		if( !!~event.tags.indexOf( 'received' ) ){
			var data = event.data;
			if ( /api/.test( data.url ) ) {
				console.log(
					chalk.green.bgBlack(data.method) + ' ' +
					chalk.grey(data.url) 
				)
			}
		}
	}
});
