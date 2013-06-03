# victoria-club

The member signup and billing management API for Riverside.io.

## Getting Started

Create a free account at [parse.com](http://parse.com). Create an app called victoria_club_development and another app called victoria_club_production. This will serve as the database. It is a nice alternative to running your own database.

Once created note the application keys and add the development versions to a config.json file. Touch config.json file and then add the following.

    {
      "PARSE_APP_ID": "ma4KVupPzQOQpUfSGKoR34TVHOTCq9Nh5ii8DLgq",
      "PARSE_MASTER_API_KEY": "YyKnMRs0pVg19kFKxln6LWoN5a53mK2e7mEr8rPb",
      "PARSE_REST_API_KEY": "izLxWoe4waULE80ovq1VqVDegcZIabQL05TFZWMF"
    }

Startup the app.

    node app.js

Now you can create your first user.

     curl -X POST http://localhost:3000/api/v0/users.json \
     -d "email=you@youremail.com" \
     -d "password=password"

Next trying logging that user in.

    curl -X POST http://localhost:3000/api/v0/sessions.json \
    -d "email=you@youremail.com" \
    -d "password=password"

Note the session_token that comes back.

Next try updating that user.

    curl -X PUT http://localhost:3000/api/v0/users/JTQKXcajdP.json \
    -d "session_token=cqo4zl2ocs4ati8c51ugs6mtt" \
    -d "stripe_customer_id=1234"

## Documentation

### Users

#### GET /api/v0/users

Gets the list of users.

    curl -X GET http://localhost:3000/api/v0/users.json

#### POST /api/v0/users

Creates a user.

    curl -X POST http://localhost:3000/api/v0/users.json \
    -d "email=you@youremail.com" \
    -d "password=password"

#### POST /api/v0/users/:id.json

Updates a user's attributes. Requires a session_token.

    curl -X PUT http://localhost:3000/api/v0/users/JTQKXcajdP.json \
    -d "session_token=cqo4zl2ocs4ati8c51ugs6mtt" \
    -d "stripe_customer_id=1234"

### Sessions

#### POST /api/v0/sessions

Lets the user login and returns the sessionToken.

    curl -X POST http://localhost:3000/api/v0/sessions.json \
    -d "email=you@youremail.com" \
    -d "password=password"
