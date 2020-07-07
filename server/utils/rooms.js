class Rooms {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.messagesArr = [];
  }

  addUser(id) {
    return this.users.push(id);
  }

  getUserList() {
    return this.users;
  }

  removeUser(id) {
    return (this.users = this.users.filter((userId) => userId !== id));
  }

  addMessage(message) {
    this.messagesArr.push(message);
    return messagesArr;
  }

  getMessages() {
    return this.messagesArr;
  }
}

module.exports = { Rooms };
