const mongoose = require('mongoose');
const request = require('request');



const users = require('../models/Users');
const gyms = require('../models/Gyms');


exports.searchPage = (req,res)=>{
    var data = req.session.search || {}
    
    data["loggedIn"] = req.session.user;
    res.render('search', data);
};

exports.searchBar = async (req, res, next) => {
    var searchTerm = req.body.barsearch;
    
    var Googlekey ='AIzaSyD7jrJ1GBKQh97oiEJ2LI5R_W6ctVsfQbg'
    var uri = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key='+Googlekey+'&type=gym&query='+searchTerm;
    
    var googlePhoto = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&key='+Googlekey+'&photoreference='
    gyms.find()
    
    await request({uri}, async (err, apiData) => {
            if(err) return res.send("error")
            var gymresults = JSON.parse(apiData.body)
            if (gymresults.results.length<1) return res.render('search', {
                error: "No results",
                searchTerm
            })
            req.session["search"] = await { results: gymresults, searchTerm, googlePhoto }
            
            next()
            
        }
    )
}

exports.renderResults = async (req,res,next) => {
    var data = req.session.search;
    var b = [];
    var test;
    data["loggedIn"] = req.session.user ? req.session.user : null;
    var results = data.results.results;
    
    const dbSearch = async (gymGoogleID) => {
        var isGyminDB = await gyms.findOne({gymGoogleID}, (err, db) => {
             if(err) return res.send(err);
             return db;
        })
        return isGyminDB ? isGyminDB.users : [];
    }
    let testFunc = () => 6;
    for(let i = 0; i < results.length; i++ ) {
       //b.push(testFunc());
       //await b.push(await dbSearch(results[i].id, results[i]))
        data.results.results[i].users = await dbSearch(results[i].id)
        if (i + 1 === results.length) {
            req.session.search = data;
            return res.render('search', data)
            
        }
    }
 
    //res.send(newresults[1])
     //res.render('search', data)
}


exports.addMember = (req,res)=>{
    var gymData = JSON.parse(req.body.id)
    if(!req.session.user) return res.redirect('/login');
    var object = { 
        gymGoogleID: gymData.id,
        gymName : gymData.name,
        users: [req.session.user]
    }
    var gymList = req.session.search.results.results
    gyms.findOne({gymGoogleID: gymData.id}).exec(async (err, data) => {
        if(err) return res.send("error getting gym data")
        var gymCookie  = gymList.find((gym) => {
                return gym.id === gymData.id
            })
        if(data === null) {
            var dataSave = await new gyms(object);
            await dataSave.save(err => {
                if(err) return res.send("error saving to database")
            })
            gymCookie.users = [req.session.user];
            return res.redirect('/gyms');
        } else {
            data.users.push(req.session.user);
            data.save((err) => {
                if (err) return res.send("error saving to database")
            });
            
            gymCookie.users.push(req.session.user)
            return res.redirect('/gyms');

        }
        
    })
};

exports.removeMember = (req,res)=>{
    var gymData = JSON.parse(req.body.id)
    if(!req.session.user) return res.redirect('/login');
    var object = { 
        gymGoogleID: gymData.id,
        gymName : gymData.name,
        users: [req.session.user]
    }
    var gymList = req.session.search.results.results
    gyms.findOne({gymGoogleID: gymData.id}).exec(async (err, data) => {
        if(err) return res.send("error getting gym data")
        var gymCookie  = gymList.find((gym) => {
                return gym.id === gymData.id
            })
        if(data === null) {
            return res.redirect('/gyms');
        } else {
            var index = data.users.indexOf(req.session.user)
            data.users.splice(index, 1);
            data.save((err) => {
                if (err) return res.send("error saving to database")
            });
            
            gymCookie.users.splice(index, 1);
            return res.redirect('/gyms');

        }
        
    })
};

