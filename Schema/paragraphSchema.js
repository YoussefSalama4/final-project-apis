const sentenceSchema = require("./sentenceSchema");
const mongoose = require("mongoose");
const paragraphSchema = new mongoose.Schema({
  end: Number,
  num_words: Number,
  sentences: [sentenceSchema],
  start: Number,
});

module.exports = paragraphSchema;
