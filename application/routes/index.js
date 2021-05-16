var express = require('express');
var router = express.Router();
var isLoggedIn = require('../middleware/routeprotectors').userIsLoggedIn;
const {getRecentPosts, getPostById, getCommentsByPostId} = require('../middleware/postsmiddleware');
var db = require('../config/database');

/* GET home page. */
router.get('/', getRecentPosts, function(req, res, next) {
  res.render('index', {title: 'InstaSham'});
});

router.get('/login', function(req, res, next){
  res.render('login', {title: 'Login'});
});

router.get('/registration', function(req, res, next){
  res.render('registration', {title: 'Registration'});
});

router.use('/postimage', isLoggedIn);
router.get('/postimage', function(req, res, next){
  res.render('postimage', {title: 'Post an Image'});
});

// /post/id
router.get('/post/:id(\\d+)', getPostById, getCommentsByPostId,function(req, res, next){
  res.render('viewimagepost', {title: `Post ${req.params.id}`});
});

module.exports = router;
