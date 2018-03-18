// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var path = require("path");
var Note = require("./models/note.js");
var headline = require("./models/headline.js");
var request = require("request");
var cheerio = require("cheerio");
var port = process.env.PORT || 3000
var app = express();

//  Database configuration with mongoose
var mongooscraper = process.env.mongooscraper || "mongodb://localhost/mongooscraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
// mongoose.connect(mongooscraper, {
//    useMongoClient: true
// });

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
   console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
   console.log("Mongoose connection successful.");
});

app.use(bodyParser.urlencoded({
    extended: false
}))
// Public Directory 
app.use(express.static("public"));

app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({
    extended: false
}));

// Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partrialDir: path.join(__dirname, "/views/layout/partials")
}));

// Routes
app.get("/", function(req, res) {
    // headline.find({ "saved": false }, function(error, data) {
    //     var hbsObject = {
    //         headline: data
    //     };
    //     console.log(hbsObject);
        res.render("home");
    // });
});

app.get("/saved", function(req, res) {
    headline.find({ "saved": true }).populate("notes").exec(function(error, headlines) {
        var hbsObject = {
            headline: headlines
        };
        res.render("saved", hbsObject);
    });
});

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
    request("https://www.nytimes.com/", function(error, response, html) {

    var $ = cheerio.load(html);

      $("article").each(function(i, element) {
  
        var result = {};
  
        result.title = $(element).children("h2").text();
        result.summary = $(element).children(".summary").text();
        result.link = $(element).children("h2").children("a").attr("href");
  
        var entry = new Article(result);
  
        // Saving that entry to the db
        entry.save(function(err, doc) {
          // LOG THE ERRORS
          if (err) {
            console.log(err);
          }

          else {
            console.log(doc);
          }
        });
  
      });
          res.send("Scraping Complete");
  
    });

  });

  // This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {
        res.json(doc);
      }
    });
  });


app.get("/articles/:id", function(req, res) {
   
    Article.findOne({ "_id": req.params.id })
    .populate("note")
    
    .exec(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      else {
        res.json(doc);
      }
    });
  });




app.listen(3000, function() {
    console.log("Started server on Port 3000");
})