const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const userModel = require("./models/users");
const MongoStore = require('connect-mongo').default;
const app = express();

const dbURL = "mongodb+srv://Jimmy:jimmy956379@cluster0.mzswg.azure.mongodb.net/Session-based?retryWrites=true&w=majority";
const clientP = mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true})
  .then((res) => {
    return res.connection.getClient();
  }).catch((err) => {
    console.log(err);
  })
app.set("view engine", "ejs");
app.use(express.json(), express.urlencoded({extended: false}), cookieParser());
app.use(express.static("./public"));
app.use(session({
  name: "sid",
  secret: "something123",
  cookie: {
    maxAge: 1000 * 60 * 60, // 2min
    sameSite: "strict",
    secure: process.env.NODE_ENV=="production" || false
  },
  store: MongoStore.create({
    clientPromise: clientP,
    autoRemove: "interval",
    autoRemoveInterval: 60
  }),
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/regenerate", (req, res) => {
  req.session.regenerate(function() {
    console.log("Succeed to regenerate sessionID");
    res.send("regenearte page");
  });
});
app.get("/destroy", (req, res) => {
  req.session.destroy(() => {
    console.log("Destroy the session");
  });
  res.send("Destroy page");
});

app.get("/login", (req, res) => {
  res.render("login", {mesg: ""});
});

app.post("/login", authenticateUser, (req, res) => {
  req.session.email = req.body.email;
  console.log(req.session);
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register", {mesg: ""});
});

app.post("/register", checkAccount, async (req, res) => {
  let hashPassword = await bcrypt.hash(req.body.password, 12);
  let storage = await userModel({
    userName: req.body.userName,
    email: req.body.email,
    password: hashPassword,
    time: new Date().toString()
  }).save();
  res.redirect("/login");
});

app.delete("/logout", (req, res) => {
  req.session.destroy(() => {
    console.log("Session destroyed");
  });
  res.redirect("/login");
});

app.get("/secret", checkCredential, (req, res) => {
  res.send("Secret page");
});

app.listen(process.env.PORT||5000, (err)=>{
  if(err) throw err;
  console.log("Server started");
});

function checkAccount(req, res, next) {
  /*Check if the given email has exited*/
  userModel.findOne({email: req.body.email})
    .then((res) => {
      if(res==null) {
        next();
      }
      res.render("register", {mesg: "This email is used"});
    }).catch((err) => {
      throw err;
    });
}

async function authenticateUser(req, res, next) {
  let user = await userModel.findOne({email: req.body.email});
  if(user==null) res.render("login", {mesg: "Wrong email"});
  let result = await bcrypt.compare(req.body.password, user.password)
  if(result==false) res.render("login", {mesg: "Wrong password"});
  next();
}

function checkCredential(req, res, next) {
  console.log(req.cookies.sid.slice(2, req.cookies.sid.indexOf(".")));
  console.log(req.sessionID);
  if(req.cookies.sid.slice(2, req.cookies.sid.indexOf("."))==req.sessionID) {
    return next();
  }
  res.send("You have to sign in to see contents");
}

app.get("/test", (req, res) => {
  console.log(req.session.flash);
  res.send(`Test page: ${req.flash("Info")}`);
  console.log(req.session.flash);
});
app.get("/flash", (req, res) => {
  req.flash("Info", "Hello World");
  res.redirect("/test");
});
