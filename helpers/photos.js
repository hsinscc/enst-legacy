var db         = require('../models');
var image      = require('./image');
var upload     = image.upload;
var cloudinary = require('cloudinary');

exports.getPhotos = function(req, res) {
  db.Photo.find().sort({ createdAt: -1 }).populate('comments').exec()
  .then(function(photos) {
    res.render('photos/index', { photos: photos });
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('back');
  });
}

exports.getPhoto = function(req, res) {
  db.Photo.findById(req.params.id).populate('comments').exec()
  .then(function(photo) {
    res.render('photos/show', { photo: photo });
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('/photos');
  });
}

exports.newPhoto = function(req, res) {
  res.render('photos/new');
}

exports.createPhoto = function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    req.body.photo.image = result.secure_url;
    req.body.photo.author = {
      id: req.user._id,
      username: req.user.username
    }
    db.Photo.create(req.body.photo)
    .then(function(photo) {
      res.redirect('/photos/' + photo.id);
    })
    .catch(function(err) {
      req.flash('error', err.message);
      return res.redirect('back');
    });
  });
}

exports.editPhoto = function(req, res) {
  db.Photo.findById(req.params.id)
  .then(function(photo) {
    res.render('photos/edit', { photo: photo });
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('back');
  });
}

exports.updatePhoto = function(req, res) {
  db.Photo.findByIdAndUpdate(req.params.id, req.body.photo)
  .then(function() {
    req.flash('success', 'You\'ve updated a photo!');
    res.redirect('/photos/' + req.params.id);
  })
  .catch(function(err) {
    req.flash('error', err.message);
    res.redirect('back');
  });
}

exports.deletePhoto = function(req, res) {
  db.Photo.findByIdAndRemove(req.params.id)
  .then(function() {
    req.flash('success', 'You\'ve deleted a photo!');
    res.redirect('/photos');
  })
  .catch(function(err) {
    req.flash('error', err.message);
    res.redirect('back');
  })
}

module.exports = exports;