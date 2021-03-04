const bcrypt = require("bcrypt");
const userModel = require("../models/users");

async function doRegister(req, res, next) {

  /*Check if the given email has exited*/
  await userModel.findOne({email: req.body.email})
    .then((user) => {
      if(user==null) return next();
      return res.render("register", {mesg: "This email is used"});
    }).catch((err) => {
      throw err;
    });

  /*Encrypt the password and save it to password database*/
  let hashPassword = await bcrypt.hash(req.body.password, 12);
  let storage = await userModel({
    userName: req.body.userName,
    email: req.body.email,
    password: hashPassword,
    time: new Date().toString()
  }).save();
  return next();
}

async function authenticateUser(req, res, next) {
  let user = await userModel.findOne({email: req.body.email});

  if(user==null) return res.render("login", {mesg: "Wrong email"});

  let result = await bcrypt.compare(req.body.password, user.password);

  if(result==false) return res.render("login", {mesg: "Wrong password"});

  req.session.isAuth = true;
  req.session.userName = user.userName;
  next();
}

function isAuth(req, res, next) {
  if(req.session.isAuth) return next();
  res.redirect("/login");
}

function isLogin(req, res, next) {
  if(req.session.isAuth) return res.redirect("/");
  next();
}

module.exports = {
  doRegister,
  authenticateUser,
  isAuth,
  isLogin
}
