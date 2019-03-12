const user = require('../controllers/user.server.controller');
module.exports = function(app) {
app.route('/api/v1/users')
        .post(user.create)

app.route('/api/v1/users/:userId')
        .get(user.read)
        .patch(user.edit);

app.route('/api/v1/users/login')
        .post(user.login);

app.route('/api/v1/users/logout')
        .post(user.logout);
}

