var express = require('express');
var router = express.Router();

var naymUser = require("../controllers/siteController");
var voterController = require('../controllers/voterController');
var naymGym = require('../controllers/placeController');
var naymLib = require('../controllers/barterController')
var naymStocks = require('../controllers/stockController')
var microNaym = require('../controllers/microController')




router.get('/', naymUser.home);

router.get('/test', naymUser.test);

router.get('/signup', naymUser.signup);

router.post('/signup', naymUser.usernamecheck, naymUser.passwordmatch, naymUser.emailcheck, naymUser.adduser);

router.get('/login', naymUser.loginpage);

router.post('/login', naymUser.login);

router.get('/session', naymUser.session);

router.get('/logout', naymUser.logout);

router.get('/settings', naymUser.loginVerify, naymUser.settings)

router.post('/update', naymUser.loginVerify, naymUser.update)

router.post('/changepassword', naymUser.loginVerify, naymUser.passwordmatch, naymUser.changePassword)

router.get('/create', voterController.createPoll);

router.post('/create', voterController.validatePoll, voterController.createdPoll);

router.get('/poll/:slug', voterController.showPoll);

router.post('/poll/:slug', voterController.voted);

router.get('/poll/:slug/results', voterController.pollResults);

router.get('/polls', voterController.userPolls);

router.get('/polls/:user', voterController.otherPolls);

router.post('/deletePoll/:slug', voterController.deletePoll)

router.get('/deletePoll', voterController.userPolls);

router.get('/gyms', naymGym.myGyms, naymGym.searchPage);

router.post('/gyms', naymGym.searchBar, naymGym.myGyms, naymGym.renderResults);

router.post('/member', naymGym.myGyms, naymGym.addMember)

router.post('/removemember', naymGym.myGyms, naymGym.removeMember)

router.get('/mygyms', naymGym.myGyms, naymGym.searchPage)

router.get('/books',  naymLib.inboxOutbox, naymLib.allBooks)

router.get('/mybooks', naymLib.inboxOutbox, naymLib.myBooks)

router.get('/addbook', naymLib.addBookStart);


router.post('/addbook', naymLib.addBook)

router.get('/searchbooks', naymLib.inboxOutbox, naymLib.displayPrevSearch)

router.post('/searchbooks', naymLib.inboxOutbox, naymLib.searchBooks)

router.post('/requestBook', naymLib.requestBook)

router.post('/removeRequest', naymLib.removeRequest)

router.get('/requestInbox', naymLib.inboxOutbox, naymLib.tradeRequests)

router.get('/requestOutbox', naymLib.inboxOutbox, naymLib.requestOutbox)


router.post('/deleteBook', naymLib.deleteBook)

router.post('/acceptTrade', naymLib.inboxOutbox, naymLib.acceptTrade)

router.get('/stocks', naymStocks.mainPage);

router.get('/microServices', microNaym.index)

router.get('/time/:time', microNaym.timeStamp);



router.get(/\/short\/.+/, microNaym.urlShortener);

router.get('/whoami', microNaym.headerParser);

router.get('/u/:short', microNaym.urlRedirect);

router.get('/search/:terms', microNaym.search);

router.get('/recent', microNaym.recent);

router.post('/file', microNaym.upload, microNaym.filedata);


module.exports = router;