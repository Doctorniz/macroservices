const mongoose = require('mongoose');
var slugify = require('slugify');

const users = require('../models/Users');
const polls = require('../models/Polls');

const basedir = '../'





exports.createPoll = (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    res.render('createpoll', {
        loggedIn: req.session.user,
        basedir,
        askedQuestion: req.query.question
    });
}

exports.validatePoll = (req, res, next) => {
    if(req.body.title === "" || req.body.title === null) {
        return res.render('createpoll', {
            loggedIn: req.session.user,
            error: "Invalid title",
            basedir
        })
    }
    if(!req.body.option || req.body.option.length < 2) {
        return res.render('createpoll', {
            loggedIn: req.session.user,
            error: "No valid options",
            basedir
        })
    }
    if(req.body.option[0] === "" || req.body.option[1] === "") {
        return res.render('createpoll', {
            loggedIn: req.session.user,
            error: "Some empty fields",
            basedir
        })
    }
    next();
}

exports.createdPoll = async (req, res) => {
    const user = req.session.user;
    const options = req.body.option.map((a, i) => {
        return {
            choice: a,
            results: 0
        }
    })
    const optionsLength = req.body.option.length;
    const question = req.body.title;
    const slug = slugify(question);
 
    const object = {
        question, options, optionsLength, user, slug
    }
    var data = await new polls(object);
    await data.save(err=> {
        if(err) return res.send("error saving to database");
    });
    res.redirect('/poll/'+slug);
}

exports.showPoll = (req, res) => {
    polls.findOne({slug: req.params.slug}, (err, data) => {
        if (err) return res.send("error finding data");
        if (data==null && req.session.user) {
            res.render('createpoll', {
                loggedIn: req.session.user,
                error: "Poll does not exist, please create a new one",
                basedir
            })
        } else if (data==null && !req.session.user) {
            res.render('login', {
                error: "Poll does not exist, please login to create a new one",
                basedir
            })
        } else {
            res.render('poll', {
                loggedIn: req.session.user,
                poll: data,
                url: req.protocol+"://"+req.get('host')+'/poll/'+data.slug,
                error: req.query.error,
                basedir
            });
        }
    })
    
}

exports.voted = async (req, res) => {
    const slug = req.params.slug;
    const id = Number(req.body.choice);
    var path = 'options.'+id+'.results'
    var inc = {}
    inc[path] = 1;
    
    polls.findOneAndUpdate(
        {slug}, {$inc: inc} , {new:true}, (err, data)=>{
        if (err) return res.send("error finding data");
        if (req.body.choice==null || data == null) {
            res.redirect('/poll/'+slug+'/?error=Something went wrong');
        } else {
            res.redirect('/poll/'+slug+'/results');
        }
    })
    
}

exports.pollResults = async (req, res) => {
    const slug = req.params.slug;
    polls.findOne({slug}, (err, data)=>{
        if (err) return res.send("error finding data");
        if (data == null) {
            res.redirect('/poll/'+slug+'/?error=Something went wrong');
        } else {
            res.render('results', {
                data: data,
                basedir,
                loggedIn:req.session.user,
                url: req.protocol+"://"+req.get('host')+'/poll/'+slug
            });
        }
    });
}


exports.userPolls = async (req, res) => {
    const error = req.query.error;
    
    if(!req.session.user) {
        return res.render('userPolls', {
            error
        })
    }
    polls.find({
        user: req.session.user
    }).exec((err, data)=> {
        if(err) return res.send(err);
        res.render('userPolls', {
            data: data,
            loggedIn: req.session.user,
            error,
            same:true,
            userLookUp: req.session.user
    });
    })
    
}

exports.otherPolls = async (req, res) => {
    if(req.session.user === req.params.user) return res.redirect('/polls')
    await users.findOne({username:req.params.user}, (err, db) =>{
        if(err) return res.send(err);
        if(db===null && req.session.user) return res.redirect('/polls?error=User does not exist');
        if(db===null && !req.session.user) return res.render('login', {
            error: "User does not exist"
        })
    })
    polls.find({
        user: req.params.user
    }).exec((err, data)=> {
        if(err) return res.send(err);
        res.render('userPolls', {
            data: data,
            loggedIn: req.session.user,
            same: false,
            userLookUp: req.params.user
    });
    })
}


exports.deletePoll = async (req, res) => {
    var slug = req.params.slug;
    polls.findOneAndRemove({slug, user:req.session.user}, (err, docs) => {
        if(err) return res.redirect("/poll")
        res.redirect('/polls');
    })
}