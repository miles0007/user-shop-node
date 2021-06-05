'use strict'

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

/*
* Local Dependencies
*/
const routes = require('./libs/routers')



/* 
* App configurations
*/
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const app = express()

app.use(express.json());
app.use('/', routes);

app.listen(8080, () => console.log("Listening on Port: 8080"))
