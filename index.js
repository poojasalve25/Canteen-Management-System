const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts')
const cors = require('cors');
require('dotenv/config');
const PORT = process.env.PORT || 6000;
app.use(express.json());
app.use(expressLayouts)
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static('public'))
app.use('/css',express.static(__dirname + 'views/partials/css'))
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/js', express.static(__dirname + 'public/js'));

app.set("view engine", "ejs");

const userRoutes = require('./routes/user');
const adminRoute = require('./routes/admin');

app.use('/user', userRoutes);
app.use('/admin',adminRoute);

app.listen(PORT, () => {
    console.log(`Listening to ${PORT}`);
  });

