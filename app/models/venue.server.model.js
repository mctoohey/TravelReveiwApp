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
            let values = [venueName, categoryId, city, shortDescription, longDescription, address, latitude, longitude, adminId, date];
            db.getPool().query('SELECT * FROM VenueCategory WHERE category_id = ?', categoryId, function(err, rows) {
                if (err) {
                    done(500, err);
                } else if (rows.length === 0) {
                    // TODO: Check reference server response.
                    done(400, {"ERROR": "Venue category id not found"});
                } else if (rows.length > 1) {
                    done(500, {"ERROR": "Venue category id should be unique"});
                } else {
                    db.getPool().query('INSERT INTO Venue (venue_name, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) VALUES ?', [[values]], function(err, result) {
                        if (err) {
                            done(400, err);
                        } else {
                            done(201, {"venueId": result.insertId});
                        }
                    });
                }
            });
        }
    });
}

exports.update = function(id, token, updatedInfo, done) {
    db.getPool().query('SELECT * FROM User, Venue WHERE admin_id = user_id and (auth_token = ? or venue_id = ?)', [token, id], function(err, rows) {
        if (err) {
            done(500, err);
        } else if (rows.length === 0) {
            done(404, {"ERROR": "Venue not found"});
        } else if (rows.length === 2) {
            done(403, {"ERROR": "You are not allowed to alter this venue"});
        } else if (rows.length > 2) {
            done(500, {"ERROR": "Either venue id or auth token was not unique"});
        } else if (rows[0].venue_id != id) {
            done(404, {"ERROR": "Venue not found"});
        } else if (rows[0].auth_token != token) {
            done(401, {"ERROR": "Supplied token is not valid"});
        } else {
            db.getPool().query('UPDATE Venue SET ? WHERE venue_id = ?', [updatedInfo, id], function(err, result) {
                if (err) {
                    done(500, err);
                } else {
                    done(200, {});
                }
            });
        }
    });
}

exports.getOne = function(id, done) {
    let venueJson = {}
    db.getPool().query('SELECT * FROM Venue WHERE venue_id = ?', id, function(err, rows) {
        if (err) {
            done(500, err);
        } else if (rows.length === 0) {
            done(404, {"ERROR": "Venue could not be found"});
        } else if (rows.length > 1) {
            done(500, {"ERROR": "Venue id should be unique"});
        } else {
            venueJson.venueName = rows[0].venue_name;
            venueJson.city = rows[0].city;
            venueJson.shortDescription = rows[0].short_description;
            venueJson.longDescription = rows[0].long_description;
            venueJson.dateAdded = rows[0].date_added;
            venueJson.address = rows[0].address;
            venueJson.latitude = rows[0].latitude;
            venueJson.longitude = rows[0].longitude;

            let adminId = rows[0].admin_id;
            let categoryId = rows[0].category_id;
            db.getPool().query('SELECT * FROM User WHERE user_id = ?', adminId, function(err, rows) {
                if (err) {
                    done(500, err);
                } else if (rows.length > 1) {
                    done(500, {"ERROR": "User id should be unique"});
                } else {
                    // TODO: Check behavior of this on reference server.
                    let admin = {"userId":adminId}
                    if (rows.length === 1) {
                        admin = {"userId":adminId, "username": rows[0].username}
                    } else {
                        admin = {"userId":adminId, "username": null}
                    }
                    venueJson.admin = admin;

                    db.getPool().query('SELECT * FROM VenueCategory WHERE category_id = ?', categoryId, function(err, rows) {
                        if (err) {
                            done(500, err);
                        } else if (rows.length > 1) {
                            done(500, {"ERROR": "Category id should be unique"});
                        } else if (rows.length === 0) {
                            done(500, {"ERROR": "Category id could not be found"});
                        } else {
                            venueJson.category = {"categoryId": categoryId,
                                                  "categoryName": rows[0].category_name,
                                                  "categoryDescription": rows[0].category_description}

                            db.getPool().query('SELECT * FROM VenuePhoto WHERE venue_id = ?', id, function(err, rows) {
                                if (err) {
                                    done(500, err);
                                } else {
                                    let photos = [];
                                    for (let row of rows) {
                                        photos.push({"photoFilename": row.photo_filenamePrimary, 
                                                    "photoDescription": row.photo_description, 
                                                    "isPrimary": row.is_primary});
                                    }
                                    venueJson.photos = photos;
                                    done(200, venueJson);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}