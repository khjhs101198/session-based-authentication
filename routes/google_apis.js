const router = require("express").Router();
const googleapis = require("../controllers/controller_googleapis");
const googleAuth = require("../controllers/controller_googleAuth");
const mid_auth = require("../middlewares/mid_auth");

// Use openid connect to log in
router.route("/openid")
    .get(googleAuth.googleLogIn_get)

// Callback url from google auth server
router.route("/callback")
    .get(googleAuth.checkState, googleAuth.getIDToken, googleAuth.googleCallback_get)

router.route("/")
    .get(mid_auth.isAuth, googleapis.googleapi_get)

router.route("/email")
    .put(mid_auth.isAuth)

module.exports = router;