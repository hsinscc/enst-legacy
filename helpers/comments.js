var db     = require('../models');
var image  = require('./image');
var upload = image.upload;

exports.newComment = function(req, res) {
  db.Photo.findById(req.params.id)
  .then(function(photo) {
    res.render('comments/new');
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('back');
  })
}

exports.createComment = function(req, res) {
  db.Photo.findById(req.params.id)
  .then(function(photo) {
    db.Comment.create(req.body.comment)
    .then(function(comment) {
      comment.author.id = req.user._id;
      comment.author.username = req.user.username;
      comment.save();
      photo.comments.push(comment);
      photo.save();
      req.flash('success', 'You\'ve added a comment!');
      res.redirect('/photos/' + photo._id);
    })
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('back');
  });
}

exports.editComment = function(req, res) {
  db.Photo.findById(req.params.id)
  .then(function(photo) {
    db.Comment.findById(req.params.cid)
    .then(function(comment) {
      res.render('comments/edit', { photo: photo, comment: comment });
    })
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('back');
  })
}

exports.updateComment = function(req, res) {
  db.Comment.findByIdAndUpdate(req.params.cid, req.body.comment)
  .then(function() {
    req.flash('success', 'You\'ve updated a comment!');
    res.redirect('/photos/' + req.params.id);
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('back');
  });
}

exports.deleteComment = function(req, res) {
  db.Comment.findByIdAndRemove(req.params.cid)
  .then(function() {
    req.flash('success', 'You\'ve deleted a comment!');
    res.redirect('/photos/' + req.params.id);
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('back');
  });
}

module.exports = exports;