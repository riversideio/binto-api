module.exports = [
  {
    method  : 'GET',
    path    : '/api/v0/location/plans.json',
    config  : {
		handler : function ( request ) {
			request.Stripe.plans.list( 3, 0, function ( err, plans ) {
				var res = {};
				if ( err ) {
					res.success = false;
					res.error = { message : err };
				}else{
					res.success = true;
					res.plans = plans.data;
				}
				request.reply( res );
			});
		}
	}
  }
];