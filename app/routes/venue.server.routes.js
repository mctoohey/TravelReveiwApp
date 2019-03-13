const venue = require('../controllers/venue.server.controller');
module.exports = function(app) {
    app.route('/api/v1/venues')
        .post(venue.create);
}