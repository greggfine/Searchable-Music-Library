const express = require('express');
const fs = require('fs');
const http = require('http');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const User = require('./models/user');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
// var WaveSurfer = require('wavesurfer.js');

// var buttons = {
// 	play: document.getElementById("btn-play"),
// 	pause: document.getElementById("btn-pause"),
// 	stop: document.getElementById("btn-stop")
// };

// var Spectrum = WaveSurfer.create({
//     container: '#audio-spectrum',
//     progressColor: '#03a9f4',
// });

// buttons.play.addEventListener('click', function(){
// 	Spectrum.play();
// 	buttons.stop.disabled = false;
// 	buttons.pause.disabled = false;
// 	buttons.play.disabled = true;
// }, false);


// buttons.pause.addEventListener('click', function(){
// 	Spectrum.pause();
// 	buttons.pause.disabled = true;
// 	buttons.play.disabled = false;
// }, false);

// buttons.stop.addEventListener('click', function(){
// 	Spectrum.stop();
// 	buttons.pause.disabled = true;
// 	buttons.play.disabled = false;
// 	buttons.stop.disabled = true;
// }, false);

// Spectrum.on('ready', function() {
// 	buttons.play.disabled = false;
// });

// window.addEventListener('resize', function(){
// 	var currentProgress = Spectrum.getCurrentTime() / Spectrum.getDuration();

// 	Spectrum.empty();
// 	Spectrum.drawBuffer();

// 	Spectrum.seekTo(currentProgress);

// 	buttons.pause.disabled = true;
// 	buttons.play.disabled = false;
// 	buttons.stop.disabled = false;
// }, false);

// Spectrum.load('Advair_gff2a.mp3');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

// // app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(require('express-session')({
	secret: "Rusty is the best and cutest dog in the world",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://gregg:gregg@ds025239.mlab.com:25239/mongouploads');
// Mongo URI
const mongoURI='mongodb://gregg:gregg@ds025239.mlab.com:25239/mongouploads';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', function() {
	// Init stream
	gfs = Grid(conn.db, mongoose.mongo);
	gfs.collection('uploads');
})

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);

        const fileInfo = {
          filename: file.originalname,
          bucketName: 'uploads',
          metadata: req.body
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// ==================
//  	ROUTES
// ==================

// @route GET/
// @desc Loads form

app.get('/tracks', isLoggedIn, function(req, res) {
	gfs.files.find().toArray(function(err, files){
		// Check if files
		if(!files || files.length === 0){
			res.render('index', {files: false});
			} else {
				files.map(file => {
					if(file.contentType === 'audio/mp3') 
					{
						file.isAudio = true;
					} else {
						file.isAudio = false;
					}
				});
				res.render('index', {files: files});
		}
	})
});

// Show sign up form
app.get('/register', function(req, res) {
	res.render('register');
});

//  Handling User Sign Up
app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/");
        });
    });
});

//  LOGIN ROUTES
//  render login form
app.get('/', function(req, res) {
	res.render('home');
});

app.get('/login', function(req, res) {
	res.render('login');
});

// LOGIN Logic
// Middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/search",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

// @route POST/upload
// @desc Uploads file to DB
app.post('/upload', upload.single('file'), isLoggedIn, function(req, res) {
	res.redirect('/tracks');
});

// @route GET /files
// @desc Display all files in JSON
app.get('/files', isLoggedIn, function(req, res){
	gfs.files.find().toArray(function(err, files){
		if(!files || files.length === 0){
			return res.status(404).json({
				err: 'No files exist'
			});
		}
		return res.json(files);
	})
})

// @route GET /files/:filename
// @desc Display single file object
app.get('/files/:filename', isLoggedIn, function(req, res){
	gfs.files.findOne({filename: req.params.filename}, function(err, file){
		if(!file || file.length === 0){
			return res.status(404).json({
				err: 'No file exists'
			});
		}
		return res.json(file);
	});
});

// @route GET /audio/:filename
// @desc Display Audio
// app.get('/audio/:filename',isLoggedIn, function(req, res){
// 	gfs.files.findOne({filename: req.params.filename}, function(err, file){

// 		if(!file || file.length === 0){
// 			return res.status(404).json({
// 				err: 'No file exists'
// 			});
// 		}

// 		if(file.contentType === 'audio/mp3') {
// 			var name = file.filename;

// 			const readstream = gfs.createReadStream(file.filename);
// 			readstream.pipe(res);
// 		} else {
// 			res.status(404).json({
// 				err: 'Not an audio file'
// 			});
// 		}
// 	});
// });

//SEARCH route
app.get('/search', isLoggedIn, function(req, res) {
	res.render('search')
});

//DISPLAY SEARCH RESULT route
app.get('/result', isLoggedIn, function(req, res) {
		var genre = req.query.genre;
		var length = req.query.length;
		var available = req.query.available;
		var bpm = req.query.bpm;
		gfs.files.find(
					{
						 // "metadata.genre": genre ,  "metadata.length": length ,
							// 	 "metadata.available": available  
								$or: [ {"metadata.genre": genre }, { "metadata.length": length },
										{ "metadata.available": available },
										{ "metadata.bpm": bpm } ]
					}
					)
		.toArray(function(err, files){

		if(!files || files.length === 0){
			return res.status(404).json({
				err: 'No file exists'
			});
		} else {
			res.render('results', {files: files});
			}
		})
})

// EDIT route
app.get('/files/:filename/edit', isLoggedIn, function(req, res) {
	gfs.files.findOne({filename: req.params.filename}, function(err, file) {
		if(err) {
			res.redirect('/files');
		} else {
			res.render('edit', {file: file})
		}
	})
})

//UPDATE ROUTE
app.put("/files/:filename", isLoggedIn, function(req,res){
	var genre = req.body.genre;
	var available = req.body.available;
	var length = req.body.length;
	var bpm = req.body.bpm;
    gfs.files.update({'filename': req.params.filename}, {'$set': {"metadata.genre": genre, 
    	"metadata.available": available, 
    	"metadata.length": length,
    	"metadata.bpm": bpm
    	 }})
        res.redirect('/tracks');
    })

//  @route DELETE /files/:id
//  @desc Delete file
app.delete('/files/:id', isLoggedIn, function(req, res){
	gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
		if(err) {
			return res.status(404).json({err: err});
		}
		res.redirect('/tracks');
	});
});

app.listen(5000, function() {
	console.log('The server is running');
});