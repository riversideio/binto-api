var checkins = {
  create: {
    handler: function(request) {
      var checkin = request.payload;

      request.Parse.post("/classes/Checkin.json", checkin, function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}});
        } else {
          request.reply({success: true, checkin: checkin});
        }
      });
    }
  },
  all: {
    handler: function( request ) {
      var query = request.query;
      query = query || { };

      request.Parse.get("/classes/Checkin.json", query, function(resp) {
        if (resp.error) {
          request.reply({success: false, error: {message: resp.error}});
        } else {
          request.reply({success: true, checkins: resp});
        }
      });
    }
  }
}

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/checkins.json',
    config: checkins.create
  },
  {
    method: 'GET',
    path: '/api/v0/checkins.json',
    config: checkins.all
  }
];
