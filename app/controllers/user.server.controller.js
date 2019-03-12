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

exports.edit = function(req, res) {
    let id = req.params.userId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }

    let updateInfo = {}
    if (req.body.hasOwnProperty('givenName')) {
        updateInfo["given_name"] = req.body.givenName;
    }
    if (req.body.hasOwnProperty('familyName')) {
        updateInfo["family_name"] = req.body.familyName;
    }
    if (req.body.hasOwnProperty('password')) {
        updateInfo["password"] = req.body.password;
    }
    
    User.update(id, token, updateInfo, function (code, result){
        res.status(code);
        res.json(result);
    });
}

exports.read = function(req, res) {
    let id = req.params.userId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }

    User.getOne(id, token, function(code, result) {
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

exports.logout = function(req, res) {
    let token = req.headers['x-authorization'];
    User.logout(token, function(code, result) {
        res.status(code);
        res.json(result);
    });
}

