if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
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
const User = require("./userSchema.js");

//----------------------------------------- END OF IMPORTS---------------------------------------------------

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
app.use(passport.initialize());
app.use(passport.session());
require("./passport-config")(passport);

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
//----------------------------------------- END OF MIDDLEWARE---------------------------------------------------

// Routes
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.status(401).send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("Successfully Authenticated");
        console.log(req.user);
      });
    }
  })(req, res, next);
});
app.post("/register", (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User Already Exists");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      await newUser.save();
      res.send("User Created");
    }
  });
});
app.get("/user", (req, res) => {
  res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
});

const usersData = [];

app.post("/userdata", (req, res) => {
  console.log(req.body.name);
  User.findOne({ email: req.body.email }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("Email Already In Use");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.name,
        password: hashedPassword,
        email: req.body.email,
        movingTo: req.body.movingTo,
        major: req.body.major,
      });
      await newUser.save();
      res.send("User Created");
    }
  });
  console.log("Line 108:", req.body);
});

app.get("/userdata", (req, res) => {
  console.log("THIS IS REQ user", req.body);
  res.send(req.body);
});
//----------------------------------------- END OF ROUTES---------------------------------------------------
//Start Server
app.listen(5000, () => {
  console.log("Server Has Started");
});
