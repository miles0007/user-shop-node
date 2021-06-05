'use strict'

const express = require('express');
const controls = require('./controllers');
const {verifyToken, getToken, scanToken } = require('./helpers');


const router = express.Router();

// api routes
router.get('/', [getToken, scanToken], controls.home)
router.post('/api/create/', controls.register)
router.all('/api/login/',controls.login)
router.patch("/api/user/update/", verifyToken, controls.update);
router.delete("/api/user/delete/", verifyToken, controls.delete);
router.post('/api/insertproduct/', verifyToken, controls.addProduct);
router.get('/api/tocart/', verifyToken, controls.addCart);
router.get('/api/mycart', [getToken, verifyToken], controls.myCart);


// web endpoints
router.get('/mycart/', [getToken, scanToken], controls.viewCart)

module.exports = router;
