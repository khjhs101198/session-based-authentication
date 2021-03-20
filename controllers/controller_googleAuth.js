const oauth2Client = require("../config/setup_googleapis");
const crypto = require("crypto");

module.exports.googleLogIn_get = (req, res) => {
    const authURL = generateAuthURL(req, res);
    res.redirect(authURL);
};

module.exports.googleCallback_get = (req, res) => {
    res.send("Callback page for google");
};

module.exports.getToken = async (req , res, next) => {
    const { tokens } = await oauth2Client.getToken(req.query);
    oauth2Client.setCredentials(tokens);
    next();
}

module.exports.checkState = (req, res, next) => {
    if(req.query.state===req.cookies.google_state) {
        return next();
    } else {
        return res.redirect("/auth/login");
    }
};

module.exports.requireData = (req, res, next) => {
    
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
