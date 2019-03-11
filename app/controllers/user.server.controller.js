const User = require('../models/user.server.model');

exports.create = function(req, res) {
    // let values = [
    //     [req.body.username, req.body.email, req.body.givenName, req.body.familyName, req.body.password]
    // ];

    User.insert(req.body.username, 
                req.body.email, 
                req.body.givenName, 
                req.body.familyName, 
                req.body.password, 
                function(code, result) {
        res.status(code);
        res.json(result);
    });
}

exports.read = function(req, res) {
    let id = req.params.userId;
    User.getOne(id, function(code, result) {
        res.status(code);
        res.json(result);
    });
};

exports.login = function(req, res) {
    if (req.body.hasOwnProperty('username')) {
        User.authenticateWithUsername(req.body.username, req.body.password, function(code, result) {
            res.status(code);
            res.json(result);
        });
    } else if (req.body.hasOwnProperty('email')) {
        User.authenticateWithEmail(req.body.email, req.body.password, function(code, result) {
            res.status(code);
            res.json(result);
        });
    } else {
        res.status(400);
        res.json({"Error": "No username or email supplied"});
    }
}

