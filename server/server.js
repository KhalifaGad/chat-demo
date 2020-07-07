require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const { attachSocketIO } = require("./socket.io.js");
const connectDB = require("./db/dbConnection.js");

// const socketIO = require('socket.io');

// const {generateMessage, generateLocationMessage} = require('./utils/message');
// const {isRealString} = require('./utils/isRealString');
// const {Users} = require('./utils/users');
let dbUrl = process.env.BAZAR_DB_URL_LOCAL;

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || 3001;
let app = express();
let server = http.createServer(app);

app.use(express.static(publicPath));

server = attachSocketIO(server);

connectDB(dbUrl).then(() => {
  console.log("mongo is up "+dbUrl)
  server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  });
});
