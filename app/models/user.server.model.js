const db = require('../../config/db');
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');

exports.insert = function(username, email, givenName, familyName, password, done) {
    // TODO: Check that all fields are valid.
    if (!isValidEmail(email)) {
        done(400, {"Validation Error": "Invalid email address"});
    } else if (!isValidPassword(password)) {
        done(400, {"Validation Error": "Invalid password"});
    } else {
        let values = [username, email, givenName, familyName, hashPassword(password)];

        db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?', [[values]], function(err, result) {
            if (err) {
                done(400, err);
            } else {
                done(201, {"userId": result.insertId});
            }
        });
    }
}

exports.update = function(id, token, updatedInfo, done) {
    if (this.isAuthorized(id, token)) {
        db.getPool().query('UPDATE User SET ? WHERE user_id = ?', [updatedInfo, id], function(err, result) {
            if (err) {
                done(400, err);
            } else {
                done(200, {});
            }
        });
    } else {
        done(403, {});
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


exports.getOne = function(userId, token, done) {
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
                "givenName": rows[0].given_name,
                "familyName": rows[0].family_name
            }
            if (rows[0].auth_token === token) userData["email"] = rows[0].email;

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
        }  else if (rows.length === 0) {
            done(400, {"Error": 'User not found'});
        } else if (rows.length > 1) {
            done(400, {"Error": 'More than one user found. This should never occur!'})
        } else {
            passwordHash = rows[0].password;

            if (bcrypt.compareSync(password, passwordHash)) {
                let token = uuidv1();
                authResult = {
                    "userId": rows[0].user_id,
                    "token": token
                }

                db.getPool().query('UPDATE User SET auth_token = ? WHERE user_id = ?', [authResult.token, authResult.userId], function(err, result) {
                    if (err) {
                        done(400, err);
                    } else {
                        done(200, authResult);
                    }
                });
            } else {
                done(400, {"Authentication Error": "Incorrect username or password"});
            }
        }
    });
}

exports.isAuthorized = function(id, token) {
    let isValidToken = false;
    db.getPool().query('SELECT * FROM User WHERE auth_token = ? and user_id = ?', [token, id], function(err, rows) {
        if (err) {
            isValidToken = false;
        } else if (rows.length === 1) {
            isValidToken = true;
        }
        console.log(isValidToken);
        console.log(rows);
    });
    return isValidToken;
}

exports.logout = function(token, done) {
    db.getPool().query('UPDATE User SET auth_token = null WHERE auth_token = ?', token, function(err, result) {
        if (err) {
            done(401, err);
        } else if (result.affectedRows === 0) {
            done(401, {"Error": "Token not found"});
        } else if (result.affectedRows > 1) {
            // Should users still be logged out here?
            done(401, {"Error": "Token should be unique to one user"});
        } else {
            done(200, {});
        }
    });
}