const express = require('express'),
    //   mongoose = require('mongoose'),
    //   Grid = require('gridfs-stream'),
      router  = express.Router();

// const mongoURI = process.env.MONGO_URI;
// mongoose.connect(mongoURI, {useUnifiedTopology: false});


// const conn = mongoose.createConnection(mongoURI);

// Init gfs
// var gfs;

// conn.once('open', () => {
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection('uploads');
// })

router.get('/', (req, res) => {
        res.render("temp");
    // var genre, genre2, genre3, length, bpm;
    // genre = genre2 = genre3 = req.query.genre;
    // length = req.query.length,
    // bpm = req.query.bpm;

    // if (!genre && !bpm && !length) {
    //     gfs.files.find({'metadata.genre': 'rock'})
    //              .toArray((err, files) => {
    //                 res.render('search', { files, genre, bpm, length });
    //              })
    // } else if (genre) {
    //     gfs.files.find({
    //             $or: [
    //                     { 'metadata.genre': genre },
    //                     { 'metadata.genre2': genre2 },
    //                     { 'metadata.genre3': genre3 }
    //                 ]
    //         })
    //         .toArray((err, files) => {
    //             res.render('search', { files, genre, bpm, length });
    //         })
    // } else if (length) {
    //     gfs.files.find({ 'metadata.length': length })
    //         .toArray((err, files) => {
    //             res.render('search', { files, genre, bpm, length });
    //         })
    // }
    // else {
    //     gfs.files.find({'metadata.bpm': bpm })
    //         .toArray((err, files) => {
    //             res.render('search', { files, genre, bpm, length });
    //         })
    // }
})

module.exports = router;