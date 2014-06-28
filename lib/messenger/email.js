var nodemailer = require('nodemailer');

var messengerEmail = function( options ) {
  var settings  = {
    host: options.smtp_host,
    port: parseInt(options.smtp_port, 10),
    requiresAuth: true,
    auth: {
      user: options.smtp_username,
      pass: options.smtp_password
    }
  };

  var returningMethods = {
    deliverCancelPlanEmail: function( email ) {
      var smtpTransport = nodemailer.createTransport("SMTP", settings);
      var mailOptions = {
        from:     options.from,
        to:       email,
        cc:       options.from,
        subject:  "You've successfully canceled your plan",
        text:     "Hi "+email+". You have succesfully canceled your plan. You credit card will no longer be charged."
      }

      smtpTransport.sendMail(mailOptions, function(error, response) {
        smtpTransport.close();

        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: " + response.message);
        }
      });

    }
  }

  return returningMethods;
}

module.exports = messengerEmail;
