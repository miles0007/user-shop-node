'use strict'

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

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

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser())
// static configuration
const publicDirectory = path.join(__dirname, './public/')
app.use(express.static(publicDirectory))

// handlebar configuration
const viewPath = path.join(__dirname, './public/templates/views')
const partialsPath = path.join(__dirname, './public/templates/partials')
app.set('view engine', 'hbs')
app.set('views', viewPath)
hbs.registerPartials(partialsPath)


app.use('/', routes);

app.listen(8080, () => console.log("Listening on Port: 8080"))
