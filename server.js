'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3123;

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://JeffAbney:warhol88@cluster0-schfu.mongodb.net/test?retryWrites=true";
MongoClient.connect(uri, { useNewUrlParser: true }, (error, client) => {
  if (error) return process.exit(1);
  var db = client.db('FCC');
  var collection = db.collection('Url');
  console.log("connection is working");

  app.use(cors());

  /** this project needs to parse POST bodies **/
  // you should mount the body-parser here
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use('/public', express.static(process.cwd() + '/public'));

  app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });


  // your first API endpoint... 
  app.get("/api/hello", function (req, res) {
    res.json({ greeting: 'hello API' });
  });

  app.post('/api/shorturl/new', (req, res, next) => {
    let oldUrl = req.body.url;
    let setShortUrl = function (count) {
      collection.insert({ original_url: oldUrl, short_url: count }, (error, results) => {
        if (error) return next(error);
        console.log(results);
        res.json({ original_url: oldUrl, short_url: count });
      })
    }
    collection.findOne({ original_url: oldUrl }, (error, doc) => {
      if (error) return next(error);
      if (doc == null) {
        console.log("It's a new URL!");
        db.collection('Url').count()
          .then(function (count) {
            setShortUrl(count);
          })
      } else {
        console.log("URL already exists in collection")
        res.json({original_url: oldUrl, short_url: doc.short_url});
      }
    })
  })

  app.listen(port, function () {
    console.log('Node.js listening ... port ' + port);
  });
});