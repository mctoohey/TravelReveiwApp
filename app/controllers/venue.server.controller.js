const Venue = require('../models/venue.server.model');

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
    // TODO: Check that all fields are valid.
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

