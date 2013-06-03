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
          user.session_token = resp.sessionToken;
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
  method  : 'PUT',
  path    : '/api/v0/users/{id}',
  config  : users.update
});
