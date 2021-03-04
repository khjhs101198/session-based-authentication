const express = require("express");
const router = express.Router();
const auth = require("../controllers/controller_auth");

router.get("/", auth.isAuth, (req, res) => {
  res.send("Secret page");
});

module.exports = router;
