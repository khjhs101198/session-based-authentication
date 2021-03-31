const axios = require("axios");
const queryString = require("querystring");
const driveModel = require("../models/drive");

// Protected resources
module.exports.isAuth = (req, res, next) => {
    // The user has logged in
    if(req.session.isAuth) {
        return next();
    }

    // Not logged in
    res.redirect("/auth/login");
}

// Redreict to home page if the user is already logged in
module.exports.isLog = (req, res, next) => {
    // Redirect user to home page
    if(req.session.isAuth) {
        return res.redirect("/");
    }
    next();
};

module.exports.getUserID = (req, res, next) => {
    // show the user information on the header bar
    if(req.session.isAuth) {
        res.locals.userID = req.session.userID;
        return next();
    } else {
        res.locals.userID = "Guest";
        return next();
    }
};

module.exports.autoRefreshToken = async (req, res, next) => {
    // The user hasn't grant the access to google drive
    let exp = req.session.tokenExpiration;
    if(!exp) {
        return next();
    }

    // Refresh access token
    try {
        let remain = (exp - Date.now()) / 1000;

        if(remain<600) {
            let drive = await driveModel.findOne({aud: req.session.userID});
            await refreshAccessToken(req, drive);
            console.log("refresh access token"); 
        }
 
    } catch(err) {
        if(err.message.includes("400")) {
            console.log("Invalid refresh token");
        } else {
            throw err;
        }
    }
    next();
}

async function refreshAccessToken(req, drive) {
    let url = "https://oauth2.googleapis.com/token" 

    let resp = await axios.post(url, queryString.stringify({
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: drive.refresh_token
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    req.session.tokenExpiration = Date.now() + 3599000;

    drive.access_token = resp.data.access_token;
    drive.expiry_date  = Date.now() + 3599000; // The response dosn't contain expiry_date
    await drive.save();
}