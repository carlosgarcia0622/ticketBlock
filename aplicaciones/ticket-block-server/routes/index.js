const express = require('express');
const app = express();




app.use(require('./enrollAdmin'));
app.use(require('./registerUser'));
app.use(require('./createTickets'));
app.use(require('./queryTickets'));
app.use(require('./transferTickets'));

module.exports = app;
