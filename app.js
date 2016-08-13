'use strict';

// simple express server
var express = require('express');
var app = express();
var router = express.Router();

app.use(express.static('public'));
app.get('/api/test', function(req, res) {
  res.status(200).send({test: 'true'})
});

app.listen(8080);
