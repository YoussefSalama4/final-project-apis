const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "An audio should have a title"],
    minlength: [3, "audio title should be at least 3 charaters"],
  },
  audio: {
    type: String,
    // required: [true, "an audio is required"],
  },
  owner: {
    type: String,
    required: [true, "an audio should have an owner"],
  },
  trancriptionText: { type: String, default: "" },
  duration: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Audio = mongoose.model("Audio", audioSchema);

module.exports = Audio;
