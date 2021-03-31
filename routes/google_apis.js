const router = require("express").Router();
const googleapis = require("../controllers/controller_googleapis");
const googleAuth = require("../controllers/controller_googleAuth");
const mid_auth = require("../middlewares/mid_auth");

// Authorization
router.route("/centralCallback")
    .get(googleAuth.googleCentralCallback_get)

router.route("/openid")
    .get(googleAuth.googleLogIn_get)

router.route("/callback/openid")
    .get(googleAuth.checkState, googleAuth.getIDToken, googleAuth.googleOpenidCallback)

router.route("/drive")
    .get(googleapis.getDrive_get)
    .put(googleapis.getDrive_put)

router.route("/callback/drive")
    .get(googleAuth.checkState, googleapis.getToken, googleapis.googleDriveCallback)

router.route("/revoke")
    .delete(googleapis.revoke)

module.exports = router;