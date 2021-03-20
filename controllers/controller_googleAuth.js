const oauth2Client = require("../config/setup_googleapis");
const crypto = require("crypto");
const axios = require("axios");
const userModel_google = require("../models/user_google");

module.exports.googleLogIn_get = (req, res) => {
    const authURL = generateAuthURL(req, res);
    res.redirect(authURL);
};

module.exports.googleCallback_get = async (req, res) => {
    try {
        let user = await userModel_google.findOne({google_id: req.userProfile.id});

        req.session.userID = req.userProfile.id;
        req.session.isAuth = true;

        if(user) {
            res.json(user.google_id);
        } else {
            await userModel_google.create({google_id: req.userProfile.id});
            res.send("New user is created by using google account");
        }
    } catch(err) {
        throw err;
    }
};

module.exports.getToken = async (req, res, next) => {
    const { tokens } = await oauth2Client.getToken(req.query);
    oauth2Client.setCredentials(tokens);
    req.tokens = tokens;
    next();
}

module.exports.checkState = (req, res, next) => {
    if(req.query.state===req.cookies.google_state) {
        return next();
    } else {
        return res.redirect("/auth/login");
    }
};

module.exports.requireData = async (req, res, next) => {
    const tokenEndpoint = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${req.tokens.access_token}`
    const userProfile = await axios.get(tokenEndpoint);
    req.userProfile = userProfile.data;
    next();
};

// Internal functions
function generateAuthURL(req, res) {
    const scopes = ["profile"];
    const randomState = crypto.randomBytes(48).toString("base64");

    // store the random state in cookie temporarily
    res.cookie("google_state", randomState, {
        httpOnly: true,
        secure: process.env.NODE_ENV=="production" || false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 5
    });

    // generate the redirect url to auth server
    const authURL = oauth2Client.generateAuthUrl({
        scope: scopes,
        state: randomState
    });

    return authURL;
}