const mongoose = require("mongoose");

let chatSchema = mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channels",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

let chatlModel = mongoose.model("Chat", chatSchema);
module.exports = { chatlModel };
