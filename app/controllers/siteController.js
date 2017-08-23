const mongoose = require('mongoose');
const users = require('../models/Users');

const basedir = '../'


exports.home = (req, res) => {
    req.session.back = req.originalUrl;
    res.render('index', {loggedIn: req.session.user})
}

exports.test = (req, res) => {
    res.send("hello world times two");
}

exports.signup = (req, res) => {
    res.render('signup', {
        basedir
    });
}

exports.usernamecheck = (req,res,next) => {
    const username = req.body.username;
    users.findOne({username: username}, (err, data) => {
        if(err) return res.send("error finding data");
        if(data===null) {
            next()
        } else {
            res.render("login", {
                loggedIn: req.session.user,
                error: "Username already exists, please choose another",
                
                
            });
        }
    })
}

exports.passwordmatch = (req, res, next) => {
    const body = req.body;
    if(body.newpassword !== body.cpassword) {
        if (req.session.back) {
            return res.redirect(req.session.back+'?error=passwords do not match')
        }
        res.render("login", {
                loggedIn: req.session.user,
                error: "These passwords do not match",
                basedir
            });
    } else {
        next();
    }
}

exports.emailcheck = (req, res, next) => {
    if(req.body.email==="") return next();
    users.findOne({email: req.body.email}, (err,data)=> {
        if(err) return res.send("error finding data");
        if(data===null) {
            next();
        } else {
            res.render("login", {
                loggedIn: req.session.user,
                error: "This email exists in our database",
                basedir
            });
        }
    })
}

exports.adduser = async (req, res) => {
    const object = {username: req.body.username, password: req.body.newpassword, email: req.body.email}
    var data = await new users(object);
    await data.save(err=> {
        if(err) return res.send("error saving to database");
    });
    req.session.user = req.body.username;
    res.render('index', {
        loggedIn: req.session.user
    });
}

exports.loginVerify = (req, res, next) => {
    //req.session.back = req.headers.referer
    if(req.session.user) return next();
    if(!req.session.user) {
        return res.render('login',{
            loggedIn: req.session.user
        })
    }
}

exports.loginpage = async (req, res) => {
    req.session.back = req.headers.referer
    res.render('login',{
        loggedIn: req.session.user,
        basedir
    })
}

exports.login = async (req, res) => {
    //you added originalurl to default back
    let back = req.session.back;
    console.log(req.url, req.path);
    req.session.back = null;
    users.findOne({username:req.body.username}, async (err, data) => {
        if (err) return res.send("error finding data");
        if (data==null) {
            res.render('login', {
                error: "Username does not exist, please signup",
                basedir
            })
        } else if (data.password !== req.body.password) {
            res.render('login', {
                error: "Wrong password, please try again",
                basedir
            })
        } else {
            req.session.user = req.body.username;
            res.redirect(back ? back : '/')
        }
    })
    
}

exports.logout = (req, res) => {
    req.session.destroy();
    console.log(req.session);
    res.redirect('/');
}

exports.session = async (req, res) => {
    res.send(req.session);
}

exports.settings = (req, res) => {
    var error = req.query.error;
    var success = req.query.success;
    req.session.back = req.originalUrl;
    users.findOne({username: req.session.user}, (err, user) => {
        if(err) return res.send(err+"error")
        if(user=== null) {
            req.session = {}
            return res.redirect('/settings')
        } else {
            req.session.back = req.path;
            return res.render('settings', {
                UserData: user,
                loggedIn: req.session.user,
                error, success
            });
        }
    })
    
}

exports.update = (req, res) => {
    users.findOneAndUpdate({username: req.body.username}, {
        "$set": {"city": req.body.city, "country": req.body.country}
    }, (err, db) => {
        if(err) return res.send("error " + err)
        res.redirect('/settings?success=Location updated!');
    })
}

exports.changePassword = (req, res) => {
    users.findOneAndUpdate({username: req.body.username, password: req.body.password}, 
    {"$set": {"password": req.body.newpassword}}, (err, db) => {
        if(err) return res.send(err + "err")
        if (db === null) return res.redirect('/settings?error=Please type your password again')
        res.redirect('/settings?success=Password updated');
    })
}
