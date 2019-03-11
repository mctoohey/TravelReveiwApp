const db = require('../../config/db');
const bcrypt = require('bcrypt');

exports.insert = function(username, email, given_name, family_name, password, done) {

    if (!isValidEmail(email)) {
        done(400, {"Validation Error": "Invalid email address"});
    } else if (!isValidPassword(password)) {
        done(400, {"Validation Error": "Invalid password"});
    } else {
        let values = [username, email, given_name, family_name, hashPassword(password)];

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