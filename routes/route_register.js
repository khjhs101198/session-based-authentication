const express = require("express");
const router = express.Router();
const auth = require("../controllers/controller_auth");

router.get("/", auth.isLogin, (req, res) => {
  res.render("register", {mesg: ""});
});

router.post("/", auth.doRegister, (req, res) => {
  res.redirect("/login");
});

module.exports = router;
