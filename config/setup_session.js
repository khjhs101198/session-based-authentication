const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const clientP = require("./setup_database");

const session_config = {
    name: "sid",
    secret: "something123",
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hours
      sameSite: "strict",
      secure: process.env.NODE_ENV=="production" || false
    },
    store: MongoStore.create({
      clientPromise: clientP,
      autoRemove: "interval",
      autoRemoveInterval: 60
    }),
    resave: false,
    saveUninitialized: false
};

module.exports = session(session_config);