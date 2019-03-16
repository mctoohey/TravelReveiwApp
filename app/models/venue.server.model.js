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
    adminOnlyAction(id, token, done, function() {
        db.getPool().query('UPDATE Venue SET ? WHERE venue_id = ?', [updatedInfo, id], function(err, result) {
            if (err) {
                done(500, err);
            } else {
                done(200, {});
            }
        });
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

exports.query = function(selectQueryItems, constraints, done) {
    let queryString = 'SELECT * FROM Venue';
    if (Object.keys(selectQueryItems).length > 0) {
        queryString += ' WHERE ?' + ' and ?'.repeat(selectQueryItems.length-1);
    }
    
    db.getPool().query(queryString, selectQueryItems, function(err, rows) {
        if (err) {
            done(500, err);
        } else {
            let result = []
            processQueryRows(rows, constraints, result, done);
        }
    });
}

function processQueryRows(venueRows, constraints, result, done) {
    //TODO: distance stuff.
    if (venueRows.length === 0) {
        let endIndex = result.length;
        let startIndex = 0;
        let sortBy = 'meanStarRating';
        if (constraints.hasOwnProperty('startIndex')) {
            startIndex = constraints.startIndex;
        }

        if (constraints.hasOwnProperty('count')) {
            endIndex = startIndex + constraints.count;
        }

        //TODO: Test sorting
        if (constraints.hasOwnProperty('sortBy')) {
            sortBy = constraints.sortBy;
        }

        let sortByFunction = function(a, b){return b[sortBy] - a[sortBy]};
        if (constraints.hasOwnProperty('reverseSort') && constraints.reverseSort) {
            sortByFunction = function(a, b){return a[sortBy] - b[sortBy]};
        }

        result.sort(sortByFunction);
        return done(200, result.slice(startIndex, endIndex));
    }

    let row = venueRows.pop();
    if (!constraints.hasOwnProperty('queryString') || row.venue_name.toLowerCase().includes(constraints.queryString.toLowerCase())) {
        let venueId = row.venue_id;
        let venue = {
            "venueId": venueId,
            "venueName": row.venue_name,
            "categoryId": row.category_id,
            "city": row.city,
            "shortDescription": row.short_description,
            "latitude": row.latitude,
            "longitude": row.longitude,
            "primaryPhoto": null
        }
        
        db.getPool().query('SELECT * FROM Review WHERE reviewed_venue_id = ?', venueId, function(err, rows) {
            if (err) {
                done(500, err);
            } else {
                let starRatingSum = 0;
                let costRatingFrequencies = {};

                let costRatingMode = 0;
                if (rows.length > 0) {
                    costRatingMode = rows[0].cost_rating;
                }
                for (let row of rows) {
                    starRatingSum += row.star_rating;
                    if (costRatingFrequencies.hasOwnProperty(row.cost_rating)) {
                        costRatingFrequencies[row.cost_rating] += 1;
                    } else {
                        costRatingFrequencies[row.cost_rating] = 1;
                    }

                    if (costRatingFrequencies[row.cost_rating] > costRatingFrequencies[costRatingMode]) {
                        costRatingMode = row.cost_rating;
                    }
                }

                let starRatingMean = 0;
                if (rows.length > 0) {
                    starRatingMean = starRatingSum / rows.length;
                }
                venue.meanStarRating = starRatingMean;
                venue.modeCostRating = costRatingMode;

                db.getPool().query('SELECT * FROM VenuePhoto WHERE reviewed_venue_id = ?', venueId, function(err, rows) {
                    //TODO: photos.
                });

                let meetsConstraints = true;

                if (constraints.hasOwnProperty('minStarRating') && constraints.minStarRating > venue.meanStarRating) {
                    meetsConstraints = false;
                }
                if (constraints.hasOwnProperty('maxCostRating') && constraints.maxCostRating < venue.modeCostRating) {
                    meetsConstraints = false;
                }
                
                if (meetsConstraints) {
                    result.push(venue);
                }
                processQueryRows(venueRows, constraints, result, done);
            }
        });
    } else {
        processQueryRows(venueRows, constraints, result, done);
    }
}

exports.readCategories = function (done) {
    db.getPool().query('SELECT * FROM VenueCategory', function(err, rows) {
        if (err) {
            done(500, err);
        } else {
            let categories = []
            for (let row of rows) {
                categories.push({"categoryId": row.category_id,
                                 "categoryName": row.category_name,
                                 "categoryDescription": row.category_description});
            }
            done(200, categories);
        }
    });
}

exports.insertPhoto = function(venueId, photoFilename, photoDescription, isPrimary, token, doneError, doneSuccess) {
    adminOnlyAction(venueId, token, doneError, function() {
        db.getPool().query('SELECT * FROM VenuePhoto WHERE is_primary = 1', function(err, rows) {
            if (err) {
                doneError(500, err);
            } else if (rows.length > 1) {
                doneError(500, {"ERROR": "More than one primary photo found"});
            } else {
                if (rows.length === 0) {
                    isPrimary = true;
                }
                let primaryValue = 0;
                if (isPrimary) {
                    primaryValue = 1;
                    db.getPool().query('UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ?', venueId, function(err, result) {
                        if (err) {
                            done(500, err);
                        } else {
                            insertPhotoValuesIntoDatabase([venueId, photoFilename, photoDescription, primaryValue], doneError, doneSuccess);
                        }
                    });
                } else {
                    insertPhotoValuesIntoDatabase([venueId, photoFilename, photoDescription, primaryValue], doneError, doneSuccess);
                }
            } 
        });
    });
}

function insertPhotoValuesIntoDatabase(values, doneError, doneSuccess) {
    db.getPool().query('INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES ?', [[values]], function(err, result) {
        if (err) {
            doneError(400, err);
        } else {
            doneSuccess(201, {});
        }
    });
}

function adminOnlyAction(venueId, token, done, action) {
    db.getPool().query('SELECT * FROM User, Venue WHERE admin_id = user_id and (auth_token = ? or venue_id = ?)', [token, venueId], function(err, rows) {
        if (err) {
            done(500, err);
        } else if (rows.length === 0) {
            done(404, {"ERROR": "Venue not found"});
        } else if (rows.length === 2) {
            done(403, {"ERROR": "You are not allowed to alter this venue"});
        } else if (rows.length > 2) {
            done(500, {"ERROR": "Either venue id or auth token was not unique"});
        } else if (rows[0].venue_id != venueId) {
            done(404, {"ERROR": "Venue not found"});
        } else if (rows[0].auth_token != token) {
            done(401, {"ERROR": "Supplied token is not valid"});
        } else {
            action();
        }
    });
}