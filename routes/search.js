const express = require('express'),
      mongoose = require('mongoose'),
      Grid = require('gridfs-stream'),
      router  = express.Router();

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI);
// mongoose.connect(mongoURI, {
//     useNewUrlParser: true,
//     useFindAndModify: false,
//     useCreateIndex: true,
//     useUnifiedTopology: false
//   });


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://gregg:<password>@ht-music-library.q1chn.mongodb.net/<dbname>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


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