const oauth2Client = require("../config/setup_googleapis");
const crypto = require("crypto");
const queryString = require("querystring");
const userModel_google = require("../models/user_google");

// redirect users to google auth server
module.exports.googleLogIn_get = (req, res) => {
    const authURL = generateLoginURL(req, res);
    res.redirect(authURL);
};

// redirect to different callback url according to state
module.exports.googleCentralCallback_get = async (req, res) => {
    let redURL = req.query.state.slice(req.query.state.indexOf("?")+1, req.query.state.length);

    res.redirect(redURL + `?${queryString.stringify(req.query)}`);
};

module.exports.googleOpenidCallback = async (req, res) => {
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
function generateLoginURL(req, res) {

    const scopes = ["profile"];
    const randomState = crypto.randomBytes(48).toString("base64");
    const redURL = "?/api/google/callback/openid";

    // store the random state in cookie temporarily
    res.cookie("google_state", randomState + redURL, {
        httpOnly: true,
        secure: process.env.NODE_ENV=="production" || false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 5
    });

    // generate the redirect url to auth server
    const authURL = oauth2Client.generateAuthUrl({
        scope: scopes,
        access_type: "offline",
        state: randomState + redURL,
        prompt: "select_account"
    });

    return authURL;
}
