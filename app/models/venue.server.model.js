const db = require('../../config/db');

exports.insert = function(venueName, categoryId, city, shortDescription, longDescription, address, latitude, longitude, token, done) {
    
    let values = [venueName, categoryId, city, shortDescription, longDescription, address, latitude, longitude];

    db.getPool().query('SELECT * FROM User WHERE auth_token = ?', token, function(err, rows) {
        if (err) {
            done(500, err);
        } else if (rows.length > 1) {
            done(500, {"ERROR": "Authentication token should be unique"});
        } else if (rows.length === 0) {
            done(401, {"ERROR": "Supplied token is not valid"})
        } else {
            db.getPool().query('INSERT INTO Venue (venueName, categoryId, city, shortDescription, longDescription, address, latitude, longitude) VALUES ?', [[values]], function(err, result) {
                if (err) {
                    done(400, err);
                } else {
                    done(201, {"venueId": result.insertId});
                }
            });
        }
    });
}