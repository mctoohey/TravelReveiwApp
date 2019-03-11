const User = require('../models/user.server.model');

exports.create = function(req, res) {
    // let values = [
    //     [req.body.username, req.body.email, req.body.givenName, req.body.familyName, req.body.password]
    // ];

    User.insert(req.body.username, 
                req.body.email, 
                req.body.givenName, 
                req.body.familyName, 
                req.body.password, 
                function(code, result) {
        res.status(code);
        res.json(result);
    });
};