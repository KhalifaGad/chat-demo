const { channelModel } = require("../model/channel");
const { chatlModel } = require("../model/chat");

let chatModule = {
  async addMessges(messages) {
    return await chatlModel.insertMany(messages).catch((err) => {
      return err;
    });
  },

  async getMessages(channelId) {
    return await chatlModel.find({ channelId: channelId }).catch((err) => {
      return err;
    });
  },

  async addChannel(channel) {
    return await channelModel(channel)
      .save()
      .then((doc) => {
        return doc;
      })
      .catch((err) => {
        return err;
      });
  },

  async getChannel(users) {
    return await channelModel
      .findOne({
        users: users,
      })
      .catch((err) => {
        return err;
      });
  },

};

module.exports = { chatModule };
