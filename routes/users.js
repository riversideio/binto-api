var users = {
  index: {
    handler: function(request) {
      request.Parse.get("/users", function(resp) {
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

      request.Parse.post("/users", user, function(resp) {
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
      request.Parse.get("/users/"+request.params.id, function(resp) {
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

      request.Parse.put("/users/"+request.params.id, user, function(resp) {
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
      var _user = {
        session_token : request.payload.session_token
      };
      request.Parse.get("/users/me", _user, function(resp) {
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
            plan:       request.payload.plan || user.plan_id || STRIPE_PLAN_ID,
            email:      user.email
          };

          // before updating here make validate against parse to make sure 
          // user submitting to this user id is the same user with same
          // session

          if (user.stripe_customer_id) {
            request.Stripe.customers.update(user.stripe_customer_id, payload, function(err, customer) {
              if (err) {
                request.reply({success: false, error: {message: err.message}})
              } else {
                var user_payload = {
                  stripe_customer_id: customer.id, 
                  session_token: request.payload.session_token,
                  plan_id : payload.plan
                };
                
                request.Parse.put("/users/"+user.objectId, user_payload, function(resp) {
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
                var user_payload = {
                  stripe_customer_id: customer.id, 
                  session_token: request.payload.session_token,
                  plan_id : payload.plan
                };
                
                request.Parse.put("/users/"+user.objectId, user_payload, function(resp) {
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
  cancelPlan : {
    handler : function ( request ) {
      var user = request.payload;
      var _user = {
        session_token : request.payload.session_token
      };
      // get stripe id
      request.Parse.get("/users/me", _user, function( resp ) {
        if (resp.error) return request.reply({success: false, error: {message: resp.error}});
        user.id = resp.objectId;
        user.email = resp.email;
        // remove plan from stripe
        request.Stripe.customers.cancel_subscription( resp.stripe_customer_id, false, function ( err, res ) {
          if (err) return request.reply({success: false, error: {message: err}});
          user.plan_id = "0";
          // update plan
          request.Parse.put("/users/" + user.id, user, function( resp ) {
            if (resp.error) return request.reply({success: false, error: {message: resp.error}})

            request.messengerEmail.deliverCancelPlanEmail(user.email);

            request.reply({
              success: true,
              message : res
            })
          });
        });
      });
    }
  },
  updatePlan : {
    handler : function ( request ) {
      var user = request.payload;
      var _user = {
        session_token : request.payload.session_token
      };
      // get stripe id
      request.Parse.get("/users/me", _user, function( resp ) {
        if (resp.error) return request.reply({success: false, error: {message: resp.error}});
        user.id = resp.objectId;
        // remove plan from stripe
        request.Stripe.customers.update_subscription( resp.stripe_customer_id, {
          plan : user.plan
        }, function ( err, res ) {
          if (err) return request.reply({success: false, error: {message: err}});
          var payload = { 
            plan_id : user.plan,
            session_token : user.session_token 
          };
          // update plan
          request.Parse.put("/users/" + user.id + "", payload, function( resp ) {
            if (resp.error) return request.reply({success: false, error: {message: resp.error}})
            request.reply({
              success: true,
              message : res
            })
          });
        });
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
  },
  charge : {
    handler : function ( request ) {
      var user = request.payload,
        _user,
        charge = {
          amount : +user.amount,
          currency : 'usd',
          card : {
            number : user.card_number,
            cvc : user.card_cvc,
            exp_month : user.card_exp_month,
            exp_year: user.card_exp_year
          },
          metadata : {}
        };
      function process ( charge ) {
       request.Stripe.charges.create( charge, function ( err, res ) {
          if (err) return request.reply({success: false, error: {message: err}});
          request.reply({
            success : true,
            message : res
          });
        });
      }
      if ( request.payload.session_token ){
        _user = {
          session_token : request.payload.session_token
        };
        return request.Parse.get("/users/me", _user, function( resp ) {
          if (resp.error) return request.reply({success: false, error: {message: resp.error}});
          if ( user.stripe_customer_id ) charge.customer = user.stripe_customer_id;
          charge.metadata.email = resp.email;
          process( charge );
        }); 
      } 
      if ( !user.email ) return request.reply({success:false, error : { message : 'Please provide a Email to make charge' }});
      charge.metadata.email = user.email;
      charge.metadata.name = user.name;
      process( charge );
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
    path    : '/api/v0/users/{id}/cancel_plan.json',
    config  : users.cancelPlan
  },
  {
    method  : 'POST',
    path    : '/api/v0/users/{id}/update_plan.json',
    config  : users.updatePlan
  },
  {
    method  : 'POST',
    path    : '/api/v0/users/{id}/charge.json',
    config  : users.charge
  },
  {
    method  : 'POST',
    path    : '/api/v0/users/reset_password.json',
    config  : users.resetPassword
  }
];
