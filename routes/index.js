var express    = require('express');
var router     = express.Router({ mergeParams: true });
var helpers    = require('../helpers');
var image      = require('../helpers/image');
var upload     = image.upload;
var passport   = require('passport');

router.route('/')
  .get(helpers.getHome)

router.route('/register')
  .get(helpers.register)
  .post(upload.single('image'), helpers.createUser)

router.route('/login')
  .get(helpers.login)
  .post(passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/photos',
    failureFlash: true,
    successFlash: 'Successfully logged in!'
  }), function(req, res) {})

router.route('/logout')
  .get(helpers.logout)

router.route('/forgot')
  .get(helpers.forgot)
  .post(helpers.postForgot)

router.route('/reset/:token')
  .get(helpers.getToken)
  .post(helpers.resetPassword)

router.post('/reset/:token', );

module.exports = router;