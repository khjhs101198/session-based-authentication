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