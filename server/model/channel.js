const mongoose = require("mongoose");

let channelSchema = mongoose.Schema({
  users: [
    {
      type: String,
      require: true,
    },
  ],
  lastMessage: {
    type: String,
    default: "",
  },
});
channelSchema.index({ users: 1 }, { unique: true });
let channelModel = mongoose.model("Channels", channelSchema);

channelModel.ensureIndexes(function (err) {
  console.log("ENSURE INDEX");
  if (err) console.log(err);
});
channelModel.on("index", function (err) {
  console.log("ON INDEX");
  if (err) console.log(err);
});

module.exports = { channelModel };
