const db = require('../../config/db');

exports.insert = function(values, done) {
    //let values = [username, email, given_name, family_name, password];

    db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?', [values], function(err, result) {
        if (err) return done(400, err);

        done(201, {"userId": result.insertId});
    });
};