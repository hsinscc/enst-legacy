var methodOverride = require('method-override'),
    flash          = require('connect-flash'),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    express        = require('express'),
    app            = express();

var passport       = require('passport'),
    passportLocal  = require('passport-local');

// requiring routes
var indexRoutes    = require('./routes/index'),
    userRoutes     = require('./routes/users'),
    photoRoutes    = require('./routes/photos'),
    commentRoutes  = require('./routes/comments');

var db             = require('./models');

// be sure this line is before passport config
app.use(flash());
app.locals.moment = require('moment');

// passport config
app.use(require('express-session')({
  secret: 'Jay is strongest!',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(db.User.authenticate()));
passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());

// app config
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// routes config
app.use(indexRoutes);
app.use('/users', userRoutes);
app.use('/photos', photoRoutes);
app.use('/photos/:id/comments', commentRoutes);

app.listen(process.env.PORT || 8000, process.env.IP, function() {
  console.log('The Enstagram Server has started!');
  console.log('Listening on port %d in %s mode', this.address().port, app.settings.env);
  console.log('http://localhost:8000');
  console.log('http://localhost:8000/users');
});
