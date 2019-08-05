//Models for the DOCUMENTS

//requiring mongoose
var mongoose = require("mongoose");

var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

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
    required: false
  }
});

var Document = mongoose.model("Document", documentSchema);
module.exports = {
  Document: Document
};
