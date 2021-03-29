const { drive } = require("googleapis/build/src/apis/drive");
const userModel = require("../models/user_local");
const driveModel = require("../models/drive");

module.exports.login_get = (req ,res) => {
    res.render("login");
};

module.exports.login_post = async function (req, res) {
    let { email, password } = req.body;
  
    try {
      let user = await userModel.login(email, password);

      let drive = await driveModel.findOne({aud: user._id});
      if(drive) {
        req.session.tokenExpiration = drive.expiry_date;
      }

      req.session.userID = user._id;
      req.session.isAuth = true;
      
      res.json({id: user._id});
    } catch(err) {
      let errors = errorHandler(err);
      res.json(errors);
    }
}

module.exports.register_get = (req ,res) => {
    res.render("register");
};

module.exports.register_post = async function (req, res) {
    let { email, password } = req.body;
  
    try {
      let user = await userModel.create({email, password});
      res.json({id: user._id});
    } catch(err) {
      let errors = errorHandler(err);
      res.json(errors);
    }
};

module.exports.logout_get = (req, res) => {
    req.session.destroy(() => {
        console.log("Session destroyed");
    });
    res.clearCookie("sid");
    res.redirect("/");
};
  
/*Handle the errors when signing in */
function errorHandler(err) {
    console.log(err.message);
    let errors = {email: "", password: ""};
  
    // Wrong Email
    if(err.message == "Wrong email") {
      errors.email = "Wrong email";
    }
  
    // Wrong password
    if(err.message == "Wrong password") {
      errors.password = "Wrong password";
    }
  
    // Validation errors
    if(err.message.includes("userProfiles validation failed")) {
      Object.values(err.errors).forEach((item, i) => {
        errors[item.path] = item.message;
      });
    }
  
    // This email is uesed
    if(err.code=="11000") {
      errors.email = "This email is used";
    }
  
    return errors;
}

