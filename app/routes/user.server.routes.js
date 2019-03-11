const user = require('../controllers/user.server.controller');
module.exports = function(app) {
app.route('/api/v1/users')
        //.get(users.list)
        .post(user.create)

app.route('/api/v1/users/:userId')
        .get(user.read);

app.route('/api/v1/users/login')
        .post(user.login);

app.route('/api/v1/users/logout')
        .post(user.logout);
}

