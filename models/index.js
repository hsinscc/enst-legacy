var mongoose = require('mongoose');

mongoose.set('debug', true);
var url = process.env.DATABASEURL || 'mongodb://localhost:27017/demo';
mongoose.connect(url, { useNewUrlParser: true });
mongoose.Promise = Promise;

module.exports.User    = require('./user');
module.exports.Photo   = require('./photo');
module.exports.Comment = require('./comment');