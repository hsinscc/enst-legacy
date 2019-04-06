var db         = require('../models');
var image      = require('./image');
var upload     = image.upload;
var cloudinary = require('cloudinary');
var passport   = require('passport');
var async      = require('async');
var nodemailer = require('nodemailer');
var crypto     = require('crypto');

exports.getHome = function(req, res) {
  res.render('home');
}

exports.register = function(req, res) {
  res.render('register');
}

exports.createUser = function(req, res) {
  var newUser = new db.User({
    username: req.body.username,
    saying: req.body.saying,
    email: req.body.email    
  });
  if (req.body.adminCode === '123') {
    newUser.isAdmin = true;
  }
  // how to remove the duplicate codes?
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      newUser.avatar = result.secure_url;
      db.User.register(newUser, req.body.password, function(err, user) {
        if (err) {
          console.log(err.message);
          req.flash('error', err.message);
          return res.render('register', { error: err.message });
        } else {
          passport.authenticate('local')(req, res, function() {
            req.flash('success', 'Successfully signed up!\nNice to meet you, ' + req.user.username + '!');
            res.redirect('/photos');
          });
        }
      });
    });
  } else {
    db.User.register(newUser, req.body.password, function(err, user) {
      if (err) {
        console.log(err.message);
        req.flash('error', err.message);
        return res.render('register', { error: err.message });
      } else {
        passport.authenticate('local')(req, res, function() {
          req.flash('success', 'Successfully signed up!\nNice to meet you, ' + req.user.username + '!');
          res.redirect('/photos');
        });
      }
    });
  }
}

exports.login = function(req, res) {
  res.render('login');
}

exports.logout = function(req, res) {
  req.logout();
  req.flash('success', 'You\'ve logged out!\nSee ya!');
  res.redirect('/photos');
}

exports.forgot = function(req, res) {
  res.render('forgot');
}

exports.postForgot = function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      db.User.findOne({email: req.body.email}, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'enstagram.inc@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'enstagram.inc@gmail.com',
        subject: 'Enstagram Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
}

exports.getToken = function(req, res) {
  db.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
}

exports.resetPassword = function(req, res) {
  async.waterfall([
    function(done) {
      db.User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash('error', 'Passwords do not match.');
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'enstagram.inc@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'enstagram.inc@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'You\'ve changed your passwords');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/photos');
  });
}

module.exports = exports;