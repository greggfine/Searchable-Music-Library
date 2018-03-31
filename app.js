const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();

// var urlencodedParser = bodyParser.urlencoded({ extended: true });
// var jsonParser = bodyParser.json()

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

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

// @route GET/
// @desc Loads form

app.get('/', function(req, res) {
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

// @route POST/upload
// @desc Uploads file to DB
app.post('/upload', upload.single('file'), function(req, res) {
	// res.json({file: req.file});
	res.redirect('/');
});

// @route GET /files
// @desc Display all files in JSON
app.get('/files', function(req, res){
	gfs.files.find().toArray(function(err, files){
		// Check if files
		if(!files || files.length === 0){
			return res.status(404).json({
				err: 'No files exist'
			});
		}
		// Files exist
		return res.json(files);
	})
})


// @route GET /files/:filename
// @desc Display single file object
app.get('/files/:filename', function(req, res){
	gfs.files.findOne({filename: req.params.filename}, function(err, file){
		// Check if files
		if(!file || file.length === 0){
			return res.status(404).json({
				err: 'No file exists'
			});
		}
		// File exists
		return res.json(file);


	});
});

// @route GET /image/:filename
// @desc Display Image
app.get('/audio/:filename', function(req, res){
	gfs.files.findOne({filename: req.params.filename}, function(err, file){
		// Check if files
		if(!file || file.length === 0){
			return res.status(404).json({
				err: 'No file exists'
			});
		}
		// Check if audio
		if(file.contentType === 'audio/mp3') {
			// Read output to browser
			const readstream = gfs.createReadStream(file.filename);
			readstream.pipe(res);
		} else {
			res.status(404).json({
				err: 'Not an audio file'
			});
		}
	});
});


//SEARCH route
app.get('/search', function(req, res) {
	res.render('search')
})

//DISPLAY SEARCH RESULT route
app.get('/result', function(req, res) {
		var genre = req.query.genre;
		var length = req.query.length;
		gfs.files.find(
					{
						$or: [ {"metadata.genre": genre }, { "metadata.length": length } ]

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

//  @route DELETE /files/:id
//  @desc Delete file
app.delete('/files/:id', function(req, res){
	gfs.remove({_id: req.params.id, root: 'uploads'}, (err, gridStore) => {
		if(err) {
			return res.status(404).json({err: err});
		}
		res.redirect('/');
	});
});


app.listen(5000, function() {
	console.log('The server is running');
})



// var colors = {
// 	one: 'blue',
// 	two: 'red'
// };






