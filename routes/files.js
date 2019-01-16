const express = require('express'),
      router  = express.Router(),
      mongoose = require('mongoose'),
      multer = require('multer'),
      GridFsStorage = require('multer-gridfs-storage'),
      Grid = require('gridfs-stream');

// Mongo URI
// Left blank for portfolio purposes
const mongoURI = /////////////////////////
mongoose.connect(mongoURI);
// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
var gfs;

conn.once('open', () => {
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
// ==========================
//  	DISPLAY UPDATE PAGE
// ==========================
router.get('/:filename/edit', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, function (err, file) {
        if (err) {
            res.redirect('/files');
        } else {
            res.render('edit', { file: file })
        }
    })
})

// ==================
//  	UPDATE 
// ==================

router.put('/:filename', (req, res) => {
    var genre = req.body.genre,
        genre2 = req.body.genre2,
        genre3 = req.body.genre3,
        available = req.body.available,
        length = req.body.length,
        bpm = req.body.bpm,
        description = req.body.description,
        id = req.body.id,
        trackname = req.body.trackname;
    alt = req.body.alt;
    filename = req.body.filename;
    gfs.files.update({ 'filename': req.params.filename }, {
        '$set': {
            'filename': filename,
            'metadata.genre': genre,
            'metadata.genre2': genre2,
            'metadata.genre3': genre3,
            'metadata.available': available,
            'metadata.length': length,
            'metadata.bpm': bpm,
            'metadata.description': description,
            'metadata.id': id,
            'metadata.trackname': trackname,
            'metadata.alt': alt
        }
    })
    res.redirect('/filemanager');
})

// ==================
//  	DELETE 
// ==================

router.delete('/:id', (req, res) => {
    gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({ err: err });
        }
        res.redirect('/cms');
    });
});

// ================================
//  	DATABASE FILES/JSON
// ================================

// Display all file objects
router.get('/', (req, res) => {
    gfs.files.find().toArray(function (err, files) {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        return res.json(files);
    });
});

// Display single file object
router.get('/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, function (err, file) {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        return res.json(file);
    });
});

// Play single file audio
router.get('/audio/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, function (err, file) {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        if (file.contentType === 'audio/mp3') {
            var name = file.filename;
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an audio file'
            });
        }
    });
});

module.exports = router;