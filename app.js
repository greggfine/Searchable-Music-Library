const express 				= require('express'),
	  app					= express(),
	//   mongoose 			    = require('mongoose'),
	//   passport 				= require('passport'),
	  User 					= require('./models/user'),
	//   LocalStrategy 		= require('passport-local'),
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

app.get('/', (req, res) => {
	res.redirect('/search');
});

app.use("/register", register);

// app.use(isLoggedIn);


app.use("/files", files);
app.use("/search", search);
app.use("/cms", cms);

app.get('/filemanager', (req, res) => {
	res.render("file_manager")
});

var port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Our app is running on http://localhost:${port}`));