const request = require('request');
const cheerio = require('cheerio');
const express = require('express');

var app = express();
var url = 'https://google.com/search?q=hello-world'

request(url, function(err, res, body) {
  console.log({"message":"size: " + body.length})
})

var callExternalService = function()

app.get('/property', function(clientRequest, clientResponse) {
  request(
    url,
    function(err, apiResponse, body) {
      console.log({"message":"size: " + body.length})
      response.json({"message":"size: " + body.length})
    });
});

app.listen(8081);