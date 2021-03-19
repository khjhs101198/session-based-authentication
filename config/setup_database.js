const mongoose = require("mongoose");

const clientP = mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
  .then((res) => {
    return res.connection.getClient();
  }).catch((err) => {
    console.log(err);
  });

module.exports = clientP;