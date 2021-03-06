const Venue = require('../models/venue.server.model');
const uuidv1 = require('uuid/v1');
const fs = require('fs');

exports.read = function(req, res) {
    let id = req.params.venueId;
    Venue.getOne(id, function(code, result) {
        res.status(code);
        res.json(result);
    });
}

exports.create = function(req, res) {
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }
    
    if (!isValidName(req.body.venueName)) {
        res.status(400).json({"Validation Error": "Invalid venue name"});
    } else if (!isValidCategoryId(req.body.categoryId)) {
        res.status(400).json({"Validation Error": "Invalid category id"});
    } else if (!isValidCity(req.body.city)) {
        res.status(400).json({"Validation Error": "Invalid password"});
    } else if (!isValidDescription(req.body.shortDescription)) {
        res.status(400).json({"Validation Error": "Invalid short description"});
    } else if (!isValidDescription(req.body.longDescription)) {
        res.status(400).json({"Validation Error": "Invalid long description"});
    } else if (!isValidAddress(req.body.address)) {
        res.status(400).json({"Validation Error": "Invalid address"});
    } else if (!isValidLatitude(req.body.latitude)) {
        res.status(400).json({"Validation Error": "Invalid latitude"});
    } else if (!isValidLongitude(req.body.longitude)) {
        res.status(400).json({"Validation Error": "Invalid longitude"});
    } else {
        Venue.insert(req.body.venueName, 
                    req.body.categoryId, 
                    req.body.city, 
                    req.body.shortDescription, 
                    req.body.longDescription,
                    req.body.address,
                    req.body.latitude,
                    req.body.longitude,
                    token,
                    function(code, result) {
            res.status(code);
            res.json(result);
        });
    }
}

exports.edit = function(req, res) {
    let id = req.params.venueId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }

    let updateInfo = {};
    let allInfoValid = true;
    if (req.body.hasOwnProperty('venueName')) {
        updateInfo["venue_name"] = req.body.venueName;
        allInfoValid = allInfoValid && isValidName(req.body.venueName);
    }
    if (req.body.hasOwnProperty('categoryId')) {
        updateInfo["category_id"] = req.body.categoryId;
        allInfoValid = allInfoValid && isValidCategoryId(req.body.categoryId);
    }
    if (req.body.hasOwnProperty('city')) {
        updateInfo["city"] = req.body.city;
        allInfoValid = allInfoValid && isValidCity(req.body.city);
    }

    if (req.body.hasOwnProperty('shortDescription')) {
        updateInfo["short_description"] = req.body.shortDescription;
        allInfoValid = allInfoValid && isValidDescription(req.body.shortDescription);
    }

    if (req.body.hasOwnProperty('longDescription')) {
        updateInfo["long_description"] = req.body.longDescription;
        allInfoValid = allInfoValid && isValidDescription(req.body.longDescription);
    }

    if (req.body.hasOwnProperty('address')) {
        updateInfo["address"] = req.body.address;
        allInfoValid = allInfoValid && isValidAddress(req.body.address);
    }

    if (req.body.hasOwnProperty('latitude')) {
        updateInfo["latitude"] = req.body.latitude;
        allInfoValid = allInfoValid && isValidLatitude(req.body.latitude);
    }

    if (req.body.hasOwnProperty('longitude')) {
        updateInfo["longitude"] = req.body.longitude;
        allInfoValid = allInfoValid && isValidLatitude(req.body.longitude);
    }
    
    if (allInfoValid && Object.keys(updateInfo).length > 0) {
        Venue.update(id, token, updateInfo, function (code, result){
            res.status(code);
            res.json(result);
        });
    } else {
        res.status(400);
        res.json({"ERROR": "Invalid information in request"});
    } 
}

exports.getCategories = function(req, res) {
    Venue.readCategories(function(code, result) {
        res.status(code);
        res.json(result);
    });
}

exports.addPhoto = function(req, res) {
    let id = req.params.venueId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }
    let validFileExtensions = ['png', 'jpeg', 'jpg'];

    let isValidValues = true;
    isValidValues = isValidValues && req.body.hasOwnProperty('description');
    isValidValues = isValidValues && req.body.hasOwnProperty('makePrimary') && ['true', 'false'].includes(req.body['makePrimary'].toLowerCase());
    if (isValidValues) {
        let photoDescription = req.body['description'];
        let isPrimary = req.body['makePrimary'].toLowerCase() === 'true';
        let photoFileName = null;
        let fileLocation = null;
        if (req.hasOwnProperty('files') && req.files.hasOwnProperty('photo')) {
            photoFileName = req.files.photo.originalFilename;
            fileLocation = req.files.photo.path;
        } else {
            res.status(400);
            res.json({"ERROR": "No photo supplied"});
            return;
        }

        let photoExtension = photoFileName.split('.')[photoFileName.split('.').length-1];
        if (!validFileExtensions.includes(photoExtension.toLowerCase())) {
            res.status(400);
            res.json({"ERROR": "Not a valid file extension, must be '.png', '.jpg' or '.jpeg'"});
            return;
        }

        if (photoExtension === 'jpg') photoExtension = 'jpeg';

        let storedPhotoName = uuidv1() + '.' + photoExtension;

        Venue.insertPhoto(id, storedPhotoName, photoDescription, isPrimary, token, function(code, result) {
            res.status(code);
            res.json(result);
        }, function(code, result) {
            try {
                //TODO: Delete entry from database if this occurs.
                if (!fs.existsSync(`venue_photos/${id}`)) {
                    fs.mkdirSync(`venue_photos/${id}`);
                }
                fs.copyFileSync(fileLocation, `venue_photos/${id}/${storedPhotoName}`);
                res.status(code);
                res.json(result)
            } catch(e) {
                res.status(500);
                res.json(e);
            }
        });
    } else {
        res.status(400);
        res.json({"ERROR": "Either description or make primary is invalid"});
    }
}

exports.getPhoto = function(req, res) {
    let id = req.params.venueId;
    let photoFileName = req.params.photoFilename;
    Venue.getPhoto(id, photoFileName, function(code, result) {
        res.status(code);
        res.json(result);
    }, function(code, image, type) {
        if (type === 'jpg') type = 'jpeg';
        res.status(code);
        res.setHeader("Content-Type", `image/${type}`);
        res.end(image);
    });
}

exports.deletePhoto = function(req, res) {
    let id = req.params.venueId;
    let photoFileName = req.params.photoFilename;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }

    Venue.deletePhoto(id, photoFileName, token, function(code, result) {
        res.status(code);
        res.json(result);
    });
}

exports.setPrimaryPhoto = function(req, res) {
    let id = req.params.venueId;
    let photoFileName = req.params.photoFilename;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }
    Venue.setPrimaryPhoto(id, photoFileName, token, function(code, result) {
        res.status(code);
        res.json(result);
    });
}

exports.get = function(req, res) {
    let queryItems = []
    let constraints = {}
    let allValidParams = true;
    if (req.query.hasOwnProperty('startIndex')) {
        constraints.startIndex = parseInt(req.query.startIndex);
        allValidParams = allValidParams && Number.isInteger(constraints.startIndex) && constraints.startIndex >= 0;
    }
    
    if (req.query.hasOwnProperty('count')) {
        constraints.count = parseInt(req.query.count);
        allValidParams = allValidParams && Number.isInteger(constraints.count) && constraints.count >= 0;
    }

    if (req.query.hasOwnProperty('minStarRating')) {
        constraints.minStarRating = Number(req.query.minStarRating);
        allValidParams = allValidParams && isValidStarRating(constraints.minStarRating);
    }

    if (req.query.hasOwnProperty('maxCostRating')) {
        constraints.maxCostRating = Number(req.query.maxCostRating);
        allValidParams = allValidParams && isValidCostRating(constraints.maxCostRating);
    }

    if (req.query.hasOwnProperty('q')) {
        constraints.queryString = req.query.q;
        allValidParams =  allValidParams && constraints.queryString.length > 0;
    }

    if (req.query.hasOwnProperty('myLatitude')) {
        constraints.myLatitude = Number(req.query.myLatitude);
        allValidParams = allValidParams && isValidLatitude(constraints.myLatitude);
    }

    if (req.query.hasOwnProperty('myLongitude')) {
        constraints.myLongitude = Number(req.query.myLongitude);
        allValidParams = allValidParams && isValidLongitude(constraints.myLongitude);
    }

    if (req.query.hasOwnProperty('sortBy')) {
        constraints.sortBy = req.query.sortBy;
        allValidParams = allValidParams && ['STAR_RATING', 'COST_RATING', 'DISTANCE'].includes(constraints.sortBy);
        if (constraints.sortBy === 'DISTANCE' && (!req.query.hasOwnProperty('myLatitude') || !req.query.hasOwnProperty('myLongitude'))) {
            allValidParams = false;
        }
    }

    if (req.query.hasOwnProperty('reverseSort')) {
        allValidParams = allValidParams && ['true', 'false'].includes(req.query.reverseSort.toLowerCase());
        constraints.reverseSort = req.query.reverseSort.toLowerCase() === 'true';
    }

    if (req.query.hasOwnProperty('city')) {
        queryItems.push({"city": req.query.city});
        allValidParams = allValidParams && isValidCity(req.query.city);
    }

    if (req.query.hasOwnProperty('categoryId')) {
        queryItems.push({"category_id": req.query.categoryId});
        allValidParams = allValidParams && isValidCategoryId(Number(req.query.categoryId));
    }

    if (req.query.hasOwnProperty('adminId')) {
        queryItems.push({"admin_id": req.query.adminId});
        allValidParams = allValidParams && isValidAdminId(Number(req.query.adminId));
    }
    
    if (allValidParams) {
        Venue.query(queryItems, constraints, function(code, result) {
            res.status(code);
            res.json(result);
        });
    } else {
        res.status(400);
        res.json({"ERROR": "One or more parameters was invalid"});
    }   
}

exports.addReview = function(req, res) {
    let id = req.params.venueId;
    let token = '';
    if (req.headers.hasOwnProperty('x-authorization')) {
        token = req.headers['x-authorization'];
    }

    let reviewBody = req.body.reviewBody;
    let starRating = req.body.starRating;
    let costRating = req.body.costRating;

    if (isValidReviewBody(reviewBody) && isValidStarRating(starRating) && isValidCostRating(costRating)) {
        Venue.insertReview(id, reviewBody, starRating, costRating, token, function(code, result) {
            res.status(code);
            res.json(result);
        });
    } else {
        res.status(400);
        res.json({"ERROR": "Invalid information in request body"});
    }
}

exports.getReviews = function(req, res) {
    let id = req.params.venueId;
    Venue.getVenueReviews(id, function(code, result) {
        res.status(code);
        res.json(result);
    });
}

function isValidName(name) {
    return (typeof name === "string") && name.length > 0;
}

function isValidCategoryId(id) {
    return Number.isInteger(id);
}

function isValidCity(Cityname) {
    return (typeof Cityname === "string") && Cityname.length > 0;
}

function isValidDescription(descirption) {
    return (typeof descirption === "string");
}

function isValidAddress(address) {
    return (typeof address === "string") && address.length > 0;
}

function isValidLatitude(latitude) {
    return (typeof latitude === "number") && -90 <= latitude && latitude <= 90;
}

function isValidLongitude(longitude) {
    return (typeof longitude === "number") && -180 <= longitude && longitude <= 180;
}

function isValidReviewBody(review) {
    return (typeof review === "string") && review.length > 0;
}

function isValidStarRating(starRating) {
    return Number.isInteger(starRating) &&  1 <= starRating && starRating <= 5;
}

function isValidCostRating(costRating) {
    return Number.isInteger(costRating) &&  0 <= costRating && costRating <= 4;
}

function isValidAdminId(adminId) {
    return Number.isInteger(adminId) &&  0 <= adminId; 
}

