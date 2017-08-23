const moment = require('moment');
const mongoose = require('mongoose');
var request = require('request');
const shorturl = require('../models/Short');
const searchterm = require('../models/Search');
var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });


exports.index = (req,res) => {
    res.render('micro', {
        loggedIn: req.session.user
    })
}

exports.timeStamp = async (req, res) => {
 const timestamp = req.params.time;
 if(!(isNaN(timestamp))) {
   const unix = Number(timestamp)
   const date = await moment(unix, "x");
   const natural = date.format("MMMM D YYYY");
    res.json({
      unix,
      natural});
 } else if(moment(timestamp, "MMMM D YYYY").isValid()) {
    const natural = timestamp;
    const date = await moment(natural, "MMMM D YYYY");
    const unix = date.format("x");
    res.json({
      unix,
      natural});
 } else {
   res.json(null)
 }
}


exports.headerParser =  (req, res) => {
   var host = req.headers["x-forwarded-for"],
       lang = req.headers["accept-language"].split(';')[0].split(',')[0],
       userClient = req.headers["user-agent"].split('(')[1].split(')')[0],
       output = {
           "Address": host,
           "Language": lang,
           "Operating System": userClient
       }

    res.json(output);
}

exports.urlShortener = async (req, res) => {
    var startingpath = 'https://naymservices.herokuapp.com/u/';
    var original  =  req.path.substring(7);
    var expression = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    var regex = new RegExp(expression);
    if(regex.test(original)) {
        var short = Math.floor(Math.random()*100000).toString();

        var obj = {
            original, shortCode: short, shortURL: startingpath+short
        }
        var data = await new shorturl({
            original, short
        });
        await data.save(err => {
            if(err) {
                console.log("error");
                return res.send("Error saving to database");
            }
        });
        res.json(obj);
    } else {
        res.send("Error, please supply valid URL including http")
    }

}


exports.urlRedirect = (req, res) => {
    var short = req.params.short;
    shorturl.findOne({short}, (err, data) => {
        if(err) return res.send("error finding data");
        if(data.original) {
            res.redirect(data.original)
        } else {
            res.json(data);
        }
    })
}




exports.search = async (req, res, next) => {
  const terms = req.params.terms;
  const offset = req.query.offset || 10;
  var googleSearch = "https://www.googleapis.com/customsearch/v1?key="+process.env.GOOGLEAPI+"&cx="+process.env.GOOGLECX+"&q="+terms+"&searchType=image&num="+offset;
  var data = [];
  await request({
    uri: googleSearch }, async (err, dat) => {
      if(err) return res.send("error searching: "+ err);
      const searchitems = JSON.parse(dat.body).items;
      for(item in searchitems) {
          data.push({
              title: searchitems[item].title,
              link: searchitems[item].link,
              context: searchitems[item].image.contextLink
              
          });
      }
    var searchsave = await new searchterm({terms});
    await searchsave.save(err => {
            if(err) {
                console.log("error");
                return res.send("Error saving to database");
            }
        });
      res.json(data);
  });
}

exports.recent = (req, res) => {
    searchterm.find({}).sort({_id : -1}).limit(10).exec((err, data) => {
      if(err) return res.send("Error at "+err);
      var obj = [];
      for(i in data) {
          obj.push({
              terms: data[i].terms,
              time: moment(data[i].time).format('MMMM Do YYYY, h:mm:ss a')
          })
      }
      res.json(obj);
    })
}

exports.upload = upload.single('filed');

exports.filedata = (req, res) => {
    var file = req.file;
    var obj = {
        filename: file.originalname,
        encoding: file.encoding,
        mimeType: file.mimetype,
        sizeInBytes: file.size
    }
    
    res.json(obj);

}