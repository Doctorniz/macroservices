const mongoose = require('mongoose');
const users = require('../models/Users');

const basedir = '../'


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
            res.render("signup", {
                error: "username exists",
                
                
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
        res.render("signup", {
                error: "passwords do not match",
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
            res.render("signup", {
                error: "email exists",
                basedir
            });
        }
    })
}

exports.adduser = async (req, res) => {
    const object = {username: req.body.username, password: req.body.password, email: req.body.email}
    var data = await new users(object);
    await data.save(err=> {
        if(err) return res.send("error saving to database");
    });
    req.session.user = req.body.username;
    res.json(object);
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
            res.redirect(req.session.back ? req.session.back : '/')
        }
    })
    
}

exports.logout = (req, res) => {
    req.session.user = null;
    res.redirect('back');
}

exports.session = async (req, res) => {
    res.send(req.session);
}

exports.settings = (req, res) => {
    var error = req.query.error;
    req.session.back = '/settings'
    users.findOne({username: req.session.user}, (err, user) => {
        if(err) return res.send(err+"error")
        if(user=== null) {
            req.session = {}
            return res.redirect('/settings')
        } else {
            return res.render('settings', {
                UserData: user,
                loggedIn: req.session.user,
                error
            });
        }
    })
    
}

exports.update = (req, res) => {
    users.findOneAndUpdate({username: req.body.username}, {
        "$set": {"city": req.body.city, "country": req.body.country}
    }, (err, db) => {
        if(err) return res.send("error " + err)
        res.redirect('/settings');
    })
}

exports.changePassword = (req, res) => {
    users.findOneAndUpdate({username: req.body.username, password: req.body.password}, 
    {"$set": {"password": req.body.newpassword}}, (err, db) => {
        if(err) return res.send(err + "err")
        if (db === null) return res.redirect('/settings?error=please type your password again')
        res.redirect('/settings');
    })
}
