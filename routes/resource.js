const router = require("express").Router();
const mid_auth = require("../middlewares/mid_auth");
const resource = require("../controllers/controller_resource");

router.get("/smoothies", mid_auth.isAuth, resource.resource_get);

module.exports = router;