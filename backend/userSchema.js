const mongoose = require("mongoose");
const user = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  password: String,
  email: String,
  movingTo: String,
  major: String,
  school: String,
});

module.exports = mongoose.model("User", user);
