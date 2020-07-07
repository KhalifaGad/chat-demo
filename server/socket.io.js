const socketIO = require("socket.io");

const { Rooms } = require("./utils/rooms");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/isRealString");
const { chatModule } = require("./module/index");

let roomsArr = [];
let roomFlag = false;
let room;

function attachSocketIO(server) {
  let io = socketIO(server);
  let roomId = "";
  io.on("connection", (socket) => {
    // console.log("siz: "+roomsArr.length)
    console.log("A new user just connected");

    socket.on("join", async (params, callback) => {
      let user1Id = "5ef354b98312541498b9e0eb",
        user2Id = "5ef354b98312541498b9e0ea";
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

      console.log("flag: " + roomFlag);
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
        channelId:room.id,
        text: message.text,
        from: "5ef354b98312541498b9e0eb",
        date: new Date(),
      };
      console.log(socket.rooms);
      if (isRealString(messages.text)) {
        io.to(room.id).emit(
          "newMessage",
          generateMessage(socket.id, messages.text)
        );
      }
      await room.messagesArr.push(messages);
      callback("This is the server:");
    });

    // socket.on(
    //   "createLocationMessage",
    //   (coords) => {
    //     //let user = users.getUser(socket.id);

    //     //  if (user) {
    //     io.to(user.room).emit(
    //       "newLocationMessage",
    //       generateLocationMessage(user.name, coords.lat, coords.lng)
    //     );
    //   }
    //   // }
    // );
    socket.on("disconnect", async () => {
      // let user = users.removeUser(socket.id);
      // if (user) {
      await room.removeUser(socket.id);
      if ((await room.getUserList().length) == 0) {
        roomsArr = roomsArr.filter((rom) => {
          return room.id !== rom.id;
        });
        roomFlag = false;
        let saveMessages=await chatModule.addMessges(room.getMessages())
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
