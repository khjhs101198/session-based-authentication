const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  google_id: {
    type: String,
    unique: true,
    required: [true, "Please enter the google id"]
  }
});

/*Customize our own login method*/
userSchema.statics.login = async function(email, password) {
  
};

const userModel = mongoose.model("userProfiles-google", userSchema);

module.exports = userModel;
