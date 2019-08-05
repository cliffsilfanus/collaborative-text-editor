/*
SERVER SETUP FOR COLLOABORATIVE_TEXT_EDITOR

*/
var express = require("express");
var router = express.Router();
var models = require("../models");
var logger = require("morgan");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var mongoose = require("mongoose");
var _ = require("underscore");
var cors = require("cors");

var app = express();

// view engine setup
app.set("components", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../../client/build"))); //check
app.use(cors());

app.use(
  session({
    secret: process.env.SECRET,
    name: "cookie",
    store: new MongoStore({ mongooseConnection: mongoose.connection }), // this is where we r storing our session info in the mongo database
    proxy: true,
    saveUninitialized: true,
    resave: true
  })
);
//MIDDLEWARE
var validateLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    res.status(401).json({ error: true, message: "NOT LOGGED IN" });
    return;
  } else {
    next();
  }
};

// POST registration page
var validateReq = function(userData) {
  return userData.password === userData.passwordRepeat;
};

app.post("/signup", function(req, res) {
  if (!validateReq(req.body)) {
    return res.json({
      error: true,
      message: "Error on post request to sign up"
    });
  }
  var u = new models.User({
    // Note: Calling the email form field 'username' here is intentional,
    // passport is expecting a form field specifically named 'username'.
    // There is a way to change the name it expects, but this is fine.
    email: req.body.email,
    password: req.body.password,
    displayName: req.body.displayName
  });

  u.save(function(err, user) {
    if (err) {
      console.log(err);
      return res.json({ error: true, message: "Error saving to the database" });
    }
    console.log(user);
    res.json({ error: false, user: user });
  });
});

// POST Login page

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  models.User.findOne({ email: email }, (err, user) => {
    //database error
    if (err) {
      console.log(err);
      return res.status(401).json({ error: true, message: "ERROR WHILE FINDING " + err });
    }
    //passwords dont match
    if (!user || user.password !== password) {
      res.status(401);
      console.log("passwords dont match");
      return res.json({ error: true, message: err });
    }
    //defualt case
    //user._id
    //user.email
    //all the stuff we store in the database
    req.session.user = user; // sets the user on the session
    // how to know if someon is logged in or not  //\\
    return res.json({ error: false, user: user });
  });
});

// GET Logout page
app.post("/logout", function(req, res, next) {
  // lOGS USER OUT
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        return next(err);
      } else {
        return res.json({ success: true });
      }
    });
  }
});

// app.get("/test", validateLoggedIn, (req, res) => {
//   console.log(req.session.user);
//   res.send("ok!");
//   return;
// });

app.post("/docs/new", (req, res) => {
  /////
  var doc = new Document({
    author: req.user._id,
    collaborators: [req.user._id],
    title: req.body.title,
    password: req.body.password
  });
  doc.save((err, documents) => {
    //saves the documents to the database
    if (err) {
      console.log(err);
      return res.status(401).json({ error: true, message: "ERROR WHILE FINDING DOCUMENT " + err });
    }
    //when saving we return with a json respresentation of the documents
    res.json({ error: false });
  });
});

app.get("/docs", (req, res) => {
  // Route that sends all the docs
  models.Document.find({ user: req.user }, (err, docs) => {
    if (err) {
      console.log("ERROR FINDING TH DOCS IN THE DATABASE");
    }
    return res.status(200).json({ error: false, docs: docs });
  });
});

app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

const port = process.env.port || 3000;
app.listen(port, function() {
  console.log("Listening on %s", port);
});
