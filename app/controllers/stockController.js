const request = require('request');


exports.mainPage = (req, res) => {
    res.render('stocks',{
        loggedIn: req.session.user
    });
}