const express 				= require('express'),
	  mongoose 			    = require('mongoose'),
	  passport 				= require('passport'),
	  bodyParser 			= require('body-parser'),
	  User 					= require('./models/user'),
	  LocalStrategy 		= require('passport-local'),
	  passportLocalMongoose = require('passport-local-mongoose'),
	  path 					= require('path'),
	  crypto 				= require('crypto'),
	  multer 				= require('multer'),
	  GridFsStorage 		= require('multer-gridfs-storage'),
	  Grid 					= require('gridfs-stream'),
	  methodOverride 		= require('method-override');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

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

// Mongo URI
const mongoURI='mongodb://gregg:gregg@ds025239.mlab.com:25239/mongouploads';
mongoose.connect(mongoURI);
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
//  	REGISTER
// ==================


// Show sign up form
app.get('/register', function(req, res) {
	res.render('register');
});

//  Handling User Sign Up
app.post('/register', function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req, res, function(){
           res.redirect('/');
        });
    });
});


// ==================
//  	HOME/LOGIN
// ==================


//  LOGIN ROUTES
//  render login form
app.get('/',  function(req, res) {
	res.render('home');
});

// LOGIN Logic
// Middleware
app.post('/', passport.authenticate('local', {
    successRedirect: '/search',
    failureRedirect: '/'
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
	res.redirect('/');
}









// ==================
//  	SEARCH
// ==================
app.get('/search', isLoggedIn, function(req, res, value) {
		var genre 		= req.query.genre,
		    length 		= req.query.length,
		    available 	= req.query.available,
		    bpm 		= req.query.bpm;
		gfs.files.find(
					{
						$or: [ 
								{ 'metadata.genre': genre }, 
								{ 'metadata.length': length },
								{ 'metadata.available': available },
								{ 'metadata.bpm': bpm }
							 ]
					})
				  .toArray(function(err, files){
					res.render('search', {files: files, genre: genre});
				}) })



// ==================
//  	DISPLAY CMS
// ==================
app.get('/cms', isLoggedIn, function(req, res) {
	gfs.files.find().toArray(function(err, files){
		if(!files || files.length === 0){
			res.render('cms', {files: false});
		} else {
			files.map(file => {
				if(file.contentType === 'audio/mp3') 
					{file.isAudio = true;} else {
						file.isAudio = false;}});
				res.render('cms', {files: files});}
	}); });


// ==================
//  	UPLOAD FILE
// ==================
app.post('/upload', upload.single('file'), isLoggedIn, function(req, res) {
	res.redirect('/cms');
});

app.get('/filemanager', isLoggedIn, function(req, res) {
	res.render("file_manager") 
});




// ==========================
//  	DISPLAY UPDATE PAGE
// ==========================
app.get('/files/:filename/edit', isLoggedIn, function(req, res) {
	gfs.files.findOne({filename: req.params.filename}, function(err, file) {
		if(err) {
			res.redirect('/files');
		} else {
			res.render('edit', {file: file})
		}
	}) })


// ==================
//  	UPDATE 
// ==================

app.put('/files/:filename', isLoggedIn, function(req,res){
	var genre       = req.body.genre,
	 	available   = req.body.available,
		length      = req.body.length,
		bpm         = req.body.bpm,
	    description = req.body.description,
	    id 			= req.body.id,
	    trackname   = req.body.trackname;
	    filename   = req.body.filename;
    gfs.files.update({'filename': req.params.filename}, {'$set': {
			'filename': filename,
	    	'metadata.genre': 		genre, 
	    	'metadata.available':   available, 
	    	'metadata.length':      length,
	    	'metadata.bpm': 		bpm,
	    	'metadata.description': description,
	    	'metadata.id': 			id,
	    	'metadata.trackname':   trackname
    	}})
        res.redirect('/cms');
    })


// ==================
//  	DELETE 
// ==================

app.delete('/files/:id', isLoggedIn, function(req, res){
	gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
		if(err) {
			return res.status(404).json({err: err});
		}
		res.redirect('/cms');
	});
});




// ================================
//  	DATABASE FILES/JSON
// ================================

// Display all file objects
app.get('/files', isLoggedIn, function(req, res){
	gfs.files.find().toArray(function(err, files){
		if(!files || files.length === 0){
			return res.status(404).json({
				err: 'No files exist'
			});
		}
		return res.json(files); }); });

// Display single file object
app.get('/files/:filename', isLoggedIn, function(req, res){
	gfs.files.findOne({filename: req.params.filename}, function(err, file){
		if(!file || file.length === 0){
			return res.status(404).json({
				err: 'No file exists'
			});
		}
		return res.json(file); }); });

// Play single file audio
app.get('/audio/:filename',isLoggedIn, function(req, res){
	gfs.files.findOne({filename: req.params.filename}, function(err, file){
		if(!file || file.length === 0){
			return res.status(404).json({
				err: 'No file exists'
			}); }

		if(file.contentType === 'audio/mp3') {
			var name = file.filename;
			const readstream = gfs.createReadStream(file.filename);
			readstream.pipe(res);
		} else {
			res.status(404).json({
				err: 'Not an audio file'
			}); } }); });






// ================================
//  	SETUP SERVER PORT
// ================================

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});