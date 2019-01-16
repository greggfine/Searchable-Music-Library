const express = require('express'),
      mongoose = require('mongoose'),
      Grid = require('gridfs-stream'),
      router  = express.Router();

// Mongo URI
const mongoURI = 'mongodb://gregg:gregg@ds025239.mlab.com:25239/mongouploads';
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

router.get('/', (req, res) => {
    var genre, genre2, genre3, length, bpm;
    genre = genre2 = genre3 = req.query.genre;
    length = req.query.length,
    bpm = req.query.bpm;

    if (!genre && !bpm && !length) {
        gfs.files.find({'metadata.genre': 'rock'})
                 .toArray((err, files) => {
                    res.render('search', { files, genre, bpm, length });
                 })
    } else if (genre) {
        gfs.files.find({
                $or: [
                        { 'metadata.genre': genre },
                        { 'metadata.genre2': genre2 },
                        { 'metadata.genre3': genre3 }
                    ]
            })
            .toArray((err, files) => {
                res.render('search', { files, genre, bpm, length });
            })
    } else if (length) {
        gfs.files.find({ 'metadata.length': length })
            .toArray((err, files) => {
                res.render('search', { files, genre, bpm, length });
            })
    }
    else {
        gfs.files.find({'metadata.bpm': bpm })
            .toArray((err, files) => {
                res.render('search', { files, genre, bpm, length });
            })
    }
})

module.exports = router;