const mongoose = require("mongoose");
const paragraphSchema = require("../Schema/paragraphSchema");
const topicsArraySchema = require("../Schema/topicSchema");

const audioSchema = new mongoose.Schema({
  title: {
    type: String,
    default: `audio-${Date.now()}`,
    minlength: [3, "audio title should be at least 3 charaters"],
  },
  audioName: {
    type: String,
    default: `audio-${Date.now()}`,
  },
  paragraphs: [paragraphSchema],
  topics: [topicsArraySchema],
  audio: {
    type: String,
  },
  owner: {
    type: String,
  },
  transcriptionText: { type: String, default: "" },
  duration: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  appwriteID: {
    type: String,
  },
  contentType: {
    type: String,
    default: "",
  },
});

const Audio = mongoose.model("Audio", audioSchema);

module.exports = Audio;
