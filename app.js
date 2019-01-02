const express 				= require('express'),
	  app					= express(),
	  mongoose 			    = require('mongoose'),
	  passport 				= require('passport'),
	  User 					= require('./models/user'),
	  LocalStrategy 		= require('passport-local'),
	  methodOverride 		= require('method-override'),
	  helmet				= require('helmet');

const register  = require('./routes/register'),
	  search    = require('./routes/search'),
	  files	    = require('./routes/files');
	  cms	    = require('./routes/cms');


app.use(helmet());

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


// ====================================
//  	PASSPORT AUTH
// ====================================
app.use(require('express-session')({
	secret: 'Rusty is the best and cutest dog in the world',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ==================
//  	HOME/LOGIN
// ==================

//  LOGIN ROUTES
//  render login form
app.get('/', (req, res) => {
	res.render('home');
});

// LOGIN Logic
// Middleware
app.post('/', passport.authenticate('local', {
    successRedirect: '/search', 
    failureRedirect: '/'
}) ,function(req, res){
});

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/');
}

app.use(isLoggedIn);

app.use("/register", register);
app.use("/files", files);
app.use("/search", search);
app.use("/cms", cms);

app.get('/filemanager', (req, res) => {
	res.render("file_manager")
});

var port = process.env.PORT || 8080;
app.listen(port, () => console.log('Our app is running on http://localhost:' + port));