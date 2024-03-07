const mongoose = require("mongoose");

// Define the topic schema
const topicSchema = new mongoose.Schema({
  confidence: Number,
  topic: String,
});

// Define the topics array schema
const topicsArraySchema = new mongoose.Schema({
  end_word: Number,
  start_word: Number,
  text: String,
  topics: [topicSchema],
});

module.exports = topicsArraySchema;
