const user = require('../controllers/user.server.controller');
module.exports = function(app) {
app.route('/api/v1/users')
        //.get(users.list)
        .post(user.create);
};