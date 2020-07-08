const socketIO = require("socket.io");
const fs = require("fs");
const path = require("path");

const { Rooms } = require("./utils/rooms");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/isRealString");
const { chatModule } = require("./module/index");
const { text } = require("express");
const moment = require("moment");

let roomsArr = [];
let room;
function attachSocketIO(server) {
  let io = socketIO(server);
  io.on("connection", (socket) => {
    // console.log("siz: "+roomsArr.length)
    console.log("A new user just connected");

    socket.on("join", async (params, callback) => {
      let roomId = "";
      let roomFlag = false;
      // let user1Id = "5ef354b98312541498b9e0eb",
      //   user2Id = "5ef354b98312541498b9e0ea";
      if (!params) {
        return callback("Name and room are required");
      }
      params = params.sort().join(",");
      console.log(roomsArr.length);
      let channel = await chatModule.getChannel(params);

      if (channel) roomId = channel._id + "";
      else {
        let channel = {};
        channel.users = params;
        let insertToDb = await chatModule.addChannel(channel);
        console.log(insertToDb);
        roomId = insertToDb._id + "";
      }

      for (let i = 0; i < roomsArr.length; i++) {
        if (roomsArr[i].id === roomId) {
          roomFlag = true;
          console.log("user1: " + roomsArr[i].getUserList());
          roomsArr[i].addUser(socket.id);
          console.log("user2: " + roomsArr[i].getUserList());
          room = roomsArr[i];
          break;
        }
      }

      if (!roomFlag) {
        room = new Rooms(roomId);
        console.log("users1: " + (await room.getUserList()));
        await room.addUser(socket.id);
        console.log("users2: " + (await room.getUserList()));
        await roomsArr.push(room);
      }
      console.log("room: " + room);

      socket.join(room.id);
      console.log(socket.adapter.rooms);

      // console.log(users);

      io.to(room.id).emit("updateUsersList", await room.getUserList());

      socket.emit(
        "newMessage",
        generateMessage("Admin", `Welocome to ${room.id}!`)
      );

      socket.broadcast
        .to(room.id)
        .emit("newMessage", generateMessage("Admin", "New User Joined!"));
      callback();
    });

    socket.on("createMessage", async (message, callback) => {
      let messages = {
        channelId: room.id,
        text: message.text,
        from: message.userId,
        type: "text",
        date: moment().valueOf(),
      };
      console.log(moment(messages.date).format('LT'));
      if (isRealString(messages.text)) {
        io.to(room.id).emit(
          "newMessage",
          generateMessage(messages.from, messages.text)
        );
      }
      await room.messagesArr.push(messages);
      callback("This is the server:");
    });

    socket.on("upload-image", async function (message) {
      let messages = {
        channelId: room.id,
        text: Date.now() + message.name,
        from: message.userId,
        type: "img",
        date: moment().valueOf(),
      };

      var writer = fs.createWriteStream(
        path.join(__dirname, "/../public/tmp/" + messages.text),
        {
          encoding: "base64",
        }
      );

      writer.write(message.data);
      writer.end();

      writer.on("finish", function () {
        console.log("up");
        io.to(room.id).emit(
          "image-uploaded",
          generateMessage(messages.from, "./tmp/" + messages.text)
        );
      });
      writer.on("error", function (err) {
        console.log(err);
      });
      await room.messagesArr.push(messages);
    });

    socket.on("disconnect", async () => {
      await room.removeUser(socket.id);
      if ((await room.getUserList().length) == 0) {
        roomsArr = roomsArr.filter((rom) => {
          return room.id !== rom.id;
        });
        let saveMessages = await chatModule.addMessges(room.getMessages());
        delete room;
      }
      io.to(room.id).emit("updateUsersList", room.getUserList());
      io.to(room.id).emit(
        "newMessage",
        generateMessage("Admin", `${socket.id} has left ${room.id} chat room.`)
      );
      delete room;
      //}
    });
  });
  return server;
}
module.exports = { attachSocketIO };
