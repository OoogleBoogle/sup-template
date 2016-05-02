var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/user');

var app = express();

var jsonParser = bodyParser.json();

// Add your API endpoints here
app.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        if (err) {
            return res.sendStatus(500);
        }

        return res.json(users);
    });
});

app.get('/users/:userId', function(req, res) {
    User.findOne({
        _id: req.params.userId
    }, function(err, user) {
        if (err) {
            return res.sendStatus(500);
        }
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.json(user);
    });
});

app.post('/users', jsonParser, function(req, res) {
    if (!('username' in req.body)) {
      return res.status(422).json({message: 'Missing field: username'})
    }

    if (typeof req.body.username !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: username'});
    }

    if (req.body.username === "") {
        return res.status(422).json({message: 'Empty field: username'});
    }

    var user = new User({
        username: req.body.username
    });

    user.save(function(err, user) {
        if (err) {
            return res.sendStatus(422);
        }

        return res.status(201).location('/users/' + user._id).json({});
    });
});

app.put('/users/:userId', jsonParser, function(req, res) {
    if (!('username' in req.body)) {
      return res.status(422).json({message: 'Missing field: username'})
    }

    if (typeof req.body.username !== 'string') {
        return res.status(422).json({message: 'Incorrect field type: username'});
    }

    if (req.body.username === "") {
        return res.status(422).json({message: 'Empty field: username'});
    }

    User.findByIdAndUpdate(req.params.userId, req.body, {upsert: true}, function(err) {
        if (err) {
          return res.sendStatus(500);
        }
        return res.status(200).json({});
    });
});

app.delete('/users/:userId', jsonParser, function(req, res) {
    User.findByIdAndRemove(req.params.userId, function(err, user) {
        if (err) {
          return res.sendStatus(500);
        }
        if (!user) {
          return res.status(404).json({message: 'User not found'});
        }
        return res.status(200).json({});
    });
});

var databaseUri = global.databaseUri || 'mongodb://localhost/sup';
mongoose.connect(databaseUri).then(function() {
    app.listen(8080, function() {
        console.log('Listening on localhost:8080');
    });
});

module.exports = app;
