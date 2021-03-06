var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/home', function(req, res, next) {
  res.render('home');
});


// Basic Login Functionality===============================================================================================================
const User = require('./../models/user');
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion } = require('mongodb');
const Console = require("console");
const {contentDisposition} = require("express/lib/utils");
const uri = "mongodb+srv://root:root@shopnshop.0g85k.mongodb.net/?retryWrites=true&w=majority";
const requiredLogin = (req,res,next) => {
  if(!req.session.user_id){
    return res.redirect('/login');
  }else {
    next();
  }
}
router.get('/login', function(req, res, next) {
  res.render('login');
});
router.post('/login', async function(req, res, next) {
  const username = req.body.uname;
  const pass = req.body.pass;
  await MongoClient.connect(uri,async function (err, db) {
    if (err) throw err;
    const dbo = db.db('ShopNShop');
    const User = dbo.collection("User");
    const found = await User.findOne({ username });
    if(found){
      const validPassword = await bcrypt.compare(pass,found.password);
      if(validPassword){
        req.session.user_id = found._id;
        res.redirect('/profile');
      }else{
        res.redirect('/login');
      }
    }else{
      res.redirect('/login');
    }
   });
});
router.get('/signup', function(req, res, next) {
  res.render('signup');
});
router.post('/signup', async function(req, res, next) {
  const password = req.body.pass;
  const username = req.body.uname;
  const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username:username,
    password:hash
  });
  MongoClient.connect(uri,function (err,db){
    if(err) throw err;
    const dbo = db.db("ShopNShop");
    dbo.collection("User").insertOne(user, function (err, res){
      if(err) throw err;
      console.log("Inserted Record");
      db.close();
    });
  });
  res.redirect('/login');
});
router.post('/logout', function (req,res, next){
  // req.session.user_id = null;
  req.session.destroy();
  res.redirect('/login');
})
router.get('/profile',requiredLogin,function (req,res,next){
  // if(!req.session.user_id){
  //   return res.redirect('/login');
  // }else {
    res.render('profile');
  // }
});
// Basic Login Functionality===============================================================================================================
// Authentication via google===============================================================================================================




module.exports = router;
