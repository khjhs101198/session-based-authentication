const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", isLogin, (req, res) => {
  res.render("login", {mesg: ""});
});

app.post("/login", authenticateUser, (req, res) => {
  res.redirect("/");
});

app.get("/register", isLogin, (req, res) => {
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
    res.clearCookie("sid");
    res.redirect("/login");
    console.log("Session destroyed");
  });
});

app.get("/secret", isAuth, (req, res) => {
  res.send("Secret page");
});

app.listen(process.env.PORT||5000, (err)=>{
  if(err) throw err;
  console.log("Server started");
});

function checkAccount(req, res, next) {
  /*Check if the given email has exited*/
  userModel.findOne({email: req.body.email})
    .then((user) => {
      if(user==null) return next();
      res.render("register", {mesg: "This email is used"});
    }).catch((err) => {
      throw err;
    });
}

async function authenticateUser(req, res, next) {
  let user = await userModel.findOne({email: req.body.email});

  if(user==null) return res.render("login", {mesg: "Wrong email"});

  let result = await bcrypt.compare(req.body.password, user.password);

  if(result==false) return res.render("login", {mesg: "Wrong password"});

  req.session.isAuth = true;
  req.session.userName = user.userName;
  next();
}

function isAuth(req, res, next) {
  if(req.session.isAuth) return next();
  res.redirect("/login");
}

function isLogin(req, res, next) {
  if(req.session.isAuth) return res.redirect("/");
  next();
}

/**/
app.get("/test", (req, res) => {
  console.log(req.session.flash);
  res.send(`Test page: ${req.flash("Info")}`);
  console.log(req.session.flash);
});
app.get("/flash", (req, res) => {
  req.flash("Info", "Hello World");
  res.redirect("/test");
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
