const oauth2Client = require("../config/setup_googleapis");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const queryString = require("querystring");
const userModel_google = require("../models/user_google");
const driveModel = require("../models/drive");

// redirect users to google auth server
module.exports.googleLogIn_get = (req, res) => {
    const scopes = ["profile"];
    const redURL = "/api/google/callback/openid";
    const authURL = generateLoginURL(res, scopes, redURL);

    res.redirect(authURL);
};

// redirect to different callback url according to state
module.exports.googleCentralCallback_get = (req, res) => {

    let state = JSON.parse(req.query.state.slice(req.query.state.indexOf("{"), req.query.state.indexOf("}")+1));

    res.redirect(state.redURL + `?${queryString.stringify(req.query)}`);
};

module.exports.googleOpenidCallback = async (req, res) => {
    let tokens = req.tokens; 

    try {
        // Check the idToken is from google
        let idToken = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_OAUTH_CLIENT_ID
        });
        let payload = idToken.getPayload();

        let user = await userModel_google.findOne({google_id: payload.sub});
  
        if(!user) {
            // The user first log in with google account
            await userModel_google.create({
                google_id: payload.sub,
                name: payload.name,
                picture: payload.picture
            });

            return res.send("Account created by google, please log in again");
        } else {
            // The user already has an account
            let drive = await driveModel.findOne({aud: user._id});
            if(drive) {
                req.session.tokenExpiration = drive.expiry_date;
                req.session.linkDrive = drive.google_id;
            }

            req.session.userID = user._id;
            req.session.google_id = payload.sub;
            req.session.isAuth = true;

            user.name = payload.name;
            user.picture = payload.picture;
            await user.save();
        }

        res.send("Succed to log in with google account");
    } catch(err) {
        throw err;
    }
};

// check the state parameter 
module.exports.checkState = (req, res, next) => {
    let state = req.query.state;

    if(state===req.cookies.google_state) {
        return next();
    } else {
        return res.redirect("/auth/login"); 
    }
};

// use auth code to get tokens
module.exports.getIDToken = async (req, res, next) => {
    try {
        const { tokens } = await oauth2Client.getToken(req.query);
        oauth2Client.setCredentials(tokens);
        console.log(tokens);
        req.tokens = tokens; 
        next();
    } catch(err) {
        // (1) The user rejects to grant the scopes that our app requires. (2) other errors
        console.log(err);
        res.redirect("/auth/login");
    }
}

/*---------Internal functions---------*/

// generate the log in url
function generateLoginURL(res, scopes, redURL) {

    let random = crypto.randomBytes(48).toString("base64");
    let state = JSON.stringify({redURL});

    // store the random state in cookie temporarily
    res.cookie("google_state", random + state, {
        httpOnly: true,
        secure: process.env.NODE_ENV=="production" || false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 5
    });

    // generate the redirect url to auth server
    const authURL = oauth2Client.generateAuthUrl({
        scope: scopes,
        state: random + state,
        prompt: "select_account"
    });

    return authURL;
}

