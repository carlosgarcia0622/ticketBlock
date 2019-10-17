const express = require('express');
const app = express();




app.use(require('./enroll-admin'));
app.use(require('./register-user'));
app.use(require('./create-tickets'));
app.use(require('./query-ticket'));
app.use(require('./transfer'));
app.use(require('./reedem'));
app.use(require('./get-events'));

module.exports = app;
