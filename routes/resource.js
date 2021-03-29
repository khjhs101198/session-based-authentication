const router = require("express").Router();
const mid_auth = require("../middlewares/mid_auth");
const resource = require("../controllers/controller_resource");
const googleapis = require("../controllers/controller_googleapis");

router.get("/smoothies", mid_auth.isAuth, resource.resource_get);

router.route("/myDrive")
    .get(mid_auth.isAuth, googleapis.myDrive_get);

module.exports = router;
