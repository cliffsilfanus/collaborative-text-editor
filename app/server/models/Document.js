//Models for the DOCUMENTS

//requiring mongoose
var mongoose = require("mongoose");

var documentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User"
    //does this come automatically?
  },
  collaborators: {
    type: [{ type: mongoose.Schema.ObjectId, ref: "User" }]
  },
  password: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ""
  }
});

var Document = mongoose.model("Document", documentSchema);
module.exports = Document;
