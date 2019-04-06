var express    = require('express');
var router     = express.Router({ mergeParams: true });
var middleware = require('../middleware');
var helpers    = require('../helpers/photos');
var image      = require('../helpers/image');
var upload     = image.upload;

router.route('/')
  .get(helpers.getPhotos)
  .post(middleware.isLoggedIn, upload.single('image'), helpers.createPhoto)

router.route('/new')
  .get(middleware.isLoggedIn, helpers.newPhoto)

router.route('/:id')
  .get(helpers.getPhoto)
  .put(middleware.checkPhotoOwnership, helpers.updatePhoto)
  .delete(middleware.checkPhotoOwnership, helpers.deletePhoto)

router.route('/:id/edit')
  .get(middleware.checkPhotoOwnership, helpers.editPhoto)

module.exports = router;