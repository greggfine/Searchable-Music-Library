const express = require('express'),
      passport = require('passport'),
      User = require('../models/user'),
      router  = express.Router();

router.use(express.urlencoded({extended: true}));
router.use(express.json());

// Show sign up form
router.get('/', function (req, res) {
    res.render('register');
});

//  Handling User Sign Up
router.post('/', function (req, res) {
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

module.exports = router;
