const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql');

// open the database
let db = new sqlite3.Database('./data.sqlite', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the travel review database.');
  }
});

exports.getPool = function () {
    return {
        query: (sql, values, ...args) => {
                if (values) {
                    sql = mysql.format(sql, values);
                }
                console.log(sql);
                return db.all(sql, ...args);
            },
        run: (sql, values, ...args) => {
                if (values) {
                    sql = mysql.format(sql, values);
                }
                console.log(sql);
                return db.run(sql, ...args);
            },
        exec: (sql, values, ...args) => {
            if (values) {
                sql = mysql.format(sql, values);
            }
            return db.exec(sql, ...args);
        }
        };
};
