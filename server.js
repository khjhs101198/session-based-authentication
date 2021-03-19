const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const MongoStore = require('connect-mongo').default;

/*Import routers*/
const route_login = require("./routes/route_login");
const route_register = require("./routes/route_register");
const route_logout = require("./routes/route_logout");
const route_secret = require("./routes/route_secret");
const app = express();

/*Set password database*/
const dbURL = "mongodb+srv://Jimmy:jimmy956379@cluster0.mzswg.azure.mongodb.net/Session-based?retryWrites=true&w=majority";
const clientP = mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true})
  .then((res) => {
    return res.connection.getClient();
  }).catch((err) => {
    console.log(err);
  })

/*Set middlewares*/
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

/*Set routers middlewares*/
app.use("/login", route_login);
app.use("/register", route_register);
app.use("/logout", route_logout);
app.use("/secret", route_secret);

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(5000, (err)=>{
  if(err) throw err;
  console.log("Server started");
});

/*
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
*/
