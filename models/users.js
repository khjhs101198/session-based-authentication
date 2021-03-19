const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Please enter the email"],
    validate: [isEmail, "Please enter valid email"]
  },
  password: {
    type: String,
    minlength: [6, "The length of password is less than 6"],
    required: [true, "Please enter the password"]
  }
});

/*Hash the password before storing into database--(middleware)*/
userSchema.pre("save", async function(next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/*Customize our own login method*/
userSchema.statics.login = async function(email, password) {
  let user = await this.findOne({email});

  /*Check if the email does existes*/
  if(user) {
    let hash = await bcrypt.compare(password, user.password);

    /*Check password*/
    if(hash) {
      return user;
    } else {
      throw new Error("Wrong password");
    }
  }
  else {
    throw new Error("Wrong email");
  }
};

const userModel = mongoose.model("userProfiles", userSchema);

module.exports = userModel;
