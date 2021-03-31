const axios = require("axios");
const crypto = require("crypto");
const queryString = require("querystring");
const oauth2Client = require("../config/setup_googleapis");
const driveModel = require("../models/drive");

module.exports.myDrive_get = (req, res) => {
    // pass current linked drive
    if(req.session.linkDrive) {
        res.locals.linkDrive = req.session.linkDrive;
    } else {
        res.locals.linkDrive = "none";
    }

    res.render("api");
};

// generate auth url
module.exports.getDrive_get =  (req, res) => {
    let scopes = ["profile", "https://www.googleapis.com/auth/drive"];
    let redURL = "/api/google/callback/drive";
    let aud = req.session.userID;

    let authURL = generateAuthURL(res, scopes, redURL, aud);
    res.redirect(authURL);
};

module.exports.getToken = async (req, res, next) => {
    try {
        let { tokens } = await oauth2Client.getToken(req.query);
        oauth2Client.setCredentials(tokens);
        req.tokens = tokens; 
        next();
    } catch(err) {
        // (1) The user rejects to grant the scopes that our app requires. (2) other errors
        console.log(err);
        res.redirect("/");
    }
}

module.exports.googleDriveCallback = async (req, res) => {

    // id token
    let tokens = req.tokens;
    let idToken = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_OAUTH_CLIENT_ID
    });
    let payload = idToken.getPayload();

    // Check and storage
    let aud = JSON.parse(req.query.state.slice(req.query.state.indexOf("{"), req.query.state.indexOf("}")+1)).aud;
    try {
        let drive = await driveModel.findOne({google_id: payload.sub});
        if(drive) {
            // This google drive had been used
            if(drive.aud!==aud) {
                return res.send("This google drive had already linked to other account");
            } else {
                // Update the tokens
                if(tokens.refresh_token) {
                    drive.refresh_token = tokens.refresh_token;
                }
                if(tokens.access_token) {
                    drive.access_token = tokens.access_token;
                    drive.expiry_date = tokens.expiry_date;
                }
                await drive.save();
                res.send("Update the token");
            }
        } else {
            // Create new link    
            await driveModel.create({
                google_id: payload.sub,
                aud: aud,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: tokens.expiry_date
            });
            res.send("New google drive linked");
        }
    } catch(err) {
        throw err;
    }
};

// Use token to get google dirve's data
module.exports.getDrive_put = async (req, res) => {
    try {
        let drive = await driveModel.findOne({aud: req.session.userID});
        if(!drive) {
            return res.send("No google_id");
        }

        let reqURL = `https://www.googleapis.com/drive/v3/files`;
        let driveData = await axios.get(reqURL, {
            headers: {
                "Authorization": `Bearer ${drive.access_token}`
            }
        });
        res.status(200).json(driveData.data);
    } catch(err) {
        let errors = errorHandler(err);
        res.json(errors);
    }
}

module.exports.revoke = async (req, res) => {
    try {
        await driveModel.deleteOne({aud: req.session.userID});

        req.session.linkDrive = "";
        res.send("Tokens deleted");
    } catch(err) {
        throw err;
    }
};

/*---------Internal functions---------*/

function errorHandler(err) {
    let errors = {};

    if(err.message.includes("401")) {
        errors.authError = "Unauthorized";
    }

    if(err.message.includes("403")) {
        errors.authError = "No credentials";
    }

    return errors;
}

function generateAuthURL(res, scopes, redURL, aud) {

    let random = crypto.randomBytes(48).toString("base64");
    let state = JSON.stringify({redURL, aud});

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
        access_type: "offline",
        state: random + state,
        prompt: "select_account",
        include_granted_scopes: true
    });

    return authURL;
}
