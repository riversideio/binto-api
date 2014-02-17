# binto-api

An open source member signup and billing management API for coworking spaces.

## Getting Started

Create a free account at [parse.com](http://parse.com). Create an app called binto_api_development and another app called binto_api_production. This will serve as the database. It is a nice alternative to running your own database.

Once created note the application keys and add the development versions to a .env file.

```
cp .env.example .env
```

Optionally add a STRIPE_PLAN_ID in this config if you want a card automatically associated to your coworking space's monthly membership plan.

Startup the app.

```
node app.js
```

Now you can create your first user.

```
curl -X POST http://localhost:3000/api/v0/users.json \
-d "email=you@youremail.com" \
-d "password=password"
```

Next trying logging that user in.

```
curl -X POST http://localhost:3000/api/v0/sessions.json \
-d "email=you@youremail.com" \
-d "password=password"
```

Note the session_token that comes back.

Next try updating that user.

```
curl -X POST http://localhost:3000/api/v0/users/JTQKXcajdP/update.json \
-d "session_token=cqo4zl2ocs4ati8c51ugs6mtt" \
-d "stripe_customer_id=1234"
```

Now, we need to add in [Stripe](http://stripe.com) appropriately. Create an account at [Stripe.com](http://stripe.com) and then copy the test secret key to your `.env` file.


### Events

Just added to the list of endpoints is events. The built in calendar we use is Google Calendar. We get access to this using a [Service Account](https://developers.google.com/accounts/docs/OAuth2ServiceAccount) for authentication. To get a key for the service account go to your [Google API Console](https://code.google.com/apis/console/) make sure calendar access is switched on in APIs & Auth > APIs. Now go to APIs & Auth > Credentials and "Create a New Client ID". This will pop up a modal toggle the radio inputs to "Service Account", then click "Create Client ID". This will download a file and give you a passcode to unlock the file this is usually "notasecret".

Once you have this file downloaded store this p12 file into pem with openssl.

```
openssl pkcs12 -in yourkey.p12 -out yourkey.pem -nodes
```

Now we host on heroku and this is a open project so we cannot be storing that file in our project or everyone would have access to this file. So we store this data in a eviroment variable. To achieve this we take the file and url encode it the decode it when in the app. You can do this by running something like this in node.

```javascript
var fs = require('fs');
fs.readfile('yourkey.pem', function ( err, res ) {
	var key = res.teString('utf8');
	if ( err ) console.log( err );
	console.log( encodeURIComponent( key ) );
});
```

Then run that file. This should output the key in a format that you can store in a enviroment variable. Now add it to your `.env` file. 

```
GOOGLE_KEY={the output}
GOOGLE_EMAIL={serviceaccountemail@developer.gserviceaccount.com}
GOOGLE_CALENDAR={calendarsID@group.calendar.google.com}
```

You will also need `GOOGLE_EMAIL` which can be found in the API console, and you `GOOGLE_CALENDAR` which is the id of the calendar you want to use for your events.

Once all thos things are settup all you need to do is share the calendar with the `GOOGLE_EMAIL` attached to the service account.  You can do this by going to [Google Calendar](https://www.google.com/calendar/), clicking the small arrow next to the calendar name you would like to use, and then click share this calendar.

## Deploying to Heroku

```
heroku create
git push heroku master
heroku config:set PARSE_APP_ID=GZPNki0Ypqqe2ij498wF7oKz1x9ARs6W8024Juri PARSE_REST_API_KEY=7U7a06KhU42eMnoC8UDluGyxOAklQKo6DEqHTYUb STRIPE_SECRET_KEY=sk_live_nV0HfnLZINki0ASexaKQPB0m
STRIPE_PLAN_ID=riversideio100
```

You will also need to setup all the GOOGLE variables for you `.env` to get the event endpoints to work. 


## Documentation

* [Users](#users)
* [Sessions](#sessions)
* [Plans](#plans)
* [Checkins](#checkins)
* [Events](#events)

### Users [^](#documentation)

#### GET /api/v0/users

Gets the list of users.

```
curl -X GET http://localhost:3000/api/v0/users.json
```

#### POST /api/v0/users

Creates a user.

```
curl -X POST http://localhost:3000/api/v0/users.json \
-d "email=you@youremail.com" \
-d "password=password"
```

#### GET /api/v0/users/:id/show.json

Gets a user.

```
curl -X GET http://localhost:3000/api/v0/users/JTQKXcajdP/show.json
```

#### POST /api/v0/users/:id/update.json

Updates a user's attributes. Requires a session_token.

```
curl -X POST http://localhost:3000/api/v0/users/JTQKXcajdP/update.json \
-d "session_token=cqo4zl2ocs4ati8c51ugs6mtt" \
-d "stripe_customer_id=1234"
```

#### POST /api/v0/users/:id/update_card.json

Updates a user's credit card on file. Creates one if not yet existing. Requires a session_token.

```
curl -X POST http://localhost:3000/api/v0/users/JTQKXcajdP/update_card.json \
-d "session_token=cqo4zl2ocs4ati8c51ugs6mtt" \
-d "card_number=4242424242424242" \
-d "card_cvc=123" \
-d "card_exp_month=7" \
-d "card_exp_year=18"
```

#### POST /api/v0/users/:id/update_plan.json

Updates a users subscription to Stripe, requires a `plan` and `session_token`.

```
curl -X POST http://localhost:3000/api/v0/users/me/update_plan.json \
-d "session_token=cqo4zl2ocs4ati8c51ugs6mtt" \
-d "plan=BALLERZ12"
```

#### POST /api/v0/users/:id/cancel_plan.json

Cancel a users subscription to Stripe, requires a `session_token`.

```
curl -X POST http://localhost:3000/api/v0/users/me/cancel_plan.json \
-d "session_token=cqo4zl2ocs4ati8c51ugs6mtt"
```

#### POST /api/v0/users/reset_password.json

Request a password reset email from Parse. Requires just `email` of user.

```
curl -X POST http://localhost:3000/api/v0/users/reset_password.json \
-d "email=bobdillin@coolpickels.com" \
```

#### POST /api/v0/users/:id/charge.json

Charges a user's credit card to a specified amount, currently only works with inputted cards. Requires a session_token.

```
curl -X POST http://localhost:3000/api/v0/users/JTQKXcajdP/charge.json \
-d "session_token=cqo4zl2ocs4ati8c51ugs6mtt" \
-d "card_number=4242424242424242" \
-d "card_cvc=123" \
-d "card_exp_month=7" \
-d "card_exp_year=18"\
-d "amount=5000"
```

### Sessions

#### POST /api/v0/sessions

Lets the user login and returns the sessionToken.

```
curl -X POST http://localhost:3000/api/v0/sessions.json \
-d "email=you@youremail.com" \
-d "password=password"
```

### Plans

#### GET /api/v0/plans.json

Gets a list of white listed plans for the user to select on signup.

```
curl -X GET http://localhost:3000/api/v0/plans.json 
```

Note: You can blacklist plans (if you want to keep some secret). Set your environment variable `PLAN_BLACKLIST`. Seperate multiple ones with commas. `heroku config:set PLAN_BLACKLIST=plan1,plan2` 

### Checkins

#### GET /api/v0/checkins.json

Gets a list of checkins.

```
curl -X GET http://localhost:3000/api/v0/checkins.json
```

#### POST /api/v0/checkins.json

Creates a checkin.

```
curl -X POST http://localhost:3000/api/v0/checkins.json
```

### Events 

#### GET /api/v0/events.json

Gets a list of events

```
curl -X GET http://localhost:3000/api/v0/events.json
```

There are a series of differnt parameter that can be passed with to get certain criteria of events. Right now the current adapter is using [Google Calendars API v3](https://developers.google.com/google-apps/calendar/v3/reference/events/list) so use the referance to their params.

#### POST /api/v0/events.json

Create an Event

```
curl -X POST http://localhost:3000/api/v0/events.json \ 
-d "start={DateTime}" \
-d "end={DateTime}" \
-d "title=Hello World" \
-d "decription=Things and Stuff" 
```

Right now the only params available are the ones listed in the call. `start` and `end` are the only require field and use a Date Time formatted according to RFC 3339. eg. `moment().format()` 
