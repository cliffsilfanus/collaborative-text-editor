//Models for the DOCUMENTS

//requiring mongoose

var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String
  },
  documents: {
    ref: "Documents",
    type: String
  }
});

var User = mongoose.model("User", userSchema);

module.exports = User;
