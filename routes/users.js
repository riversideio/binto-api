var users = {
  index: {
    handler: function (request) {
      Parse.get("/users.json", function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}})
        } else {
          request.reply({ success: true, users: resp.results });
        }
      });
    } 
  },
  create: {
    handler: function(request) {
      var user = request.payload;
      user.username = user.email;

      Parse.post("/users.json", user, function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}})
        } else {
          user.session_token  = resp.sessionToken;
          user.id             = resp.objectId;
          request.reply({success: true, user: user});
        }
      });
    }
  },
  update: {
    handler: function(request) {
      var user = request.payload;
      user.username = user.email;

      Parse.put("/users/"+request.params.id+".json", user, function(resp) {
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
      var payload = {
        card: {
          number:     request.payload.card_number, 
          cvc:        request.payload.card_cvc, 
          exp_month:  request.payload.card_exp_month, 
          exp_year:   request.payload.card_exp_year
        },
        plan:       STRIPE_PLAN_ID
      };

      Stripe.customers.create(payload, function(err, customer) {
        if (err) {
          request.reply({success: false, error: {message: err.message}})
        } else {
          var user = {stripe_customer_id: customer.id, session_token: request.payload.session_token};
          
          Parse.put("/users/"+request.params.id+".json", user, function(resp) {
            if (resp.error) {
              request.reply({success: false, error: {message: resp.error}})
            } else {
              request.reply({success: true, user: user});
            }
          });
        }
      });
    }
  }
};

server.route({
  method  : 'GET',
  path    : '/api/v0/users.json',
  config  : users.index
});

server.route({
  method  : 'POST',
  path    : '/api/v0/users.json',
  config  : users.create
});

server.route({
  method  : 'POST',
  path    : '/api/v0/users/{id}/update.json',
  config  : users.update
});

server.route({
  method  : 'POST',
  path    : '/api/v0/users/{id}/update_card.json',
  config  : users.update_card
});
