//var dataAdapter = require( './lib/adapter' );


var users = {
  index: {
    handler: function(request) {
      request.Parse.get("/users.json", function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}})
        } else {
          resp.results.forEach( function( user ){
            delete user.address_1;
            delete user.address_2;
            delete user.city;
            delete user.phone;
          });
          request.reply({ success: true, users: resp.results });
        }
      });
    } 
  },
  create: {
    handler: function(request) {
      var user = request.payload;
      user.username = user.email;

      request.Parse.post("/users.json", user, function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}})
        } else {
          // remove user password from api response
          delete user.password;
          user.session_token  = resp.sessionToken;
          user.id             = resp.objectId;
          request.reply({success: true, user: user});
        }
      });
    }
  },
  get: {
    handler: function(request) {
      request.Parse.get("/users/"+request.params.id+".json", function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}})
        } else {
          request.reply({ success: true, user: resp });
        }
      });
    }
  },
  update: {
    handler: function(request) {
      var user = request.payload;
      user.username = user.email;

      request.Parse.put("/users/"+request.params.id+".json", user, function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}})
        } else {
          request.reply({success: true, user: user});
        }
      });
    }
  },
  update_card: {
    handler: function(request) {
      request.Parse.get("/users/"+request.params.id+".json", function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}})
        } else {
          var user    = resp;

          var payload = {
            card: {
              number:     request.payload.card_number, 
              cvc:        request.payload.card_cvc, 
              exp_month:  request.payload.card_exp_month, 
              exp_year:   request.payload.card_exp_year
            },
            plan:       STRIPE_PLAN_ID,
            email:      user.email
          };

          if (user.stripe_customer_id) {
            request.Stripe.customers.update(user.stripe_customer_id, payload, function(err, customer) {
              if (err) {
                request.reply({success: false, error: {message: err.message}})
              } else {
                var user_payload = {stripe_customer_id: customer.id, session_token: request.payload.session_token};
                
                request.Parse.put("/users/"+request.params.id+".json", user_payload, function(resp) {
                  if (resp.error) {
                    request.reply({success: false, error: {message: resp.error}})
                  } else {
                    request.reply({success: true, user: user_payload});
                  }
                });
              }
            });
          } else {
            request.Stripe.customers.create(payload, function(err, customer) {
              if (err) {
                request.reply({success: false, error: {message: err.message}})
              } else {
                var user_payload = {stripe_customer_id: customer.id, session_token: request.payload.session_token};
                
                request.Parse.put("/users/"+request.params.id+".json", user_payload, function(resp) {
                  if (resp.error) {
                    request.reply({success: false, error: {message: resp.error}})
                  } else {
                    request.reply({success: true, user: user_payload});
                  }
                });
              }
            });
          }
        }
      });
    }
  },
  resetPassword : {
    handler : function ( request ) {
      var user = request.payload;

      request.Parse.post('/requestPasswordReset', user, function ( resp ) {
        if ( resp.error ) {
          return request.reply({
            success: false,
            error : {
              message : resp.error
            }
          })
        }
        request.reply({
          success : true,
          message : resp
        })
      })
    }
  }
};


module.exports = [
  {
    method  : 'GET',
    path    : '/api/v0/users.json',
    config  : users.index
  },
  {
    method  : 'POST',
    path    : '/api/v0/users.json',
    config  : users.create
  },
  {
    method  : 'GET',
    path    : '/api/v0/users/{id}/show.json',
    config  : users.get
  },
  {
    method  : 'POST',
    path    : '/api/v0/users/{id}/update.json',
    config  : users.update
  },
  {
    method  : 'POST',
    path    : '/api/v0/users/{id}/update_card.json',
    config  : users.update_card
  },
  {
    method  : 'POST',
    path    : '/api/v0/users/reset_password.json',
    config  : users.resetPassword
  }
];
