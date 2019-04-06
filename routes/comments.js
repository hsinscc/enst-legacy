var express    = require('express');
var router     = express.Router({ mergeParams: true });
var middleware = require('../middleware');
var helpers    = require('../helpers/comments');

router.route('/')
  .post(middleware.isLoggedIn, helpers.createComment)

router.route('/new')
  .get(middleware.isLoggedIn, helpers.newComment)

router.route('/:cid/edit')
  .get(middleware.checkCommentOwnership, helpers.editComment)

router.route('/:cid')
  .put(middleware.checkCommentOwnership, helpers.updateComment)
  .delete(middleware.checkCommentOwnership, helpers.deleteComment)

module.exports = router;