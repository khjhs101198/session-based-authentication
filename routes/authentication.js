const router = require("express").Router();
const auth = require("../controllers/controller_authentication");
const mid_auth = require("../middlewares/mid_auth");

router.route("/login")
    .get(mid_auth.isLog, auth.login_get)
    .post(auth.login_post)

router.route("/register")
    .get(mid_auth.isLog, auth.register_get)
    .post(auth.register_post)

router.route("/logout")
    .get(auth.logout_get)

module.exports = router;