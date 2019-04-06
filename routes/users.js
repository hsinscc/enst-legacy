var express    = require('express');
var router     = express.Router({ mergeParams: true });
var middleware = require('../middleware');
var helpers    = require('../helpers/users');
var image      = require('../helpers/image');
var upload     = image.upload;

router.route('/')
  .get(helpers.getUsers)

router.route('/:username')
  .get(helpers.getUser)
  .put(middleware.checkUserOwnership, upload.single('image'), helpers.updateUser)
  .delete(middleware.checkUserOwnership, helpers.deleteUser)

router.route('/:username/edit')
  .get(middleware.checkUserOwnership, helpers.editUser)

module.exports = router;