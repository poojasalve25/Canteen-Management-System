const mysql = require('mysql');
require('dotenv/config');

var db;

function connectDatabase() {
    db = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: `${process.env.mysqlpassword}`,
      database: 'canteen'
    });

    db.connect(function (err) {
      if (!err) {
        console.log('Database is connected!');
      } else {
        console.log(err);
      }
    });
  return db;
}
module.exports = connectDatabase();