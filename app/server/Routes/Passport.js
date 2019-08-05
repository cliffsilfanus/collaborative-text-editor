/*
SERVER SETUP FOR COLLOABORATIVE_TEXT_EDITOR

*/
var express = require("express");
var session = require("express-session");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var models = require("..models"); ////\\\\\
var auth = require("./Auth");
// Database imports below
var MongoStore = require("connect-mongo")(session);
var mongoose = require("mongoose");
var _ = require("underscore");

var app = express();

// view engine setup
app.set("components", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../../client/build"))); //check

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

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport Serialize
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Passport Deserialize
passport.deserializeUser((id, done) => {
  models.User.findById(id, function(err, user) {
    done(null, user);
  });
});

// Passport Strategy
passport.use(
  new LocalStrategy(function(email, password, done) {
    //finds user by email
    models.User.findOne({ email: email }, (err, user) => {
      //database error
      if (err) {
        console.log(err);
        return done(null, false);
      }
      //passwords dont match
      if (user.password !== password) {
        console.log("passwords dont match");
        return done(null, false);
      }
      //defualt case
      //user._id
      //user.email
      //all the stuff we store in the database
      return done(null, user);
    });
  })
);

app.use("/", auth(passport)); //how we are physically passing passport
app.use("/", routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});

const port = process.env.port || 3000;
app.listen(port, function() {
  console.log("Listening on %s", port);
});
