const { Users } = require("./utils/users");
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/isRealString");

const socketIO = require("socket.io");
let users = new Users();

function attachSocketIO(server) {
  let io = socketIO(server);
  io.on("connection", (socket) => {
    console.log("A new user just connected");
    // console.log(socket.adapter.rooms);
    console.log(socket.rooms)
    /* 
      {
        'WTYVJ3mOhkpRIv-BAAAB': Room { sockets: { 'WTYVJ3mOhkpRIv-BAAAB': true }, length: 1 }
      }
    */
    socket.on("join", (params, callback) => {
      if (!isRealString(params.name) || !isRealString(params.room)) {
        return callback("Name and room are required");
      }

      socket.join(params.room);
      users.removeUser(socket.id);
      users.addUser(socket.id, params.name, params.room);

      io.to(params.room).emit(
        "updateUsersList",
        users.getUserList(params.room)
      );
      socket.emit(
        "newMessage",
        generateMessage("Admin", `Welocome to ${params.room}!`)
      );

      socket.broadcast
        .to(params.room)
        .emit("newMessage", generateMessage("Admin", "New User Joined!"));

      callback();
    });

    socket.on("createMessage", (message, callback) => {
      let user = users.getUser(socket.id);
      console.log(socket.rooms)
      if (user && isRealString(message.text)) {
        io.to(user.room).emit(
          "newMessage",
          generateMessage(user.name, message.text)
        );
      }
      callback("This is the server:");
    });

    socket.on("createLocationMessage", (coords) => {
      let user = users.getUser(socket.id);

      if (user) {
        io.to(user.room).emit(
          "newLocationMessage",
          generateLocationMessage(user.name, coords.lat, coords.lng)
        );
      }
    });

    socket.on("disconnect", () => {
      let user = users.removeUser(socket.id);

      if (user) {
        io.to(user.room).emit("updateUsersList", users.getUserList(user.room));
        io.to(user.room).emit(
          "newMessage",
          generateMessage(
            "Admin",
            `${user.name} has left ${user.room} chat room.`
          )
        );
      }
    });
  });
  return server;
}

module.exports = { attachSocketIO };
