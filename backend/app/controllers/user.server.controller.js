const User = require('../models/user.server.model');
const bcrypt = require('bcrypt');

exports.create = function(req, res) {
    if (!isValidEmail(req.body.email)) {
        res.status(400).json({"Validation Error": "Invalid email address"});
    } else if (!isValidUserName(req.body.username)) {
        res.status(400).json({"Validation Error": "Invalid user name"});
    } else if (!isValidPassword(req.body.password)) {
        res.status(400).json({"Validation Error": "Invalid password"});
    } else if (!isValidName(req.body.givenName)) {
        res.status(400).json({"Validation Error": "Invalid given name"});
    } else if (!isValidName(req.body.familyName)) {
        res.status(400).json({"Validation Error": "Invalid family name"});
    } else {
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
}

exports.edit = function(req, res) {
    let id = req.params.userId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }

    let updateInfo = {};
    let allInfoValid = true;
    if (req.body.hasOwnProperty('givenName')) {
        updateInfo["given_name"] = req.body.givenName;
        allInfoValid = allInfoValid && isValidName(req.body.givenName);
    }
    if (req.body.hasOwnProperty('familyName')) {
        updateInfo["family_name"] = req.body.familyName;
        allInfoValid = allInfoValid && isValidName(req.body.familyName);
    }
    if (req.body.hasOwnProperty('password')) {
        allInfoValid = allInfoValid && isValidPassword(req.body.password);
        if (allInfoValid) {
            updateInfo["password"] = bcrypt.hashSync(req.body.password, 12);
        }
    }

    if (Object.keys(updateInfo).length === 0) {
        res.status(400);
        res.json({"ERROR": "No valid fields provided"});
        return;
    }
    
    if (allInfoValid) {
        User.update(id, token, updateInfo, function (code, result){
            res.status(code);
            res.json(result);
        });
    } else {
        res.status(400);
        res.json({"ERROR": "Invalid information in request"});
    } 
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
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }
    User.logout(token, function(code, result) {
        res.status(code);
        res.json(result);
    });
}

exports.addPhoto = function(req, res) {
    let id = req.params.userId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }
    let imageType = req.headers['content-type'];
    let imageName = null;

    if (imageType === 'image/png') imageName = `${id}.png`;
    else if (imageType === 'image/jpeg') imageName = `${id}.jpeg`;

    if (imageName != null) {
        User.addPhoto(id, token, imageName, req.body, function(code, result) {
            res.status(code);
            res.json(result);
        });
    } else {
        res.status(400);
        res.json({"ERROR": `Content type '${imageType}' is not supported`});
    }
}

exports.getPhoto = function(req, res) {
    let id = req.params.userId;
    User.getPhoto(id, function(code, result) {
        res.status(code);
        res.json(result);
    }, function(code, image, type) {
        res.status(code);
        res.setHeader("Content-Type", `image/${type}`);
        res.end(image);
    });
}

exports.deletePhoto = function(req, res) {
    let id = req.params.userId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }

    User.deletePhoto(id, token, function(code, result) {
        res.status(code);
        res.json(result);
    });
}

exports.getReviews = function(req, res) {
    let id = req.params.userId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }
    User.getVenueReviews(id, token, function(code, result) {
        res.status(code);
        res.json(result);
    });
}

function isValidEmail(email) {
    let emailRe = /^[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.]+@[a-zA-z0-9-.]+$/;
    return (typeof email === "string") && emailRe.test(email) && email.length > 0;
}

function isValidPassword(password) {
    return (typeof password === "string") && password.length > 0;
}

function isValidName(name) {
    return (typeof name === "string") && name.length > 0;
}

function isValidUserName(username) {
    let usernameRe = /^[a-zA-Z0-9]+$/;
    return (typeof username === "string") && usernameRe.test(username) && username.length > 0;
}

