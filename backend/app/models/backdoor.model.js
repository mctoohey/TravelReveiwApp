const db = require('../../config/db');
const fs = require('mz/fs');
const bcrypt = require('bcrypt');

const photoDirectory = './storage/photos/';

exports.resetDB = async function () {
    const sql = await fs.readFile('app/resources/create_database.sql', 'utf8');
    db.getPool().exec(sql);

    if (await fs.exists(photoDirectory)) {
        const files = await fs.readdir(photoDirectory);
        for (const file of files) {
            if (file !== 'default.png') {
                fs.unlink(photoDirectory + file);
            }
        }
    }

};

exports.loadData = async function () {
    await populateDefaultUsers();
    try {
        const sql = await fs.readFile('app/resources/resample_database.sql', 'utf8');
        await db.getPool().exec(sql);
    } catch (err) {
        console.log(err.sql);
        throw err;
    }
};

/**
 * Populates the User table in the database with the given data. Must be done here instead of within the
 * `resample_database.sql` script because passwords must be hashed according to the particular implementation.
 * @returns {Promise<void>}
 */
async function populateDefaultUsers() {
    const createSQL = 'INSERT INTO User (username, email, given_name, family_name, password) VALUES ?';
    let { properties, usersData } = require('../resources/default_users');

    // Shallow copy all the user arrays within the main data array
    // Ensures that the user arrays with hashed passwords won't persist across multiple calls to this function
    usersData = usersData.map(user => ([ ...user ]));

    const passwordIndex = properties.indexOf('password');
    await Promise.all(usersData.map(user => changePasswordToHash(user, passwordIndex)));

    try {
        await db.getPool().run(createSQL, [usersData]);
    } catch (err) {
        console.log(err.sql);
        throw err;
    }
}

async function changePasswordToHash(user, passwordIndex) {
    user[passwordIndex] = bcrypt.hashSync(user[passwordIndex], 12);

    // It is recommended you use a reputable cryptology library to do the actual hashing/comparing for you...
}

exports.executeSql = async function (sql) {
    try {
        return await db.getPool().run(sql);
    } catch (err) {
        console.log(err.sql);
        throw err;
    }
};
