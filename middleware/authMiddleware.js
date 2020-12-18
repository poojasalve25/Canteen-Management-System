const jwt = require('jsonwebtoken');
const mysqlConnection = require("../connection");


const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {

        jwt.verify(token, 'secretkey', (err, decodedToken) => {

            if (err) {
                console.log(err);
                res.locals.user = null;

                next();
            } else {
                let stmt = 'SELECT * FROM users WHERE email=?'

                mysqlConnection.query(stmt, [decodedToken.email], (err, result, field) => {

                    if (err) {
                        console.log('Student not found')
                        res.locals.user = null;
                        next();

                    } else {
                        console.log('In check')
                        res.locals.user = result[0];
                        console.log(res.locals);
                        next();
                    }

                })

            }

        })

    } else {

    }
}
module.exports = {
    checkUser
};