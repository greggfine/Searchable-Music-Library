const express = require('express'),
      mongoose = require('mongoose'),
      multer = require('multer'),
      Grid = require('gridfs-stream'),
      GridFsStorage = require('multer-gridfs-storage'),
      path = require('path'),
      crypto = require('crypto'),
      router  = express.Router();

// Mongo URI
const mongoURI = 'mongodb://gregg:gregg@ds025239.mlab.com:25239/mongouploads';
mongoose.connect(mongoURI);
// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once('open', function () {
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
//  	DISPLAY CMS
// ==================
router.get('/', function (req, res) {
    gfs.files.find().toArray(function (err, files) {
        if (!files || files.length === 0) {
            res.render('cms', { files: false });
        } else {
            files.map(file => {
                if (file.contentType === 'audio/mp3') { file.isAudio = true; } else {
                    file.isAudio = false;
                }
            });
            res.render('cms', { files: files });
        }
    });
});

router.get('/filemanager', (req, res) => {
    res.render("file_manager")
});


// ==================
//  	UPLOAD FILE
// ==================
router.post('/', upload.single('file'), (req, res) => {
	res.redirect('/');
});



module.exports = router;