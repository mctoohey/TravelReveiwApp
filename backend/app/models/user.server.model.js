const db = require('../../config/db');
const bcrypt = require('bcrypt');
const cyrpto = require('crypto');
const fs = require('fs'); 

exports.insert = function(username, email, givenName, familyName, password, done) {
    
    let values = [username, email, givenName, familyName, hashPassword(password)];

    db.getPool().run('INSERT INTO User (username, email, given_name, family_name, password) VALUES ?', [[values]], function(err) {
        if (err) {
            done(400, err);
        } else {
            done(201, {"userId": this.lastID});
        }
    });
}

function hashPassword(password) {
    return bcrypt.hashSync(password, 12);
}

exports.update = function(id, token, updatedInfo, done) {
    db.getPool().query('SELECT * FROM User WHERE auth_token = ?', token, function(err, rows) {
        if (err) {
            done(400, err);
        } else if (rows.length != 1) {
            done(401, {});
        } else if (rows[0].user_id != id) {
            done(403, {})
        } else {
            db.getPool().run('UPDATE User SET ? WHERE user_id = ?', [updatedInfo, id], function(err) {
                if (err) {
                    done(400, err);
                } else {
                    done(200, {});
                }
            });
        }
    });  
}

exports.getOne = function(userId, token, done) {
    db.getPool().query('SELECT * FROM User WHERE user_id = ?', userId, function (err, rows) {
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


exports.exists = function(id, done) {
    db.getPool().query('SELECT * FROM User WHERE user_id = ?', id, function (err, rows) {
        if (err) {
            done(false, err);
        } else if (rows.length != 1) {
            done(false);
        } else {
            done(true);
        }
    });
}


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
                let token = cyrpto.randomBytes(16).toString('hex');
                authResult = {
                    "userId": rows[0].user_id,
                    "token": token
                }

                db.getPool().run('UPDATE User SET auth_token = ? WHERE user_id = ?', [authResult.token, authResult.userId], function(err) {
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

exports.logout = function(token, done) {
    db.getPool().run('UPDATE User SET auth_token = null WHERE auth_token = ?', token, function(err) {
        if (err) {
            done(401, err);
        } else if (this.changes === 0) {
            done(401, {"Error": "Token not found"});
        } else if (this.changes > 1) {
            // Should users still be logged out here?
            done(401, {"Error": "Token should be unique to one user"});
        } else {
            done(200, {});
        }
    });
}

exports.addPhoto = function(id, token, imageName, imageRaw, done) {
    db.getPool().query('SELECT * FROM User WHERE user_id = ? or auth_token = ?', [id, token], function(err, rows) {
        if (err) {
            done(500, err);
        } else if (rows.length === 0) {
            done(404, {"ERROR": "User not found"});
        } else if (rows.length === 2) {
            done(403, {"ERROR": "You are not allowed to change this users photo"});
        } else if (rows.length > 2) {
            done(500, {"ERROR": "Either user id or auth token was not unique"});
        } else if (rows[0].user_id != id) {
            done(404, {"ERROR": "User not found"});
        } else if (rows[0].auth_token != token) {
            done(401, {"ERROR": "Supplied token is not valid"});
        } else {
            fs.writeFile(`user_photos/${imageName}`, imageRaw, function (err) {
                if (err) {
                    done(500, {"ERROR": "Could not save image"});
                } else {
                    let statusCode = 200;
                    if (rows[0].profile_photo_filename === null) statusCode = 201;
                    db.getPool().run('UPDATE User SET profile_photo_filename = ? WHERE user_id = ?', [imageName, id], function(err) {
                        if (err) {
                            done(500, err);
                        } else {
                            done(statusCode, {});
                        }
                    });
                }
            });
        }
    });
}

exports.getPhoto = function(id, doneError, doneImage) {
    db.getPool().query('SELECT * FROM User WHERE user_id = ?', id, function(err, rows) {
        if (err) {
            doneError(500, err);
        } else if (rows.length === 0) {
            doneError(404, {"ERROR": "User not found"});
        } else if (rows.length > 1) {
            doneError(500, {"ERROR": "User id should be unique"});
        } else if (rows[0].profile_photo_filename === null) {
            doneError(404, {"ERROR": "Image not found"});
        } else {
            fs.readFile(`user_photos/${rows[0].profile_photo_filename}`, function(err, contents) {
                if (err) {
                    doneError(500, err);
                } else {
                    doneImage(200, contents, rows[0].profile_photo_filename.split('.')[1]);
                }
            });
        }
    });
}

exports.deletePhoto = function(id, token, done) {
    db.getPool().query('SELECT * FROM User WHERE user_id = ? or auth_token = ?', [id, token], function(err, rows) {
        if (err) {
            done(500, err);
        } else if (rows.length === 0) {
            done(404, {"ERROR": "User not found"});
        } else if (rows.length === 2) {
            done(403, {"ERROR": "You are not allowed to change this users photo"});
        } else if (rows.length > 2) {
            done(500, {"ERROR": "Either user id or auth token was not unique"});
        } else if (rows[0].user_id != id) {
            done(404, {"ERROR": "User not found"});
        } else if (rows[0].auth_token != token) {
            done(401, {"ERROR": "Supplied token is not valid"});
        } else if (rows[0].profile_photo_filename === null) {
            done(404, {"ERROR": "Image not found"});
        } else {
            db.getPool().run('UPDATE User SET profile_photo_filename = null WHERE user_id = ?', id, function(err) {
                if (err) {
                    done(500, err);
                } else {
                    try {
                        fs.unlinkSync(`user_photos/${rows[0].profile_photo_filename}`);
                        done(200, {});
                    } catch(err) {
                        done(500, err);
                    }
                }
            });
        }
    });
}

exports.getVenueReviews = function(userId, token, done) {
    db.getPool().query('SELECT * FROM User WHERE auth_token = ? or user_id = ?', [token, userId], function(err, rows) {
        let result = [];
        if (err) {
            done(500, err);
        } else if (rows.length > 2) {
            done(500, {"ERROR": "User id or auth token was not unique."})
        } else if (rows.length === 0 || rows.length === 1 && rows[0].user_id != userId) {
            done(404, {"ERROR": "User not found"})
        } else if (rows.length === 1 && rows[0].auth_token != token) {
            done(401, {"ERROR": "Invalid token supplied"});
        } else {
            db.getPool().query('SELECT * FROM (Review JOIN User ON review_author_id = user_id JOIN Venue ON reviewed_venue_id = Venue.venue_id JOIN VenueCategory ON Venue.category_id = VenueCategory.category_id) LEFT JOIN VenuePhoto ON (Venue.venue_id = VenuePhoto.venue_id and is_primary = 1) WHERE review_author_id = ?', userId, function(err, rows) {
                if (err) {
                    done(500, err);
                } else {
                    for (let row of rows) {
                        let review = {};
                        review.reviewAuthor = {"userId": row.user_id, "username": row.username};
                        review.reviewBody = row.review_body;
                        review.starRating = row.star_rating;
                        review.costRating = row.cost_rating;
                        review.timePosted = row.time_posted;

                        let venue = {};
                        venue.venueId = row.reviewed_venue_id;
                        venue.venueName = row.venue_name;
                        venue.categoryName = row.category_name;
                        venue.city = row.city;
                        venue.shortDescription = row.short_description;
                        venue.primaryPhoto = row.photo_filename

                        review.venue = venue;

                        result.push(review);
                    }
                    done(200, result);
                }
            });
        }
    });
}