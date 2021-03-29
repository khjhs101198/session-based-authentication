require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

// middlewares & view engine
app.set("view engine", "ejs");
app.use(express.json(), express.urlencoded({extended: false}), cookieParser());
app.use(express.static("./public"));
app.use(require("./config/setup_session"));
app.use(require("./middlewares/mid_auth").getUserID);


// database
const db = require("./config/setup_database");
const { oauth2 } = require('googleapis/build/src/apis/oauth2');

// routers
app.use("/auth", require("./routes/authentication"));
app.use("/resource", require("./routes/resource"));
app.use("/api/google", require("./routes/google_apis"));

// home page
app.get("/", (req, res) => {
  res.render("home");
});

app.listen(process.env.PORT||3000, (err) => {
  if(err) throw err;
  console.log("Server started on port 3000");
});


// Check some functionalities of session
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