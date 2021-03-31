const express = require("express");
const { OAuth2Client } = require('google-auth-library');
const app = express();

const oauth2Client = new OAuth2Client(
    "599170504630-4h0vek5k1jpplj2ce193n3408qt32mor.apps.googleusercontent.com",
    "B16RDX8yPFJnZTcfIPbM8dWd",
    "http://localhost:5000/callback"
);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("test");
});

app.get("/auth", (req, res) => {
    res.redirect(genAuth());
});

app.get("/callback", getToken, (req, res) => {
    res.send("callback");
});

app.listen(5000, function(err) {
    if(err) throw err;
    console.log("Server started");
});

function genAuth() {
    const authURL = oauth2Client.generateAuthUrl({
        scope: ["https://www.googleapis.com/auth/drive"],
        prompt: "select_account",
        include_granted_scopes: true
    });

    return authURL;
}

async function getToken(req, res, next) {
    try {
        let { tokens } = await oauth2Client.getToken(req.query);
        console.log(tokens);
        req.tokens = tokens; 
        next();
    } catch(err) {
        // (1) The user rejects to grant the scopes that our app requires. (2) other errors
        console.log(err);
        res.redirect("/");
    }
}
