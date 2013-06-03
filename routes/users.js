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
