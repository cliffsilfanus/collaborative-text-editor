var express = require("express");
var router = express.Router();
var models = require("./models");

module.exports = function(passport) {
  // GET registration page

  // POST registration page
  var validateReq = function(userData) {
    return userData.password === userData.passwordRepeat;
  };

  router.post("/signup", function(req, res) {
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
      email: req.body.username,
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
  // authenitcates the user
  router.post("/login", passport.authenticate("local"), function(req, res) {
    res.redirect("/users/" + req.user._id);
    // CHECK FOR REACT ROUTER
  });

  // GET Logout page
  router.post("/logout", function(req, res) {
    try {
      req.logout();
    } catch (error) {
      return res.json({
        error: false,
        logout: "LOGOUT SUCCESSFUL"
      });
      // logs out
    }
  });

  return router;
};
