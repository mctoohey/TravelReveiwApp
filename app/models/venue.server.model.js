const db = require('../../config/db');

exports.insert = function(venueName, categoryId, city, shortDescription, longDescription, address, latitude, longitude, token, done) {
    db.getPool().query('SELECT * FROM User WHERE auth_token = ?', token, function(err, rows) {
        if (err) {
            done(500, err);
        } else if (rows.length > 1) {
            done(500, {"ERROR": "Authentication token should be unique"});
        } else if (rows.length === 0) {
            done(401, {"ERROR": "Supplied token is not valid"})
        } else {
            let adminId = rows[0].user_id;
            let date = new Date(Date.now()).toISOString();
            console.log(date);
            let values = [venueName, categoryId, city, shortDescription, longDescription, address, latitude, longitude, adminId, date];
            db.getPool().query('INSERT INTO Venue (venue_id, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) VALUES ?', [[values]], function(err, result) {
                if (err) {
                    done(400, err);
                } else {
                    done(201, {"venueId": result.insertId});
                }
            });
        }
    });
}