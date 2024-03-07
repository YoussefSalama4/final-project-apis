const mongoose = require("mongoose");
const sentenceSchema = new mongoose.Schema({
  end: Number,
  start: Number,
  text: String,
});

module.exports = sentenceSchema;
