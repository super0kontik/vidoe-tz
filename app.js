const express = require('express');
const app = express();
const cors = require('cors');
const indexRouter = require('./routers/index');

app.use(cors());
app.use('/', indexRouter);

module.exports = app;
