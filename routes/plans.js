require('dotenv').load();

var blacklist = process.env.PLAN_BLACKLIST;
blacklist = (blacklist || '').split(/\,/);

var plans = {
  all: {
		handler : function ( request ) {
			request.Stripe.plans.list( 3, 0, function ( err, plans ) {
				var res = {};
				if ( err ) {
					res.success = false;
					res.error = { message : err };
				}else{
					res.success = true;
					res.plans = plans.data.filter(function( plan ) {
						// returns true if not in array
						return !~blacklist.indexOf( plan.id ) 
					});
				}
				request.reply( res );
			});
		}
  }
}

module.exports = [
  {
    method: 'GET',
    path:   '/api/v0/plans.json',
    config: plans.all
  }
];
