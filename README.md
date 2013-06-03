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

Now you can create your first user.

     curl -X POST http://localhost:3000/api/v0/users.json \
     -d "email=you@youremail.com" \
     -d "password=password"


## Documentation

### GET /api/v0/users

Gets the list of users.

    curl -X GET http://localhost:3000/api/v0/users.json

### POST /api/v0/uses

Creates a user.

    curl -X POST http://localhost:3000/api/v0/users.json \
    -d "email=you@youremail.com" \
    -d "password=password"