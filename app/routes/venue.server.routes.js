const venue = require('../controllers/venue.server.controller');
module.exports = function(app) {
    app.route('/api/v1/venues')
        .get(venue.get)
        .post(venue.create);

    app.route('/api/v1/venues/:venueId')
        .get(venue.read)
        .patch(venue.edit);

    app.route('/api/v1/categories')
        .get(venue.getCategories);

    app.route('/api/v1/venues/:venueId/photos')
        .post(venue.addPhoto);
}