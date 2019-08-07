var User = require("./User");
var Document = require("./Document");
var mongoose = require("mongoose");

var connect = process.env.MONGODB_URI;
mongoose.connect(connect, {
  useNewUrlParser: true
});

module.exports = { User, Document };
