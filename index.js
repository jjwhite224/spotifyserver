var client_id = '408c364aa451469fb5802460bf85ec06';
var spotify_client_secret = "25baf8fcd8a94179ac8d79d98462ba03";
var redirect_uri = 'http://localhost:5000/callback';
//const querystring = require('querystring');
const express = require('express')
const request = require('request');
var app = express();
var router = express.Router();
const port = 5000
var access_token

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next()
});
app.get('/login', function(req, res,next) {

  var state = generateRandomString(16);
  var scope = 'streaming user-read-private user-read-email';
var auth_query_parameters = new URLSearchParams({ response_type: 'code',
client_id: client_id,
scope: scope,
redirect_uri: redirect_uri,
state: state})
  res.redirect('https://accounts.spotify.com/authorize?' +
    auth_query_parameters.toString());
})

    app.get('/callback', (req, res,next) => {

      var code = req.query.code;
    
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + spotify_client_secret).toString('base64')),
          'Content-Type' : 'application/x-www-form-urlencoded'
        },
        json: true
      };
    
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
           access_token = body.access_token;
          res.redirect('http://127.0.0.1:5500/test.html')
        }
      });
    })

    app.get('/token', (req, res,next) => {
      res.json(
         {
            access_token: access_token
         })
    })

//console.log(access_token)
app.get('/refresh_token', function(req, res,next) {

  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + spotify_client_secret).toString('base64')), 
    'Content-Type' : 'application/x-www-form-urlencoded'
  },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

