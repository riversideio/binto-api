var nodemailer = require('nodemailer');

var MessengerEmail = function( options ) {
  var settings  = {
    host: options.smtp_host,
    port: parseInt(options.smtp_port, 10),
    requiresAuth: true,
    auth: {
      user: options.smtp_username,
      pass: options.smtp_password
    }
  };

  var messengerEmail = {
    deliverCancelPlanEmail: function( email ) {
      var smtpTransport = nodemailer.createTransport("SMTP", settings);
      var mailOptions = {
        from:     "billing@riverside.io",
        to:       user.email,
        cc:       ["billing@riverside.io", "scott@scottmotte.com"],
        subject:  "[Riverside.io] Cancelation successful",
        text:     "You have successfully cancled your account with Riverside.io. You won't be charged any further."
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

  return messengerEmail;
}

module.exports = MessengerEmail;
