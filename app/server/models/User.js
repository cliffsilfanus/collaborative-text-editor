//Models for the DOCUMENTS

//requiring mongoose

var mongoose = require("mongoose");

var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

var userSchema = new mongoose.schema({
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

module.exports = {
  User: User
};
