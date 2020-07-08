const mongoose = require("mongoose");

let chatSchema = mongoose.Schema({
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channels",
    required: true,
  },
  text: {
    type: String,
    require: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  date: {
    type: Date,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
});

let chatlModel = mongoose.model("Chat", chatSchema);
module.exports = { chatlModel };
