var db         = require('../models');
var image      = require('./image');
var upload     = image.upload;
var cloudinary = require('cloudinary');

exports.getUsers = function(req, res) {
  db.User.find()
  .then(function(users) {
    res.render('users/index', { users: users });
  })
  .catch(function(err) {
    req.flash('error', err.message);
    req.redirect('back');
  })
}

// how to deliver two objects?
exports.getUser = function(req, res) {
  db.User.findOne({ username: req.params.username })
  .then(function(user) {
    db.Photo.find().where('author.username').equals(user.username).sort({ createdAt: -1 }).populate('comments').exec()
    .then(function(photos) {
      res.render('users/show', { user: user, photos: photos });
    })
    .catch(function(err) {
      req.flash('error', err.message);
      res.redirect('/users');
    });
  })
  .catch(function(err) {
    req.flash('error', err.message);
    res.redirect('back');
  });
}

exports.editUser = function(req, res) {
  db.User.findOne({ username: req.params.username })
  .then(function(user) {
    res.render('users/edit', { user: user });
  })
  .catch(function(err) {
    req.flash('error', err.message);
    res.redirect('back');
  });
}

exports.updateUser = function(req, res) {
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      req.body.user.avatar = result.secure_url;
      db.User.findOneAndUpdate({ username: req.params.username }, req.body.user, function(err, user) {
        if (err) {
          console.log(err);
          req.flash('error', err.message);
          res.redirect('back');
        } else {
          if (req.params.username === req.body.user.username) {
            req.flash('success', 'You\'ve updated your profile!');
          } else {
            req.flash('success', 'You\'ve updated your profile! Please login again!');
            db.Photo.find().where('author.username').equals(req.params.username).exec(function(err, photos) {
              photos.forEach(function(photo) {
                photo.author.username = req.body.user.username;
                photo.save();
              });
            });
            db.Comment.find().where('author.username').equals(req.params.username).exec(function(err, comments) {
              comments.forEach(function(comment) {
                comment.author.username = req.body.user.username;
                comment.save();
              });
            });
          }
          res.redirect('/users/' + req.body.user.username);
        }
      });
    }); 
  } else {
    db.User.findOneAndUpdate({ username: req.params.username }, req.body.user, function(err, user) {
      if (err) {
        console.log(err);
        req.flash('error', err.message);
        res.redirect('back');
      } else {
        if (req.params.username === req.body.user.username) {
          req.flash('success', 'You\'ve updated your profile!');
        } else {
          req.flash('success', 'You\'ve updated your profile! Please login again!');
          db.Photo.find().where('author.username').equals(req.params.username).exec(function(err, photos) {
            photos.forEach(function(photo) {
              photo.author.username = req.body.user.username;
              photo.save();
            });
          });
          db.Comment.find().where('author.username').equals(req.params.username).exec(function(err, comments) {
            comments.forEach(function(comment) {
              comment.author.username = req.body.user.username;
              comment.save();
            });
          });
        }
        res.redirect('/users/' + req.body.user.username);
      }
    });
  }
}

exports.deleteUser = function(req, res) {
  db.User.findOneAndRemove({ username: req.params.username })
  .then(db.Photo.remove().where('author.username').equals(req.params.username).exec())
  .then(db.Comment.remove().where('author.username').equals(req.params.username).exec())
  .then(function() {
    req.flash('success', 'You\'ve deleted your profile and photos!');
    res.redirect('/photos');
  })
  .catch(function(err) {
    req.flash('error', err.message);
    res.redirect('back');
  });
}

module.exports = exports;