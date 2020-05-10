const express = require('express');
const bodyParser = require('body-parser');
const formData = require("express-form-data");
const fs = require('fs');

const formDataOptions = {
    uploadDir: 'temp_downloads',
    autoClean: true
  };

const allowCrossOriginRequests = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');
    next();
};

module.exports = function () {
    const app = express();
    app.rootUrl = '/api/v1';

    // MIDDLEWARE
    app.use(allowCrossOriginRequests);
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: 'text/plain' }));  // for the /executeSql endpoint
    app.use(bodyParser.raw({ type: 'image/png' })); 
    app.use(bodyParser.raw({ type: 'image/jpeg' })); 
    app.use(formData.parse(formDataOptions));
    app.use(formData.format());

    //Create required directories.
    if (!fs.existsSync('venue_photos')) {
        fs.mkdirSync('venue_photos');
    }
    if (!fs.existsSync('user_photos')) {
        fs.mkdirSync('user_photos');
    }
    if (!fs.existsSync('temp_downloads')) {
        fs.mkdirSync('temp_downloads');
    }

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require('../app/routes/user.server.routes')(app);
    require('../app/routes/venue.server.routes')(app);

    // DEBUG (you can remove this)
    app.get('/', function (req, res) {
        res.send({ 'message': 'Hello World!' })
    });

    return app;
};
