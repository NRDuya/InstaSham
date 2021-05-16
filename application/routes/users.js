var express = require('express');
var router = express.Router();
var db = require('../config/database');
const UserModel = require('../models/Users');
var bcrypt = require('bcrypt');
const { successPrint, errorPrint } = require('../helpers/debug/debugprinters');
const UserError = require('../helpers/error/UserError');

function isEmailValid(email_){
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email_);
}

function isUserValid(username_){
  if( username_.match(/^[0-9a-zA-Z]+$/) &&
      username_.charAt(0).match(/[a-zA-Z]/) &&
      username_.length >= 3){
          return true;
      }
  else{
      return false;
  }
}

function isPasswordSecure (password_){
  if( password_.match(/[A-Z]/g) &&
      password_.match(/[0-9]/g) &&
      password_.match(/[^a-zA-Z\d]/g) &&
      password_.length >= 8){
          return true;
      }
  else{
      return false;
  }
};


// REGISTRATION //
router.post('/register', (req, res, next) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let cpassword = req.body.cpassword;

  if(isEmailValid(email) && isUserValid(username) && isPasswordSecure(password) && password === cpassword){
    UserModel.usernameExists(username)
      .then((usernameDoesExist) =>{
        if(usernameDoesExist){
          throw new UserError(
            "Registration Failed: Username already exists",
            "/registration", 
            200);
        }
        else{
          return UserModel.emailExists(email);
        }
      })
      .then((emailDoesExist) => {
        if(emailDoesExist){
          throw new UserError(
            "Registration Failed: Email already exists",
            "/registration",
            200);
        }
        else{
          return UserModel.create(username, password, email);
        }
      })
      .then((createdUserId) => {
        if(createdUserId < 0){
        throw new UserError(
          "Server Error, user could not be created",
          "/registration",
          500);
        }
        else{
          successPrint("User.js --> User was created!");
          req.flash("success", "Account has been created")
          res.redirect('/login');
        }
      })
      .catch((err) => {
        errorPrint("User could not be made", err);
        if(err instanceof UserError){
          errorPrint(err.getMessage());
          req.flash('error', err.getMessage());
          res.status(err.getStatus());
          res.redirect(err.getRedirectURL());
        }
        else{
          next(err);
        }
      });
    }
    else{
      errorPrint("Invalid inputs");
      req.flash('error', "Invalid Inputs");
      res.redirect("/registration");
    }
})


// LOGIN //
router.post('/login', (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  if(isUserValid(username) && isPasswordSecure(password)){
    UserModel.authenticate(username, password)
      .then((loggedUserId) => {
        if(loggedUserId > 0){
          successPrint(`User ${username} is logged in`);
          req.session.username = username;
          req.session.userId = loggedUserId;
          res.locals.logged = true;
          req.flash("success", "Successfully logged in");
          res.redirect("/");
        } else{
          throw new UserError(
            "Invalid username and/or password",
            "/login", 
            200)
        }
      })
      .catch((err) => {
        errorPrint("user login failed");
        if(err instanceof UserError){
          errorPrint(err.getMessage());
          req.flash('error', err.getMessage());
          res.status(err.getStatus());
          res.redirect("/login");
        } else{
          next(err);
        }
      })
  }
  else{
    errorPrint("Invalid parameters");
    req.flash('error', "Invalid Inputs");
    res.redirect("/login");
  }
})

// LOGOUT //
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if(err){
      errorPrint('Session could not be destroyed.');
      next(err);
    }
    else{
      successPrint('Session was destroyed');
      res.clearCookie('csid');
      res.json({status:"OK", message: "User is logged out"})
    }
  })
})

module.exports = router;
