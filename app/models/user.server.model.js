const db = require('../../config/db');
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');

exports.insert = function(username, email, givenName, familyName, password, done) {

    if (!isValidEmail(email)) {
        done(400, {"Validation Error": "Invalid email address"});
    } else if (!isValidPassword(password)) {
        done(400, {"Validation Error": "Invalid password"});
    } else {
        let values = [username, email, givenName, familyName, hashPassword(password)];

        db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?', [[values]], function(err, result) {
            if (err) return done(400, err);
    
            done(201, {"userId": result.insertId});
        });
    }
}

function isValidEmail(email) {
    var emailRe = /[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.]+@[a-zA-z0-9-.]+/;
    return emailRe.test(email);
}

function isValidPassword(password) {
    return password.length > 0;
}

function hashPassword(password) {
    return bcrypt.hashSync(password, 12);
}


exports.getOne = function(userId, done) {
    db.getPool().query('SELECT * FROM User WHERE user_id = ?', userId, function (err, rows) {
        // TODO: Consider using different status code here.
        if (err) {
            done(404, err);
        } else if (rows.length == 0) {
            done(404, {"Error": 'User not found'});
        } else if (rows.length > 1) {
            done(404, {"Error": 'More than one user found. This should never occur!'})
        } else {
            userData = {
                "username": rows[0].username,
                "email": rows[0].email,
                "givenName": rows[0].given_name,
                "familyName": rows[0].family_name
            }

            done(200, userData);
        }
        
    });
};


exports.authenticateWithUsername = function(username, password, done) {
    authenticate({username: username}, password, done);
}

exports.authenticateWithEmail = function(email, password, done) {
    authenticate({email: email}, password, done);
}

function authenticate(uniqueSelectCondition, password, done) {
    db.getPool().query('SELECT * FROM User WHERE ?', uniqueSelectCondition, function (err, rows) {
        if (err) {
            done(400, err);
        }  else if (rows.length == 0) {
            done(400, {"Error": 'User not found'});
        } else if (rows.length > 1) {
            done(400, {"Error": 'More than one user found. This should never occur!'})
        } else {
            passwordHash = rows[0].password;

            if (bcrypt.compareSync(password, passwordHash)) {
                let token = uuidv1();
                result = {
                    "userId": rows[0].user_id,
                    "token": token
                }
                done(200, result);
            } else {
                done(400, {"Authentication Error": "Incorrect username or password"});
            }
        }
    });
}