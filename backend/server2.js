if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const Joi = require("joi");
const { request } = require("express");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const passportLocal = require("passport-local");
const chalk = require("chalk");
const app = express();

const initializePassport = require("./passport-config.js");
const cookieParser = require("cookie-parser");
initializePassport(passport, (email) => {
  return users.find((user) => user.email === email);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //key=value&key=value -> req.body
app.use(
  cors({
    origin: "http://localhost:3000", //location of react app
    credentials: true,
  })
);
app.use(flash());

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser("secretcode"));

//basically where i have left off:
// how do I load pages from the front end and say oh hey! if you fail,go to the register pageXOffset.
// if you dont fail, go through login page.
// do i need to render the sign up and log in pages from the backend??

// app.use(passport.initialize());
// app.use(passport.session());

const connection_url =
  "mongodb+srv://dilan:2924Harlanwood@cluster0.eryuw.mongodb.net/db?retryWrites=true&w=majority";
//DB config
mongoose
  .connect(connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to mongodb!"))
  .catch((err) => console.log("Error connecting to mongo: ", err));

const userSchema = new mongoose.Schema({
  name: String,
});

let data = [
  {
    id: 1,
    name: "Dilan",
    email: "dilan@gmail.com",
    password: "1234",
  },
  {
    id: 2,
    name: "Connor",
    email: "connor@gmail.com",
    password: "5678",
  },
  {
    id: 3,
    name: "Anna",
    email: "anna@gmail.com",
    password: "9123",
  },
];

const users = [
  {
    id: Date.now().toString(),
    name: "Devon",
    email: "Devon@gmail.com",
    password: "devonRules",
  },
];

function validateUser(user) {
  const userSchema = Joi.object({
    name: Joi.string().alphanum().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
  });

  //Validate
  return userSchema.validate(user);
}

app.get("/", (req, res) => {
  //this will be called when we go to '/'
  //req = incoming request
  res.send(data);
});

app.post("/animals", (req, res) => {
  console.log("this is req.body: ", req.body.data);
  const requestData = req.body.data;
  data.push(requestData);
  res.send(data);
});

app.get("/animals", (req, res) => {
  res.send(data);
});

app.post("/users", async (req, res) => {
  console.log("this is really req.body: ", req.body);
  const { error } = validateUser(req.body);

  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const requestData = req.body;
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    //redirect
  } catch {}

  res.send(users);
});

app.get("/users", (req, res) => {
  console.log("this is req.body: ", req.body.data);
  const requestData = req.body.data;
  res.send(users);
});

app.post(
  "/authenticateUser",
  passport.authenticate("local", {
    successRedirect: "http://localhost:3000",
    failureRedirect: "http://localhost:3000/login",
    failureFlash: true,
  })
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
