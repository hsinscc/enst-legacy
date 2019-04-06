var Photo   = require('../models/photo');
var Comment = require('../models/comment');

var middlewareObj = {};

middlewareObj.checkUserOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.username === req.params.username || req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'You don\'t have permission!');
      res.redirect('/users/' + req.params.username);
    }
  } else {
    req.flash('error', 'You need to be logged in!');
    res.redirect('/users/' + req.params.username);
  }
}

middlewareObj.checkPhotoOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Photo.findById(req.params.id, function(err, photo) {
      if (err || !photo) {
        console.log(err);
        req.flash('error', err.message);
        res.redirect('/photos');
      } else if (photo.author.id.equals(req.user._id) || req.user.isAdmin) {
        // req.photo = photo;
        next();
      } else {
        req.flash('error', 'You don\'t have permission!');
        res.redirect('/photos/' + req.params.id);
      }
    });
  } else {
    req.flash('error', 'You need to be logged in!');
    res.redirect('/photos/' + req.params.id);
  }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.cid, function(err, comment) {
      if (err) {
        console.log(err);
        req.flash('error', err.message);
        res.redirect('/photos/' + req.params.id);
      } else if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
        next();
      } else {
        req.flash('error', 'You don\'t have permission!');
        res.redirect('/photos/' + req.params.id);
      }
    });
  } else {
    req.flash('error', 'You need to be logged in!');
    res.redirect('/photos/' + req.params.id);
  }
}

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error', 'You need to be logged in!');
    res.redirect('/login');
  }
}

module.exports = middlewareObj;