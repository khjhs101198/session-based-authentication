const express = require("express");
const router = express.Router();

router.delete("/", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sid");
    res.redirect("/login");
    console.log("Session destroyed");
  });
});

module.exports = router;
