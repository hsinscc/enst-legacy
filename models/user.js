var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: String,
  email: { type: String, unique: true, required: true },
  saying: { type: String, default: 'I love Enstagram' },
  avatar: { type: String, default: 'https://image.flaticon.com/icons/svg/149/149071.svg' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isAdmin: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);