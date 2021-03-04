const express = require("express");
const auth = require("../controllers/controller_auth");
const router = express.Router();

router.get("/", auth.isLogin, (req, res) => {
  res.render("login", {mesg: ""});
});

router.post("/", auth.authenticateUser, (req, res) => {
  res.redirect("/");
});

module.exports = router
