const oauth2Client = require("../config/setup_googleapis");
const crypto = require("crypto");
const axios = require("axios");
const userModel_google = require("../models/user_google");

// redirect users to google auth server
module.exports.googleLogIn_get = (req, res) => {
    const authURL = generateLoginURL(req, res);
    res.redirect(authURL);
};

// callback route for google auth server
module.exports.googleCallback_get = async (req, res) => {
    let tokens = req.tokens;

    try {
        let idToken = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_OAUTH_CLIENT_ID
        });
        let payload = idToken.getPayload();
        let user = await userModel_google.findOne({google_id: payload.sub});

        req.session.userID = payload.sub;
        req.session.isAuth = true;

        if(!user) {
            await userModel_google.create({
                google_id: payload.sub,
                name: payload.name,
                picture: payload.picture,
                scope: tokens.scope
            });
        } else {
            user.name = payload.name;
            user.picture = payload.picture;
            await user.save();
        }
    } catch(err) {
        throw err;
    }

    res.send("Succeed to log in with google account");
};

// check the state parameter 
module.exports.checkState = (req, res, next) => {
    if(req.query.state===req.cookies.google_state) {
        return next();
    } else {
        return res.redirect("/auth/login");
    }
};

// use auth code to get tokens
module.exports.getIDToken = async (req, res, next) => {
    const { tokens } = await oauth2Client.getToken(req.query);
    oauth2Client.setCredentials(tokens);
    req.tokens = tokens; 
    next();
}

/*---------Internal functions---------*/

// generate the log in url
function generateLoginURL(req, res) {

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
        access_type: "offline",
        state: randomState,
        prompt: "select_account"
    });

    return authURL;
}
